// ── User & Auth ──
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ── Services ──
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  rate: number;
  minQuantity: number;
  maxQuantity: number;
  type: "default" | "custom_comments" | "subscriptions" | "polls";
  isActive: boolean;
}

// ── Orders ──
export type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "partial"
  | "cancelled"
  | "refunded";

export interface Order {
  id: number;
  serviceId: number;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  startCount?: number;
  remains?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Transactions ──
export type TransactionType = "deposit" | "purchase" | "refund" | "bonus";

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

// ── Tickets / Support ──
export type TicketStatus = "open" | "answered" | "closed";

export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: number;
  body: string;
  isStaff: boolean;
  createdAt: string;
}

// ── API Response ──
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
