import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './models/user.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { UserCreateDto } from './models/user-create.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async all(@Query('page') page: number): Promise<User[]> {
    return await this.userService.paginate(page);
  }

  @Post()
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
  async get(@Param('id') id: number): Promise<User> {
    return this.userService.findOne({ id });
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: UserCreateDto,
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
  async delete(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
