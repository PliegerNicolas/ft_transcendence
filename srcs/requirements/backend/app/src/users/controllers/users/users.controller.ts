import { Body, Controller, Get, Param, ParseIntPipe, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';

@Controller('users')
export class UsersController {

    @Get()
    getUsers() {
        return [{ username: 'Esteban' }, { username: 'Paul'}];
    }

    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: string) {
        console.log(id);
        return { id };
    }

    @Post('create')
    @UsePipes(new ValidationPipe())
    createUser(@Body() userData: CreateUserDto) {
        console.log(userData);
        return {};
    }

}
