import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./controllers/users/users.controller";
import { UsersService } from "./services/users/users.service";
import { User } from "./entities/User.entity";
import { Profile } from "../profiles/entities/Profile.entity";
import { Relationship } from "../relationships/entities/Relationship.entity";
import { GamelogToUser } from "../gamelogs/entities/GamelogToUser.entity";
import { Channel } from "../chats/channels/entities/Channel.entity";
import { ChannelMember } from "../chats/channels/entities/ChannelMember.entity";
import { AuthModule } from "../../auth/auth.module";
import { GuardsModule } from "../../guards/guards.module";
import { FileUploadsModule } from "../file-uploads/file-uploads.module";
import { MimeTypes } from "../file-uploads/enums/mime-types.enum";
import { MB_MULTIPLICATOR } from "../file-uploads/configs/file-uploads.constants";
import { PicturesController } from './controllers/pictures/pictures.controller';
import { PicturesService } from './services/pictures/pictures.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Profile, Relationship, GamelogToUser, Channel, ChannelMember]),
		FileUploadsModule.register({
			dest: './assets/uploads/user-pictures',
			allowedMimetypes: [MimeTypes.PNG, MimeTypes.JPEG, MimeTypes.GIF],
			maxSize: 5 * MB_MULTIPLICATOR,
		}),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [UsersController, PicturesController],
	providers: [UsersService, PicturesService],
	exports: [UsersService, PicturesService],
})
export class UsersModule {}
