import api from "./api";

import {
  ProductsResponse,
  Product,
  CreateProductData,
  UpdateProductData,
} from "@/types";

export const productsApi = {
  // Get all products with pagination and search
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const { data } = await api.get<ProductsResponse>("/api/products", {
      params,
    });
    return data;
  },

  //   Get single product by ID
  getProduct: async (id: string) => {
    const { data } = await api.get<Product>(`/api/products/${id}`);
    return data;
  },

  //   Create new product (admin only)
  createProduct: async (productData: CreateProductData) => {
    const { data } = await api.post<Product>("/api/products", productData);
    return data;
  },

  //   Update product (ADMIN only)
  updateProduct: async (id: string, productData: CreateProductData) => {
    const { data } = await api.put<Product>(`/api/products/${id}`, productData);
    return data;
  },

  deleteProduct: async (id: string) => {
    const { data } = await api.delete(`/api/products/${id}`);
    return data;
  },

  getLowStockProducts: async () => {
    const { data } = await api.get<{ count: number; products: Product[] }>(
      "/api/products/low-stock"
    );
    return data;
  },
};
