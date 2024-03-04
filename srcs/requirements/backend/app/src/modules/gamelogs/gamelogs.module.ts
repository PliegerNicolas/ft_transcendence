import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GamelogsController } from "./controllers/gamelogs/gamelogs.controller";
import { GamelogsService } from "./services/gamelogs/gamelogs.service";
import { Gamelog } from "./entities/Gamelog.entity";
import { GamelogToUser } from "./entities/GamelogToUser.entity";
import { User } from "../users/entities/User.entity";
import { UsersModule } from "../users/users.module";
import { GuardsModule } from "../../guards/guards.module";
import { AuthModule } from "../../auth/auth.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Gamelog, GamelogToUser, User]),
		forwardRef(() => UsersModule),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [GamelogsController],
	providers: [GamelogsService],
	exports: [GamelogsService],
})
export class GamelogsModule {}
