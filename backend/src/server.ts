import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de autenticação
app.use('/api/users', userRoutes);

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