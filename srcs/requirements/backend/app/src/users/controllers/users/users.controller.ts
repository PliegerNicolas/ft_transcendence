import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { ReplaceUserDto } from 'src/users/dtos/ReplaceUser.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) {}

	// @UseGuards(AuthGuard('jwt'))
    @Get()
    async getUsers() {
        return (await this.userService.getUsers());
    }

	@UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getUser(@Param('id', ParseIntPipe) id: number) {
        return (await this.userService.getUser(id));
    }

	@UseGuards(AuthGuard('jwt'))
    @Post()
    async createUser(@Body(new ValidationPipe) createUserDto: CreateUserDto) {
        return (await this.userService.createUser(createUserDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async replaceUserById(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
    ) {
        return (await this.userService.updateUser(id, replaceUserDto));
    }

	@UseGuards(AuthGuard('jwt'))
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