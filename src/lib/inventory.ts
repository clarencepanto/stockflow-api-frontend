import api from "./api";
import { InventoryAdjustmentsResponse, CreateAdjustmentData } from "@/types";

export const inventoryApi = {
  // get all inventory adjustments with pagination and filters

  getAdjustments: async (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    type?: string;
  }) => {
    const { data } = await api.get<InventoryAdjustmentsResponse>(
      "/api/inventory",
      { params }
    );

    return data;
  },

  //   Create new inventory adjustment
  createAdjustment: async (adjustmentData: CreateAdjustmentData) => {
    const { data } = await api.post("/api/inventory", adjustmentData);
    return data;
  },

  //   Get adjustments for a specific product
  getProductAdjustments: async (productId: string) => {
    const { data } = await api.get(`/api/inventory/product/${productId}`);
  },
};
