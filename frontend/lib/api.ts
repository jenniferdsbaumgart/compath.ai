import { getToken } from './auth';

// ENDPOINTS
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string;
  data?: any;
}

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
      return Promise.reject(new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`));
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

interface User {
  avatar: string;
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

interface CoinTransaction {
  id: string;
  amount: number;
  date: string;
  type: 'purchase' | 'spend' | 'earn';
}

interface Recommendation {
  profile: string;
  niche: string;
  description: string;
  potential: string;
  investmentRange: string;
  timeCommitment: string;
  actionButton: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  duration?: number;
  instructor?: string;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  completedCourses: number;
  totalRevenue: number;
}

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  url?: string;
}

interface Favourite {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  url?: string;
  savedAt?: string;
}

export const api = {
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
    request<{ success: boolean; profileCompletion: number }>('/users/profile', {
      method: 'POST',
      data: { questionId, response },
    }),

  getProfileRecommendations: (data: any) =>
  request<{ recommendations: Recommendation[] }>('/users/profile/recommendations', {
    method: 'POST',
    data,
  }),

  purchaseCoins: (amount: number) =>
    request<{ transaction: CoinTransaction; coins: number }>('/coins/purchase', {
      method: 'POST',
      data: { amount },
    }),

  getCoinHistory: () =>
    request<{ transactions: CoinTransaction[] }>('/coins/history'),

  listCourses: () => request<{ courses: Course[] }>('/courses'),

  getCourseDetails: (courseId: string) => request<{ course: Course }>(`/courses/${courseId}`),

  enrollCourse: (courseId: string) =>
    request<{ success: boolean; message: string }>('/courses/enroll', {
      method: 'POST',
      data: { courseId },
    }),

  search: (query: string) =>
    request<{ results: SearchResult[] }>('/search', {
      method: 'POST',
      data: { query },
    }),

  getDashboardData: (userId: string) => request<{ metrics: DashboardMetrics }>(`/dashboard/${userId}`),

  listUsers: () => request<{ users: User[] }>('/admin/users'),

  getUserById: (id: string) => request<{ user: User }>(`/users/${id}`),

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
      avatar?: string;
      profileCompletion?: number;
      favourites?: Array<{
        title: string;
        description?: string;
        tags?: string[];
        url?: string;
        savedAt?: string;
      }>;
    }
  ) =>
    request<{ user: User; message: string }>(`/users/${id}`, {
      method: 'POST',
      data,
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  addfavourite: (courseId: string) =>
    request<{ success: boolean; favourite: Favourite }>('/favourites', {
      method: 'POST',
      data: { courseId },
    }),

  removefavourite: (courseId: string) =>
    request<{ success: boolean }>(`/favourites/${courseId}`, {
      method: 'DELETE',
    }),

  listfavourites: () => request<{ favourites: Favourite[] }>('/favourites'),

  saveUserProfile: (data: {
    userId: string;
    education: string[];
    areas: string[];
    investment: number;
    time: number;
    hobbies: string[];
    audience: string[];
  }) =>
    request<{ message: string }>('/profile/save', {
      method: 'POST',
      data,
    }),

  retrainModelKNN: () =>
    request<{ accuracy: number }>('/admin/retrain', { method: 'POST' })
};