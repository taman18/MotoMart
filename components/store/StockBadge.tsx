import { StockStatus } from "@/lib/types";

interface Props {
  stock: number;
  minStock: number;
}

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock === 0) return "out_of_stock";
  if (stock <= minStock) return "low_stock";
  return "in_stock";
}

export default function StockBadge({ stock, minStock }: Props) {
  const status = getStockStatus(stock, minStock);
  if (status === "in_stock")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        In Stock
      </span>
    );
  if (status === "low_stock")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
        Low Stock ({stock} left)
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Out of Stock
    </span>
  );
}
