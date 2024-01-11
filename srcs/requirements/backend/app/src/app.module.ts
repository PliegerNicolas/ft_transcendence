import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: 5432,
      username: 'my_username',
      password: 'my_password',
      database: 'my_db',
      entities: [],
    synchronize: true,
    }),
    UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
