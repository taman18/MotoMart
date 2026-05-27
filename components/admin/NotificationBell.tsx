"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, PackageX, CheckCheck, X } from "lucide-react";
import { useListNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from "@/store/api/notificationsApi";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useListNotificationsQuery({}, {
    pollingInterval: 30_000, // poll every 30s for new stock alerts
  });
  const [markRead]    = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const notifications = data?.data.notifications ?? [];
  const unreadCount   = data?.data.unreadCount ?? 0;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleMarkRead(id: string) {
    await markRead(id);
  }

  async function handleMarkAll() {
    await markAllRead();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full ml-2 bottom-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Stock Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <CheckCheck className="w-3 h-3" /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                All clear — no stock alerts
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 items-start transition-colors ${
                    n.isRead
                      ? "opacity-60"
                      : "bg-orange-50/50 dark:bg-orange-900/10"
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    n.type === "out_of_stock"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-orange-100 dark:bg-orange-900/30"
                  }`}>
                    {n.type === "out_of_stock"
                      ? <PackageX className="w-3.5 h-3.5 text-red-500" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${
                      n.type === "out_of_stock"
                        ? "text-red-700 dark:text-red-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-primary-500 hover:bg-primary-700 transition-colors"
                      title="Mark as read"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
