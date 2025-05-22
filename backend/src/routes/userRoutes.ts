// src/routes/userRoutes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router: Router = Router();

// Definindo os tipos para o corpo da requisição
interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface CoinRequestBody {
  amount: number;
}

interface UpdateUserRequestBody {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  company?: string;
  website?: string;
  bio?: string;
}

//  middleware de autenticação
// Verifica se o token JWT é válido e adiciona o usuário à requisição
const authMiddleware = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  console.log('authMiddleware: Token received:', token);
  if (!token) {
    console.log('authMiddleware: No token provided');
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      console.error('authMiddleware: JWT_SECRET not defined');
      throw new Error('JWT_SECRET não está definido');
    }

    const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };
    console.log('authMiddleware: Decoded token:', decoded);
    (req as any).user = decoded.user;
    next();
  } catch (error) {
    console.error('authMiddleware: Invalid token:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// cadastro de usuário
router.post('/register', async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
  }
  if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    return res.status(400).json({ message: 'Email inválido' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já registrado' });
    }

    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).json({ message: 'Nome já registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      coins: 200,
    });

    await user.save();

    // Gerar token JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    };

    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido');
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Login
router.post('/login', async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou senha inválidos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou senha inválidos' });
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    };

    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido');
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// mostrar saldo de moedas
router.get('/coins', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('coins');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json({ coins: user.coins ?? 200 }); // Fallback
  } catch (error) {
    console.error('Error fetching coins:', (error as Error).message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// gastar moedas
router.post('/coins/spend', authMiddleware, async (req: Request<{}, {}, CoinRequestBody>, res: Response) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Quantidade inválida' });
  }

  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (user.coins < amount) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    user.coins -= amount;
    await user.save();

    res.status(200).json({ coins: user.coins });
  } catch (error) {
    console.error('Error spending coins:', (error as Error).message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// ganhar moedas
router.post('/coins/earn', authMiddleware, async (req: Request<{}, {}, CoinRequestBody>, res: Response) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Quantidade inválida' });
  }

  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.coins += amount;
    await user.save();

    res.status(200).json({ coins: user.coins });
  } catch (error) {
    console.error('Error earning coins:', (error as Error).message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Puxa todos os usuários
// Apenas para fins de teste, não deve ser exposto em produção
router.get('/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('id name email coins createdAt');
    console.log('Backend: Fetched users:', users.length);
    res.status(200).json({ users });
  } catch (error) {
    console.error('Backend: Error fetching users:', (error as Error).message);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Pega usuário específico por id
// Apenas para fins de teste, não deve ser exposto em produção
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log('GET /api/users/:id: Requesting user ID:', id);
  try {
    const user = await User.findById(id).select('id name email coins createdAt phone location company website bio');
    if (!user) {
      console.log('GET /api/users/:id: User not found for ID:', id);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    console.log('GET /api/users/:id: Fetched user:', (user._id as string | { toString(): string }).toString());
    res.status(200).json({ user });
  } catch (error) {
    console.error('GET /api/users/:id: Error fetching user:', (error as Error).message);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

// Atualiza informações do usuário
router.put('/:id', authMiddleware, async (req: Request<{ id: string }, {}, UpdateUserRequestBody>, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, location, company, website, bio } = req.body;

  if (!name && !email && !phone && !location && !company && !website && !bio) {
    return res.status(400).json({ message: 'Pelo menos um campo deve ser fornecido' });
  }

  try {
    const updateData: Partial<UpdateUserRequestBody> = {};
    if (name) updateData.name = name;
    if (email) {
      if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return res.status(400).json({ message: 'Email inválido' });
      }
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email já registrado' });
      }
      updateData.email = email;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (company !== undefined) updateData.company = company;
    if (website !== undefined) updateData.website = website;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('id name email coins createdAt phone location company website bio');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('Backend: Updated user:', (user as { _id: { toString: () => string } })._id.toString());
    res.status(200).json({ user, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Backend: Error updating user:', (error as Error).message);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

router.get('/profile/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log('GET /api/profile/:id: Requesting user ID:', id);
  try {
    const user = await User.findById(id).select('id name email coins createdAt phone location company website bio');
    if (!user) {
      console.log('GET /api/profile/:id: User not found for ID:', id);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    console.log('GET /api/profile/:id: Fetched user:', (user._id as string | { toString(): string }).toString());
    res.status(200).json({ user });
  } catch (error) {
    console.error('GET /api/profile/:id: Error fetching user:', (error as Error).message);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

export default router;