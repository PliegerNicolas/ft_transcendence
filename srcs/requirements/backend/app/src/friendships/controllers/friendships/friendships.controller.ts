import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateFriendshipDto } from 'src/friendships/dtos/CreateFriendshipDto';
import { UpdateFriendshipDto } from 'src/friendships/dtos/UpdateFriendshipDto';
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
    @UsePipes(new ValidationPipe())
    async createFriendship(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() createFriendshipDto: CreateFriendshipDto,
    ) {
        return (this.friendshipService.createUserFriendship(userId, createFriendshipDto));
    }

    @Patch(':targetId')
    @UsePipes(new ValidationPipe())
    async updateFriendship(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetId', ParseIntPipe) targetId: number,
        @Body() updateFriendshipDto: UpdateFriendshipDto,
    ) {
        return (this.friendshipService.updateUserFriendship(userId, targetId, updateFriendshipDto));
    }
    
}
