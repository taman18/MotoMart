"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, Shield, Truck, BadgeDollarSign,
  Star, ArrowRight, Disc, Cog, Zap, Filter, Car, Circle, Droplets,
} from "lucide-react";
import PartCard from "@/components/store/PartCard";
import { parts, BIKE_BRANDS } from "@/lib/data";

const categories = [
  { name: "Brakes",            icon: Disc,     count: 48,  color: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  { name: "Engine Parts",      icon: Cog,      count: 124, color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  { name: "Electrical",        icon: Zap,      count: 89,  color: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" },
  { name: "Filters",           icon: Filter,   count: 67,  color: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
  { name: "Body Parts",        icon: Car,      count: 93,  color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
  { name: "Tyres & Tubes",     icon: Circle,   count: 41,  color: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
  { name: "Oils & Lubricants", icon: Droplets, count: 28,  color: "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" },
];

const brandColors: Record<string, string> = {
  Honda:          "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20",
  Hero:           "border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  Bajaj:          "border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20",
  TVS:            "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20",
  Yamaha:         "border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
  Suzuki:         "border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
  "Royal Enfield":"border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40",
  Universal:      "border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20",
};

const brandInitials: Record<string, string> = {
  Honda: "H", Hero: "He", Bajaj: "Bj", TVS: "TVS",
  Yamaha: "Y", Suzuki: "Sz", "Royal Enfield": "RE", Universal: "U",
};

export default function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState("Honda");
  const [partSearch, setPartSearch] = useState("");
  const featuredParts = parts.filter((p) => p.isFeatured);

  return (
    <main>
      {/* Hero — always dark gradient */}
      <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700 opacity-20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 opacity-10 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-accent-500/20 text-accent-400 text-sm font-medium px-3 py-1 rounded-full mb-5 border border-accent-500/30">
              <Star className="w-3.5 h-3.5 fill-accent-400" />
              India&apos;s #1 Online 2-Wheeler Parts Store
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-3">
              Find the Right Part <span className="text-accent-500">for Your Bike</span>
            </h1>
            <p className="text-lg text-gray-300 mb-2">Apni bike ke liye genuine spare parts — fast delivery, best price.</p>
            <p className="text-base text-gray-400 mb-10">Over 400+ genuine parts for Honda, Hero, Bajaj, TVS, Yamaha & more.</p>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="flex-none text-gray-900 dark:text-gray-100 text-sm font-medium rounded-xl px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 outline-none cursor-pointer"
              >
                {BIKE_BRANDS.filter((b) => b !== "Universal").map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search part name e.g. brake pad, filter..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/parts?brand=${selectedBrand}&search=${encodeURIComponent(partSearch)}`; }}
                className="flex-1 text-gray-900 dark:text-gray-100 text-sm px-4 py-3 outline-none rounded-xl placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
              />
              <Link
                href={`/parts?brand=${selectedBrand}&search=${encodeURIComponent(partSearch)}`}
                className="flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                <Search className="w-4 h-4" /> Search Parts
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mt-5 text-sm text-gray-400">
              <span>Popular:</span>
              {["Brake Pad", "Air Filter", "Chain Kit", "Headlight", "Engine Oil"].map((q) => (
                <Link key={q} href={`/parts?search=${q}`} className="hover:text-accent-400 transition-colors hover:underline underline-offset-2">{q}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand quick-select */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap shrink-0">Shop by Brand:</span>
            {Object.keys(brandInitials).map((brand) => (
              <Link
                key={brand}
                href={`/parts?brand=${brand}`}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 bg-white dark:bg-gray-800 transition-all font-medium text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${brandColors[brand]}`}
              >
                <span className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  {brandInitials[brand]}
                </span>
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 dark:bg-gray-950 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Browse by Category</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Find parts by type for your bike</p>
            </div>
            <Link href="/parts" className="hidden sm:flex items-center gap-1 text-primary-700 dark:text-primary-300 font-semibold text-sm hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {categories.map(({ name, icon: Icon, count, color }) => (
              <Link
                key={name}
                href={`/parts?category=${encodeURIComponent(name)}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 flex flex-col items-center gap-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className={`${color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{count} parts</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Parts */}
      <section className="bg-white dark:bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Parts &amp; Deals</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Top picks and best-selling parts</p>
            </div>
            <Link href="/parts" className="flex items-center gap-1 text-primary-700 dark:text-primary-300 font-semibold text-sm hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredParts.map((part) => <PartCard key={part.id} part={part} />)}
          </div>
        </div>
      </section>

      {/* Why Choose Us — always dark gradient, looks fine in both modes */}
      <section id="about" className="bg-gradient-to-br from-primary-800 to-primary-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Why Choose MotoMart?</h2>
            <p className="text-primary-200 text-sm">Trusted by 50,000+ bike owners across India</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield,          title: "100% Genuine Parts",     desc: "All parts are sourced directly from OEM manufacturers and authorized distributors. No fake, no duplicate.", badge: "OEM Certified" },
              { icon: Truck,           title: "Fast Pan-India Delivery", desc: "Express delivery within 2-4 days to all major cities. Free shipping on orders above ₹500.",               badge: "Free Shipping ₹500+" },
              { icon: BadgeDollarSign, title: "Best Price Guarantee",    desc: "We match any lower price from a verified seller. Get the best deal, always.",                              badge: "Price Match Promise" },
            ].map(({ icon: Icon, title, desc, badge }) => (
              <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 text-white hover:bg-white/15 transition-colors">
                <div className="bg-accent-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-accent-400 uppercase tracking-wide">{badge}</span>
                <h3 className="text-lg font-bold mt-1 mb-2">{title}</h3>
                <p className="text-primary-200 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ label: "Parts Available", value: "400+" }, { label: "Happy Customers", value: "50K+" }, { label: "Bike Brands", value: "7+" }, { label: "Cities Served", value: "500+" }].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-primary-300 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-accent-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Not sure which part you need?</h3>
            <p className="text-orange-100 text-sm mt-0.5">Chat with our Parts Assistant — tell us your bike model and issue.</p>
          </div>
          <Link href="/parts" className="shrink-0 bg-white text-accent-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2">
            Browse All Parts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
