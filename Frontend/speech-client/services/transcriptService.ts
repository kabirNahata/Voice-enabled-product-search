import apiClient from "@/lib/apiClient";
import { Transcript, CreateTranscriptRequest } from "@/types";

export const transcriptService = {
  getBySession: async (sessionId: string): Promise<Transcript[]> => {
    const res = await apiClient.get<Transcript[]>(`/api/transcripts/session/${sessionId}`);
    return res.data;
  },

  create: async (request: CreateTranscriptRequest): Promise<Transcript> => {
    const res = await apiClient.post<Transcript>("/api/transcripts", request);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/transcripts/${id}`);
  },
};