import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple";
}

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-900/30",     icon: "text-primary-700 dark:text-primary-300", border: "border-blue-100 dark:border-blue-800" },
  green:  { bg: "bg-green-50 dark:bg-green-900/30",   icon: "text-green-700 dark:text-green-400",     border: "border-green-100 dark:border-green-800" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/30", icon: "text-accent-500",                        border: "border-orange-100 dark:border-orange-800" },
  red:    { bg: "bg-red-50 dark:bg-red-900/30",       icon: "text-red-600 dark:text-red-400",         border: "border-red-100 dark:border-red-800" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/30", icon: "text-purple-700 dark:text-purple-400",   border: "border-purple-100 dark:border-purple-800" },
};

export default function StatsCard({ icon: Icon, label, value, sub, color = "blue" }: Props) {
  const c = colorMap[color];
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${c.border} p-5 flex items-start gap-4 shadow-sm`}>
      <div className={`${c.bg} p-3 rounded-lg`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
