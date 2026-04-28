export interface Session {
  id: string;
  name: string;
  createdAt: string;
  transcripts?: Transcript[];
}

export interface Transcript {
  id: string;
  sessionId: string;
  text: string;
  type: "stt" | "tts";
  language?: string;
  confidence?: number;
  createdAt: string;
}

export interface CreateSessionRequest {
  name: string;
}

export interface CreateTranscriptRequest {
  sessionId: string;
  text: string;
  type: "stt" | "tts";
  language?: string;
  confidence?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sku: string;
  stock: number;
  imageUrl?: string;
  rating?: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sku: string;
  stock: number;
  imageUrl?: string;
  rating?: number;
  isActive?: boolean;
}

export interface ProductSearchRequest {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: string;
}

export interface VoiceSearchRequest {
  transcript: string;
}

export interface VoiceSearchResponse {
  transcript: string;
  parsedFilter: ProductSearchRequest;
  results: Product[];
  count: number;
}