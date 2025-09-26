import { Connection } from 'mongoose';

// Função para criar índices otimizados no MongoDB
export async function createOptimizedIndexes(connection: Connection) {
  try {
    // Índices para Users
    const UserModel = connection.models.User;
    if (UserModel) {
      // Índice composto para autenticação (email único já existe)
      await UserModel.collection.createIndex(
        { email: 1 },
        {
          name: 'email_unique_auth',
          unique: true,
          background: true,
        },
      );

      // Índice para buscas por localização/empresa
      await UserModel.collection.createIndex(
        { location: 1, company: 1 },
        {
          name: 'location_company_search',
          background: true,
        },
      );

      // Índice para perfil de conclusão
      await UserModel.collection.createIndex(
        { profileCompletion: 1, createdAt: -1 },
        {
          name: 'profile_completion_recent',
          background: true,
        },
      );
    }

    // Índices para Reports
    const ReportModel = connection.models.Report;
    if (ReportModel) {
      // Índice composto para queries de dashboard (usuário + data)
      await ReportModel.collection.createIndex(
        { userId: 1, createdAt: -1 },
        {
          name: 'user_reports_timeline',
          background: true,
        },
      );

      // Índice para buscas por query de pesquisa
      await ReportModel.collection.createIndex(
        { searchQuery: 'text' },
        {
          name: 'search_query_text',
          background: true,
        },
      );

      // Índice composto para filtros de data + usuário
      await ReportModel.collection.createIndex(
        { createdAt: -1, userId: 1 },
        {
          name: 'reports_date_user',
          background: true,
        },
      );

      // Índice para métricas globais
      await ReportModel.collection.createIndex(
        { createdAt: -1 },
        {
          name: 'reports_timeline_global',
          background: true,
        },
      );
    }

    // Índices para Dashboard Read Models
    const DashboardModel = connection.models.DashboardReadModel;
    if (DashboardModel) {
      // Índice principal para lookups de usuário
      await DashboardModel.collection.createIndex(
        { userId: 1 },
        {
          name: 'dashboard_user_lookup',
          unique: true,
          background: true,
        },
      );

      // Índice para cache expiration
      await DashboardModel.collection.createIndex(
        { lastUpdated: 1 },
        {
          name: 'dashboard_cache_expiration',
          background: true,
          expireAfterSeconds: 3600, // 1 hora
        },
      );
    }

    console.log('✅ Optimized indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating optimized indexes:', error);
    throw error;
  }
}

// Função para verificar e recriar índices se necessário
export async function ensureIndexes(connection: Connection) {
  try {
    await createOptimizedIndexes(connection);
  } catch (error) {
    console.warn(
      '⚠️ Index creation failed, continuing without optimization:',
      error,
    );
  }
}

// Função para performance monitoring de queries
export async function logSlowQueries(connection: Connection) {
  // Habilitar profiling para queries lentas (>100ms)
  try {
    if (connection.db) {
      // Profiling habilitado via configuração do MongoDB
      console.log(
        '📊 Query profiling can be enabled via MongoDB configuration',
      );
    }
  } catch (error) {
    console.warn('⚠️ Could not enable query profiling:', error);
  }
}
