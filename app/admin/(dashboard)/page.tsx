"use client";

import Link from "next/link";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Eye,
  Wrench,
} from "lucide-react";
import StatsCard from "@/components/store/StatsCard";
import OrderStatusBadge from "@/components/store/OrderStatusBadge";
import { parts, orders } from "@/lib/data";

const lowStockParts = parts.filter((p) => p.stock > 0 && p.stock <= p.minStock);
const outOfStockParts = parts.filter((p) => p.stock === 0);
const totalRevenue = orders
  .filter((o) => o.status === "delivered")
  .reduce((sum, o) => sum + o.total, 0);

const topSelling = [...parts]
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 5);

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link
          href="/admin/parts"
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Package className="w-4 h-4" /> Manage Parts
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          icon={Package}
          label="Total Parts"
          value={parts.length}
          sub={`${outOfStockParts.length} out of stock`}
          color="blue"
        />
        <StatsCard
          icon={ShoppingBag}
          label="Total Orders"
          value={orders.length}
          sub={`${orders.filter((o) => o.status === "pending").length} pending`}
          color="purple"
        />
        <StatsCard
          icon={IndianRupee}
          label="Revenue (Delivered)"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          sub="From delivered orders"
          color="green"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={lowStockParts.length + outOfStockParts.length}
          sub={`${outOfStockParts.length} out of stock`}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary-700 dark:text-primary-300 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Items</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-400">{order.id}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{order.customer}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{order.city}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-gray-100">
                      ₹{order.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="flex items-center gap-1 text-xs text-primary-700 dark:text-primary-300 hover:underline font-medium">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
              <h2 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Stock Alerts
              </h2>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {lowStockParts.length + outOfStockParts.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-60 overflow-y-auto">
              {outOfStockParts.map((part) => (
                <div key={part.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{part.name}</p>
                    <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                  </div>
                </div>
              ))}
              {lowStockParts.map((part) => (
                <div key={part.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{part.name}</p>
                    <p className="text-xs text-orange-500 font-medium">Low: {part.stock} left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Top Selling</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {topSelling.map((part, i) => (
                <div key={part.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{part.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{part.reviewCount} sold</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    ₹{part.price.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
