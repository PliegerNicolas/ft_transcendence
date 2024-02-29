import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfilesController } from "./controllers/profiles/profiles.controller";
import { ProfilesService } from "./services/profiles/profiles.service";
import { Profile } from "./entities/Profile.entity";
import { User } from "../users/entities/User.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Profile, User]),
	],
	controllers: [ProfilesController],
	providers: [ProfilesService],
	exports: [ProfilesService],
})
export class ProfilesModule {}
