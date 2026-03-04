import apiClient from './client';
import type { User } from '../types';

export interface LoginResponse {
  access_token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/auth/login', { email, password });
  return res.data;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/auth/register', { email, password, name });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>('/api/auth/me');
  return res.data;
}
