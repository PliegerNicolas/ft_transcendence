import { Module, forwardRef } from '@nestjs/common';
import { ChannelsGuard } from './channels.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPublicGuard } from './jwt-public.guard';
import { RoleGlobalGuard, RoleGuard } from './role.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/User.entity';
import { Profile } from '../modules/profiles/entities/Profile.entity';
import { ChannelMember } from '../modules/chats/channels/entities/ChannelMember.entity';
import { Channel } from '../modules/chats/channels/entities/Channel.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Profile, Channel, ChannelMember]),
        forwardRef(() => AuthModule),
    ],
    controllers: [],
    providers: [ChannelsGuard, JwtAuthGuard, JwtPublicGuard, RoleGuard, RoleGlobalGuard],
    exports: [ChannelsGuard, JwtAuthGuard, JwtPublicGuard, RoleGuard, RoleGlobalGuard],
})
export class GuardsModule {}
