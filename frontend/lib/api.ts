import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  token?: string;
  data?: any;
}

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
      return Promise.reject(new Error(errorData.message || 'Ocorreu um erro na requisição'));
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    // For API unavailable, mock the response for demo purposes
    if (endpoint === '/profile/recommendations') {
      return {
        recommendations: [
          {
            niche: 'Cursos Online de Produtividade',
            description: 'Criar cursos e conteúdos digitais para pessoas que querem aumentar sua produtividade e organização.',
            potential: 'Alto',
            investmentRange: 'R$500 - R$1.000',
            timeCommitment: '10-20 horas por semana'
          },
          {
            niche: 'Consultoria em Marketing Digital',
            description: 'Oferecer serviços de consultoria para pequenas empresas que desejam melhorar sua presença online.',
            potential: 'Médio-Alto',
            investmentRange: 'R$1.000 - R$5.000',
            timeCommitment: '20-40 horas por semana'
          },
          {
            niche: 'Produtos Sustentáveis para Casa',
            description: 'Criar uma loja online com produtos ecológicos e sustentáveis para uso doméstico.',
            potential: 'Médio',
            investmentRange: 'R$5.000 - R$10.000',
            timeCommitment: '20-30 horas por semana'
          }
        ]
      } as T;
    }
    return Promise.reject(error);
  }
}

// Mock APIs for the Compath platform
export const api = {
  // User coins
  getUserCoins: () => request<{ coins: number }>('/user/coins'),
  spendCoins: (amount: number) => request<{ coins: number }>('/user/coins/spend', { 
    method: 'POST', 
    data: { amount } 
  }),
  earnCoins: (amount: number) => request<{ coins: number }>('/user/coins/earn', { 
    method: 'POST', 
    data: { amount } 
  }),
  
  // Profile wizard
  saveProfileResponse: (questionId: string, response: any) => 
    request<{ success: boolean }>('/profile/response', { 
      method: 'POST', 
      data: { questionId, response } 
    }),
  
  getProfileRecommendations: () => 
    request<{ 
      recommendations: Array<{
        niche: string;
        description: string;
        potential: string;
        investmentRange: string;
        timeCommitment: string;
      }> 
    }>('/profile/recommendations'),
  
  // Courses
  listCourses: () => request<{ courses: any[] }>('/courses'),
  getCourseDetails: (courseId: string) => request<{ course: any }>(`/courses/${courseId}`),
};