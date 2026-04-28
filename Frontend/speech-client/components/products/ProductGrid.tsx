"use client";

import { Product } from "@/types";
import ProductCard from "./ProductCard";
import { Loader2, PackageSearch } from "lucide-react";

interface Props {
  products: Product[];
  loading: boolean;
  error: string | null;
  resultCount?: number;
}

export default function ProductGrid({ products, loading, error, resultCount }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <p className="text-gray-400 text-sm">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <PackageSearch className="w-12 h-12" />
        <p className="text-sm">No products found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resultCount !== undefined && (
        <p className="text-sm text-gray-400">
          {resultCount} product{resultCount !== 1 ? "s" : ""} found
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}