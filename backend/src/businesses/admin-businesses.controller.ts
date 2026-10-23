import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminOnly } from '../common/decorators/admin-only.decorator.js';
import {
  AddBusinessUserDto,
  BusinessFilterDto,
  BusinessListQueryDto,
  CreateBusinessDto,
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

  @Post()
  create(@Body() dto: CreateBusinessDto) {
    return this.businesses.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.businesses.get(id);
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
}
