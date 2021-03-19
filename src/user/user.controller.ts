import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './models/user.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { UserCreateDto } from './models/user-create.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginatedResult } from 'src/common/paginated-result.interface';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { UserUpdateDto } from './models/user-update.dto';
import { HasPermission } from 'src/permission/has-permission.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}
  @Get()
  @HasPermission('users')
  async all(@Query('page') page: number): Promise<PaginatedResult> {
    return await this.userService.paginate(page, ['role']);
  }

  @Post()
  @HasPermission('users')
  async create(@Body() body: UserCreateDto): Promise<User> {
    const password = await bcrypt.hash('1234', 12);
    return this.userService.create({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: password,
      role: { id: body.role_id },
    });
  }

  @Get(':id')
  @HasPermission('users')
  async get(@Param('id') id: number): Promise<User> {
    return this.userService.findOne({ id }, ['role']);
  }

  @Put('info')
  async updateInfo(@Req() request: Request, @Body() body: UserUpdateDto) {
    const id = await this.authService.userId(request);
    await this.userService.update(id, body);

    return this.userService.findOne({ id });
  }

  @Put('password')
  async updatePassword(
    @Req() request: Request,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }
    const hashed = await bcrypt.hash(password, 12);

    const id = await this.authService.userId(request);
    await this.userService.update(id, { password: hashed });

    return this.userService.findOne({ id });
  }

  @Put(':id')
  @HasPermission('users')
  async update(
    @Param('id') id: number,
    @Body() body: UserUpdateDto,
  ): Promise<User> {
    await this.userService.update(id, {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      role: { id: body.role_id },
    });

    return this.userService.findOne({ id });
  }

  @Delete(':id')
  @HasPermission('users')
  async delete(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
