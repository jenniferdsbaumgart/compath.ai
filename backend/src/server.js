const express = require('express');
const connectDB = require('../config/db'); // Ajustado o caminho para config/db.js
require('dotenv').config(); // Garante que o .env seja carregado

// Conectar ao Banco de Dados MongoDB
connectDB();

const app = express();

// Middlewares (ex: para parsear JSON)
app.use(express.json());

// Rotas da API
app.use('/api/auth', require('./routes/authRoutes')); // Rota para autenticação
// app.use('/api/users', require('./routes/users'));

// Rota de health check básica ou homepage da API
app.get('/', (req, res) => {
  res.send('API Rodando');
});

const PORT = process.env.PORT || 3001; // Usa a porta do .env ou 3001 como padrão

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API de autenticação disponível em http://localhost:${PORT}/api/auth`);
  console.log(`API principal disponível em http://localhost:${PORT}/`);
});
