"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Search, Menu, X, Wrench, ChevronDown,
  User, LogOut, ShieldCheck, LogIn, UserPlus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-accent-500 p-1.5 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Moto<span className="text-accent-500">Mart</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/parts" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
              Browse Parts <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <Link href="/parts" className="text-gray-300 hover:text-white transition-colors">Bike Brands</Link>
            <Link href="/#about" className="text-gray-300 hover:text-white transition-colors">About</Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <form
              onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/parts?search=${encodeURIComponent(searchQuery)}`; }}
              className="hidden sm:flex items-center bg-gray-800 rounded-lg px-3 py-1.5 gap-2 border border-gray-700 focus-within:border-primary-500 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-36 lg:w-52"
              />
            </form>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {/* User dropdown (desktop) */}
            {isLoggedIn ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name[0]}
                  </div>
                  <span className="text-sm text-gray-300 max-w-[80px] truncate">{user?.name.split(" ")[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{user?.identifier}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/cart" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <ShoppingCart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      My Cart
                      {totalItems > 0 && (
                        <span className="ml-auto bg-accent-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>
                      )}
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link href="/register" className="flex items-center gap-1.5 text-sm bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold">
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-4 space-y-3">
          <form
            onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { window.location.href = `/parts?search=${encodeURIComponent(searchQuery)}`; setMenuOpen(false); } }}
            className="flex items-center bg-gray-700 rounded-lg px-3 py-2 gap-2"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search parts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm text-white placeholder-gray-400 outline-none flex-1" />
          </form>
          <Link href="/parts" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-1">Browse Parts</Link>
          <Link href="/parts" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-1">Bike Brands</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-1">About</Link>
          <div className="border-t border-gray-700 pt-3">
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 py-1">
                  <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-bold text-white">{user?.name[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.identifier}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-primary-300 hover:text-white py-1">
                    <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-1">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 text-sm border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 py-2 rounded-lg transition-colors">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-accent-500 hover:bg-accent-600 text-white py-2 rounded-lg transition-colors font-semibold">
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
