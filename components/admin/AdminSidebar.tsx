"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Settings,
  Wrench,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "./NotificationBell";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/parts", label: "Parts", icon: Package },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-accent-500 p-1.5 rounded-lg">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">
            Moto<span className="text-accent-500">Mart</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 mt-1 pl-7">
          <ShieldCheck className="w-3 h-3 text-primary-400" />
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                {label}
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* User + actions */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <div className="px-1 pb-1">
          <NotificationBell />
        </div>
        {/* Logged-in user chip */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800">
            <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.identifier}</p>
            </div>
          </div>
        )}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ← Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
