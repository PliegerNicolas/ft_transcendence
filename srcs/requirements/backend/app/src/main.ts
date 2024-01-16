import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeormExceptionFilter } from './common/filters/typeorm-exception/typeorm-exception.filter';
import { ChatGateway } from './chat/gateways/chat.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Apply a global TypeORM exception filter
  app.useGlobalFilters(new TypeormExceptionFilter());

  await app.listen(3450);
}
bootstrap();
