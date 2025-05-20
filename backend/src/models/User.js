const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'O email é obrigatório.'],
    unique: true, // Garante que cada email seja único no banco
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Por favor, insira um email válido.'], // Validação simples de formato de email
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
  },
  profileType: { // Adicionando o campo que você tem no seu formulário de registro
    type: String,
    enum: ['comum', 'empresa', 'admin'], // Exemplo de tipos de perfil, ajuste conforme necessário
    default: 'comum',
  },
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

module.exports = mongoose.model('User', UserSchema); // 'User' será o nome do model, e a coleção no MongoDB será 'users' (pluralizado automaticamente)