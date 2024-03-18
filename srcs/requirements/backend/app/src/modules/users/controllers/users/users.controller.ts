import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { UsersService } from "../../services/users/users.service";
import { CreateUserDto } from "../../dtos/CreateUser.dto";
import { ParseUsernamePipe } from "src/common/pipes/parse-username/parse-username.pipe";
import { ReplaceUserDto } from "../../dtos/ReplaceUser.dto";
import { UpdateUserDto } from "../../dtos/UpdateUser.dto";
import { AuthGuard } from "@nestjs/passport";
import { JwtPublicGuard } from "../../../../guards/jwt-public.guard";
import { GlobalRole } from "../../../../guards/role.decorator";
import { UsersGuard } from "../../../../guards/users.guard";
import { RoleGlobalGuard } from "../../../../guards/role.guard";
import { Serialize } from "src/common/serialization/decorators/serialize/serialize.decorator";

@Controller()
@Serialize()
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
        @Body(new ValidationPipe) createUserDto: CreateUserDto,
    ) {
        return (await this.userService.createUser(createUserDto));
    }
    
    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

	@UseGuards(JwtPublicGuard)
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

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Get('me')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyUser(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.userService.getMyUser(username));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Put('me')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyUser(
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.userService.replaceUser(username, replaceUserDto));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Patch('me')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyUser(
        @Body(new ValidationPipe) updateUserDto: UpdateUserDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.userService.updateUser(username, updateUserDto));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
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

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceUser(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) replaceUserDto: ReplaceUserDto,
    ) {
        return (await this.userService.replaceUser(username, replaceUserDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Patch('users/:username')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateUser(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) updateUserDto: UpdateUserDto,
    ) {
        return (await this.userService.updateUser(username, updateUserDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async deleteUser(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.userService.deleteUser(username));
    }

}
