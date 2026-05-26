import { OrderStatus } from "@/lib/types";

const config: Record<OrderStatus, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700" },
  dispatched:{ label: "Dispatched",className: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700" },
  delivered: { label: "Delivered", className: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700" },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}>
      {label}
    </span>
  );
}
