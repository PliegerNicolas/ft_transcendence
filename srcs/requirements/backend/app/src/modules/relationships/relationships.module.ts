import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RelationshipsController } from "./controllers/relationships/relationships.controller";
import { RelationshipsService } from "./services/relationships/relationships.service";
import { Relationship } from "./entities/Relationship.entity";
import { User } from "../users/entities/User.entity";
import { GuardsModule } from "../../guards/guards.module";
import { AuthModule } from "../../auth/auth.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Relationship, User]),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [RelationshipsController],
	providers: [RelationshipsService],
	exports: [RelationshipsService],
})
export class RelationshipsModule {}
