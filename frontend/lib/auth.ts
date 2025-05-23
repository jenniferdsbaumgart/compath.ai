import { jwtDecode } from 'jwt-decode';

// Definição do tipo User
export type User = {
  id: string;
  name: string;
  email: string;
  coins: number;
  avatar?: string;
  phone?: string;
  location?: string;
  company?: string;
  website?: string;
  bio?: string;
};

// Definição do tipo JwtPayload
export type JwtPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    coins: number;
  };
  exp: number;
};

// GERENCIAMENTO TOKEN

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('compath_token', token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('compath_token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('compath_token');
    localStorage.removeItem('compath_user');
  }
};

// USUÁRIO ATUAL
export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token) {
    console.log('getCurrentUser: No token found');
    return null;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log('getCurrentUser: Token expired');
      removeToken();
      return null;
    }
    return {
      id: decoded.user.id,
      name: decoded.user.name,
      email: decoded.user.email,
      coins: decoded.user.coins,
    };
  } catch (error) {
    console.error('getCurrentUser: Invalid token:', error);
    removeToken();
    return null;
  }
};

// VERIFICAÇÃO DE AUTENTICAÇÃO
// Verifica se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    console.log('isAuthenticated: No token found');
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const isValid = decoded.exp && decoded.exp * 1000 > Date.now();
    console.log('isAuthenticated: Token valid?', isValid, 'Expiration:', new Date(decoded.exp * 1000));
    return !!isValid;
  } catch (error) {
    console.error('isAuthenticated: Invalid token:', error);
    return false;
  }
};

// LOGOUT
export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// SIGN UP E LOGIN
interface SignUpResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    coins: number;
  };
}

// Função para criar uma nova conta
export async function signUp(name: string, email: string, password: string): Promise<SignUpResponse> {
  const response = await fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data: SignUpResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao criar conta');
  }

  setToken(data.token);
  localStorage.setItem('compath_user', JSON.stringify(data.user));

  return data;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignInResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    coins: number;
  };
}

// Função para fazer login
export async function signIn(email: string, password: string): Promise<SignInResponse> {
  const response = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data: SignInResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer login');
  }

  console.log('signIn: Saving to localStorage:', { token: data.token, user: data.user });
  setToken(data.token);
  localStorage.setItem('compath_user', JSON.stringify(data.user));

  return data;
}