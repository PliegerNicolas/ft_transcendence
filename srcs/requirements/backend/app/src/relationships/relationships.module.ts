import { Module } from '@nestjs/common';
import { RelationshipsService } from './services/relationships/relationships.service';
import { RelationshipsController } from './controllers/relationships/relationships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relationship } from './entities/Relationship.entity';
import { User } from 'src/users/entities/User.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Relationship, User])
  ],
  providers: [RelationshipsService],
  controllers: [RelationshipsController]
})
export class RelationshipsModule {}
