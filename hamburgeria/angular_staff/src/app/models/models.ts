// src/app/models/models.ts

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  available: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  status: OrderStatus;
  total: number;
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export type OrderStatus =
  | 'in_attesa'
  | 'in_preparazione'
  | 'pronto'
  | 'consegnato';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  in_attesa: 'In attesa',
  in_preparazione: 'In preparazione',
  pronto: 'Pronto 🍔',
  consegnato: 'Consegnato',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  in_attesa: '#F59E0B',
  in_preparazione: '#3B82F6',
  pronto: '#10B981',
  consegnato: '#6B7280',
};
