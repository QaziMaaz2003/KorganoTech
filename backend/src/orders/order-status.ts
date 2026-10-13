import type { OrderStatus } from '../generated/prisma/client.js';

/** Allowed next statuses. Cancelling restocks every line. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const ACTIVE_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
];

export const STATUS_NOTES: Record<OrderStatus, string> = {
  PENDING: 'Order placed — Cash on Delivery',
  CONFIRMED: 'Order confirmed',
  PROCESSING: 'Order is being prepared',
  SHIPPED: 'Order shipped',
  DELIVERED: 'Order delivered',
  CANCELLED: 'Order cancelled',
};
