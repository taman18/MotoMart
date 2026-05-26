"use client";

import Link from "next/link";
import { ShoppingCart, Star, Wrench } from "lucide-react";
import { Part } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import StockBadge, { getStockStatus } from "./StockBadge";

interface Props {
  part: Part;
}

export default function PartCard({ part }: Props) {
  const { addToCart } = useCart();
  const stockStatus = getStockStatus(part.stock, part.minStock);
  const discount = Math.round(((part.mrp - part.price) / part.mrp) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group overflow-hidden flex flex-col">
      <Link href={`/parts/${part.id}`} className="block relative overflow-hidden bg-gray-50 dark:bg-gray-700/50">
        <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
          <Wrench className="w-16 h-16 text-gray-300 dark:text-gray-500" />
        </div>
        {part.isSale && discount > 0 && (
          <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        {part.isFeatured && (
          <span className="absolute top-2 right-2 bg-primary-800 text-white text-xs font-bold px-2 py-0.5 rounded">
            Featured
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded w-fit mb-2">
          {part.category}
        </span>

        <Link href={`/parts/${part.id}`} className="group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 mb-2">
            {part.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1 mb-3">
          {part.compatibleBikes.slice(0, 2).map((bike) => (
            <span
              key={bike}
              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full"
            >
              {bike}
            </span>
          ))}
          {part.compatibleBikes.length > 2 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 px-1">+{part.compatibleBikes.length - 2}</span>
          )}
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{part.rating}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">({part.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{part.price.toLocaleString("en-IN")}</span>
            {part.mrp > part.price && (
              <span className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{part.mrp.toLocaleString("en-IN")}</span>
            )}
          </div>

          <div className="mb-3">
            <StockBadge stock={part.stock} minStock={part.minStock} />
          </div>

          <button
            onClick={() => addToCart(part)}
            disabled={stockStatus === "out_of_stock"}
            className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-gray-500 text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {stockStatus === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
