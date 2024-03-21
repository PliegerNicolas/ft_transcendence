import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	//Setting up middleware for cookies
	app.use(cookieParser(process.env.API42_SECRET));
	app.enableCors({ origin: true, credentials: true })
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', 'https://localhost:8080');
		res.header('Access-Control-Allow-Origin', 'https://localhost:3030');
		next();
	});

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { groups: ['transform'] },
		}),
	);

	app.setGlobalPrefix('api');
	await app.listen((process.env.PORT ?? '3000'));
}
bootstrap();
