import { Module } from '@nestjs/common';
import { GameGateway } from './gateways/gateways.gateway';

@Module({
  imports: [],
  providers: [GameGateway]
})
export class GameModule {}
