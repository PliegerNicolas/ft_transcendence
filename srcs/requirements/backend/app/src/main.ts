import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter.ts/typeorm-exception.filter.ts.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Apply a global TypeORM exception filter
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  await app.listen(3450);
}
bootstrap();
