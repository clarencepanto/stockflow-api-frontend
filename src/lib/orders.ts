import api from "./api";
import {
  OrdersResponse,
  Order,
  CreateOrderData,
  UpdateOrderStatusData,
} from "@/types";

export const ordersApi = {
  // get all orders with pagination and filters

  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) => {
    const { data } = await api.get<OrdersResponse>("/api/orders", { params });
    return data;
  },

  //   get single order by id
  getOrder: async (id: string) => {
    const { data } = await api.get<Order>(`/api/orders/${id}`);
    return data;
  },

  //   Create new Order
  createOrder: async (orderData: CreateOrderData) => {
    const { data } = await api.post<Order>("/api/orders", orderData);
    return data;
  },

  //Update order status
  updateOrderStatus: async (id: string, statusData: UpdateOrderStatusData) => {
    const { data } = await api.patch<Order>(
      `/api/orders/${id}/status`,
      statusData
    );
    return data;
  },

  //   get todays order
  getTodaysOrder: async () => {
    const { data } = await api.get<{
      count: number;
      totalRevenue: number;
      orders: Order[];
    }>("/api/orders/today");
  },
};
