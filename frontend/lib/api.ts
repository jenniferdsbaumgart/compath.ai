import { getToken } from './auth';

// ENDPOINTS
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string;
  data?: any;
}

/**
 * Função para fazer requisições à API
 * @param endpoint - O endpoint da API
 * @param options - Opções adicionais para a requisição
 * @returns A resposta da API
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token = getToken(), data, ...customConfig } = options;

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      return Promise.reject(new Error(errorData.message || 'Ocorreu um erro na requisição'));
    }

    if (response.status === 204) {
      return {} as T;
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API Fetch Error:', error);
    return Promise.reject(error);
  }
}

// Tipagens para as respostas da API
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
}

interface Recommendation {
  niche: string;
  description: string;
  potential: string;
  investmentRange: string;
  timeCommitment: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  coinCost?: number;
  duration?: string;
  category?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'user' | 'other';
}

interface DashboardMetrics {
  coins: number;
  searchCount: number;
  activeCourses: Course[];
  totalUsers: number;
  totalCourses: number;
  totalSearches: number;
  profileCompletion?: number; // Adicionado para progresso dinâmico
  userActivity: {
    invitedFriends: number;
  };
}

interface Favorite {
  id: string;
  courseId: string;
  userId: string;
  createdAt: string;
}

interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'spend' | 'earn';
  createdAt: string;
}

export const api = {
  // Autenticação (/api/users)
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/users/login', {
      method: 'POST',
      data: { email, password },
    }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ token: string; user: User }>('/users/register', {
      method: 'POST',
      data,
    }),

  getUserCoins: () => request<{ coins: number }>('/users/coins'),

  spendCoins: (amount: number) =>
    request<{ coins: number }>('/users/coins/spend', {
      method: 'POST',
      data: { amount },
    }),

  earnCoins: (amount: number) =>
    request<{ coins: number }>('/users/coins/earn', {
      method: 'POST',
      data: { amount },
    }),

  saveProfileResponse: (questionId: string, response: any) =>
    request<{ success: boolean }>('/users/profile', {
      method: 'POST',
      data: { questionId, response },
    }),

  getProfileRecommendations: () =>
    request<{ recommendations: Recommendation[] }>('/users/profile/recommendations'),

  // Moedas (/api/coins)
  purchaseCoins: (amount: number) =>
    request<{ transaction: CoinTransaction; coins: number }>('/coins/purchase', {
      method: 'POST',
      data: { amount },
    }),

  getCoinHistory: () =>
    request<{ transactions: CoinTransaction[] }>('/coins/history'),

  // Cursos (/api/courses)
  listCourses: () => request<{ courses: Course[] }>('/courses'),

  getCourseDetails: (courseId: string) => request<{ course: Course }>(`/courses/${courseId}`),

  enrollCourse: (courseId: string) =>
    request<{ success: boolean; message: string }>('/courses/enroll', {
      method: 'POST',
      data: { courseId },
    }),

  // Pesquisa (/api/search)
  search: (query: string) =>
    request<{ results: SearchResult[] }>('/search', {
      method: 'GET',
      data: { query },
    }),

  // Dashboard (/api/dashboard)
  getDashboardData: (userId: string) => request<{ metrics: DashboardMetrics }>(`/dashboard/${userId}`),

  // Administração (/api/admin)
  listUsers: () => request<{ users: User[] }>('/admin/users'),

  getUserById: (id: string) => request<{ user: User }>(`/admin/users/${id}`),

  updateUser: (
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      company?: string;
      website?: string;
      bio?: string;
    }
  ) =>
    request<{ user: User; message: string }>(`/admin/users/${id}`, {
      method: 'PUT',
      data,
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  // Favoritos (/api/favourites)
  addFavorite: (courseId: string) =>
    request<{ success: boolean; favorite: Favorite }>('/favourites', {
      method: 'POST',
      data: { courseId },
    }),

  removeFavorite: (courseId: string) =>
    request<{ success: boolean }>(`/favourites/${courseId}`, {
      method: 'DELETE',
    }),

  listFavorites: () => request<{ favorites: Favorite[] }>('/favourites'),
};