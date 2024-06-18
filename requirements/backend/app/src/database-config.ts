import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const dbConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'database',
	port: parseInt(process.env.DB_PORT ?? '5432'),
	username: process.env.POSTGRES_USER ?? 'default_user',
	password: process.env.POSTGRES_PASSWORD ?? 'default_password',
	database: process.env.POSTGRES_DB ?? 'default_db',
	entities: [__dirname + '/**/*.entity{.ts,.js}'],
	synchronize: true,
	//logging: true, // TEMP
};
