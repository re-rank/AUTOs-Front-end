import apiClient from './client';
import type { DashboardData } from '../types';

export interface DomeggookStatus {
  logged_in: boolean;
}

export interface ActionResult {
  message: string;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await apiClient.get<DashboardData>('/api/dashboard');
  return res.data;
}

export async function getDomeggookStatus(): Promise<DomeggookStatus> {
  const res = await apiClient.get<DomeggookStatus>('/api/domeggook-status');
  return res.data;
}

export async function domeggookLogin(): Promise<ActionResult> {
  const res = await apiClient.post<ActionResult>('/api/domeggook-login');
  return res.data;
}

export async function manualCheck(): Promise<ActionResult> {
  const res = await apiClient.post<ActionResult>('/api/manual-check');
  return res.data;
}

export async function manualTracking(): Promise<ActionResult> {
  const res = await apiClient.post<ActionResult>('/api/manual-tracking');
  return res.data;
}

export interface DomeggookOption {
  name: string;
  values: string[];
}

export async function getDomeggookOptions(url: string): Promise<{ options: DomeggookOption[] }> {
  const res = await apiClient.get<{ options: DomeggookOption[] }>('/api/domeggook-options', {
    params: { url },
  });
  return res.data;
}
