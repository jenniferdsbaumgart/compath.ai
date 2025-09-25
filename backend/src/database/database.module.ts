import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ensureIndexes, logSlowQueries } from './indexes';

@Module({
  imports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private connection: Connection) {}

  async onModuleInit() {
    try {
      // Garantir que os índices estejam criados
      await ensureIndexes(this.connection);

      // Configurar monitoramento de queries lentas
      await logSlowQueries(this.connection);

      console.log('🎯 Database optimization initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }
}
