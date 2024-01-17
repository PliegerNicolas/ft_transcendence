import { Module } from '@nestjs/common';
import { RelationshipsService } from './services/relationships/relationships.service';
import { RelationshipsController } from './controllers/relationships/relationships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relationship } from './entities/Relationship';
import { User } from 'src/users/entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([Relationship, User])
  ],
  providers: [RelationshipsService],
  controllers: [RelationshipsController]
})
export class RelationshipsModule {}
