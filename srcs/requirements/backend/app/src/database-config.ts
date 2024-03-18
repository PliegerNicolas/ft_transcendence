import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const dbConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'database',
	port: parseInt(process.env.DB_PORT ?? '5432'),
	username: process.env.DB_USER ?? 'default_user',
	password: process.env.DB_PASSWORD ?? 'default_password',
	database: process.env.DB_NAME ?? 'default_db',
	entities: [__dirname + '/**/*.entity{.ts,.js}'],
	synchronize: true,
	//logging: true, // TEMP
};
