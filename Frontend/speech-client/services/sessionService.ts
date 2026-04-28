import apiClient from "@/lib/apiClient";
import { Session, CreateSessionRequest } from "@/types";

export const sessionService = {
  getAll: async (): Promise<Session[]> => {
    const res = await apiClient.get<Session[]>("/api/sessions");
    return res.data;
  },

  getById: async (id: string): Promise<Session> => {
    const res = await apiClient.get<Session>(`/api/sessions/${id}`);
    return res.data;
  },

  create: async (request: CreateSessionRequest): Promise<Session> => {
    const res = await apiClient.post<Session>("/api/sessions", request);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/sessions/${id}`);
  },
};