"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Heart, Share2, Play, ExternalLink } from "lucide-react";
import type { PortfolioData } from "@/lib/validators/template-schemas";

interface PP { data: PortfolioData; accentColor?: string; }

export function BlueprintPortfolio({ data, accentColor = "#8b5cf6" }: PP) {
  const { fullName, headline, bio, avatarUrl, projects, socialLinks, contacts } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* CREATOR PROFILE CARD */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-2xl text-center space-y-6">
          {avatarUrl && (
            <div className="relative h-28 w-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-500 shadow-xl">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image src={avatarUrl} alt={fullName} fill className="object-cover" sizes="112px" priority />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{fullName}</h1>
            <p className="text-sm font-semibold text-purple-400">{headline}</p>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">{bio}</p>
          </div>

          {/* Social Icons Pill Grid */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/20 transition-all">
                {s.label || s.platform}
              </a>
            ))}
          </div>
        </div>

        {/* CREATIVE SHOWCASE */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-2">Featured Campaigns & Content</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 hover:bg-white/10 transition-all">
                  {p.coverImageUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                      <Image src={p.coverImageUrl} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                  )}
                  <h3 className="font-bold text-sm">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}