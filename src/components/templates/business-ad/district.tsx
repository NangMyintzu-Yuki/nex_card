"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  Code,
  Cpu,
  Globe,
  Layers,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  isCeo?: boolean;
}

export interface ProductServiceItem {
  id?: string;
  title: string;
  category?: string;
  description: string;
  price?: string;
  priceNote?: string;
  features?: string[];
  imageUrl?: string;
  highlighted?: boolean;
}

export interface ContactItem {
  type: string;
  value: string;
  label?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BusinessHour {
  days: string;
  hours: string;
}

export interface HistoryItem {
  year: string;
  title: string;
  description: string;
}

export interface WhatWeDoItem {
  title: string;
  description: string;
  iconName?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface BusinessAdData {
  businessName: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  heroImageUrl?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  address?: Address;
  certifications?: string[];
  founded?: string;
  contacts?: ContactItem[];
  socialLinks?: SocialLink[];
  businessHours?: BusinessHour[];
  testimonials?: Testimonial[];
  faq?: FAQItem[];
  whatWeDo?: WhatWeDoItem[];
  history?: HistoryItem[];
  services?: ProductServiceItem[];
}

export interface ComprehensiveCompanyProfileProps {
  data: BusinessAdData;
  accentColor?: string;
  teamMembers?: TeamMember[];
  products?: ProductServiceItem[];
}

// ==========================================
// HELPER UTILITIES
// ==========================================

function cHref(type: string, value: string) {
  const sanitized = value.trim();
  switch (type.toLowerCase()) {
    case "email":
      return `mailto:${sanitized}`;
    case "phone":
      return `tel:${sanitized.replace(/\s+/g, "")}`;
    case "whatsapp":
    case "viber":
      return `https://wa.me/${sanitized.replace(/[^0-9]/g, "")}`;
    case "telegram":
      return `https://t.me/${sanitized.replace("@", "")}`;
    case "website":
      return sanitized.startsWith("http") ? sanitized : `https://${sanitized}`;
    default:
      return sanitized.startsWith("http") ? sanitized : "#";
  }
}

function ContactIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
      return <Phone className="h-4 w-4" />;
    case "website":
      return <Globe className="h-4 w-4" />;
    case "address":
      return <MapPin className="h-4 w-4" />;
    case "whatsapp":
    case "viber":
    case "telegram":
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <Send className="h-4 w-4" />;
  }
}

function StarRating({ r }: { r: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < r
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function CategoryIcon({ name }: { name?: string }) {
  switch (name?.toLowerCase()) {
    case "cloud":
      return <Cloud className="h-6 w-6" />;
    case "cpu":
      return <Cpu className="h-6 w-6" />;
    case "code":
      return <Code className="h-6 w-6" />;
    default:
      return <Layers className="h-6 w-6" />;
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function DistrictBusiness({
  data,
  accentColor = "#2563eb", // Friendly Royal Blue
  teamMembers = [],
  products = [],
}: ComprehensiveCompanyProfileProps) {
  const {
    businessName,
    tagline,
    description,
    logoUrl,
    heroImageUrl,
    services = [],
    contacts = [],
    testimonials = [],
    businessHours = [],
    faq = [],
    primaryCtaLabel = "ဆက်သွယ်ရန်",
    primaryCtaUrl = "#contact",
    address,
    certifications = [],
    founded,
    whatWeDo = [],
  } = data;

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allServicesAndProducts = [...services, ...products];

  // Primary Phone for Quick Call Action
  const phoneContact =
    contacts.find((c) => c.type.toLowerCase() === "phone")?.value || "";

  const ceoMember = teamMembers.find(
    (m) =>
      m.isCeo ||
      m.role?.toLowerCase().includes("ceo") ||
      m.role?.toLowerCase().includes("founder") ||
      m.role?.toLowerCase().includes("owner")
  );

  return (
    <main className="min-h-screen bg-slate-50/60 text-slate-800 antialiased font-sans pb-16 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={businessName}
                width={140}
                height={45}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-black text-xl shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  {businessName.charAt(0)}
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {businessName}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#who-we-are" className="hover:text-slate-900 transition-colors">
              အကြောင်းအရာ
            </a>
            {whatWeDo.length > 0 && (
              <a href="#what-we-do" className="hover:text-slate-900 transition-colors">
                ဝန်ဆောင်မှုများ
              </a>
            )}
            {allServicesAndProducts.length > 0 && (
              <a href="#products-services" className="hover:text-slate-900 transition-colors">
                ထုတ်ကုန်နှင့် စေတနာ
              </a>
            )}
            {testimonials.length > 0 && (
              <a href="#testimonials" className="hover:text-slate-900 transition-colors">
                သုံးသပ်ချက်များ
              </a>
            )}
            <a href="#contact" className="hover:text-slate-900 transition-colors">
              ဆက်သွယ်ရန်
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {phoneContact && (
              <a
                href={`tel:${phoneContact.replace(/\s+/g, "")}`}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                <span>{phoneContact}</span>
              </a>
            )}

            <a
              href={primaryCtaUrl}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
              style={{ backgroundColor: accentColor }}
            >
              <span>{primaryCtaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-6 py-4 space-y-3 shadow-lg">
            <a
              href="#who-we-are"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              အကြောင်းအရာ
            </a>
            {whatWeDo.length > 0 && (
              <a
                href="#what-we-do"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                ဝန်ဆောင်မှုများ
              </a>
            )}
            {allServicesAndProducts.length > 0 && (
              <a
                href="#products-services"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                ထုတ်ကုန်များနှင့် ဝန်ဆောင်မှု
              </a>
            )}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              ဆက်သွယ်ရန်
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/50 py-12 lg:py-20 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {founded && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
                    <Building2 className="h-3.5 w-3.5 text-amber-500" />
                    စတင်တည်ထောင် - {founded}
                  </span>
                )}
                {certifications.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    စိတ်ချယုံကြည်ရသော လုပ်ငန်း
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
                {businessName}
              </h1>

              {tagline && (
                <p className="text-lg font-semibold text-slate-700 lg:text-xl leading-snug">
                  {tagline}
                </p>
              )}

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base max-w-2xl">
                {description}
              </p>

              {/* Quick Info Badges for SME */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {address?.city && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400">တည်နေရာ</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {address.street ? `${address.street}, ` : ""}{address.city}
                      </p>
                    </div>
                  </div>
                )}
                {businessHours.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400">ဆိုင်ဖွင့်ချိန်</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {businessHours[0]?.days}: {businessHours[0]?.hours}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <a
                  href={primaryCtaUrl}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                {phoneContact && (
                  <a
                    href={`tel:${phoneContact.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
                  >
                    <PhoneCall className="h-4 w-4 text-emerald-600" />
                    <span>တိုက်ရိုက်ဖုန်းဆက်ရန်</span>
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {heroImageUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
                    <Image
                      src={heroImageUrl}
                      alt={businessName}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                  </div>
                ) : (
                  <div
                    className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl p-8 text-center text-white shadow-xl"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Building2 className="h-16 w-16 mb-4 text-white/80" />
                    <h3 className="text-2xl font-bold">{businessName}</h3>
                    {tagline && <p className="mt-2 text-sm opacity-90">{tagline}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="who-we-are" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            <div className={ceoMember ? "lg:col-span-6" : "lg:col-span-12"}>
              <span
                className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50"
                style={{ color: accentColor }}
              >
                ကျွန်ုပ်တို့အကြောင်း
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                လုပ်ငန်းအတွေ့အကြုံနှင့် စေတနာ
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                {description}
              </p>

              {certifications.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    အသိအမှတ်ပြုလက်မှတ်များ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {ceoMember && (
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {ceoMember.avatarUrl ? (
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
                        <Image
                          src={ceoMember.avatarUrl}
                          alt={ceoMember.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow"
                        style={{ backgroundColor: accentColor }}
                      >
                        {ceoMember.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        ဦးဆောင်သူ
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {ceoMember.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {ceoMember.role}
                      </p>
                      {ceoMember.bio && (
                        <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                          "{ceoMember.bio}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      {whatWeDo.length > 0 && (
        <section
          id="what-we-do"
          className="py-16 bg-slate-50/80 border-t border-slate-200/60"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                အဓိကဝန်ဆောင်မှုများ
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                လူကြီးမင်းတို့အတွက် ဆောင်ရွက်ပေးနေမှုများ
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whatWeDo.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-all"
                >
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    <CategoryIcon name={item.iconName} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products & Services Section */}
      {allServicesAndProducts.length > 0 && (
        <section
          id="products-services"
          className="py-16 bg-white border-t border-slate-200/60"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                ထုတ်ကုန်နှင့် စေတနာ
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                ရရှိနိုင်သော ကုန်ပစ္စည်းများနှင့် ဝန်ဆောင်မှုများ
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allServicesAndProducts.map((s, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                    s.highlighted
                      ? "border-amber-400 bg-amber-50/20 shadow-lg ring-2 ring-amber-400/20"
                      : "border-slate-200 bg-white shadow-xs hover:shadow-md"
                  }`}
                >
                  <div>
                    {s.highlighted && (
                      <span className="absolute -top-3 right-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-xs">
                        လူကြိုက်များသော
                      </span>
                    )}

                    {s.imageUrl && (
                      <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-100">
                        <Image
                          src={s.imageUrl}
                          alt={s.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>

                    {s.price && (
                      <p className="mt-2 text-xl font-black text-slate-900">
                        {s.price}{" "}
                        {s.priceNote && (
                          <span className="text-xs text-slate-500 font-medium">
                            / {s.priceNote}
                          </span>
                        )}
                      </p>
                    )}

                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {s.description}
                    </p>

                    {s.features && s.features.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {s.features.map((f, j) => (
                          <li
                            key={j}
                            className="flex items-center gap-2 text-xs sm:text-sm text-slate-700"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={primaryCtaUrl}
                      className="inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:brightness-110 transition-all"
                      style={{ backgroundColor: accentColor }}
                    >
                      စုံစမ်းမေးမြန်းရန်
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section
          id="testimonials"
          className="py-16 bg-slate-50/80 border-t border-slate-200/60"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                သုံးသပ်ချက်များ
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                ဝယ်ယူသူများ၏ ရလဒ်နှင့် မှတ်ချက်များ
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/80 p-6 bg-white shadow-xs"
                >
                  <StarRating r={t.rating || 5} />
                  <p className="mt-3 text-sm italic text-slate-700">
                    "{t.quote}"
                  </p>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs font-bold text-slate-900">{t.author}</p>
                    {t.role && <p className="text-xs text-slate-500">{t.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faq.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200/60">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                သိရှိလိုသည်များ
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ
              </h2>
            </div>

            <div className="mt-8 space-y-3">
              {faq.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-4 text-left font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-5 space-y-3">
              <h3 className="text-2xl font-extrabold">{businessName}</h3>
              {tagline && <p className="text-xs text-slate-400">{tagline}</p>}
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                {description}
              </p>
            </div>

            {contacts.length > 0 && (
              <div className="md:col-span-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  တိုက်ရိုက်ဆက်သွယ်ရန်
                </h4>
                <ul className="space-y-2.5">
                  {contacts.map((c, i) => (
                    <li key={i}>
                      <a
                        href={cHref(c.type, c.value)}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        <ContactIcon type={c.type} />
                        <span>{c.label || c.value}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {businessHours.length > 0 && (
              <div className="md:col-span-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  ဆိုင်ဖွင့်ချိန်များ
                </h4>
                <ul className="space-y-2">
                  {businessHours.map((h, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-300 flex justify-between gap-2"
                    >
                      <span className="font-medium">{h.days}:</span>
                      <span className="text-slate-400">{h.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
            <a
              href={primaryCtaUrl}
              className="rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              {primaryCtaLabel}
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-slate-200 p-2 sm:hidden shadow-lg">
        {phoneContact && (
          <a
            href={`tel:${phoneContact.replace(/\s+/g, "")}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white bg-emerald-600 mr-2 shadow-xs active:scale-95 transition-all"
          >
            <PhoneCall className="h-4 w-4" />
            <span>ဖုန်းခေါ်ရန်</span>
          </a>
        )}
        <a
          href={primaryCtaUrl}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
          style={{ backgroundColor: accentColor }}
        >
          <span>{primaryCtaLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </main>
  );
}

export const mockEnterpriseData: BusinessAdData & {
  teamMembers?: TeamMember[];
  products?: ProductServiceItem[];
} = {
  businessName: "Apex Innovations",
  tagline: "Building scalable enterprise solutions for tomorrow",
  description:
    "Apex Innovations is a global enterprise software and consulting firm dedicated to accelerating digital transformation through modern web technologies, AI integration, and cloud-native architectures.",
  logoUrl: "",
  heroImageUrl: "",
  primaryCtaLabel: "Schedule a Consultation",
  primaryCtaUrl: "#contact",
  founded: "2014",
  address: {
    street: "100 Tech Boulevard, Suite 400",
    city: "San Francisco, CA 94107",
  },
  certifications: [
    "ISO 27001 Certified",
    "AWS Advanced Tier Partner",
    "SOC 2 Type II Compliant",
  ],
  contacts: [
    { type: "email", value: "contact@apexinnovations.com", label: "Email Us" },
    { type: "phone", value: "+1 (800) 555-0199", label: "Call Direct" },
  ],
  socialLinks: [
    { platform: "linkedin", url: "https://linkedin.com/company/apex" },
    { platform: "twitter", url: "https://twitter.com/apex_innovate" },
  ],
  businessHours: [
    { days: "Mon - Fri", hours: "8:00 AM - 6:00 PM PST" },
    { days: "Sat", hours: "9:00 AM - 1:00 PM PST" },
  ],
  testimonials: [
    {
      quote:
        "Apex transformed our core infrastructure in under six months. Their leadership and technical depth are unmatched.",
      author: "Sarah Jenkins",
      role: "CTO, FinTech Global",
      rating: 5,
    },
    {
      quote:
        "The team delivered on every milestone without friction. Easily the best agency partner we have worked with.",
      author: "Marcus Vance",
      role: "VP of Digital, CloudScale Inc.",
      rating: 5,
    },
  ],
  faq: [
    {
      question: "How long does a typical enterprise onboarding take?",
      answer:
        "Initial discovery and roadmap setup take 2 weeks, followed by iterative deployment sprints tailored to your stack.",
    },
    {
      question: "Do you offer post-launch maintenance and compliance audits?",
      answer:
        "Yes, we provide 24/7 managed support along with annual SOC 2 and ISO compliance checks.",
    },
  ],
  whatWeDo: [
    {
      title: "Cloud Migration & Architecture",
      description:
        "Migrating legacy systems to resilient, auto-scaling cloud environments on AWS, Azure, and Google Cloud.",
      iconName: "cloud",
    },
    {
      title: "AI Integration & Automation",
      description:
        "Implementing LLMs, automated workflows, and predictive analytics tailored to enterprise data pipelines.",
      iconName: "cpu",
    },
    {
      title: "Custom Platform Engineering",
      description:
        "End-to-end web and mobile web platforms built with React, Next.js, and high-performance microservices.",
      iconName: "code",
    },
  ],
  history: [
    {
      year: "2014",
      title: "Company Founded",
      description:
        "Apex Innovations was founded in San Francisco as a boutique cloud architecture advisory.",
    },
    {
      year: "2018",
      title: "Global Expansion",
      description:
        "Expanded operations to EMEA and Asia-Pacific, growing the team past 100 enterprise engineers.",
    },
    {
      year: "2022",
      title: "Launch of AI Labs",
      description:
        "Introduced specialized enterprise AI integration services to accelerate automated operations.",
    },
    {
      year: "2025",
      title: "Over 500+ Clients Served",
      description:
        "Achieved SOC 2 Type II certification and scaled enterprise delivery across 25 countries.",
    },
  ],
  teamMembers: [
    {
      name: "Dr. Elena Rostova",
      role: "Chief Executive Officer & Co-Founder",
      bio: "Former VP of Engineering with 18+ years leading large-scale distributed systems and digital transformation programs.",
      isCeo: true,
      linkedinUrl: "https://linkedin.com",
    },
    {
      name: "David Chen",
      role: "Chief Technology Officer",
      bio: "Specializes in cloud infrastructure, microservices, and high-throughput data processing systems.",
    },
    {
      name: "Samantha Wright",
      role: "Head of Product Strategy",
      bio: "Leads product design and UX strategy for Fortune 500 SaaS transformations.",
    },
  ],
  products: [
    {
      title: "Enterprise Core Acceleration",
      description:
        "Complete modernization overhaul for legacy applications into micro-frontend React/Next.js architectures.",
      price: "$25,000",
      priceNote: "/ base setup",
      highlighted: true,
      features: [
        "Full architecture discovery",
        "Next.js & React migration roadmap",
        "Automated CI/CD deployment pipelines",
        "Dedicated engineering squad",
      ],
    },
    {
      title: "Managed Cloud Support",
      description:
        "Continuous 24/7 cluster monitoring, incident handling, and automated security patch management.",
      price: "$5,000",
      priceNote: "/ month",
      features: [
        "Sub-15 minute SLA response",
        "SOC 2 compliance monitoring",
        "Cost optimization audits",
      ],
    },
  ],
};