import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { ReplaceUserDto } from 'src/users/dtos/ReplaceUser.dto';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) {}

    @Get()
    async getUsers() {
        return (await this.userService.getUsers());
    }

    @Get(':id')
    async getUser(@Param('id', ParseIntPipe) id: number) {
        return (await this.userService.getUser(id));
    }

    @Post()
    async createUser(@Body(new ValidationPipe) createUserDto: CreateUserDto) {
        return (await this.userService.createUser(createUserDto));
    }

    @Put(':id')
    async replaceUserById(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
    ) {
        return (await this.userService.updateUser(id, replaceUserDto));
    }

    @Patch(':id')
    async updateUserById(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe) updateUserDto: UpdateUserDto,
    ) {
        return (await this.userService.updateUser(id, updateUserDto));
    }

    @Delete(':id')
    async deleteUserById(@Param('id', ParseIntPipe) id: number) {
        return (await this.userService.deleteUser(id));
    }

}