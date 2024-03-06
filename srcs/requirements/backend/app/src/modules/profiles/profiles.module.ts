import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfilesController } from "./controllers/profiles/profiles.controller";
import { ProfilesService } from "./services/profiles/profiles.service";
import { Profile } from "./entities/Profile.entity";
import { User } from "../users/entities/User.entity";
import { GuardsModule } from "../../guards/guards.module";
import { AuthModule } from "../../auth/auth.module";
import { FileUploadsModule } from "../file-uploads/file-uploads.module";
import { MimeTypes } from "../file-uploads/enums/mime-types.enum";
import { MB_MULTIPLICATOR } from "../file-uploads/configs/file-uploads.config";
import { File } from "../file-uploads/entities/file.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Profile, User, File]),
		FileUploadsModule.register({
			uploadDest: './assets/uploads/profile-pictures',
			allowedMimeTypes: [MimeTypes.PNG, MimeTypes.JPEG, MimeTypes.GIF],
			maxSizeInBits: 5 * MB_MULTIPLICATOR,
		}),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [ProfilesController],
	providers: [ProfilesService],
	exports: [ProfilesService],
})
export class ProfilesModule {}
