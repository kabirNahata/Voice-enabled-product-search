import apiClient from "@/lib/apiClient";
import {
  Product,
  CreateProductRequest,
  ProductSearchRequest,
  VoiceSearchRequest,
  VoiceSearchResponse,
} from "@/types";

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const res = await apiClient.get<Product[]>("/api/products");
    return res.data;
  },

  getById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<Product>(`/api/products/${id}`);
    return res.data;
  },

  search: async (request: ProductSearchRequest): Promise<Product[]> => {
    const res = await apiClient.post<Product[]>("/api/products/search", request);
    return res.data;
  },

  voiceSearch: async (request: VoiceSearchRequest): Promise<VoiceSearchResponse> => {
    const res = await apiClient.post<VoiceSearchResponse>("/api/products/voice-search", request);
    return res.data;
  },

  create: async (product: CreateProductRequest): Promise<Product> => {
    const res = await apiClient.post<Product>("/api/products", product);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
};