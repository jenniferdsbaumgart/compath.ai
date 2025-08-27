import axios from 'axios';
import { encodeProfileToFeatures } from '../utils/featureEncoder';

interface UserProfile {
  education: string[];
  areas: string[];
  investment: number;
  time: number;
  hobbies: string[];
  audience: string[];
}

export async function fetchRecommendationsFromPython(data: { features: number[] }) {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_KNN_URL}/predict`, data);
  return response.data;
}
