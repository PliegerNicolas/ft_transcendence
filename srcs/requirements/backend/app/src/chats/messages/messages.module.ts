import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { ControllersController } from './controllers/controllers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/Message.entity';
import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [ServicesService, MessagesService],
  controllers: [ControllersController, MessagesController]
})
export class MessagesModule {}
