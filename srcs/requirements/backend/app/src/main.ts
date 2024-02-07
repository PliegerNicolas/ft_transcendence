import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeormExceptionFilter } from './common/filters/typeorm-exception/typeorm-exception.filter';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });

	// Apply a global TypeORM exception filter
	app.useGlobalFilters(new TypeormExceptionFilter());

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { groups: ['transform'] },
		}),
	);

	await app.listen(3450);
}
bootstrap();
