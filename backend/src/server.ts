import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import * as dotenv from 'dotenv';
import searchRoutes from './routes/searchRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/adminRoutes';
import coinRoutes from './routes/coinRoutes';
import favouriteRoutes from './routes/favouriteRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de autenticação
app.use('/api/users', userRoutes);
// Rota de pesquisa
app.use('/api/search', searchRoutes);
// Rota de dashboard
app.use('/api/dashboard', dashboardRoutes);
// Rota de moedas
app.use('/api/coins', coinRoutes);
// Rota de administração
app.use('/api/admin', adminRoutes);
// Rota de favoritos
app.use('/api/favorites', favouriteRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// Conexão com o MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro de conexão com o MongoDB:', error);
  });