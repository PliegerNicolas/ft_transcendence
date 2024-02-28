import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RelationshipsController } from "./controllers/relationships/relationships.controller";
import { RelationshipsService } from "./services/relationships/relationships.service";
import { Relationship } from "./entities/Relationship.entity";
import { User } from "../users/entities/User.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Relationship, User])
	],
	controllers: [RelationshipsController],
	providers: [RelationshipsService],
})
export class RelationshipsModule {}
