const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/user'); 
// Se você ainda tem os controllers em authController.js e quer usá-los, mantenha a linha abaixo:
// const { login } = require('../controllers/authController'); // Supondo que 'login' venha de lá

// @route   POST api/auth/register
// @desc    Registrar um novo usuário
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, profileType } = req.body;

  try {
    // 1. Verificar se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Usuário já existe com este email' });
    }

    // 2. Criar uma nova instância do usuário (ainda não salva no DB)
    user = new User({
      name,
      email,
      password, // A senha ainda não está hasheada aqui
      profileType,
    });

    // 3. Hashear a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Salvar o usuário no banco de dados
    await user.save();


    res.status(201).json({ msg: 'Usuário registrado com sucesso!', userId: user.id }); // Não retorne a senha!
  } catch (err) {
    console.error(err.message);
    // Tratar erros de validação do Mongoose
    if (err.name === 'ValidationError') {
        let errors = {};
        Object.keys(err.errors).forEach((key) => {
            errors[key] = err.errors[key].message;
        });
        return res.status(400).json({ msg: 'Erro de validação', errors });
    }
    // Tratar outros erros do servidor
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// @route   POST api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Verificar se o usuário existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas' }); // Mensagem genérica por segurança
    }

    // 2. Comparar a senha fornecida com a senha hasheada no banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' }); // Mensagem genérica
    }

    // 3. Se as credenciais estiverem corretas, criar e retornar um JWT
    const payload = {
      user: {
        id: user.id,
        // Você pode adicionar outros campos ao payload se desejar, como name ou profileType
        // name: user.name,
        // profileType: user.profileType
      },
    };

    // Assine o token com um segredo. É MUITO IMPORTANTE que este segredo
    // seja guardado de forma segura (ex: em variáveis de ambiente) e não diretamente no código.
    // Para este exemplo, usarei 'seuSegredoJWT', mas substitua por uma variável de ambiente.
    // Ex: process.env.JWT_SECRET
    jwt.sign(
      payload,
      process.env.JWT_SECRET || process.env.JWT_SECRET, // Use uma variável de ambiente para o segredo!
      { expiresIn: '1h' }, // Token expira em 1 hora (formato string é comum)
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;