// src/app.ts
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';

import userRoutes from './routes/userRoutes';
import searchRoutes from './routes/searchRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/adminRoutes';
import coinRoutes from './routes/coinRoutes';
import favouriteRoutes from './routes/favouriteRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import profileRoutes from './routes/profileRoutes';

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
}));
app.use(express.json());

// Rotas existentes
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Nova rota para recomendações com KNN
app.use('/api/users/profile/recommendations', recommendationRoutes);
app.use('/api/profile', profileRoutes);

export default app;
