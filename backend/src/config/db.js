const mongoose = require('mongoose');
require('dotenv').config(); // Carrega as variáveis do arquivo .env para process.env

const connectDB = async () => {
  // Usaremos MONGODB_URI conforme sugerido na atualização do .env
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('ERRO: A variável de ambiente MONGODB_URI não está definida no arquivo .env.');
    console.error('Por favor, adicione MONGODB_URI="sua_string_de_conexao_mongodb" ao seu arquivo .env');
    process.exit(1); // Encerra a aplicação se a URI não estiver definida
  }

  try {
    await mongoose.connect(mongoURI); // Mongoose 6+ não requer mais opções como useNewUrlParser, etc.
    console.log('MongoDB Conectado com sucesso!');

    // Ouvintes de eventos do Mongoose para monitorar a conexão
    mongoose.connection.on('connected', () => {
      console.log('Mongoose conectado ao DB.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose erro de conexão: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose desconectado.');
    });

  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1); // Encerra a aplicação em caso de falha na conexão com o BD
  }
};

module.exports = connectDB;