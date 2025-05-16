import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken } from '../services/tokenService';

// ATENÇÃO: Este é um armazenamento de usuários em memória apenas para fins de demonstração.
// Em produção, use um banco de dados real.
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}
const users: User[] = []; 
let userIdCounter = 1;

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  // Verifica se o usuário já existe
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'E-mail já cadastrado.' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: (userIdCounter++).toString(),
      name,
      email,
      passwordHash,
    };
    users.push(newUser);

    const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });

    // Retorna o usuário (sem a senha) e o token
    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }

  try {
    const isPasswordMatch = await comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
  }
};
