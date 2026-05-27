"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic, MicOff, Sparkles, AlertCircle, CheckCircle, RotateCcw,
} from "lucide-react";
import type { Category, BikeBrand } from "@/lib/types";
import type { CreatePartPayload } from "@/store/api/partsApi";

// ── Web Speech API shim types (not in all TS DOM libs) ────────────────────────
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart:  ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend:    ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror:  ((this: ISpeechRecognition, ev: { error: string }) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
}
type SRCtor = new () => ISpeechRecognition;

function getSRCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as SRCtor | null;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface VoiceFormState {
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
  partNumber: string;
  compatibleVehiclesRaw: string;
}

export const emptyVoiceForm: VoiceFormState = {
  name: "", description: "", price: "", mrp: "", stock: "", minStock: "10",
  category: "Brakes", brand: "Honda",
  compatibleBikes: [], isFeatured: false, isSale: false,
  partNumber: "", compatibleVehiclesRaw: "",
};

type VoiceStatus = "idle" | "listening" | "processing" | "done" | "error";

interface Props {
  form: VoiceFormState;
  onChange: (f: VoiceFormState) => void;
  aiFilledFields: Set<string>;
  onAiFilled: (fields: Set<string>) => void;
  accessToken: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  "Brakes", "Engine Parts", "Electrical", "Filters",
  "Body Parts", "Tyres & Tubes", "Oils & Lubricants",
];
const BRANDS: BikeBrand[] = [
  "Honda", "Hero", "Bajaj", "TVS", "Yamaha", "Suzuki", "Royal Enfield", "Universal",
];

const CATEGORY_MAP: Record<string, Category> = {
  "brakes":            "Brakes",
  "engine":            "Engine Parts",
  "engine parts":      "Engine Parts",
  "electrical":        "Electrical",
  "filters":           "Filters",
  "filter":            "Filters",
  "body parts":        "Body Parts",
  "body":              "Body Parts",
  "tyres & tubes":     "Tyres & Tubes",
  "tyres & wheels":    "Tyres & Tubes",
  "tyres":             "Tyres & Tubes",
  "oils & lubricants": "Oils & Lubricants",
  "oils":              "Oils & Lubricants",
  "lubricants":        "Oils & Lubricants",
  "suspension":        "Engine Parts",
  "transmission":      "Engine Parts",
  "cooling":           "Engine Parts",
  "interior":          "Body Parts",
  "lighting":          "Electrical",
  "exhaust":           "Body Parts",
};

function normalizeCategory(raw: string): Category {
  const key = raw.toLowerCase().trim();
  return CATEGORY_MAP[key] ?? (CATEGORIES.includes(raw as Category) ? (raw as Category) : "Brakes");
}

function normalizeBrand(raw: string): BikeBrand {
  return BRANDS.find((b) => b.toLowerCase() === raw.toLowerCase().trim()) ?? "Universal";
}

// ── Web Audio helpers ──────────────────────────────────────────────────────────

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext as (typeof AudioContext) | undefined;
    return Ctor ? new Ctor() : null;
  } catch { return null; }
}

function tone(ctx: AudioContext, freq: number, t: number, dur: number, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = type; osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t); osc.stop(t + dur);
}

function playStart()   { const c = getAudioCtx(); if (!c) return; tone(c, 440, c.currentTime, 0.12); tone(c, 660, c.currentTime + 0.15, 0.12); }
function playStop()    { const c = getAudioCtx(); if (!c) return; tone(c, 660, c.currentTime, 0.12); tone(c, 440, c.currentTime + 0.15, 0.12); }
function playSuccess() { const c = getAudioCtx(); if (!c) return; const t = c.currentTime; tone(c, 523, t, 0.14); tone(c, 659, t + 0.16, 0.14); tone(c, 784, t + 0.32, 0.20); }
function playError()   { const c = getAudioCtx(); if (!c) return; tone(c, 180, c.currentTime, 0.30, "sawtooth"); }

// ── Field CSS ──────────────────────────────────────────────────────────────────

function fieldCls(field: string, filled: Set<string>): string {
  const hi = filled.has(field)
    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600";
  return `w-full px-3 py-2 text-sm ${hi} border rounded-lg outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function VoiceAddTab({ form, onChange, aiFilledFields, onAiFilled, accessToken }: Props) {
  const [status, setStatus]         = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [enhancing, setEnhancing]   = useState(false);
  const srRef                       = useRef<ISpeechRecognition | null>(null);

  useEffect(() => () => { srRef.current?.abort(); }, []);

  const callParse = useCallback(async (text: string, enhance: boolean) => {
    setStatus("processing"); setErrorMsg("");
    try {
      const res  = await fetch("/api/voice-parse", {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body:    JSON.stringify({ transcript: text }),
      });
      const json = await res.json() as { ok: boolean; data?: { product: Record<string, unknown> }; error?: { message: string } };
      if (!json.ok || !json.data?.product) throw new Error(json.error?.message ?? "Unknown error");

      const p        = json.data.product;
      const newFlds  = new Set<string>(enhance ? aiFilledFields : []);
      const updated  = { ...form };

      // Helper: set only if current is empty OR we are doing a fresh parse
      const maybeSet = (key: keyof VoiceFormState, val: string) => {
        if (!val) return;
        const cur = form[key];
        const isEmpty = cur === "" || (Array.isArray(cur) && cur.length === 0);
        if (!enhance || isEmpty) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updated as any)[key] = val;
          newFlds.add(key);
        }
      };

      if (typeof p.name               === "string") maybeSet("name",                 p.name);
      if (typeof p.part_number        === "string") maybeSet("partNumber",            p.part_number);
      if (typeof p.description        === "string") maybeSet("description",           p.description);
      if (typeof p.compatible_vehicles=== "string") maybeSet("compatibleVehiclesRaw", p.compatible_vehicles);
      if (p.price != null && p.price !== "")        maybeSet("price",                String(p.price));
      if (p.stock != null && p.stock !== "")        maybeSet("stock",                String(p.stock));
      if (typeof p.category === "string" && p.category) maybeSet("category", normalizeCategory(p.category));
      if (typeof p.brand    === "string" && p.brand)    maybeSet("brand",    normalizeBrand(p.brand));

      if (updated.compatibleVehiclesRaw) {
        updated.compatibleBikes = updated.compatibleVehiclesRaw.split(",").map((s) => s.trim()).filter(Boolean);
      }

      onAiFilled(newFlds); onChange(updated);
      setStatus("done"); playSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error"); playError();
    }
  }, [form, aiFilledFields, onAiFilled, onChange, accessToken]);

  function handleMic() {
    if (status === "listening") { srRef.current?.stop(); return; }
    const SR = getSRCtor(); if (!SR) return;
    const sr = new SR();
    sr.lang = "en-IN"; sr.interimResults = false; sr.maxAlternatives = 1;
    sr.onstart  = () => { setStatus("listening"); setErrorMsg(""); playStart(); };
    sr.onend    = () => { playStop(); };
    sr.onerror  = (e) => {
      setErrorMsg(e.error === "no-speech" ? "No speech detected. Please try again." : `Mic error: ${e.error}`);
      setStatus("error"); playError();
    };
    sr.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text.trim().length < 3) { setErrorMsg("Too short — please say more."); setStatus("error"); playError(); return; }
      setTranscript(text);
      callParse(text, false);
    };
    srRef.current = sr;
    try { sr.start(); } catch { setErrorMsg("Could not start microphone."); setStatus("error"); }
  }

  async function handleEnhance() {
    if (!form.name) { setErrorMsg("Fill at least the product name first."); return; }
    setEnhancing(true);
    const hint = [`Product name: ${form.name}.`, form.description && `Description: ${form.description}.`, form.brand && `Brand: ${form.brand}.`, form.compatibleVehiclesRaw && `Compatible with: ${form.compatibleVehiclesRaw}.`].filter(Boolean).join(" ");
    await callParse(hint, true);
    setEnhancing(false);
  }

  function handleReset() { srRef.current?.abort(); setStatus("idle"); setTranscript(""); setErrorMsg(""); }

  // ── Unsupported browser ───────────────────────────────────────────────────────
  if (!getSRCtor()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
        <MicOff className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-700 dark:text-gray-300 font-semibold">Voice input not supported</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Voice input requires Chrome or Edge browser.</p>
      </div>
    );
  }

  const isListening  = status === "listening";
  const isProcessing = status === "processing";
  const micBusy      = isListening || isProcessing;

  return (
    <div className="space-y-6">

      {/* Mic + status section */}
      <div className="flex flex-col items-center gap-4 py-6">

        {/* Pulsing ring + button */}
        <div className="relative flex items-center justify-center">
          {isListening && <>
            <span className="absolute w-24 h-24 rounded-full bg-red-400/30 animate-ping" />
            <span className="absolute w-20 h-20 rounded-full bg-red-400/20 animate-pulse" />
          </>}
          <button
            type="button"
            onClick={handleMic}
            disabled={isProcessing}
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
              ${isListening  ? "bg-red-500 hover:bg-red-600 text-white scale-110"
              : isProcessing ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
              :                "bg-primary-700 hover:bg-primary-600 text-white hover:scale-105"}`}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
        </div>

        {/* Waveform */}
        {isListening && (
          <div className="flex items-end gap-1 h-8">
            {[0.4,0.7,1,0.8,0.5,0.9,0.6,1,0.7,0.4].map((h, i) => (
              <span key={i} className="w-1.5 bg-primary-500 rounded-full" style={{ height: `${h*100}%`, animation: `waveBar 0.6s ease-in-out ${i*0.07}s infinite alternate` }} />
            ))}
          </div>
        )}

        {/* Status text */}
        <p className={`text-sm font-medium ${
          isListening  ? "text-red-500 dark:text-red-400"
          : isProcessing ? "text-primary-600 dark:text-primary-400"
          : status === "done"  ? "text-green-600 dark:text-green-400"
          : status === "error" ? "text-red-500 dark:text-red-400"
          : "text-gray-500 dark:text-gray-400"}`}
        >
          {isListening  ? "Listening… tap mic to stop"
          : isProcessing ? "Filling form with AI…"
          : status === "done"  ? "Form filled! Review and edit below."
          : status === "error" ? "Ready — tap mic to try again"
          :                     "Tap mic to speak your product details"}
        </p>

        {/* Heard transcript */}
        {transcript && !isListening && (
          <div className="w-full max-w-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold uppercase tracking-wide">Heard</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">&ldquo;{transcript}&rdquo;</p>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="w-full max-w-md flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{errorMsg}
          </div>
        )}

        {/* Success hint */}
        {status === "done" && (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Fields highlighted in blue were auto-filled — feel free to edit them.
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {(status === "done" || status === "error") && (
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-record
            </button>
          )}
          <button type="button" onClick={handleEnhance} disabled={enhancing || micBusy}
            className="flex items-center gap-1.5 text-xs bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {enhancing ? "Enhancing…" : "AI Enhance"}
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="sm:col-span-2">
          <FL label="Product Name *" field="name" f={aiFilledFields} />
          <input type="text" value={form.name} placeholder="e.g. Honda Activa 6G Brake Pad Set"
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className={fieldCls("name", aiFilledFields)} />
        </div>

        <div>
          <FL label="Part Number" field="partNumber" f={aiFilledFields} />
          <input type="text" value={form.partNumber} placeholder="e.g. BRK-HON-ACT6G"
            onChange={(e) => onChange({ ...form, partNumber: e.target.value })}
            className={fieldCls("partNumber", aiFilledFields)} />
        </div>

        <div>
          <FL label="Category" field="category" f={aiFilledFields} />
          <select value={form.category}
            onChange={(e) => onChange({ ...form, category: e.target.value as Category })}
            className={fieldCls("category", aiFilledFields)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <FL label="Price (₹) *" field="price" f={aiFilledFields} />
          <input type="number" value={form.price} placeholder="450"
            onChange={(e) => onChange({ ...form, price: e.target.value })}
            className={fieldCls("price", aiFilledFields)} />
        </div>

        <div>
          <FL label="MRP (₹)" field="mrp" f={aiFilledFields} />
          <input type="number" value={form.mrp} placeholder="550"
            onChange={(e) => onChange({ ...form, mrp: e.target.value })}
            className={fieldCls("mrp", aiFilledFields)} />
        </div>

        <div>
          <FL label="Stock Quantity *" field="stock" f={aiFilledFields} />
          <input type="number" value={form.stock} placeholder="50"
            onChange={(e) => onChange({ ...form, stock: e.target.value })}
            className={fieldCls("stock", aiFilledFields)} />
        </div>

        <div>
          <FL label="Brand" field="brand" f={aiFilledFields} />
          <select value={form.brand}
            onChange={(e) => onChange({ ...form, brand: e.target.value as BikeBrand })}
            className={fieldCls("brand", aiFilledFields)}>
            {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <FL label="Description" field="description" f={aiFilledFields} />
          <textarea rows={3} value={form.description} placeholder="Product description…"
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className={`${fieldCls("description", aiFilledFields)} resize-none`} />
        </div>

        <div className="sm:col-span-2">
          <FL label="Compatible Vehicles (comma-separated)" field="compatibleVehiclesRaw" f={aiFilledFields} />
          <input type="text" value={form.compatibleVehiclesRaw}
            placeholder="Honda Activa 6G, Honda Dio, Honda CB Shine"
            onChange={(e) => {
              const raw = e.target.value;
              onChange({ ...form, compatibleVehiclesRaw: raw, compatibleBikes: raw.split(",").map((s) => s.trim()).filter(Boolean) });
            }}
            className={fieldCls("compatibleVehiclesRaw", aiFilledFields)} />
        </div>

      </div>

      <style>{`@keyframes waveBar { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }`}</style>
    </div>
  );
}

// ── Tiny label helper ─────────────────────────────────────────────────────────
function FL({ label, field, f }: { label: string; field: string; f: Set<string> }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {f.has(field) && <span className="text-blue-500 dark:text-blue-400 font-normal">(AI filled)</span>}
    </label>
  );
}

// ── Payload converter ─────────────────────────────────────────────────────────
export function voiceFormToPayload(form: VoiceFormState): CreatePartPayload {
  return {
    name:            form.name.trim(),
    description:     form.description.trim(),
    category:        form.category,
    brand:           form.brand,
    price:           Number(form.price),
    mrp:             Number(form.mrp) || Number(form.price),
    stock:           Number(form.stock),
    minStock:        Number(form.minStock) || 10,
    images:          [],
    compatibleBikes: form.compatibleBikes,
    isFeatured:      form.isFeatured,
    isSale:          form.isSale,
  };
}
