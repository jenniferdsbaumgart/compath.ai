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

export const api = {
  getUserCoins: () => request<{ coins: number }>('/users/coins'),
  spendCoins: (amount: number) => request<{ coins: number }>('/users/coins/spend', {
    method: 'POST',
    data: { amount },
  }),
  earnCoins: (amount: number) => request<{ coins: number }>('/users/coins/earn', {
    method: 'POST',
    data: { amount },
  }),
  saveProfileResponse: (questionId: string, response: any) =>
    request<{ success: boolean }>('/profile', {
      method: 'POST',
      data: { questionId, response },
    }),
  getProfileRecommendations: () =>
    request<{
      recommendations: Array<{
        niche: string;
        description: string;
        potential: string;
        investmentRange: string;
        timeCommitment: string;
      }>;
    }>('/profile/recommendations'),
  listCourses: () => request<{ courses: any[] }>('/courses'),
  getCourseDetails: (courseId: string) => request<{ course: any }>(`/courses/${courseId}`),
};