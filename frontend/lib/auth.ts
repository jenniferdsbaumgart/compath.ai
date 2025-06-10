import { jwtDecode } from 'jwt-decode';

// Definição do tipo User
interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  createdAt: string;
  phone?: string;
  location?: string;
  company?: string;
  website?: string;
  bio?: string;
  profileCompletion: number;
  invitedFriends: string[];
  favourites?: Array<{
    title: string;
    description?: string;
    tags?: string[];
    url?: string;
    savedAt?: string;
  }>;
}

interface DecodedToken {
  id: string;
  exp: number;
}

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
export function getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing token from localStorage:', error);
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting token in localStorage:', error);
  }
}

export function removeToken(): void {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// USUÁRIO ATUAL
export function getCurrentUser(): User | null {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user) as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    removeToken();
    return null;
  }
}

export function setCurrentUser(user: User): void {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user in localStorage:', error);
  }
}

// VERIFICAÇÃO DE AUTENTICAÇÃO
// Verifica se o usuário está autenticado
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      removeToken();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken();
    return false;
  }
}

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