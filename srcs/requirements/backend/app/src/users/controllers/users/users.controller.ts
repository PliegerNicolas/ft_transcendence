import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/CreateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { ReplaceUserDto } from 'src/users/dtos/ReplaceUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { UsersGuard } from 'src/users/users.guard';
import { JwtPublicGuard } from 'src/auth/jwt-public.guard';

@Controller()
export class UsersController {

    constructor(private userService: UsersService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    @Get('users')
    async getUsers(
        @Request() req: any,
    ) {
        return (await this.userService.getUsers());
    }

    @Post('users')
    async createUser(
        @Body(new ValidationPipe) createUserDto: CreateUserDto
    ) {
        return (await this.userService.createUser(createUserDto));
    }
    
    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    @Get('users/:username')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getUser(
        @Param('username', ParseUsernamePipe) username: string,
        @Request() req: any,
    ) {
        if (req.user?.username) return (await this.userService.getMyUser(username));
        else return (await this.userService.getUser(username));
    }

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

    @Get('me')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyUser(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.userService.getMyUser(username));
    }

    @Put('me')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyUser(
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.userService.replaceUser(username, replaceUserDto));
    }

    @Patch('me')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyUser(
        @Body(new ValidationPipe) updateUserDto: UpdateUserDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.userService.updateUser(username, updateUserDto));
    }

    @Delete('me')
    // UseGuard => Verify if user connected and pass it's req.user
    async deleteMyUser(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.userService.deleteUser(username));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

    @Put('users/:username')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceUser(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
    ) {
        return (await this.userService.replaceUser(username, replaceUserDto));
    }

    @Patch('users/:username')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateUser(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) updateUserDto: UpdateUserDto,
    ) {
        return (await this.userService.updateUser(username, updateUserDto));
    }

    @Delete('users/:username')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async deleteUser(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.userService.deleteUser(username));
    }

}
