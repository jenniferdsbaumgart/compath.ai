import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema, Report, ReportSchema, DashboardReadModel, DashboardReadModelSchema } from './models';
import { JwtStrategy } from './auth';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './controllers/user.module';
import { AiReportModule } from './controllers/ai-report.module';
import { DashboardModule } from './controllers/dashboard.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://mongo:27017/compath',
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
      { name: DashboardReadModel.name, schema: DashboardReadModelSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MulterModule.register({
      dest: './uploads',
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        ttl: 300, // 5 minutes default TTL
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    UserModule,
    AiReportModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
