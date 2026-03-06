import apiClient from './client';
import type { Mapping } from '../types';

export interface NaverProductsResponse {
  contents: NaverProduct[];
  totalCount?: number;
}

export interface NaverProductOption {
  id?: number;
  optionName1: string;
  optionName2?: string;
  optionName3?: string;
  stockQuantity?: number;
  price?: number;
  usable?: boolean;
}

export interface NaverProduct {
  channelProductNo?: string | number;
  originProductNo?: string | number;
  channelProductName?: string;
  name?: string;
  salePrice?: number;
  channelProductPrice?: number;
  statusType?: string;
  channelProductDisplayStatusType?: string;
  options?: NaverProductOption[];
}

export interface CreateMappingData {
  source: string;
  naver_product_id: string;
  naver_product_name: string;
  domeggook_url: string;
  domeggook_option: string;
}

export async function getMappings(): Promise<Mapping[]> {
  const res = await apiClient.get<Mapping[]>('/api/mappings');
  return res.data;
}

export async function createMapping(data: CreateMappingData): Promise<Mapping> {
  const res = await apiClient.post<Mapping>('/api/mappings', data);
  return res.data;
}

export async function deleteMapping(id: number): Promise<void> {
  await apiClient.delete(`/api/mappings/${id}`);
}

export async function getNaverProducts(
  page = 1,
  size = 100
): Promise<NaverProductsResponse> {
  const res = await apiClient.get<NaverProductsResponse>('/api/naver-products', {
    params: { page, size },
  });
  return res.data;
}
