import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfilesController } from "./controllers/profiles/profiles.controller";
import { ProfilesService } from "./services/profiles/profiles.service";
import { Profile } from "./entities/Profile.entity";
import { User } from "../users/entities/User.entity";
import { GuardsModule } from "../../guards/guards.module";
import { AuthModule } from "../../auth/auth.module";
import { FileUploadsModule } from "../file-uploads/file-uploads.module";
import { ProfilePicturesController } from './controllers/profile-pictures/profile-pictures.controller';
import { ProfilePicturesService } from './services/profile-pictures/profile-pictures.service';
import { MimeTypes } from "../file-uploads/enums/mime-types.enum";
import { MB_MULTIPLICATOR } from "../file-uploads/configs/file-uploads.constants";

@Module({
	imports: [
		TypeOrmModule.forFeature([Profile, User]),
		FileUploadsModule.register({
			dest: './assets/uploads/profile-pictures',
			allowedMimetypes: [MimeTypes.PNG, MimeTypes.JPEG, MimeTypes.GIF],
			maxSize: 8 * MB_MULTIPLICATOR,
		}),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [ProfilesController, ProfilePicturesController],
	providers: [ProfilesService, ProfilePicturesService],
	exports: [ProfilesService],
})
export class ProfilesModule {}
