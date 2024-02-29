import { Module, forwardRef } from '@nestjs/common';
import { ChannelsGuard } from './channels.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPublicGuard } from './jwt-public.guard';
import { RoleGlobalGuard, RoleGuard } from './role.guard';
import { UsersGuard } from './users.guard';
import { UsersModule } from 'src/modules/users/users.module';
import { ChannelsModule } from 'src/modules/chats/channels/channels.module';
import { AuthentificationModule } from '../authentification/authentification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMember } from '../../modules/chats/channels/entities/ChannelMember.entity';
import { User } from '../../modules/users/entities/User.entity';
import { Channel } from 'src/modules/chats/channels/entities/Channel.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, ChannelMember, User]),
        forwardRef(() => UsersModule),
        forwardRef(() => ChannelsModule),
        AuthentificationModule,
    ],
    controllers: [],
    providers: [ChannelsGuard, JwtAuthGuard, JwtPublicGuard, RoleGlobalGuard, RoleGuard, UsersGuard],
    exports: [ChannelsGuard, JwtAuthGuard, JwtPublicGuard, RoleGlobalGuard, RoleGuard, UsersGuard],
})
export class GuardsModule {}
