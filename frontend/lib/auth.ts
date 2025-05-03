import { jwtDecode } from 'jwt-decode';

export type User = {
  id: string;
  name: string;
  email: string;
  coins: number;
  avatar?: string;
  phone?: string;
  location?: string;
  company?: string; // Add this line
  website?: string;
  bio?: string;
};


export type JwtPayload = {
  id: string;
  name: string;
  email: string;
  coins: number;
  exp: number;
};

// Mock user data for development
const MOCK_USERS = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    password: '123456',
    coins: 200,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    password: '123456',
    coins: 300,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
  }
];

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
  if (!token) return null;
  
  try {
    // For development, return a mock user
    return MOCK_USERS[0];
  } catch (error) {
    removeToken();
    return null;
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// Mock signup function
export const signUp = async (name: string, email: string, password: string) => {
  return new Promise<{token: string, user: User}>((resolve) => {
    setTimeout(() => {
      const user = {
        id: '3',
        name,
        email,
        coins: 200,
      };
      const token = 'mock_token_for_development';
      setToken(token);
      resolve({ token, user });
    }, 500);
  });
};

// Mock login function
export const login = async (email: string, password: string) => {
  return new Promise<{token: string, user: User}>((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        const token = 'mock_token_for_development';
        setToken(token);
        resolve({ token, user });
      } else {
        reject(new Error('Credenciais inválidas'));
      }
    }, 500);
  });
};

// Logout function
export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};