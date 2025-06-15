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
  const response = await axios.post('http://compath-knn:8000/predict', data);
  return response.data;
}
