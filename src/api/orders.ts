import apiClient from './client';
import type { Order } from '../types';

export async function getOrders(): Promise<Order[]> {
  const res = await apiClient.get<Order[]>('/api/orders');
  return res.data;
}
