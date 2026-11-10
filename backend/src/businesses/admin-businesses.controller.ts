import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AdminOnly } from '../common/decorators/admin-only.decorator.js';
import {
  AddBusinessUserDto,
  BusinessFilterDto,
  BusinessListQueryDto,
  CreateBusinessDto,
  ImportSheetDto,
  UpdateBusinessDto,
  UpdateBusinessFilterDto,
} from './dto/business.dto.js';
import { BusinessesService } from './businesses.service.js';

@AdminOnly()
@Controller('admin/businesses')
export class AdminBusinessesController {
  constructor(private readonly businesses: BusinessesService) {}

  @Get()
  list(@Query() query: BusinessListQueryDto) {
    return this.businesses.list(query);
  }

  /** The blank standard order sheet. Declared before :id so "template" is not read as an id. */
  @Get('template')
  async template(@Res() res: Response) {
    this.sheet(res, 'KorganoTech customer order sheet.xlsx', await this.businesses.template());
  }

  @Post()
  create(@Body() dto: CreateBusinessDto) {
    return this.businesses.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.businesses.get(id);
  }

  @Get(':id/export')
  async export(@Param('id') id: string, @Res() res: Response) {
    const { name, buffer } = await this.businesses.exportSheet(id);
    this.sheet(res, `${name.replace(/[^a-zA-Z0-9 _-]+/g, '').trim() || 'business'} order list.xlsx`, buffer);
  }

  /** Upload the standard sheet. Without apply=true it only previews what would change. */
  @Post(':id/import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 4 * 1024 * 1024 } }))
  import(
    @Param('id') id: string,
    @Body() dto: ImportSheetDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.businesses.importSheet(id, file, dto.mode ?? 'merge', dto.apply ?? false);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businesses.update(id, dto);
  }

  @Post(':id/users')
  addUser(@Param('id') id: string, @Body() dto: AddBusinessUserDto) {
    return this.businesses.addUser(id, dto);
  }

  @Delete(':id/users/:userId')
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.businesses.removeUser(id, userId);
  }

  @Post(':id/filters')
  addFilter(@Param('id') id: string, @Body() dto: BusinessFilterDto) {
    return this.businesses.addFilter(id, dto);
  }

  @Patch(':id/filters/:filterId')
  updateFilter(
    @Param('id') id: string,
    @Param('filterId') filterId: string,
    @Body() dto: UpdateBusinessFilterDto,
  ) {
    return this.businesses.updateFilter(id, filterId, dto);
  }

  @Delete(':id/filters/:filterId')
  removeFilter(@Param('id') id: string, @Param('filterId') filterId: string) {
    return this.businesses.removeFilter(id, filterId);
  }

  private sheet(res: Response, filename: string, buffer: Buffer) {
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });
    res.send(buffer);
  }
}
