import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { HasPermission } from 'src/permission/has-permission.decorator';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}
  @Get()
  @HasPermission('roles')
  async all(): Promise<Role[]> {
    return this.roleService.all(['permissions']);
  }

  @Get(':id')
  @HasPermission('roles')
  async get(@Param('id') id: number): Promise<Role> {
    return this.roleService.findOne({ id }, ['permissions']);
  }

  @Post()
  @HasPermission('roles')
  async create(
    @Body('name') name: string,
    @Body('permissions') ids: number[],
  ): Promise<Role> {
    return this.roleService.create({
      name,
      permissions: ids.map((id) => ({
        id,
      })),
    });
  }

  @Put(':id')
  // @HasPermission('roles')
  async update(
    @Param('id') id: number,
    @Body('name') name: string,
    @Body('permissions') ids: number[],
  ): Promise<Role> {
    await this.roleService.update(id, { name });

    const role = await this.roleService.findOne({ id }, ['permissions']);

    return this.roleService.create({
      ...role,
      permissions: ids.map((id) => ({
        id,
      })),
    });
  }

  @Delete(':id')
  @HasPermission('roles')
  async delete(@Param('id') id: number) {
    return this.roleService.delete(id);
  }
}
