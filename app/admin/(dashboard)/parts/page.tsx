"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Wrench,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { parts as initialParts, CATEGORIES, BIKE_MODELS } from "@/lib/data";
import { Part, Category, BikeBrand } from "@/lib/types";
import StockBadge, { getStockStatus } from "@/components/store/StockBadge";

type ModalMode = "add" | "edit" | null;

interface FormState {
  name: string;
  description: string;
  price: string;
  mrp: string;
  stock: string;
  minStock: string;
  category: Category;
  brand: BikeBrand;
  compatibleBikes: string[];
  isFeatured: boolean;
  isSale: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  mrp: "",
  stock: "",
  minStock: "10",
  category: "Brakes",
  brand: "Honda",
  compatibleBikes: [],
  isFeatured: false,
  isSale: false,
};

const allBikes = Object.values(BIKE_MODELS).flat();

export default function AdminPartsPage() {
  const [allParts, setAllParts] = useState(initialParts);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"name" | "price" | "stock">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = allParts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = sortField === "name" ? a.name : sortField === "price" ? a.price : a.stock;
      const bv = sortField === "name" ? b.name : sortField === "price" ? b.price : b.stock;
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  function openAdd() {
    setForm(emptyForm);
    setEditingPart(null);
    setModal("add");
  }

  function openEdit(part: Part) {
    setForm({
      name: part.name,
      description: part.description,
      price: String(part.price),
      mrp: String(part.mrp),
      stock: String(part.stock),
      minStock: String(part.minStock),
      category: part.category,
      brand: part.brand,
      compatibleBikes: part.compatibleBikes,
      isFeatured: part.isFeatured,
      isSale: part.isSale,
    });
    setEditingPart(part);
    setModal("edit");
  }

  function handleSave() {
    if (!form.name || !form.price || !form.stock) return;

    if (modal === "add") {
      const newPart: Part = {
        id: String(Date.now()),
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        mrp: Number(form.mrp) || Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        category: form.category,
        brand: form.brand,
        compatibleBikes: form.compatibleBikes,
        isFeatured: form.isFeatured,
        isSale: form.isSale,
        images: [],
        rating: 0,
        reviewCount: 0,
      };
      setAllParts((prev) => [newPart, ...prev]);
    } else if (modal === "edit" && editingPart) {
      setAllParts((prev) =>
        prev.map((p) =>
          p.id === editingPart.id
            ? {
                ...p,
                name: form.name,
                description: form.description,
                price: Number(form.price),
                mrp: Number(form.mrp) || Number(form.price),
                stock: Number(form.stock),
                minStock: Number(form.minStock),
                category: form.category,
                brand: form.brand,
                compatibleBikes: form.compatibleBikes,
                isFeatured: form.isFeatured,
                isSale: form.isSale,
              }
            : p
        )
      );
    }
    setModal(null);
  }

  function handleDelete(id: string) {
    setAllParts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
    ) : null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Parts Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{allParts.length} total parts</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Part
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-10">
                  #
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1">
                    Name <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">SKU</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <button onClick={() => toggleSort("price")} className="flex items-center gap-1">
                    Price <SortIcon field="price" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <button onClick={() => toggleSort("stock")} className="flex items-center gap-1">
                    Stock <SortIcon field="stock" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map((part, i) => (
                <tr key={part.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 text-xs">{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4 text-gray-300 dark:text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs leading-tight max-w-[180px] line-clamp-2">
                          {part.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{part.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">{part.sku}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
                      {part.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-gray-100">
                    ₹{part.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{part.stock}</td>
                  <td className="px-5 py-3.5">
                    <StockBadge stock={part.stock} minStock={part.minStock} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(part)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(part.id)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Part?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              This action cannot be undone. The part will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                {modal === "add" ? "Add New Part" : "Edit Part"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Part Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Honda Activa 6G Brake Pad Set"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Part description..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="450"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={form.mrp}
                    onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
                    placeholder="550"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="50"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
                    placeholder="10"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value as BikeBrand }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {["Honda", "Hero", "Bajaj", "TVS", "Yamaha", "Suzuki", "Royal Enfield", "Universal"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Compatible Bikes ({form.compatibleBikes.length} selected)
                  </label>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-2 gap-1.5 bg-white dark:bg-gray-700">
                    {allBikes.map((bike) => (
                      <label key={bike} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.compatibleBikes.includes(bike)}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              compatibleBikes: e.target.checked
                                ? [...f.compatibleBikes, bike]
                                : f.compatibleBikes.filter((b) => b !== bike),
                            }))
                          }
                          className="w-3.5 h-3.5 rounded accent-primary-700"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{bike}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Part</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isSale}
                      onChange={(e) => setForm((f) => ({ ...f, isSale: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">On Sale</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Product Image Upload
                  </label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                    <Wrench className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>Click to upload or drag and drop</p>
                    <p className="text-xs mt-0.5">PNG, JPG up to 2MB</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-primary-800 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {modal === "add" ? "Add Part" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
