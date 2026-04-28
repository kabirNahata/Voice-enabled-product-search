"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import VoiceSearchBar from "@/components/products/VoiceSearchBar";
import ProductGrid from "@/components/products/ProductGrid";
import { VoiceSearchResponse } from "@/types";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const { products, loading, error, reset } = useProducts();
  const [voiceResults, setVoiceResults] = useState<VoiceSearchResponse | null>(null);

  const handleVoiceResult = (response: VoiceSearchResponse) => {
    setVoiceResults(response);
  };

  const handleClear = () => {
    setVoiceResults(null);
    reset();
  };

  const displayProducts = voiceResults ? voiceResults.results : products;
  const resultCount = voiceResults ? voiceResults.count : undefined;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-blue-400 w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold">Product Store</h1>
            <p className="text-sm text-gray-400">
              Use your voice to search products
            </p>
          </div>
        </div>
      </div>

      {/* Voice Search */}
      <VoiceSearchBar onResult={handleVoiceResult} onClear={handleClear} />

      {/* Results */}
      <ProductGrid
        products={displayProducts}
        loading={loading}
        error={error}
        resultCount={resultCount}
      />
    </main>
  );
}