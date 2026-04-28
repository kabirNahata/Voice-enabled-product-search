"use client";

import { Product } from "@/types";
import { Star, Package, Tag } from "lucide-react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const stockStatus =
    product.stock === 0
      ? { label: "Out of stock", class: "text-red-400 bg-red-900/20" }
      : product.stock < 10
      ? { label: `Only ${product.stock} left`, class: "text-yellow-400 bg-yellow-900/20" }
      : { label: "In stock", class: "text-green-400 bg-green-900/20" };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-500 transition group">
      {/* Image placeholder */}
      <div className="h-40 bg-gray-900 flex items-center justify-center group-hover:bg-gray-850 transition">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="w-12 h-12 text-gray-700" />
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Category + Brand */}
        <div className="flex items-center justify-between">
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full capitalize">
            {product.category}
          </span>
          <span className="text-xs text-gray-500">{product.brand}</span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(product.rating!)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-600"
                }`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price + Stock */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${stockStatus.class}`}>
            {stockStatus.label}
          </span>
        </div>

        {/* SKU */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Tag className="w-3 h-3" />
          {product.sku}
        </div>
      </div>
    </div>
  );
}