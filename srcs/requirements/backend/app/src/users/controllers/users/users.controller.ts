import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { ReplaceUserDto } from 'src/users/dtos/ReplaceUser.dto';
import { ParseIdPipe } from 'src/common/pipes/parseid/parseid.pipe';
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
    @Get(':userId')
    async getUser(@Param('userId', ParseIdPipe) userId: bigint) {
        return (await this.userService.getUser(userId));
    }

	@UseGuards(AuthGuard('jwt'))
    @Post()
    async createUser(@Body(new ValidationPipe) createUserDto: CreateUserDto) {
        return (await this.userService.createUser(createUserDto));
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':userId')
    async replaceUserById(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
    ) {
        return (await this.userService.updateUser(userId, replaceUserDto));
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':userId')
    async updateUserById(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Body(new ValidationPipe) updateUserDto: UpdateUserDto,
    ) {
        return (await this.userService.updateUser(userId, updateUserDto));
    }

    @Delete(':userId')
    async deleteUserById(@Param('userId', ParseIdPipe) userId: bigint) {
        return (await this.userService.deleteUser(userId));
    }

}