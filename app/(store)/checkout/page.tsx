"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Wrench, MapPin, Phone, User, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

const initialForm: FormData = {
  name: "",
  phone: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    ...initialForm,
    phone: user?.role === "user" && /^\d{10}$/.test(user.identifier) ? user.identifier : "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [placed, setPlaced] = useState(false);
  const [orderId] = useState(
    "ORD-" + Date.now().toString().slice(-6)
  );

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isLoggedIn, router]);

  const deliveryFee = totalPrice >= 500 ? 0 : 60;
  const finalTotal = totalPrice + deliveryFee;

  function validate(): boolean {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = "Enter valid 10-digit phone";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.pincode.match(/^\d{6}$/)) newErrors.pincode = "Enter valid 6-digit pincode";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Your order <span className="font-semibold text-gray-900">{orderId}</span> has been placed successfully.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            We&apos;ll call you on <strong>{form.phone}</strong> to confirm delivery to{" "}
            <strong>{form.city}</strong>.
          </p>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-orange-800 mb-1">Payment: Cash on Delivery</p>
            <p className="text-xs text-orange-600">
              Please keep ₹{finalTotal.toLocaleString("en-IN")} ready at the time of delivery.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="bg-primary-800 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/parts"
              className="border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/parts" className="text-primary-700 font-semibold hover:underline">
            Browse Parts
          </Link>
        </div>
      </div>
    );
  }

  const Field = ({
    label,
    name,
    placeholder,
    type = "text",
    icon: Icon,
  }: {
    label: string;
    name: keyof FormData;
    placeholder: string;
    type?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [name]: e.target.value }));
            setErrors((err) => ({ ...err, [name]: undefined }));
          }}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
            errors[name]
              ? "border-red-300 focus:border-red-500 bg-red-50"
              : "border-gray-200 focus:border-primary-500 bg-white"
          }`}
        />
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/cart" className="hover:text-primary-700">Cart</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Delivery Details</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <Field label="Full Name" name="name" placeholder="Rajesh Kumar" icon={User} />
              <Field label="Mobile Number" name="phone" placeholder="9876543210" type="tel" icon={Phone} />
              <Field label="Full Address" name="address" placeholder="House No., Street, Locality" icon={MapPin} />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Pincode" name="pincode" placeholder="400001" />
                <Field label="City" name="city" placeholder="Mumbai" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <select
                  value={form.state}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, state: e.target.value }));
                    setErrors((err) => ({ ...err, state: undefined }));
                  }}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                    errors.state
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:border-primary-500 bg-white"
                  }`}
                >
                  <option value="">Select State</option>
                  {[
                    "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana",
                    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
                    "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
                    "Uttar Pradesh", "West Bengal",
                  ].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Payment Method</p>
                <div className="border-2 border-primary-700 bg-primary-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-4 border-primary-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500">Pay when your parts arrive at your door</p>
                  </div>
                  <span className="ml-auto text-2xl">💵</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
                <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {items.map(({ part, quantity }) => (
                    <div key={part.id} className="flex gap-3 items-start">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Wrench className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">{part.name}</p>
                        <p className="text-xs text-gray-400">Qty: {quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 shrink-0">
                        ₹{(part.price * quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      <span>₹{deliveryFee}</span>
                    )}
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-1">
                    <span>Total (COD)</span>
                    <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-5 w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 rounded-xl transition-colors text-base"
                >
                  Place Order (COD) 🛵
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  By placing the order you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
