import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { QueryProductsDto } from './dto/query-products.dto.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Get('categories/:slug')
  getCategory(@Param('slug') slug: string) {
    return this.catalog.getCategory(slug);
  }

  @Get('products')
  listProducts(@Query() query: QueryProductsDto) {
    return this.catalog.listProducts(query);
  }

  // Declared before :slug so "sizes" isn't treated as a product slug.
  @Get('products/sizes')
  listSizes() {
    return this.catalog.listSizes();
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.catalog.getProduct(slug);
  }
}
