import { LargeNumberLike } from "crypto";

export interface User {
  id: string;
  email: string;
  name: string; // Changed from username
  role: "ADMIN" | "STAFF"; // Changed from ADMIN | MANAGER | USER
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  name: string; // Changed from username
  password: string;
  role?: "ADMIN" | "STAFF"; // Changed roles
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string; // Changed from message
  errors?: any[]; // For Zod validation errors
}

// Replace your existing Product types with these:

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stockLevel: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Changed: Make all optional fields truly optional
export interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  price: number;
  stockLevel?: number; // Optional
  lowStockThreshold?: number; // Optional
}

// Changed: All fields optional for updates
export interface UpdateProductData {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  stockLevel?: number;
  lowStockThreshold?: number;
}

// Order Types
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
  createdAt: string;
  product: {
    name: string;
    sku: string;
    price?: number;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderData {
  items: CreateOrderItem[];
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
}
export interface UpdateOrderStatusData {
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
}

// Inventory Types

export interface InventoryAdjustment {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  type: "IN" | "OUT";
  reason: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };

  user: {
    name: string;
    email: string;
  };
}

export interface InventoryAdjustmentsResponse {
  adjustments: InventoryAdjustment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdjustmentData {
  productId: string;
  quantity: number;
  type: "IN" | "OUT";
  reason?: string;
}

// dashboard types

export interface DashboardStats {
  totalProducts: number;
  activeOrders: number;
  lowStockItems: number;
  revenueThisMonth: number;
}

export interface RecentOrder {
  id: string;
  userId: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  user: {
    name: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    product: {
      name: string;
    };
  }[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stockLevel: number;
  lowStockThreshold: number;
}

// Update this interface
export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  charts: {
    revenueChart: { date: string; revenue: number }[];
    stockLevelsChart: {
      name: string;
      stockLevel: number;
      lowStockThreshold: number;
    }[];
    orderStatusChart: { status: string; count: number }[];
  };
}
