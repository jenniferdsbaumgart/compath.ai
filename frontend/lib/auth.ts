import { jwtDecode } from 'jwt-decode';

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


export type JwtPayload = {
  id: string;
  name: string;
  email: string};

// Token management
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
  }
};

// Current user
export const getCurrentUser = (): User | null => {
  const token = getToken();

  try {
  
    if (!token) {
      return null;
    }
    const decoded = jwtDecode<JwtPayload>(token);
    // Você pode adicionar uma verificação de expiração do token aqui, se o payload incluir 'exp'
    // if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    //   removeToken();
    //   return null;
    // }
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      // Adicionado para satisfazer o tipo User, já que 'coins' é obrigatório.
      // O valor real de 'coins' pode precisar ser carregado separadamente 
      // (ex: via API) se não estiver incluído no JWT payload.
      coins: 0, // Você pode usar 0 ou outro valor padrão apropriado.
      // Outros campos opcionais do tipo User (avatar, phone, etc.)
      // serão undefined se não estiverem no JwtPayload.
    };
  } catch (error) {
    console.error('Falha ao decodificar o token ou token inválido:', error);
    removeToken();
    return null;
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};


// Logout function
export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// function add Adriel
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/auth';

// AuthResponse agora usará o tipo User principal definido no início do arquivo.
interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao criar conta.');
  }
  
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer login.');
  }

  if (data.token) {
    setToken(data.token);
  }
  return data;
}