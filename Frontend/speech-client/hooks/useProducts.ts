import { useCallback, useEffect, useState } from "react";
import { Product, ProductSearchRequest } from "@/types";
import { productService } from "@/services/productService";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const search = useCallback(async (request: ProductSearchRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.search(request);
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Search failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback((): void => {
    fetchAll();
  }, [fetchAll]);

  return { products, loading, error, search, reset };
}