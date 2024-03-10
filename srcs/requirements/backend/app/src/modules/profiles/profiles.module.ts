import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfilesController } from "./controllers/profiles/profiles.controller";
import { ProfilesService } from "./services/profiles/profiles.service";
import { Profile } from "./entities/Profile.entity";
import { User } from "../users/entities/User.entity";
import { GuardsModule } from "../../guards/guards.module";
import { AuthModule } from "../../auth/auth.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Profile, User]),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [ProfilesController],
	providers: [ProfilesService],
	exports: [ProfilesService],
})
export class ProfilesModule {}
