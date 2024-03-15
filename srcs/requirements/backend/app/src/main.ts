import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeormExceptionFilter } from './common/filters/typeorm-exception/typeorm-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	//Setting up middleware for cookies
	app.use(cookieParser(process.env.API_SECRET));

	app.enableCors({
		origin: true,
		credentials: true
	})

	// Apply a global TypeORM exception filter
	app.useGlobalFilters(new TypeormExceptionFilter());


	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { groups: ['transform'] },
		}),
	);

	//app.setGlobalPrefix('api');
	await app.listen(3450);
}
bootstrap();
