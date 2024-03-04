import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GamelogsController } from "./controllers/gamelogs/gamelogs.controller";
import { GamelogsService } from "./services/gamelogs/gamelogs.service";
import { Gamelog } from "./entities/Gamelog.entity";
import { GamelogToUser } from "./entities/GamelogToUser.entity";
import { User } from "../users/entities/User.entity";
import { UsersService } from "../users/services/users/users.service";
import { UsersModule } from "../users/users.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Gamelog, GamelogToUser, User]),
		forwardRef(() => UsersModule),
	],
	controllers: [GamelogsController],
	providers: [GamelogsService],
	exports: [GamelogsService],
})
export class GamelogsModule {}
