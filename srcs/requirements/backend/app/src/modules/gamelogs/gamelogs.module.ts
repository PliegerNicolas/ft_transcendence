import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GamelogsController } from "./controllers/gamelogs/gamelogs.controller";
import { GamelogsService } from "./services/gamelogs/gamelogs.service";
import { Gamelog } from "./entities/Gamelog.entity";
import { GamelogToUser } from "./entities/GamelogToUser.entity";
import { User } from "../users/entities/User.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Gamelog, GamelogToUser, User]),
	],
	controllers: [GamelogsController],
	providers: [GamelogsService]
})
export class GamelogsModule {}
