import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { ControllersController } from './controllers/controllers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/Message';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [ServicesService],
  controllers: [ControllersController]
})
export class MessagesModule {}
