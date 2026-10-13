import {
  applyDecorators,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { MAX_IMAGE_BYTES } from '../cloudinary/cloudinary.service.js';
import { AdminContentService } from './admin-content.service.js';
import { AdminCustomersService } from './admin-customers.service.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdminOrdersService } from './admin-orders.service.js';
import { AdminProductsService } from './admin-products.service.js';
import {
  AdjustStockDto,
  AdminCustomersQueryDto,
  AdminInquiriesQueryDto,
  AdminOrdersQueryDto,
  AdminProductsQueryDto,
  CreateProductDto,
  CreateVariantDto,
  GenerateVariantsDto,
  InventoryQueryDto,
  ReorderImagesDto,
  UpdateCategoryDto,
  UpdateCustomerDto,
  UpdateImageDto,
  UpdateInquiryDto,
  UpdateOrderStatusDto,
  UpdatePaymentDto,
  UpdateProductDto,
  UpdateSettingsDto,
  UpdateTrackingDto,
  UpdateVariantDto,
} from './dto/admin.dto.js';

const AdminOnly = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles('ADMIN'));

const imageUpload = { limits: { fileSize: MAX_IMAGE_BYTES } };

@AdminOnly()
@Controller('admin')
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get('stats')
  stats() {
    return this.dashboard.stats();
  }
}

@AdminOnly()
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

  @Get()
  list(@Query() query: AdminProductsQueryDto) {
    return this.products.list(query);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.products.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }

  // Images → Cloudinary → ProductImage rows
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 8, imageUpload))
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.products.uploadImages(id, files);
  }

  @Patch(':id/images/order')
  reorderImages(@Param('id') id: string, @Body() dto: ReorderImagesDto) {
    return this.products.reorderImages(id, dto);
  }

  @Post(':id/variants')
  createVariant(
    @Param('id') id: string,
    @Body() dto: CreateVariantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.products.createVariant(id, dto, user.id);
  }

  @Post(':id/variants/generate')
  generateVariants(
    @Param('id') id: string,
    @Body() dto: GenerateVariantsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.products.generateVariants(id, dto, user.id);
  }
}

@AdminOnly()
@Controller('admin/images')
export class AdminImagesController {
  constructor(private readonly products: AdminProductsService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateImageDto) {
    return this.products.updateImage(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.deleteImage(id);
  }
}

@AdminOnly()
@Controller('admin/variants')
export class AdminVariantsController {
  constructor(private readonly products: AdminProductsService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.products.updateVariant(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.deleteVariant(id);
  }
}

@AdminOnly()
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventory: AdminInventoryService) {}

  @Get()
  list(@Query() query: InventoryQueryDto) {
    return this.inventory.list(query);
  }

  @Post(':variantId/adjust')
  @HttpCode(200)
  adjust(
    @Param('variantId') variantId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventory.adjust(variantId, dto, user.id);
  }

  @Get(':variantId/movements')
  movements(@Param('variantId') variantId: string) {
    return this.inventory.movements(variantId);
  }
}

@AdminOnly()
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  list(@Query() query: AdminOrdersQueryDto) {
    return this.orders.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orders.get(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.orders.updateStatus(id, dto, user.id);
  }

  @Patch(':id/payment')
  updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.orders.updatePayment(id, dto, user.id);
  }

  @Patch(':id/tracking')
  updateTracking(@Param('id') id: string, @Body() dto: UpdateTrackingDto) {
    return this.orders.updateTracking(id, dto);
  }
}

@AdminOnly()
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customers: AdminCustomersService) {}

  @Get()
  list(@Query() query: AdminCustomersQueryDto) {
    return this.customers.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.customers.get(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.customers.update(id, dto, user.id);
  }
}

@AdminOnly()
@Controller('admin')
export class AdminContentController {
  constructor(private readonly content: AdminContentService) {}

  @Get('categories')
  listCategories() {
    return this.content.listCategories();
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.content.updateCategory(id, dto);
  }

  @Post('categories/:id/image')
  @UseInterceptors(FileInterceptor('file', imageUpload))
  uploadCategoryImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.content.uploadCategoryImage(id, file);
  }

  @Get('inquiries')
  listInquiries(@Query() query: AdminInquiriesQueryDto) {
    return this.content.listInquiries(query);
  }

  @Patch('inquiries/:id')
  updateInquiry(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.content.updateInquiry(id, dto);
  }

  @Delete('inquiries/:id')
  deleteInquiry(@Param('id') id: string) {
    return this.content.deleteInquiry(id);
  }

  @Get('newsletter')
  listSubscribers(@Query() query: PaginationQueryDto) {
    return this.content.listSubscribers(query);
  }

  @Get('settings')
  getSettings() {
    return this.content.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.content.updateSettings(dto);
  }
}
