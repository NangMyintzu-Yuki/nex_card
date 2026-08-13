"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  text: string;
}

function isMyanmar(text: string): boolean {
  return /[\u1000-\u109F]/.test(text);
}

const FAQ_EN: Record<string, string> = {
  "what is nex card":
    "NEX CARD is a platform to create stunning digital name cards, portfolios, business pages, and wedding invitations. Share instantly via link, QR code, or NFC tap.",
  "how to create":
    "Sign up, choose a category (Name Card, Portfolio, Business, or Wedding), pick a template, fill in your details, and publish. It takes less than 5 minutes!",
  "how much does it cost":
    "NEX CARD templates are premium designs available for a one-time payment. Each template has its own pricing. Sign up and browse the template gallery to see current prices.",
  "what templates are available":
    "We have 20+ templates across 4 categories: Digital Name Cards (Aurora, Obsidian, etc.), Portfolios (Canvas, Studio), Business Pages (Marquee, Vault), and Wedding Invitations (Eternal, Blossom, Noir, Celestial, Rustic).",
  "can i use qr code":
    "Yes! Every NEX CARD profile gets a unique QR code automatically. You can download it and print it on business cards, posters, or anywhere else.",
  "what is nfc":
    "NFC (Near Field Communication) allows anyone to tap your card on their phone to instantly open your profile. We support NFC tag programming for compatible tags.",
  "how to share":
    "Share your profile via a direct link, QR code, or NFC tap. Your link is always live and updates in real-time when you edit your profile.",
  "is it mobile friendly":
    "Absolutely! All NEX CARD templates are fully responsive and optimized for mobile devices. Your profile looks great on any screen size.",
  "can i customize design":
    "Yes! You can customize accent colors, upload your own photos, add social links, and choose from multiple template designs. Each template has its own style options.",
  "how to register":
    "Click 'Get Started Free' on the homepage, enter your name, email, and password. You'll be guided through onboarding to pick your first template.",
  "what is portfolio":
    "A Portfolio template lets you showcase your work, skills, experience, and projects. Perfect for developers, designers, artists, and professionals.",
  "wedding invitation":
    "Our wedding templates include love story timeline, event details, photo gallery, RSVP form, guestbook, countdown timer, and background music support.",
  "rsvp":
    "Wedding templates include a built-in RSVP form where guests can confirm attendance, select meal preferences, add dietary notes, plus-one names, and song requests.",
  "default":
    "I can help with questions about NEX CARD features, templates, pricing, QR codes, NFC, and how to get started. Try asking something like 'What templates are available?' or 'How to share my profile?'",
};

const FAQ_MY: Record<string, string> = {
  "nex card ဘာလဲ":
    "NEX CARD ဆိုတာ digital name card, portfolio, business page, wedding invitation တွေဖန်တီးဖို့ platform ပါ။ Link, QR code, NFC tap နဲ့ချက်ချင်း share လို့ရပါတယ်။",
  "ဘယ်လိုဖန်တီး":
    "Sign up ဝင်ပြီး category ရွေးပါ (Name Card, Portfolio, Business, Wedding)၊ template ရွေးပါ၊ အချက်အလက်ဖြည့်ပြီး publish လုပ်ပါ။ ၅ မိနစ်ထက်မကြာပါဘူး။",
  "ဘယ်လောက်ကျ":
    "NEX CARD template တွေက premium designs တွေဖြစ်ပြီး one-time payment နဲ့ဝယ်လို့ရပါတယ်။ Template gallery မှာ ဈေးနှုန်းတွေကြည့်နိုင်ပါတယ်။",
  "ဘယ် template":
    "categories ၄ ခုမှာ template ၂၀ ကျော်ရှိပါတယ်။ Name Card (Aurora, Obsidian)၊ Portfolio (Canvas, Studio)၊ Business (Marquee, Vault)၊ Wedding (Eternal, Blossom, Noir, Celestial, Rustic) တွေပါဝင်ပါတယ်။",
  "qr code":
    "ဟုတ်ပါတယ်! NEX CARD profile တိုင်းမှာ QR code အလိုအလျောက်ရရှိပါတယ်။ Business card, poster စတာတွေမှာ print ထုတ်လို့ရပါတယ်။",
  "nfc":
    "NFC (Near Field Communication) ဆိုတာ သင့်ဖုန်းကို card ပေါ်မှာ tap လိုက်ရုံနဲ့ profile ကိုချက်ချင်းဖွင့်ကြည့်လို့ရတဲ့ technology ပါ။",
  "ဘယ်လိုshare":
    "Direct link, QR code, ဒါမှမဟုတ် NFC tap နဲ့ share လို့ရပါတယ်။ Profile ကို edit လုပ်တိုင်း real-time မှာ update ဖြစ်ပါတယ်။",
  "mobile friendly":
    "ဟုတ်ပါတယ်! NEX CARD template တွေအကုန်လုံး mobile devices အတွက် fully responsive ဖြစ်ပါတယ်။",
  "customize":
    "ဟုတ်ပါတယ်! Accent colors ပြောင်းလို့ရ၊ ဓာတ်ပုံတင်လို့ရ၊ social links ထည့်လို့ရပြီး template design တွေကိုလည်းရွေးချယ်လို့ရပါတယ်။",
  "register":
    "Homepage မှာ 'Get Started Free' ကိုနှိပ်ပြီး name, email, password ဖြည့်ပါ။ Onboarding မှာ template ရွေးပေးပါလိမ့်မယ်။",
  "portfolio":
    "Portfolio template က သင့်အလုပ်၊ skills, experience, projects တွေကိုပြသဖို့ပါ။ Developers, designers, artists တွေအတွက်အကောင်းဆုံးပါ။",
  "wedding":
    "Wedding template တွေမှာ love story timeline, event details, photo gallery, RSVP form, guestbook, countdown timer, background music အပါအဝင် feature တွေပါဝင်ပါတယ်။",
  "rsvp":
    "Wedding template တွေမှာ RSVP form ပါဝင်ပြီး guest တွေ attendance confirm, meal preference ရွေးချယ်, dietary notes, plus-one name, song request ထည့်လို့ရပါတယ်။",
  "default_my":
    "NEX CARD features, templates, pricing, QR code, NFC နဲ့ စတင်အသုံးပြုနည်းအကြောင်း မေးလို့ရပါတယ်။ 'ဘယ် template တွေရှိလဲ' ဒါမှမဟုတ် 'Profile ဘယ်လို share ရမလဲ' စတာတွေမေးကြည့်ပါ။",
};

function getAnswer(input: string): string {
  const myanmar = isMyanmar(input);
  const lower = input.toLowerCase().trim();
  const faq = myanmar ? FAQ_MY : FAQ_EN;

  for (const [key, answer] of Object.entries(faq)) {
    if (key === "default" || key === "default_my") continue;
    if (lower.includes(key) || input.includes(key)) return answer;
  }

  if (myanmar) {
    if (input.includes("ဈေး") || input.includes("ကျ") || input.includes("ငွေ") || input.includes("free") || input.includes("စရိတ်"))
      return faq["ဘယ်လောက်ကျ"];
    if (input.includes("template") || input.includes("ဒီဇိုင်း"))
      return faq["ဘယ် template"];
    if (input.includes("sign") || input.includes("register") || input.includes("ဝင်") || input.includes("မှတ်ပုံ"))
      return faq["register"];
    if (input.includes("share") || input.includes("link") || input.includes("မျှ"))
      return faq["ဘယ်လိုshare"];
    if (input.includes("mobile") || input.includes("ဖုန်း"))
      return faq["mobile friendly"];
    if (input.includes("custom") || input.includes("ပြောင်း") || input.includes("အရောင်"))
      return faq["customize"];
    if (input.includes("wedding") || input.includes("မင်္ဂလာ") || input.includes("ဖိတ်စာ"))
      return faq["wedding"];
    if (input.includes("portfolio"))
      return faq["portfolio"];
    if (input.includes("qr"))
      return faq["qr code"];
    if (input.includes("nfc") || input.includes("tap"))
      return faq["nfc"];
    if (input.includes("rsvp") || input.includes("attend"))
      return faq["rsvp"];
    return faq["default_my"];
  }

  if (lower.includes("price") || lower.includes("cost") || lower.includes("free"))
    return FAQ_EN["how much does it cost"];
  if (lower.includes("template") || lower.includes("design"))
    return FAQ_EN["what templates are available"];
  if (lower.includes("sign") || lower.includes("register") || lower.includes("account"))
    return FAQ_EN["how to register"];
  if (lower.includes("share") || lower.includes("link"))
    return FAQ_EN["how to share"];
  if (lower.includes("mobile") || lower.includes("phone"))
    return FAQ_EN["is it mobile friendly"];
  if (lower.includes("custom") || lower.includes("color") || lower.includes("style"))
    return FAQ_EN["can i customize design"];
  if (lower.includes("wedding") || lower.includes("invite"))
    return FAQ_EN["wedding invitation"];
  if (lower.includes("portfolio") || lower.includes("showcase"))
    return FAQ_EN["what is portfolio"];
  if (lower.includes("qr"))
    return FAQ_EN["can i use qr code"];
  if (lower.includes("nfc") || lower.includes("tap"))
    return FAQ_EN["what is nfc"];
  if (lower.includes("rsvp") || lower.includes("attend"))
    return FAQ_EN["rsvp"];
  return FAQ_EN["default"];
}

const SUGGESTIONS_EN = [
  "How to create a card?",
  "What templates are available?",
  "How much does it cost?",
  "How to share my profile?",
  "What is NFC?",
  "Wedding features?",
];

const SUGGESTIONS_MY = [
  "ဘယ် template တွေရှိလဲ?",
  "ဘယ်လိုဖန်တီးရမလဲ?",
  "ဘယ်လောက်ကျလဲ?",
  "Profile ဘယ်လို share ရမလဲ?",
  "NFC ဘာလဲ?",
  "Wedding features?",
];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setMessages([{
        role: "assistant",
        text: "Hi! I'm the NEX CARD assistant. Ask me anything about our features, templates, or how to get started.\n\nမင်္ဂလာပါ! NEX CARD assistant ပါ။ Features, templates, စတာတွေအကြောင်းဘာမဆိုမေးလို့ရပါတယ်။",
      }]);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const useMyanmar = lastUserMsg ? isMyanmar(lastUserMsg.text) : false;
  const suggestions = useMyanmar ? SUGGESTIONS_MY : SUGGESTIONS_EN;

  function handleSend(text?: string) {
    const q = text ?? input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: getAnswer(q) }]);
    }, 400);
  }

  const unanswered = suggestions.filter(
    (q) => !messages.some((m) => m.role === "user" && m.text === q)
  ).slice(0, 3);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
        style={{
          background: "var(--nc-brand-grad)",
          color: "var(--nc-brand-text)",
          boxShadow: "var(--nc-glow)",
        }}
        aria-label="AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-6 z-50 flex w-[340px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: "var(--nc-bg-card)",
              border: "1px solid var(--nc-border)",
              height: "min(460px, calc(100vh - 10rem))",
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                  <path d="M9 22h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold">NEX CARD Assistant</p>
                <p className="text-[10px] opacity-80">Ask me anything / ဘာမဆိုမေးလို့ရပါတယ်</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed"
                    style={{
                      background: m.role === "user" ? "var(--nc-brand-grad)" : "var(--nc-bg-2)",
                      color: m.role === "user" ? "var(--nc-brand-text)" : "var(--nc-text)",
                      borderBottomRightRadius: m.role === "user" ? "4px" : undefined,
                      borderBottomLeftRadius: m.role === "assistant" ? "4px" : undefined,
                    }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {unanswered.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {unanswered.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                    style={{
                      borderColor: "var(--nc-border-brand)",
                      color: "var(--nc-brand-2)",
                      background: "transparent",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t px-3 py-2.5"
              style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={useMyanmar ? "မေးချင်တာရေးပါ…" : "Type your question…"}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  color: "var(--nc-text)",
                  background: "var(--nc-bg-2)",
                  border: "1px solid var(--nc-border)",
                }}
              />
              <button onClick={() => handleSend()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
                style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
