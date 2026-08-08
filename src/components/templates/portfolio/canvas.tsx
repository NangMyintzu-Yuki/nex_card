"use client";

import React, { useState } from "react";
import type { PortfolioData } from "@/lib/validators/template-schemas";
import { resolveImageUrl } from "@/lib/utils/image-url";

interface PP {
  data: PortfolioData;
  accentColor?: string;
}

function cHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  return value.startsWith("http") ? value : `https://${value}`;
}

const AVAIL_MAP: Record<string, { dot: string; text: string; glow: string }> = {
  available: { dot: "bg-emerald-400", text: "Open to opportunities", glow: "shadow-emerald-500/50" },
  limited: { dot: "bg-amber-400", text: "Limited availability", glow: "shadow-amber-500/50" },
  unavailable: { dot: "bg-rose-500", text: "Not available", glow: "shadow-rose-500/50" },
};

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function SocialIcon({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) {
  const c = "currentColor";
  const icons: Record<string, React.ReactNode> = {
    linkedin: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    github: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
    twitter: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    instagram: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    facebook: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    youtube: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    tiktok: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    whatsapp: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    telegram: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    viber: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M11.324 0c-.421 0-.854.022-1.282.067C4.564.443.828 5.602.165 10.455a11.68 11.68 0 002.792 8.342L2.02 23.57a.472.472 0 00.59.575l4.755-1.44a11.86 11.86 0 005.136 1.22h.012c6.1 0 11.157-4.91 11.323-10.956.083-3.013-1.137-5.81-3.368-7.764C17.322 2.21 14.502.99 11.386.975h-.063zM11.4 2.82c2.643.014 5.02 1.075 6.728 2.938a9.295 9.295 0 012.686 6.18c-.133 4.874-4.225 8.814-9.102 8.814a9.5 9.5 0 01-4.16-.95l-.37-.22-2.816.856.9-2.67-.24-.372a9.554 9.554 0 01-1.49-5.25c.04-5.22 4.288-9.476 9.515-9.506h-.002zm4.812 3.042a.838.838 0 00-.568-.192.847.847 0 00-.535.192c-.643.553-.857.953-.832 1.556.026.603.515 1.513 1.425 2.628.91 1.115 1.457 1.49 1.765 1.649a.84.84 0 00.585.097.844.844 0 00.516-.384c.286-.426.505-1.165.505-1.677 0-.322-.105-.655-.306-.937a1.57 1.57 0 00-.325-.339 7.26 7.26 0 00-.485-.367 5.2 5.2 0 00-.347-.226 3.49 3.49 0 00-.353-.172 1.3 1.3 0 00-.325-.097l-.165-.002-.167.002zm-2.602 1.57a.66.66 0 00-.372.118l-.134.106a2.035 2.035 0 00-.493.62c-.145.29-.293.783-.12 1.034.173.25.714.445 1.135.71.42.265.71.553.96.856.25.304.438.555.483.75.045.195-.016.334-.127.43a.86.86 0 01-.36.178c-.23.058-.503-.087-.766-.468-.263-.38-.562-.868-.95-1.355a11.28 11.28 0 01-1.126-1.77c-.256-.496-.103-.828.063-1.024.166-.195.482-.438.837-.474a.86.86 0 01.377.027zm5.59 3.117a.57.57 0 00-.398-.16h-.184a.573.573 0 00-.4.16c-.293.292-.52.736-.52 1.154 0 .419.358 1.11.985 1.872.627.762 1.004 1.062 1.233 1.192a.565.565 0 00.38.064.568.568 0 00.336-.256c.185-.28.31-.767.31-1.137 0-.215-.066-.433-.185-.62a1.26 1.26 0 00-.252-.257c-.12-.088-.254-.18-.408-.275a3.72 3.72 0 00-.397-.202 2.41 2.41 0 00-.1-.04zM8.697 10.65a.706.706 0 00-.676-.03.712.712 0 00-.423.37c-.268.573-.416 1.297-.416 2.04 0 .744.183 1.396.455 1.966.272.57.526.85.696.948a.7.7 0 00.375.063.707.707 0 00.523-.283c.178-.23.34-.654.34-1.174 0-.522-.19-.963-.382-1.285a3.117 3.117 0 00-.36-.464 2.278 2.278 0 00-.132-.112z"/></svg>,
    discord: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>,
    website: <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    behance: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.62.16-1.26.25-1.92.25H0v-15.2h6.938zm-.36 5.95c.64 0 1.16-.15 1.57-.46.41-.31.61-.78.61-1.42 0-.37-.07-.68-.2-.93-.13-.25-.32-.45-.56-.59-.24-.14-.51-.24-.82-.3-.3-.06-.61-.09-.93-.09H3.57v3.8h2.99zm.18 6.32c.37 0 .72-.04 1.05-.12.33-.08.62-.21.87-.38.25-.17.45-.4.6-.68.15-.28.23-.63.23-1.06 0-.83-.24-1.44-.72-1.81-.48-.37-1.1-.56-1.87-.56H3.57v4.61h3.19zM15.1 4.93h6.33v1.37h-6.33V4.93zM21.59 12.6c-.18-.56-.47-1.03-.87-1.42-.4-.39-.89-.68-1.48-.87-.59-.19-1.24-.29-1.96-.29-.72 0-1.38.1-1.97.29-.59.19-1.09.49-1.49.87-.4.39-.7.86-.89 1.42-.19.56-.29 1.17-.29 1.84 0 .66.1 1.27.29 1.83.19.56.49 1.04.89 1.42.4.39.9.69 1.49.88.59.19 1.25.29 1.97.29.72 0 1.37-.1 1.96-.29.59-.19 1.08-.49 1.48-.88.4-.38.7-.86.87-1.42.18-.56.27-1.17.27-1.83 0-.67-.09-1.28-.27-1.84zm-1.62 6.03c-.35-.42-.84-.63-1.46-.63-.38 0-.7.07-.96.21-.26.14-.47.33-.62.56-.15.23-.26.48-.32.76-.06.28-.1.54-.1.78h5.3c-.06-.54-.17-1.01-.32-1.34l-.52.66zM15.1 12.6c.32-.46.76-.69 1.32-.69.42 0 .77.15 1.04.45.27.3.42.67.43 1.11h-3.15c.05-.32.18-.67.36-.87z"/></svg>,
    dribbble: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.29zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>,
    medium: <svg className={className} viewBox="0 0 24 24" fill={c}><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>,
  };
  return icons[platform] ?? <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>;
}

function ContactIcon({ type, className = "h-4 w-4" }: { type: string; className?: string }) {
  const c = "currentColor";
  const icons: Record<string, React.ReactNode> = {
    email: <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>,
    phone: <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    website: <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    address: <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  };
  return icons[type] ?? <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}><circle cx="12" cy="12" r="10"/></svg>;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS — Premium dark developer portfolio
// ─────────────────────────────────────────────────────────────────────────────
export function CanvasPortfolio({ data, accentColor = "#6366f1" }: PP) {
  const {
    fullName, headline, bio, avatarUrl, projects, skills,
    experience, socialLinks, contacts, testimonials, availability,
    resumeUrl, gallery
  } = data;

  const avail = availability ? AVAIL_MAP[availability] : null;
  const [activeTab, setActiveTab] = useState<"all" | "featured">("all");
  const filteredProjects = activeTab === "featured" ? projects.filter(p => p.featured) : projects;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-indigo-500 selection:text-white font-sans antialiased relative overflow-hidden">
      
      {/* Background Glow Effect Animation */}
      <div 
        className="fixed -top-40 -left-40 h-96 w-96 rounded-full blur-[128px] opacity-20 pointer-events-none transition-all duration-1000"
        style={{ background: accentColor }}
      />
      <div 
        className="fixed top-1/2 -right-40 h-96 w-96 rounded-full blur-[128px] opacity-15 pointer-events-none transition-all duration-1000"
        style={{ background: accentColor }}
      />

      {/* Floating Glass Navigation Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-neutral-900/60 p-2 pl-4 backdrop-blur-md shadow-2xl transition-all">
          <a href="#" className="flex items-center gap-3 group">
            {avatarUrl && (
              <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/10 group-hover:scale-105 transition-transform duration-300">
                <img src={resolveImageUrl(avatarUrl)} alt={fullName} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}
            <span className="font-bold text-sm tracking-tight text-neutral-200 group-hover:text-white transition-colors">
              {fullName}
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {["Work", "Skills", "Experience", "Gallery", "Contact"].map((i) => (
              <a
                key={i}
                href={`#${i.toLowerCase()}`}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                {i}
              </a>
            ))}
          </nav>

          <div className="flex gap-2">
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-5 py-2 text-xs font-bold text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                style={{ background: accentColor }}
              >
                Resume ↓
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10">
          
          {/* Avatar Profile Frame */}
          {avatarUrl && (
            <div className="relative group shrink-0">
              <div 
                className="absolute -inset-1 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
                style={{ background: accentColor }}
              />
              <div className="relative h-36 w-36 md:h-44 md:w-44 overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl">
                <img
                  src={resolveImageUrl(avatarUrl)}
                  alt={fullName}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            {avail && (
              <div 
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md animate-pulse"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${avail.dot} shadow-lg ${avail.glow}`} />
                <span className="text-neutral-300">{avail.text}</span>
              </div>
            )}

            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
              {fullName}
            </h1>
            <p className="mt-3 text-lg font-semibold md:text-2xl" style={{ color: accentColor }}>
              {headline}
            </p>
            <p className="mt-4 max-w-2xl text-neutral-400 leading-relaxed text-sm md:text-base">
              {bio}
            </p>

            {/* Quick Contact & Social Pills */}
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2.5">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={cHref(c.type, c.value)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  <ContactIcon type={c.type} className="h-3.5 w-3.5 text-zinc-500"/>
                  <span>{c.label ?? c.value}</span>
                </a>
              ))}
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  <SocialIcon platform={s.platform} className="h-3.5 w-3.5 text-zinc-500"/>
                  <span>{s.label ?? s.platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      {projects.length > 0 && (
        <section id="work" className="px-6 py-16 border-t border-white/5 bg-neutral-900/30">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Selected Projects</h2>
                <p className="text-xs text-neutral-400 mt-1">Check out some of my recent work</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded-xl bg-neutral-900 p-1 border border-white/10 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "all" ? "bg-white/10 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => setActiveTab("featured")}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "featured" ? "bg-white/10 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Featured ({projects.filter(p => p.featured).length})
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  {p.coverImageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                      <img
                        src={resolveImageUrl(p.coverImageUrl)}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-white/5 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-neutral-300 bg-white/5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold hover:underline flex items-center gap-1"
                          style={{ color: accentColor }}
                        >
                          Live Demo ↗
                        </a>
                      )}
                      {p.repoUrl && (
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          Source Code
                        </a>
                      )}
                      {p.caseStudyUrl && (
                        <a
                          href={p.caseStudyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-400 hover:text-white transition-colors ml-auto"
                        >
                          Case Study
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills & Expertise */}
      {skills.length > 0 && (
        <section id="skills" className="px-6 py-16 border-t border-white/5">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-extrabold text-white tracking-tight">Skills & Expertise</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {skills.map((g, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
                >
                  <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest" style={{ color: accentColor }}>
                    {g.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((item, j) => (
                      <span
                        key={j}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {experience.length > 0 && (
        <section id="experience" className="px-6 py-16 border-t border-white/5 bg-neutral-900/30">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-3xl font-extrabold text-white tracking-tight">Experience</h2>
            <div className="relative border-l border-white/10 ml-4 space-y-8 pl-6 md:pl-8">
              {experience.map((e, i) => (
                <div key={i} className="relative group">
                  {/* Timeline Dot */}
                  <span 
                    className="absolute -left-[31px] md:-left-[39px] top-1.5 h-4 w-4 rounded-full border-2 border-neutral-950 transition-transform duration-300 group-hover:scale-125"
                    style={{ background: accentColor }}
                  />

                  <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {e.logoUrl && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white">
                            <img src={resolveImageUrl(e.logoUrl)} alt={e.company} className="absolute inset-0 h-full w-full object-contain p-1.5" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-bold text-white">{e.role}</h3>
                          <p className="text-xs text-neutral-400">@ {e.company}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 self-start sm:self-auto">
                        {e.startDate.slice(0, 7)} – {e.endDate ? e.endDate.slice(0, 7) : "Present"}
                      </span>
                    </div>
                    {e.description && (
                      <p className="mt-4 text-xs md:text-sm text-neutral-400 leading-relaxed">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery && gallery.length > 0 && (
        <section id="gallery" className="px-6 py-16 border-t border-white/5">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-extrabold text-white tracking-tight">Gallery</h2>
            <div className="columns-2 gap-4 sm:columns-3 md:columns-4 space-y-4">
              {gallery.map((img, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                  <div className="relative aspect-square">
                    <img
                      src={resolveImageUrl(img.url)}
                      alt={img.alt || "Gallery image"}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="px-6 py-16 border-t border-white/5 bg-neutral-900/30">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-extrabold text-white tracking-tight">Testimonials</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <div key={i} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900 p-6 backdrop-blur-sm">
                  <div>
                    <div className="mb-3 flex text-amber-400 gap-1 text-xs">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j}>★</span>
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-neutral-300 italic leading-relaxed">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                    {t.avatarUrl && (
                      <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/10">
                         <img src={resolveImageUrl(t.avatarUrl)} alt={t.author} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{t.author}</p>
                      <p className="text-[10px] text-neutral-400">
                        {t.role}{t.company && ` · ${t.company}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modern Animated Footer */}
      <footer id="contact" className="border-t border-white/10 px-6 py-16 bg-neutral-950 relative">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Let&apos;s build something together.</h2>
            <p className="mt-2 text-xs text-neutral-400">Feel free to reach out for collaborations or just a friendly chat.</p>
            <div className="mt-4 flex flex-wrap gap-4">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={cHref(c.type, c.value)}
                  className="flex items-center gap-2 text-xs font-semibold hover:underline transition-all"
                  style={{ color: accentColor }}
                >
                  <ContactIcon type={c.type} className="h-4 w-4"/>
                  {c.value}
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300 flex items-center gap-1.5"
              >
                <SocialIcon platform={s.platform} className="h-3.5 w-3.5"/>
                {s.label ?? s.platform}
              </a>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-5xl mt-12 border-t border-white/5 pt-6 flex justify-between items-center text-[10px] text-neutral-500">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
          <p className="tracking-widest font-mono">NEX CARD</p>
        </div>
      </footer>
    </main>
  );
}
