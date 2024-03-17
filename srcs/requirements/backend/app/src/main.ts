import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	//Setting up middleware for cookies
	app.use(cookieParser(process.env.API_SECRET));
	app.enableCors({ origin: true, credentials: true })

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { groups: ['transform'] },
		}),
	);

	//app.setGlobalPrefix('api');
	await app.listen((process.env.BACKEND_PORT ?? '3000'));
}
bootstrap();
