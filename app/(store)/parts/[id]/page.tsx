"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw,
  Wrench, ChevronRight, ThumbsUp, Loader2,
} from "lucide-react";
import { useGetPartQuery, useListPartsQuery } from "@/store/api/partsApi";
import { useCart } from "@/context/CartContext";
import StockBadge, { getStockStatus } from "@/components/store/StockBadge";
import PartCard from "@/components/store/PartCard";
import { reviews } from "@/lib/data";
import type { Category } from "@/lib/types";

type Tab = "description" | "compatibility" | "reviews";

export default function PartDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetPartQuery(id);
  const part = data?.data.part;

  const { data: relatedData } = useListPartsQuery(
    { category: part?.category as Category, limit: 4 },
    { skip: !part }
  );
  const relatedParts = (relatedData?.data.parts ?? []).filter((p) => p.id !== id).slice(0, 4);

  const [quantity, setQuantity]       = useState(1);
  const [activeTab, setActiveTab]     = useState<Tab>("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading part…
      </div>
    );
  }

  if (isError || !part) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-500 dark:text-gray-400">
        <p className="text-4xl">🔧</p>
        <p className="font-semibold">Part not found.</p>
        <Link href="/parts" className="text-sm text-primary-600 hover:underline">← Back to Parts</Link>
      </div>
    );
  }

  const stockStatus = getStockStatus(part.stock, part.minStock);
  const discount    = Math.round(((part.mrp - part.price) / part.mrp) * 100);

  function handleAddToCart() {
    addToCart(part!, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-primary-700 dark:hover:text-primary-300">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/parts" className="hover:text-primary-700 dark:hover:text-primary-300">Parts</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/parts?category=${part.category}`} className="hover:text-primary-700 dark:hover:text-primary-300">{part.category}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-xs">{part.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center min-h-72 lg:min-h-full p-12 relative">
              {part.images?.[0]
                ? <img src={part.images[0]} alt={part.name} className="object-contain max-h-72" />
                : <Wrench className="w-32 h-32 text-gray-300 dark:text-gray-500" />
              }
              {part.isSale && discount > 0 && (
                <span className="absolute top-4 left-4 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-50 dark:bg-blue-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                  {part.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">SKU: {part.sku}</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">{part.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(part.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-600"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{part.rating}</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">({part.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">₹{part.price.toLocaleString("en-IN")}</span>
                {part.mrp > part.price && (
                  <>
                    <span className="text-lg text-gray-400 dark:text-gray-500 line-through">₹{part.mrp.toLocaleString("en-IN")}</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">Save ₹{(part.mrp - part.price).toLocaleString("en-IN")}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mb-5">
                <StockBadge stock={part.stock} minStock={part.minStock} />
                {part.stock > 0 && part.stock <= part.minStock && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">Hurry! Only {part.stock} left</span>
                )}
              </div>

              {part.compatibleBikes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Compatible Bikes:</p>
                  <div className="flex flex-wrap gap-2">
                    {part.compatibleBikes.map((bike) => (
                      <span key={bike} className="bg-blue-50 dark:bg-blue-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                        {bike}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-900 dark:text-gray-100">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(part.stock, q + 1))} disabled={stockStatus === "out_of_stock"} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40">
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={stockStatus === "out_of_stock"}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all ${
                    addedToCart ? "bg-green-500 text-white"
                    : stockStatus === "out_of_stock" ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-accent-500 hover:bg-accent-600 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addedToCart ? "Added to Cart!" : stockStatus === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              <Link href="/cart" className="block w-full text-center py-3 px-6 rounded-xl border-2 border-primary-800 dark:border-primary-600 text-primary-800 dark:text-primary-300 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mb-6">
                View Cart &amp; Checkout
              </Link>

              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 dark:border-gray-700 pt-5">
                {[{ icon: Shield, text: "Genuine Part" }, { icon: Truck, text: "Fast Delivery" }, { icon: RotateCcw, text: "Easy Returns" }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1 text-center">
                    <Icon className="w-4 h-4 text-primary-700 dark:text-primary-300" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {(["description", "compatibility", "reviews"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "text-primary-700 dark:text-primary-300 border-b-2 border-primary-700 dark:border-primary-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab}{tab === "reviews" && <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">({part.reviewCount})</span>}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                <p className="leading-relaxed">{part.description || "No description available."}</p>
                <ul className="space-y-1">
                  <li>Brand: <strong className="text-gray-900 dark:text-gray-100">{part.brand}</strong></li>
                  <li>Category: <strong className="text-gray-900 dark:text-gray-100">{part.category}</strong></li>
                  <li>SKU: <strong className="text-gray-900 dark:text-gray-100">{part.sku}</strong></li>
                  <li>Stock Available: <strong className="text-gray-900 dark:text-gray-100">{part.stock} units</strong></li>
                </ul>
              </div>
            )}
            {activeTab === "compatibility" && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This part is compatible with the following bike models:</p>
                {part.compatibleBikes.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No compatibility info available.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {part.compatibleBikes.map((bike) => (
                      <div key={bike} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{bike}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-5">
                <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{part.rating}</p>
                    <div className="flex justify-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(part.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-600"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{part.reviewCount} reviews</p>
                  </div>
                </div>
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">{review.user[0]}</div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{review.user}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-600"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                    <button className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      <ThumbsUp className="w-3 h-3" /> Helpful
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {relatedParts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5">Related Parts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedParts.map((p) => <PartCard key={p.id} part={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
