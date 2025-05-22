// src/routes/userRoutes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router: Router = Router();

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

//  middleware de autenticação
// Verifica se o token JWT é válido e adiciona o usuário à requisição
const authMiddleware = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido');
    }

    const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };
    (req as any).user = decoded.user;
    next();
  } catch (error) {
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

export default router;