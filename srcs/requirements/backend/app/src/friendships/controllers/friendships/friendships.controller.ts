import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateFriendshipDto } from 'src/friendships/dtos/CreateFriendship.dto';
import { ReplaceFriendshipDto } from 'src/friendships/dtos/ReplaceFriendship.dto';
import { UpdateFriendshipDto } from 'src/friendships/dtos/UpdateFriendship.dto';
import { FriendshipsService } from 'src/friendships/services/friendships/friendships.service';

@Controller('users/:userId/friendships')
export class FriendshipsController {

    constructor(private friendshipService: FriendshipsService) {}

    @Get()
    async getFriendships(@Param('userId', ParseIntPipe) userId: number) {
        return (await this.friendshipService.getUserFriendships(userId));
    }

    @Get(':targetUserId')
    async getFriendship(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetUserId', ParseIntPipe) targetUserId: number,
    ) {
        return (await this.friendshipService.getUserFriendshipByUserId(userId, targetUserId));
    }

    @Post()
    async createFriendship(
        @Param('userId', ParseIntPipe) userId: number,
        @Body(new ValidationPipe) createFriendshipDto: CreateFriendshipDto,
    ) {
        return (this.friendshipService.createUserFriendship(userId, createFriendshipDto));
    }

    @Put(':targetId')
    async replaceFriendship(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetId', ParseIntPipe) targetId: number,
        @Body(new ValidationPipe) replaceFriendshipDto: ReplaceFriendshipDto,
    ) {
        return (this.friendshipService.replaceUserFriendship(userId, targetId, replaceFriendshipDto));
    }

    @Patch(':targetId')
    async updateFriendship(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetId', ParseIntPipe) targetId: number,
        @Body(new ValidationPipe) updateFriendshipDto: UpdateFriendshipDto,
    ) {
        return (this.friendshipService.updateUserFriendship(userId, targetId, updateFriendshipDto));
    }
    
}
