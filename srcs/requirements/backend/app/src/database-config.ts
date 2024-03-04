import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const dbConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'database',
	port: parseInt(process.env.DB_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	entities: [__dirname + '/**/*.entity{.ts,.js}'],
	synchronize: true,
	//logging: true, // TEMP
};
