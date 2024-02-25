import { Module } from '@nestjs/common';
import { MeController } from './controllers/me.controller';


@Module({
  controllers: [MeController]
})
export class MeModule {}
