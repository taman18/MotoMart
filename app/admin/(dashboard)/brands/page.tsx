"use client";

import { useState } from "react";
import {
  Plus, Edit2, Trash2, X, Loader2, AlertCircle, RefreshCw,
  GripVertical, Eye, EyeOff,
} from "lucide-react";
import {
  useListBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  type Brand,
  type CreateBrandPayload,
} from "@/store/api/brandsApi";

type ModalMode = "add" | "edit" | null;

interface FormState {
  name: string;
  initials: string;
  color: string;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: FormState = {
  name: "",
  initials: "",
  color: "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40",
  isActive: true,
  sortOrder: "0",
};

// Preset color options for convenience
const COLOR_PRESETS = [
  { label: "Red",    value: "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20" },
  { label: "Blue",   value: "border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20" },
  { label: "Orange", value: "border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20" },
  { label: "Green",  value: "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20" },
  { label: "Indigo", value: "border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" },
  { label: "Yellow", value: "border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" },
  { label: "Teal",   value: "border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20" },
  { label: "Gray",   value: "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40" },
  { label: "Purple", value: "border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20" },
  { label: "Pink",   value: "border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20" },
];

function formToPayload(form: FormState): CreateBrandPayload {
  return {
    name:      form.name.trim(),
    initials:  form.initials.trim(),
    color:     form.color,
    isActive:  form.isActive,
    sortOrder: Number(form.sortOrder) || 0,
  };
}

export default function AdminBrandsPage() {
  const [modal, setModal]             = useState<ModalMode>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError]     = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useListBrandsQuery({ all: true });
  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: deleting }] = useDeleteBrandMutation();

  const brandList = data?.data.brands ?? [];
  const isSaving  = creating || updating;

  function openAdd() {
    setForm(emptyForm);
    setEditingBrand(null);
    setFormError(null);
    setModal("add");
  }

  function openEdit(brand: Brand) {
    setForm({
      name:      brand.name,
      initials:  brand.initials,
      color:     brand.color,
      isActive:  brand.isActive,
      sortOrder: String(brand.sortOrder),
    });
    setEditingBrand(brand);
    setFormError(null);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.name.trim() || !form.initials.trim()) {
      setFormError("Brand name and initials are required.");
      return;
    }
    setFormError(null);
    try {
      if (modal === "add") {
        await createBrand(formToPayload(form)).unwrap();
      } else if (modal === "edit" && editingBrand) {
        await updateBrand({ id: editingBrand.id, ...formToPayload(form) }).unwrap();
      }
      setModal(null);
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBrand(id).unwrap();
    } catch { /* ignore */ }
    setDeleteConfirm(null);
  }

  async function toggleActive(brand: Brand) {
    try {
      await updateBrand({ id: brand.id, isActive: !brand.isActive }).unwrap();
    } catch { /* ignore */ }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Brand Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage brands shown in the &quot;Shop by Brand&quot; bar on the storefront.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {/* Brand list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading brands…</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-sm">Failed to load brands.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-8"></th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Preview</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Initials</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {brandList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
                      No brands yet. Click &quot;Add Brand&quot; to create one.
                    </td>
                  </tr>
                ) : brandList.map((brand) => (
                  <tr key={brand.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${!brand.isActive ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3.5 text-gray-300 dark:text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 ${brand.color}`}>
                        <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          {brand.initials}
                        </span>
                        {brand.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-gray-100">{brand.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {brand.initials}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs">{brand.sortOrder}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${brand.isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                        {brand.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(brand)}
                          title={brand.isActive ? "Hide from storefront" : "Show on storefront"}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        >
                          {brand.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openEdit(brand)}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(brand.id)}
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
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Brand?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              This will remove the brand from the storefront. Parts assigned to this brand are not affected.
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
                disabled={deleting}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                {modal === "add" ? "Add New Brand" : "Edit Brand"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}

              {/* Live preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 ${form.color}`}>
                  <span className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    {form.initials || "?"}
                  </span>
                  {form.name || "Brand Name"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Honda"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Initials *</label>
                  <input
                    type="text"
                    value={form.initials}
                    onChange={(e) => setForm((f) => ({ ...f, initials: e.target.value.slice(0, 5) }))}
                    placeholder="e.g. H"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: preset.value }))}
                      className={`px-2 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${preset.value} ${form.color === preset.value ? "ring-2 ring-primary-500 ring-offset-1" : ""}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Lower = shown first</p>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show on storefront</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-primary-800 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {modal === "add" ? "Add Brand" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
