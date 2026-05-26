import Link from "next/link";
import { Wrench } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3.5">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="bg-accent-500 p-1.5 rounded-lg">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              Moto<span className="text-accent-500">Mart</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </div>

      <footer className="text-center py-4 text-xs text-gray-400">
        © 2024 MotoMart · India&apos;s Trusted 2-Wheeler Parts Store
      </footer>
    </div>
  );
}
