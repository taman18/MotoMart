"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Wrench, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const deliveryFee = totalPrice >= 500 ? 0 : 60;
  const finalTotal  = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Browse our parts catalogue and add items to your cart.</p>
          <Link href="/parts" className="inline-flex items-center gap-2 bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Browse Parts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Shopping Cart{" "}
            <span className="text-gray-400 dark:text-gray-500 font-normal text-base">({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {items.map(({ part, quantity }) => (
              <div key={part.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                  <Wrench className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/parts/${part.id}`} className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-700 dark:hover:text-primary-300 transition-colors leading-tight line-clamp-2">
                        {part.name}
                      </Link>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">{part.category}</span>
                    </div>
                    <button onClick={() => removeFromCart(part.id)} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5 mb-3">
                    {part.compatibleBikes.slice(0, 2).map((bike) => (
                      <span key={bike} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{bike}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(part.id, quantity - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">{quantity}</span>
                      <button onClick={() => updateQuantity(part.id, Math.min(part.stock, quantity + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100">₹{(part.price * quantity).toLocaleString("en-IN")}</p>
                      {quantity > 1 && <p className="text-xs text-gray-400 dark:text-gray-500">₹{part.price.toLocaleString("en-IN")} each</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/parts" className="inline-flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300 hover:underline font-medium mt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 sticky top-20">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery Charges</span>
                  {deliveryFee === 0
                    ? <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                    : <span>₹{deliveryFee}</span>}
                </div>
                {totalPrice < 500 && (
                  <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-3 py-2 text-xs text-orange-700 dark:text-orange-400">
                    <Tag className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Add ₹{(500 - totalPrice).toLocaleString("en-IN")} more for FREE delivery
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-gray-100 text-base">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Link href="/checkout" className="block w-full text-center bg-accent-500 hover:bg-accent-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                Proceed to Order <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 justify-center">
                <span>💳</span> Cash on Delivery available
              </div>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg text-xs text-green-700 dark:text-green-400">
                🛡️ All parts are 100% genuine with return/exchange guarantee.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
