"use client";

import { useState, Suspense } from "react";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import PartCard from "@/components/store/PartCard";
import { BIKE_BRANDS, CATEGORIES } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { useListPartsQuery } from "@/store/api/partsApi";
import type { Category, BikeBrand } from "@/lib/types";

const PARTS_PER_PAGE = 8;
type SortKey = "default" | "price_asc" | "price_desc" | "newest";

function PartsContent() {
  const searchParams     = useSearchParams();
  const initialBrand     = (searchParams.get("brand") || "") as BikeBrand | "";
  const initialCategory  = (searchParams.get("category") || "") as Category | "";
  const initialSearch    = searchParams.get("search") || "";

  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands]         = useState<BikeBrand[]>(initialBrand    ? [initialBrand]    : []);
  const [inStockOnly, setInStockOnly]               = useState(false);
  const [sort, setSort]                             = useState<SortKey>("default");
  const [page, setPage]                             = useState(1);
  const [sidebarOpen, setSidebarOpen]               = useState(false);

  // Map UI sort key → API sort params
  const sortMap: Record<SortKey, { sortBy: "name" | "price" | "stock" | "createdAt"; sortDir: "asc" | "desc" }> = {
    default:    { sortBy: "createdAt", sortDir: "desc" },
    price_asc:  { sortBy: "price",     sortDir: "asc"  },
    price_desc: { sortBy: "price",     sortDir: "desc" },
    newest:     { sortBy: "createdAt", sortDir: "desc" },
  };

  const { data, isLoading, isFetching } = useListPartsQuery({
    search:   initialSearch || undefined,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    brand:    selectedBrands.length    === 1 ? selectedBrands[0]    : undefined,
    ...sortMap[sort],
    page,
    limit: PARTS_PER_PAGE,
  });

  const parts      = data?.data.parts ?? [];
  const meta       = data?.data.meta;
  const totalPages = meta?.pages ?? 1;

  // Client-side multi-filter (category/brand multi-select, in-stock, price)
  const filtered = parts.filter((p) => {
    if (selectedCategories.length > 1 && !selectedCategories.includes(p.category as Category)) return false;
    if (selectedBrands.length    > 1 && !selectedBrands.includes(p.brand as BikeBrand))        return false;
    if (inStockOnly && p.stock === 0) return false;
    return true;
  });

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPage(1);
  }
  function toggleBrand(brand: BikeBrand) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  }

  const FilterPanel = () => (
    <aside className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat as Category)}
                onChange={() => toggleCategory(cat as Category)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-primary-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">Bike Brand</h3>
        <div className="space-y-2">
          {BIKE_BRANDS.filter((b) => b !== "Universal").map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand as BikeBrand)}
                onChange={() => toggleBrand(brand as BikeBrand)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-primary-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => { setInStockOnly(!inStockOnly); setPage(1); }}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${inStockOnly ? "bg-primary-700" : "bg-gray-200 dark:bg-gray-600"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Stock Only</span>
        </label>
      </div>

      {(selectedCategories.length > 0 || selectedBrands.length > 0 || inStockOnly) && (
        <button
          onClick={() => { setSelectedCategories([]); setSelectedBrands([]); setInStockOnly(false); setPage(1); }}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium flex items-center gap-1"
        >
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
              {isLoading ? "Loading…" : `${meta?.total ?? 0} part${(meta?.total ?? 0) !== 1 ? "s" : ""} found`}
              {initialSearch && ` for "${initialSearch}"`}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
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

          {/* Mobile sidebar */}
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

          {/* Main grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {meta && !isLoading && (
                  <>Showing {(page - 1) * PARTS_PER_PAGE + 1}–{Math.min(page * PARTS_PER_PAGE, meta.total)} of {meta.total}</>
                )}
              </p>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-32 text-gray-400 dark:text-gray-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading parts…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No parts found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filtered.map((part) => <PartCard key={part.id} part={part} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-primary-800 text-white"
                        : "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen gap-2 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </div>
    }>
      <PartsContent />
    </Suspense>
  );
}
