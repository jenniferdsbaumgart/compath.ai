import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/authRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens (seu frontend)
app.use(express.json()); // Para parsear JSON no corpo das requisições

// Rotas
app.use('/api/auth', authRoutes);

// Rota de health check básica
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Backend is running!' });
});


export default app;
