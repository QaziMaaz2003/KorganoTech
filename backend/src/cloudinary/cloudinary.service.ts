import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];
// 4 MB: Vercel functions reject request bodies over about 4.5 MB.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Filter lists a business can attach to its account request. */
export const DOCUMENT_EXTENSIONS = ['pdf', 'csv', 'xls', 'xlsx', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'];
export const MAX_DOCUMENT_BYTES = MAX_IMAGE_BYTES;

export interface UploadedDocument {
  url: string;
  publicId: string;
  name: string;
}

/**
 * Product image flow: the admin uploads through the API, the file streams to
 * Cloudinary, and the returned secure_url + public_id are stored in Postgres.
 * The storefront renders the Cloudinary URL directly.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly rootFolder = 'korganotech';

  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
      // Lets tests point uploads at a local stand-in instead of api.cloudinary.com.
      ...(config.get<string>('CLOUDINARY_UPLOAD_PREFIX')
        ? { upload_prefix: config.get<string>('CLOUDINARY_UPLOAD_PREFIX') }
        : {}),
    });
  }

  validate(file: Express.Multer.File) {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `${file.originalname}: only JPG, PNG, WebP or AVIF images are allowed.`,
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException(
        `${file.originalname}: images must be 4 MB or smaller.`,
      );
    }
  }

  uploadBuffer(buffer: Buffer, folder: string): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${this.rootFolder}/${folder}`,
          resource_type: 'image',
          unique_filename: true,
          overwrite: false,
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message}`);
            reject(
              new InternalServerErrorException(
                'Image upload failed. Please try again.',
              ),
            );
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        },
      );
      stream.end(buffer);
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string) {
    this.validate(file);
    return this.uploadBuffer(file.buffer, folder);
  }

  /** A customer's attached filter list (PDF, spreadsheet, document or photo). */
  async uploadDocument(file: Express.Multer.File, folder: string): Promise<UploadedDocument> {
    const ext = extname(file.originalname).slice(1).toLowerCase();
    if (!DOCUMENT_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `That file type isn't supported. Attach a PDF, spreadsheet (CSV, XLS, XLSX), Word document, text file or image.`,
      );
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      throw new BadRequestException('Files must be 4 MB or smaller.');
    }
    // Raw uploads keep the extension from the public_id; a random prefix keeps the link unguessable.
    const safe =
      file.originalname.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 60) || 'file';
    const publicId = `${this.rootFolder}/${folder}/${randomUUID()}-${safe}.${ext}`;
    const failed = () =>
      new InternalServerErrorException('The file could not be uploaded. Please try again.');
    return new Promise((resolve, reject) => {
      try {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: publicId, resource_type: 'raw', overwrite: false },
          (error, result?: UploadApiResponse) => {
            if (error || !result) {
              this.logger.error(`Cloudinary document upload failed: ${error?.message}`);
              reject(failed());
              return;
            }
            resolve({ url: result.secure_url, publicId: result.public_id, name: file.originalname.slice(0, 160) });
          },
        );
        stream.end(file.buffer);
      } catch (e) {
        this.logger.error(`Cloudinary document upload failed: ${(e as Error).message}`);
        reject(failed());
      }
    });
  }

  /** Best effort: a failed delete is logged, never surfaced to the admin. */
  async destroy(publicId: string | null | undefined) {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (e) {
      this.logger.warn(
        `Could not delete Cloudinary asset ${publicId}: ${(e as Error).message}`,
      );
    }
  }
}
