import Link from "next/link";
import { Wrench, Phone, MapPin, Mail, Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-16 border-t border-gray-800 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-accent-500 p-1.5 rounded-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Moto<span className="text-accent-500">Mart</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              India&apos;s trusted online store for genuine 2-wheeler spare parts. Quality parts, fast delivery, best prices.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-gray-800 dark:bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/parts", label: "Browse Parts" },
                { href: "/parts?category=Brakes", label: "Brakes" },
                { href: "/parts?category=Engine Parts", label: "Engine Parts" },
                { href: "/parts?category=Electrical", label: "Electrical" },
                { href: "/parts?category=Filters", label: "Filters" },
                { href: "/cart", label: "My Cart" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bike Brands */}
          <div>
            <h3 className="text-white font-semibold mb-4">Bike Brands</h3>
            <ul className="space-y-2 text-sm">
              {["Honda", "Hero", "Bajaj", "TVS", "Yamaha", "Suzuki", "Royal Enfield"].map((brand) => (
                <li key={brand}>
                  <Link href={`/parts?brand=${brand}`} className="hover:text-white transition-colors">{brand}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                <span>SCO NO. 3, Motor market, Sector 48-C, Chandigarh, 160047</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent-500 shrink-0" />
                <a href="tel:+9988252552" className="hover:text-white transition-colors">+91 99882 52552</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-500 shrink-0" />
                <a href="mailto:support@motomart.in" className="hover:text-white transition-colors">support@motomart.in</a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
              <p className="font-medium text-gray-300 mb-1">Business Hours</p>
              <p>Mon – Sat: 10:00 AM – 7:00 PM</p>
              <p>Sunday: 11:00 AM – 3:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© 2024 MotoMart. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
