import apiClient from './client';
import type { ConnectorSetting } from '../types';

export interface ServerIpResponse {
  ip: string;
}

export interface UpdateConnectorData {
  enabled: boolean;
  config: Record<string, string>;
}

export async function getConnectors(): Promise<ConnectorSetting[]> {
  const res = await apiClient.get<ConnectorSetting[]>('/api/connectors');
  return res.data;
}

export async function updateConnector(
  name: string,
  data: UpdateConnectorData
): Promise<ConnectorSetting> {
  const res = await apiClient.put<ConnectorSetting>(`/api/connectors/${name}`, data);
  return res.data;
}

export async function getSuppliers(): Promise<ConnectorSetting[]> {
  const res = await apiClient.get<ConnectorSetting[]>('/api/suppliers');
  return res.data;
}

export async function updateSupplier(
  name: string,
  data: UpdateConnectorData
): Promise<ConnectorSetting> {
  const res = await apiClient.put<ConnectorSetting>(`/api/suppliers/${name}`, data);
  return res.data;
}

export async function getServerIp(): Promise<ServerIpResponse> {
  const res = await apiClient.get<ServerIpResponse>('/api/server-ip');
  return res.data;
}
