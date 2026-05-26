"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Bot, User, Wrench } from "lucide-react";
import { parts } from "@/lib/data";
import { Part } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  suggestedParts?: Part[];
}

const GREET: Message = {
  id: "greet",
  role: "bot",
  text: "Namaste! 🙏 Main hoon aapka Parts Assistant. Apni bike ka model aur problem batayein — main aapko sahi part dhundne mein help karunga.\n\nExample: \"Honda Activa brake problem\" ya \"Pulsar 150 chain kit\"",
};

function getBotResponse(query: string): { text: string; suggestedParts: Part[] } {
  const q = query.toLowerCase();
  const matched = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.compatibleBikes.some((b) => b.toLowerCase().includes(q)) ||
      p.brand.toLowerCase().includes(q) ||
      q.split(" ").some((word) =>
        word.length > 3 &&
        (p.name.toLowerCase().includes(word) ||
          p.category.toLowerCase().includes(word) ||
          p.brand.toLowerCase().includes(word))
      )
  );
  if (matched.length > 0) return { text: `Humne ${matched.length} part(s) find kiye aapke liye! 🔧 Yeh dekho:`, suggestedParts: matched.slice(0, 3) };
  if (q.includes("brake")) return { text: "Brake issues ke liye yeh parts check karein:", suggestedParts: parts.filter((p) => p.category === "Brakes").slice(0, 3) };
  if (q.includes("engine") || q.includes("oil") || q.includes("chain")) return { text: "Engine-related parts yeh hain:", suggestedParts: parts.filter((p) => p.category === "Engine Parts" || p.category === "Oils & Lubricants").slice(0, 3) };
  if (q.includes("light") || q.includes("electric") || q.includes("bulb")) return { text: "Electrical parts ke liye yeh options hain:", suggestedParts: parts.filter((p) => p.category === "Electrical").slice(0, 3) };
  if (q.includes("filter")) return { text: "Filter parts yeh available hain:", suggestedParts: parts.filter((p) => p.category === "Filters").slice(0, 3) };
  if (q.includes("price") || q.includes("kitna")) return { text: "Hamare parts ₹85 se shuru hote hain. Popular parts niche hain:", suggestedParts: parts.filter((p) => p.isFeatured).slice(0, 3) };
  if (q.includes("delivery") || q.includes("ship")) return { text: "🚚 Delivery details:\n• ₹500+ orders: FREE delivery\n• Below ₹500: ₹60 delivery charge\n• Delivery time: 2-4 working days pan-India", suggestedParts: [] };
  if (q.includes("return") || q.includes("refund")) return { text: "↩️ Return Policy:\n• 7-day easy return for wrong/defective parts\n• Same-day exchange for in-stock items\n• Call us at +91 88001 23456", suggestedParts: [] };
  return { text: "Hmm, main exactly samajh nahi paya. 🤔 Apni bike brand aur problem clearly batayein.\n\nExample: \"Hero Splendor oil filter\" ya \"TVS Apache clutch plate\"", suggestedParts: parts.filter((p) => p.isFeatured).slice(0, 2) };
}

const SUGGESTIONS = ["Honda Activa brake problem", "Pulsar 150 chain kit", "Engine oil filter", "Delivery charges?"];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREET]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    setMessages((prev) => [...prev, { id: String(Date.now()), role: "user", text: msg }]);
    setTyping(true);
    setTimeout(() => {
      const { text: botText, suggestedParts } = getBotResponse(msg);
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: "bot", text: botText, suggestedParts }]);
      setTyping(false);
    }, 800);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          open ? "bg-gray-700 scale-90" : "bg-primary-800 hover:bg-primary-700 hover:scale-105"
        }`}
        aria-label="Parts Assistant"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center text-white text-xs font-bold">?</span>
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden"
          style={{ maxHeight: "min(560px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-primary-800 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Parts Assistant 🔧</p>
                <p className="text-primary-300 text-xs">Online · 24/7</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-primary-300 hover:text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary-700 dark:text-primary-300" />
                  </div>
                )}
                <div className={`max-w-[78%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-primary-800 text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.suggestedParts && msg.suggestedParts.length > 0 && (
                    <div className="space-y-2 w-full">
                      {msg.suggestedParts.map((part) => (
                        <div key={part.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
                          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4 text-gray-300 dark:text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{part.name}</p>
                            <p className="text-xs text-accent-600 font-bold">₹{part.price.toLocaleString("en-IN")}</p>
                          </div>
                          <Link
                            href={`/parts/${part.id}`}
                            className="shrink-0 text-xs bg-primary-800 text-white px-2.5 py-1 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-accent-600" />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary-700 dark:text-primary-300" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-blue-50 dark:bg-blue-900/30 text-primary-700 dark:text-primary-300 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Apni bike ka model aur problem batayein..."
              className="flex-1 text-sm px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="p-2.5 bg-primary-800 hover:bg-primary-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
