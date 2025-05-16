import app from './utils/app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API de autenticação disponível em http://localhost:${PORT}/api/auth`);
});
