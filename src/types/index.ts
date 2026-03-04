export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Order {
  id: number;
  naver_order_id: string | null;
  naver_product_order_id: string;
  product_name: string | null;
  quantity: number;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;
  status: string;
  domeggook_order_id: string | null;
  tracking_company: string | null;
  tracking_number: string | null;
  created_at: string | null;
  updated_at: string | null;
  source: string;
  source_order_id: string | null;
}

export interface Mapping {
  id: number;
  naver_product_id: string;
  naver_product_name: string | null;
  domeggook_url: string;
  domeggook_option: string;
  source: string;
}

export interface ConnectorSetting {
  name: string;
  enabled: boolean;
  config: Record<string, string>;
}

export interface DashboardData {
  total_orders: number;
  status_summary: Record<string, number>;
  recent_orders: Order[];
}
