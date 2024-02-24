import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { ReplaceUserDto } from 'src/users/dtos/ReplaceUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { UsersGuard } from 'src/users/users.guard';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) {}

	// @UseGuards(AuthGuard('jwt'))
    @Get()
    async getUsers() {
        return (await this.userService.getUsers());
    }

    //@UseGuards(AuthGuard('jwt'))
    @Get(':username')
    async getUser(@Param('username', ParseUsernamePipe) username: string) {
        return (await this.userService.getUser(username));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Post()
    async createUser(@Body(new ValidationPipe) createUserDto: CreateUserDto) {
        return (await this.userService.createUser(createUserDto));
    }

    @UseGuards(AuthGuard('jwt'), UsersGuard)
    @Put(':username')
    async replaceUserById(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
    ) {
        return (await this.userService.updateUser(username, replaceUserDto));
    }

    //@UseGuards(AuthGuard('jwt'))
    @Patch(':username')
    async updateUserById(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) updateUserDto: UpdateUserDto,
    ) {
        return (await this.userService.updateUser(username, updateUserDto));
    }

    @Delete(':username')
    async deleteUserById(@Param('username', ParseUsernamePipe) username: string) {
        return (await this.userService.deleteUser(username));
    }

}