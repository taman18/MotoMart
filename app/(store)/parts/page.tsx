"use client";

import { useState, useMemo, Suspense } from "react";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import PartCard from "@/components/store/PartCard";
import { parts, BIKE_BRANDS, CATEGORIES } from "@/lib/data";
import { useSearchParams } from "next/navigation";

const PARTS_PER_PAGE = 8;
type SortKey = "default" | "price_asc" | "price_desc" | "rating" | "newest";

function PartsContent() {
  const searchParams = useSearchParams();
  const initialBrand    = searchParams.get("brand") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSearch   = searchParams.get("search") || "";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands]         = useState<string[]>(initialBrand    ? [initialBrand]    : []);
  const [priceMax, setPriceMax]     = useState(5000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort]             = useState<SortKey>("default");
  const [searchQuery]               = useState(initialSearch);
  const [page, setPage]             = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...parts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.compatibleBikes.some((b) => b.toLowerCase().includes(q))
      );
    }
    if (selectedCategories.length) result = result.filter((p) => selectedCategories.includes(p.category));
    if (selectedBrands.length)
      result = result.filter((p) =>
        selectedBrands.includes(p.brand) ||
        p.compatibleBikes.some((b) => selectedBrands.some((br) => b.includes(br)))
      );
    result = result.filter((p) => p.price <= priceMax);
    if (inStockOnly) result = result.filter((p) => p.stock > 0);
    switch (sort) {
      case "price_asc":  result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "rating":     result.sort((a, b) => b.rating - a.rating); break;
      case "newest":     result.sort((a, b) => Number(b.id) - Number(a.id)); break;
    }
    return result;
  }, [searchQuery, selectedCategories, selectedBrands, priceMax, inStockOnly, sort]);

  const totalPages = Math.ceil(filtered.length / PARTS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PARTS_PER_PAGE, page * PARTS_PER_PAGE);

  function toggleCategory(cat: string) { setSelectedCategories((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]); setPage(1); }
  function toggleBrand(brand: string)  { setSelectedBrands((p) => p.includes(brand) ? p.filter((b) => b !== brand) : [...p, brand]); setPage(1); }

  const FilterPanel = () => (
    <aside className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-primary-700" />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">Bike Brand</h3>
        <div className="space-y-2">
          {BIKE_BRANDS.filter((b) => b !== "Universal").map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-primary-700" />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">Max Price</h3>
        <input type="range" min={100} max={5000} step={50} value={priceMax} onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }} className="w-full accent-accent-500" />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>₹100</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">₹{priceMax.toLocaleString("en-IN")}</span>
          <span>₹5,000</span>
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div onClick={() => { setInStockOnly(!inStockOnly); setPage(1); }} className={`w-10 h-5 rounded-full transition-colors relative ${inStockOnly ? "bg-primary-700" : "bg-gray-200 dark:bg-gray-600"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Stock Only</span>
        </label>
      </div>

      {(selectedCategories.length > 0 || selectedBrands.length > 0 || inStockOnly || priceMax < 5000) && (
        <button onClick={() => { setSelectedCategories([]); setSelectedBrands([]); setPriceMax(5000); setInStockOnly(false); setPage(1); }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium flex items-center gap-1">
          <X className="w-3.5 h-3.5" /> Clear Filters
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Spare Parts</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} part{filtered.length !== 1 ? "s" : ""} found{searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 sticky top-20">
              <FilterPanel />
            </div>
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900 dark:text-gray-100">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-gray-500 dark:text-gray-400" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * PARTS_PER_PAGE + 1}–{Math.min(page * PARTS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <select value={sort} onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }} className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none">
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Best Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {paginated.length === 0 ? (
              <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No parts found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {paginated.map((part) => <PartCard key={part.id} part={part} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary-800 text-white" : "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">Loading...</div>}>
      <PartsContent />
    </Suspense>
  );
}
