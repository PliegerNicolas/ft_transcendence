import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { CreateProfileDto } from 'src/profiles/dtos/CreateProfileDto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfileDto';

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
    @UsePipes(new ValidationPipe())
    createUser(
        @Body() createUserDto: CreateUserDto
    ) {
        console.log(createUserDto);
        this.userService.createUser(createUserDto);
    }

    @Patch(':id')
    async updateUserById(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        await this.userService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    async deleteUserById(@Param('id', ParseIntPipe) id: number) {
        await this.userService.deleteUser(id);
    }

}