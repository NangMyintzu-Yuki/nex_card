// src/components/ocr/business-card-scanner.tsx
// Client-side OCR scanner for business cards with Myanmar text support
"use client";

import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";

interface OcrResult {
  fullName?: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  rawText: string;
}

interface BusinessCardScannerProps {
  onResult: (result: OcrResult) => void;
  onClose: () => void;
}

function parseBusinessCard(text: string): OcrResult {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: OcrResult = { rawText: text };

  const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/;
  const phoneRegex = /(?:\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.-]+(?:\/\S*)?/i;

  for (const line of lines) {
    if (!result.email) {
      const emailMatch = line.match(emailRegex);
      if (emailMatch) result.email = emailMatch[0];
    }
    if (!result.phone) {
      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch && phoneMatch[0].replace(/\D/g, "").length >= 7) {
        result.phone = phoneMatch[0].trim();
      }
    }
    if (!result.website) {
      const webMatch = line.match(websiteRegex);
      if (webMatch && !webMatch[0].includes("@")) {
        result.website = webMatch[0].startsWith("http") ? webMatch[0] : `https://${webMatch[0]}`;
      }
    }
  }

  const contactLines = lines.filter((l) => {
    const lower = l.toLowerCase();
    return !emailRegex.test(l) && !phoneRegex.test(l) && !websiteRegex.test(l) &&
      !lower.includes("email") && !lower.includes("phone") && !lower.includes("tel");
  });

  const myanmarScript = /[\u1000-\u109F]/;
  const hasMyanmar = contactLines.some((l) => myanmarScript.test(l));

  const jobTitleKeywords = [
    "ceo", "cto", "cfo", "coo", "manager", "director", "engineer", "designer",
    "developer", "founder", "owner", "president", "vp", "head", "lead",
    "senior", "junior", "intern", "consultant", "advisor", "specialist",
    "officer", "coordinator", "analyst", "architect",
    "မန်နေဂျာ", "ဒါရိုက်တာ", "ဌာနမှူး", "အကြံပေး",
  ];

  const companyKeywords = [
    "ltd", "llc", "inc", "corp", "co.", "company", "group", "enterprise",
    "solutions", "technologies", "services", "studio", "agency",
    "ကုမ္ပဏီ", "အဖွဲ့",
  ];

  const addressKeywords = [
    "street", "road", "avenue", "lane", "drive", "block", "zone",
    "township", "district", "city", "state", "country",
    "လမ်း", "ရပ်ကွက်", "မြို့နယ်", "ခရိုင်", "တိုင်း", "ပြည်နယ်",
  ];

  const titleLine = contactLines.find((l) => {
    const lower = l.toLowerCase();
    return jobTitleKeywords.some((kw) => lower.includes(kw));
  });
  if (titleLine) result.jobTitle = titleLine;

  const companyLine = contactLines.find((l) => {
    const lower = l.toLowerCase();
    return companyKeywords.some((kw) => lower.includes(kw)) && l !== titleLine;
  });
  if (companyLine) result.company = companyLine;

  const addressLine = contactLines.find((l) => {
    const lower = l.toLowerCase();
    return addressKeywords.some((kw) => lower.includes(kw));
  });
  if (addressLine) result.address = addressLine;

  const nameCandidates = contactLines.filter((l) => {
    return l !== titleLine && l !== companyLine && l !== addressLine &&
      l.length >= 2 && l.length <= 60 && !/^\d+$/.test(l);
  });

  if (nameCandidates.length > 0) {
    result.fullName = nameCandidates[0];
  }

  return result;
}

export default function BusinessCardScanner({ onResult, onClose }: BusinessCardScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function processImage(file: File) {
    setScanning(true);
    setProgress(0);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const worker = await createWorker("eng+mya", 1, {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const parsed = parseBusinessCard(data.text);
      onResult(parsed);
    } catch {
      setError("Failed to scan the image. Please try again.");
    } finally {
      setScanning(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    processImage(file);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: "var(--nc-text)" }}>
            Scan Business Card
          </h3>
          <button onClick={onClose} className="text-sm" style={{ color: "var(--nc-text-3)" }}>
            Cancel
          </button>
        </div>

        <p className="text-xs" style={{ color: "var(--nc-text-2)" }}>
          Upload or photograph a business card. Text will be extracted in English and Myanmar, then auto-fill your profile fields.
        </p>

        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={scanning}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-sm transition-all hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-50"
            style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Upload Image
          </button>
          <button onClick={() => cameraRef.current?.click()} disabled={scanning}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-sm transition-all hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-50"
            style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Take Photo
          </button>
        </div>

        {preview && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--nc-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Business card preview" className="w-full h-40 object-contain" />
          </div>
        )}

        {scanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs" style={{ color: "var(--nc-text-2)" }}>
              <span>Scanning... (English + Myanmar)</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--nc-bg-2)" }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "var(--nc-brand-grad)" }} />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
