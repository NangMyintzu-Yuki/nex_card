// scripts/generate-presentations-v2.mjs
// Visual-rich PowerPoint presentations with diagrams, mockups, and graphics

import PptxGenJS from "pptxgenjs";

const C = {
  gold: "D4AF37", goldLight: "F0C050", goldDim: "3D3200",
  dark: "0F0F0F", darkCard: "1A1A1A", darkBorder: "2A2A2A", darkSubtle: "141414",
  navy: "1E3A8A", navyLight: "2D6EB5", navyDark: "0F1D45",
  white: "FFFFFF", offWhite: "E8E8E8",
  gray: "888888", grayLight: "CCCCCC", grayDark: "555555", graySubtle: "333333",
  green: "22C55E", greenDim: "0D3320",
  red: "EF4444", redDim: "3B1010",
  blue: "3B82F6", blueDim: "0D1F45",
  purple: "8B5CF6", purpleDim: "1E0D45",
  pink: "EC4899", pinkDim: "3B0D25",
  cyan: "06B6D4", cyanDim: "0D2F35",
  orange: "F97316", orangeDim: "3B1D00",
  teal: "14B8A6",
};

const SLIDE_W = 10, SLIDE_H = 5.63;

// ─── Base Helpers ──────────────────────────────────────────────────────────

function bg(slide, color = C.dark) {
  slide.background = { color };
}

function bar(slide, x, y, w, h, color) {
  slide.addShape("rect", { x, y, w, h, fill: { color }, rectRadius: 0.05 });
}

function circle(slide, x, y, size, color) {
  slide.addShape("ellipse", { x, y, w: size, h: size, fill: { color } });
}

function txt(slide, text, opts) {
  slide.addText(text, {
    fontFace: "Arial",
    color: C.white,
    valign: "middle",
    ...opts,
  });
}

function iconCircle(slide, x, y, size, bgColor, emoji) {
  circle(slide, x, y, size, bgColor);
  txt(slide, emoji, { x, y, w: size, h: size, fontSize: size * 14, align: "center", valign: "middle" });
}

function numCircle(slide, x, y, size, num, bgColor = C.gold, textColor = C.dark) {
  circle(slide, x, y, size, bgColor);
  txt(slide, String(num), { x, y, w: size, h: size, fontSize: size * 16, bold: true, color: textColor, align: "center" });
}

function arrow(slide, x1, y1, x2, y2, color = C.goldDim) {
  slide.addShape("line", {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width: 2, dashType: "solid" },
    lineHead: "arrow",
  });
}

function arrowH(slide, x, y, length, color = C.goldDim) {
  slide.addShape("line", {
    x, y, w: length, h: 0,
    line: { color, width: 2 },
    lineHead: "arrow",
  });
}

function dashedLine(slide, x1, y1, x2, y2, color = C.darkBorder) {
  slide.addShape("line", {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width: 1, dashType: "dash" },
  });
}

// ─── Slide Builders ────────────────────────────────────────────────────────

function titleSlide(pptx, title, subtitle) {
  const s = pptx.addSlide();
  bg(s);

  // Decorative gradient orb
  s.addShape("ellipse", {
    x: 5.5, y: -1.5, w: 6, h: 6,
    fill: { type: "solid", color: C.goldDim },
    shadow: { type: "outer", blur: 120, offset: 0, color: C.gold, opacity: 0.15 },
  });

  // Accent bar
  bar(s, 0.8, 1.5, 2.2, 0.06, C.gold);

  txt(s, title, { x: 0.8, y: 1.7, w: 7, h: 1.2, fontSize: 38, bold: true, color: C.white });
  txt(s, subtitle, { x: 0.8, y: 3.0, w: 7, h: 0.6, fontSize: 14, color: C.gray });

  // Brand badge
  bar(s, 0.8, 4.2, 1.6, 0.35, C.gold);
  txt(s, "NEX CARD", { x: 0.8, y: 4.2, w: 1.6, h: 0.35, fontSize: 10, bold: true, color: C.dark, align: "center" });

  return s;
}

function sectionSlide(pptx, num, title, subtitle, accentColor = C.gold) {
  const s = pptx.addSlide();
  bg(s, C.dark);

  // Large number watermark
  txt(s, num, { x: 6.5, y: 0.5, w: 3.5, h: 4.5, fontSize: 140, bold: true, color: C.graySubtle, align: "right" });

  // Accent bar
  bar(s, 0.8, 2.0, 1.5, 0.06, accentColor);

  txt(s, title, { x: 0.8, y: 2.2, w: 6, h: 1.0, fontSize: 30, bold: true, color: C.white });
  txt(s, subtitle, { x: 0.8, y: 3.3, w: 6, h: 0.5, fontSize: 13, color: C.gray });

  return s;
}

function contentSlide(pptx, title, { leftItems, rightItems, accentColor = C.gold } = {}) {
  const s = pptx.addSlide();
  bg(s);

  // Top bar
  bar(s, 0, 0, SLIDE_W, 0.02, accentColor);

  // Title
  txt(s, title, { x: 0.5, y: 0.25, w: 9, h: 0.55, fontSize: 18, bold: true, color: C.white });

  // Separator
  bar(s, 0.5, 0.82, 9, 0.01, C.darkBorder);

  return s;
}

function closingSlide(pptx, title, subtitle) {
  const s = pptx.addSlide();
  bg(s);

  s.addShape("ellipse", {
    x: 3.5, y: 1.0, w: 3, h: 3,
    fill: { type: "solid", color: C.goldDim },
    shadow: { type: "outer", blur: 100, offset: 0, color: C.gold, opacity: 0.12 },
  });

  bar(s, 3.5, 2.0, 3, 0.06, C.gold);
  txt(s, title, { x: 1, y: 2.2, w: 8, h: 1.0, fontSize: 34, bold: true, color: C.white, align: "center" });
  txt(s, subtitle, { x: 1, y: 3.3, w: 8, h: 0.5, fontSize: 12, color: C.gray, align: "center" });
  txt(s, "NEX CARD", { x: 3.5, y: 4.3, w: 3, h: 0.4, fontSize: 14, bold: true, color: C.gold, align: "center" });

  return s;
}

// ─── Visual Component Builders ─────────────────────────────────────────────

function featureCard(slide, x, y, w, h, icon, title, desc, accentColor) {
  bar(slide, x, y, w, h, C.darkCard);
  bar(slide, x, y, 0.04, h, accentColor);
  txt(slide, icon, { x: x + 0.2, y: y + 0.12, w: 0.4, h: 0.4, fontSize: 18, align: "center" });
  txt(slide, title, { x: x + 0.65, y: y + 0.1, w: w - 0.85, h: 0.35, fontSize: 11, bold: true, color: C.white });
  txt(slide, desc, { x: x + 0.2, y: y + 0.5, w: w - 0.4, h: h - 0.6, fontSize: 9, color: C.grayLight });
}

function stepCard(slide, x, y, w, h, num, title, desc, accentColor) {
  bar(slide, x, y, w, h, C.darkCard);
  numCircle(slide, x + w / 2 - 0.22, y + 0.12, 0.44, num, accentColor, C.dark);
  txt(slide, title, { x: x + 0.1, y: y + 0.65, w: w - 0.2, h: 0.35, fontSize: 10, bold: true, color: C.white, align: "center" });
  txt(slide, desc, { x: x + 0.1, y: y + 1.0, w: w - 0.2, h: h - 1.15, fontSize: 8.5, color: C.grayLight, align: "center" });
}

function bulletList(slide, x, y, w, items, opts = {}) {
  const fontSize = opts.fontSize || 10;
  const color = opts.color || C.grayLight;
  const lineH = opts.lineH || 0.35;

  items.forEach((item, i) => {
    if (typeof item === "string") {
      txt(slide, `•  ${item}`, { x, y: y + i * lineH, w, h: lineH, fontSize, color, valign: "middle" });
    } else {
      txt(slide, `•  ${item.text}`, {
        x, y: y + i * lineH, w, h: lineH,
        fontSize: item.fontSize || fontSize,
        color: item.color || color,
        bold: item.bold || false,
        valign: "middle",
      });
    }
  });
}

function phoneMockup(slide, x, y, accentColor, content) {
  // Phone body
  bar(slide, x, y, 1.8, 3.2, C.darkCard);
  // Phone border
  slide.addShape("rect", {
    x: x - 0.03, y: y - 0.03, w: 1.86, h: 3.26,
    fill: { type: "solid", color: C.dark },
    line: { color: C.graySubtle, width: 1 },
    rectRadius: 0.15,
  });
  // Screen area
  bar(slide, x + 0.08, y + 0.2, 1.64, 2.7, C.dark);
  // Accent header bar
  bar(slide, x + 0.08, y + 0.2, 1.64, 0.4, accentColor);
  // Notch
  bar(slide, x + 0.6, y + 0.04, 0.6, 0.12, C.dark);
  // Content lines
  if (content) {
    content.forEach((line, i) => {
      const ly = y + 0.75 + i * 0.28;
      const lw = typeof line === "number" ? line : 0.8 + Math.random() * 0.5;
      bar(slide, x + 0.2, ly, Math.min(lw, 1.4), 0.1, `${accentColor}30`);
    });
  }
}

function flowDiagram(slide, steps, y = 2.5, color = C.gold) {
  const totalW = steps.length * 1.4 + (steps.length - 1) * 0.4;
  const startX = (SLIDE_W - totalW) / 2;

  steps.forEach((step, i) => {
    const x = startX + i * 1.8;
    // Box
    bar(slide, x, y, 1.4, 0.8, C.darkCard);
    slide.addShape("rect", {
      x: x - 0.02, y: y - 0.02, w: 1.44, h: 0.84,
      fill: { type: "solid", color: C.dark },
      line: { color, width: 1.5 },
      rectRadius: 0.08,
    });
    // Number
    numCircle(slide, x + 0.55, y - 0.2, 0.35, i + 1, color, C.dark);
    // Label
    txt(slide, step, { x, y: y + 0.15, w: 1.4, h: 0.5, fontSize: 9, bold: true, color: C.white, align: "center" });

    // Arrow
    if (i < steps.length - 1) {
      arrowH(slide, x + 1.45, y + 0.4, 0.3, color);
    }
  });
}

function tableSlide(slide, x, y, w, headers, rows, opts = {}) {
  const colW = w / headers.length;
  const rowH = opts.rowH || 0.38;
  const headerColor = opts.headerColor || C.gold;

  // Header row
  headers.forEach((h, i) => {
    bar(slide, x + i * colW, y, colW, rowH, headerColor);
    txt(slide, h, {
      x: x + i * colW, y, w: colW, h: rowH,
      fontSize: 9, bold: true, color: C.dark, align: "center",
    });
  });

  // Data rows
  rows.forEach((row, ri) => {
    const ry = y + (ri + 1) * rowH;
    const bgColor = ri % 2 === 0 ? C.darkCard : C.darkSubtle;
    row.forEach((cell, ci) => {
      bar(slide, x + ci * colW, ry, colW, rowH, bgColor);
      txt(slide, String(cell), {
        x: x + ci * colW, y: ry, w: colW, h: rowH,
        fontSize: 8, color: C.grayLight, align: "center",
      });
    });
  });
}

function statCard(slide, x, y, w, h, value, label, accentColor) {
  bar(slide, x, y, w, h, C.darkCard);
  txt(slide, value, { x, y: y + 0.1, w, h: 0.5, fontSize: 22, bold: true, color: accentColor, align: "center" });
  txt(slide, label, { x, y: y + 0.6, w, h: 0.3, fontSize: 9, color: C.gray, align: "center" });
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESENTATION 1: USER GUIDE (Visual)
// ═══════════════════════════════════════════════════════════════════════════

function buildUserGuide() {
  const p = new PptxGenJS();
  p.layout = "LAYOUT_16x9";
  p.title = "NEX CARD — Visual User Guide";

  // ── TITLE ──
  titleSlide(p, "NEX CARD User Guide", "Visual walkthrough for creating, managing, and sharing your digital identity");

  // ═══════════════════════════════════════════════════════════════════════
  // 1. GETTING STARTED
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "01", "Getting Started", "Account creation, login, and first-time setup", C.gold);

  // Registration flow diagram
  let s = contentSlide(p, "Account Registration Flow", { accentColor: C.green });
  flowDiagram(s, ["Visit\nwww.nexcard.wetechmm.com", "Click\nGet Started", "Fill Form", "Verify\nEmail", "Dashboard!"], 1.8, C.green);

  // Add details below the flow
  bulletList(s, 0.5, 3.2, 4.3, [
    "No credit card required for free tier",
    "Full name, email, password — that's it",
    "Email verification via confirmation link",
    "Auto-login after verification",
  ]);
  bulletList(s, 5.2, 3.2, 4.3, [
    "Session stored as HTTP-only cookie",
    "Secure, SameSite=Lax policy",
    "Configurable expiry (default: 30 days)",
    "Auto-cleanup on expiry",
  ], { color: C.grayLight });

  // Login flow
  s = contentSlide(p, "Logging In", { accentColor: C.blue });
  flowDiagram(s, ["Click\nSign In", "Enter\nCredentials", "Server\nValidates", "Cookie\nSet", "Redirect\nto Dashboard"], 1.8, C.blue);

  bulletList(s, 0.5, 3.2, 9, [
    "Click \"Sign In\" on navbar top-right",
    "Enter registered email + password",
    "bcrypt password comparison (12 salt rounds)",
    "New session record created in database",
  ]);

  // ═══════════════════════════════════════════════════════════════════════
  // 2. DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "02", "Dashboard Overview", "Your central hub for managing all profiles", C.navyLight);

  // Dashboard mockup with stats
  s = contentSlide(p, "Dashboard at a Glance", { accentColor: C.navyLight });

  // Stat cards
  statCard(s, 0.5, 1.2, 2.0, 1.0, "12", "Total Profiles", C.gold);
  statCard(s, 2.7, 1.2, 2.0, 1.0, "8", "Published", C.green);
  statCard(s, 4.9, 1.2, 2.0, 1.0, "4", "Drafts", C.orange);
  statCard(s, 7.1, 1.2, 2.0, 1.0, "1.2K", "Total Views", C.blue);

  // Feature cards
  featureCard(s, 0.5, 2.5, 4.3, 1.3, "🃏", "Profile Cards", "View all profiles as card tiles with template name, category, publish status, and view count", C.navyLight);
  featureCard(s, 5.2, 2.5, 4.3, 1.3, "⚡", "Quick Actions", "Edit, QR Code, Analytics, NFC — one-click access to all management tools per card", C.gold);

  // Card features
  s = contentSlide(p, "Profile Card Features", { accentColor: C.gold });
  featureCard(s, 0.5, 1.2, 2.8, 1.8, "🎨", "Template Preview", "Each card shows the template thumbnail with hover scale effect", C.cyan);
  featureCard(s, 3.5, 1.2, 2.8, 1.8, "📊", "View Counter", "Real-time view count with atomic increment on every profile visit", C.green);
  featureCard(s, 6.5, 1.2, 2.8, 1.8, "📝", "Draft Badge", "Semi-transparent overlay on unpublished cards with backdrop blur", C.orange);

  bulletList(s, 0.5, 3.3, 9, [
    "Staggered fade-in animation on page load (CSS @keyframes staggered-fade-in)",
    "Hover: cards lift up (translateY -4px) with enhanced shadow",
    "Template thumbnails scale to 110% with opacity increase on hover",
    "Grid: 1 col mobile → 2 col sm → 3 col md → 4 col lg",
  ]);

  // ═══════════════════════════════════════════════════════════════════════
  // 3. CREATING A PROFILE
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "03", "Creating a Profile", "Category selection, template choice, and onboarding flow", C.pink);

  // Step flow
  s = contentSlide(p, "Profile Creation — 4-Step Flow", { accentColor: C.pink });
  flowDiagram(s, ["Choose\nCategory", "Pick\nTemplate", "Fill\nContent", "Publish\n& Share"], 2.0, C.pink);

  // Detail below each step
  featureCard(s, 0.5, 3.2, 2.0, 1.8, "📁", "Step 1: Category", "Name Card, Portfolio, Business, or Wedding — each with unique templates", C.cyan);
  featureCard(s, 2.7, 3.2, 2.0, 1.8, "🎨", "Step 2: Template", "20 premium designs. Preview before committing. Switch anytime", C.pink);
  featureCard(s, 4.9, 3.2, 2.0, 1.8, "✏️", "Step 3: Content", "Add details, links, photos. Live preview updates in real-time", C.green);
  featureCard(s, 7.1, 3.2, 2.0, 1.8, "🚀", "Step 4: Publish", "Toggle publish switch. Share via link, QR, or NFC tag", C.gold);

  // Categories
  s = contentSlide(p, "Step 1 — Choose a Category", { accentColor: C.cyan });

  // Four category cards with icons
  const cats = [
    { icon: "📇", name: "Digital Name Card", desc: "Contact info, social links, vCard, CTA", color: C.cyan },
    { icon: "💼", name: "Portfolio", desc: "Projects, skills, experience, education", color: C.pink },
    { icon: "🏢", name: "Business Page", desc: "Services, testimonials, hours, gallery", color: C.green },
    { icon: "💒", name: "Wedding Invitation", desc: "Partners, love story, events, RSVP", color: C.purple },
  ];

  cats.forEach((cat, i) => {
    const x = 0.5 + i * 2.3;
    bar(s, x, 1.2, 2.1, 2.5, C.darkCard);
    bar(s, x, 1.2, 2.1, 0.04, cat.color);
    txt(s, cat.icon, { x, y: 1.4, w: 2.1, h: 0.7, fontSize: 28, align: "center" });
    txt(s, cat.name, { x, y: 2.1, w: 2.1, h: 0.4, fontSize: 11, bold: true, color: C.white, align: "center" });
    txt(s, cat.desc, { x: x + 0.15, y: 2.6, w: 1.8, h: 0.8, fontSize: 8.5, color: C.grayLight, align: "center" });
  });

  bulletList(s, 0.5, 4.0, 9, [
    "Each category has 5 unique templates with distinct design languages",
    "Templates define layout, color scheme, and available fields",
  ]);

  // Templates
  s = contentSlide(p, "Step 2 — Template Gallery (20 Templates)", { accentColor: C.pink });

  // Template grid mockup
  const templates = [
    { name: "Aurora", cat: "Name Card", color: C.cyan },
    { name: "Obsidian", cat: "Name Card", color: C.gold },
    { name: "Prism", cat: "Name Card", color: C.pink },
    { name: "Coral", cat: "Name Card", color: C.red },
    { name: "Titanium", cat: "Name Card", color: C.grayLight },
    { name: "Canvas", cat: "Portfolio", color: C.blue },
    { name: "Studio", cat: "Portfolio", color: C.pink },
    { name: "Forge", cat: "Portfolio", color: C.orange },
    { name: "Spectrum", cat: "Portfolio", color: C.teal },
    { name: "Blueprint", cat: "Portfolio", color: C.navyLight },
    { name: "Marquee", cat: "Business", color: C.red },
    { name: "District", cat: "Business", color: C.grayLight },
    { name: "Empire", cat: "Business", color: C.gold },
    { name: "Neon", cat: "Business", color: C.green },
    { name: "Vault", cat: "Business", color: C.gold },
    { name: "Eternal", cat: "Wedding", color: C.gold },
    { name: "Blossom", cat: "Wedding", color: C.pink },
    { name: "Noir", cat: "Wedding", color: C.grayLight },
    { name: "Celestial", cat: "Wedding", color: C.purple },
    { name: "Rustic", cat: "Wedding", color: C.orange },
  ];

  templates.forEach((t, i) => {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = 0.3 + col * 0.94;
    const y = 1.15 + row * 1.8;
    bar(s, x, y, 0.82, 1.5, C.darkCard);
    bar(s, x, y, 0.82, 0.06, t.color);
    // Mini phone mockup
    bar(s, x + 0.11, y + 0.15, 0.6, 0.9, C.dark);
    bar(s, x + 0.11, y + 0.15, 0.6, 0.15, t.color);
    bar(s, x + 0.17, y + 0.38, 0.48, 0.06, C.graySubtle);
    bar(s, x + 0.17, y + 0.48, 0.36, 0.06, C.grayDark);
    bar(s, x + 0.17, y + 0.58, 0.42, 0.06, C.graySubtle);
    bar(s, x + 0.17, y + 0.72, 0.2, 0.1, C.graySubtle);
    bar(s, x + 0.39, y + 0.72, 0.2, 0.1, C.graySubtle);
    txt(s, t.name, { x, y: y + 1.08, w: 0.82, h: 0.22, fontSize: 7, bold: true, color: C.white, align: "center" });
    txt(s, t.cat, { x, y: y + 1.26, w: 0.82, h: 0.18, fontSize: 6, color: C.gray, align: "center" });
  });

  // Content editing
  s = contentSlide(p, "Step 3 — Fill Your Content", { accentColor: C.green });

  // Editor mockup
  bar(s, 0.5, 1.15, 4.5, 3.8, C.darkCard);
  bar(s, 0.5, 1.15, 4.5, 0.4, C.graySubtle);
  txt(s, "✏️ Profile Editor", { x: 0.7, y: 1.15, w: 3, h: 0.4, fontSize: 10, bold: true, color: C.white });

  // Form fields mockup
  const fields = [
    { label: "Full Name", value: "Yu Ki", icon: "👤" },
    { label: "Job Title", value: "Senior Developer", icon: "💼" },
    { label: "Company", value: "WeTech", icon: "🏢" },
    { label: "Tagline", value: "Lorem Ipsum...", icon: "💬" },
    { label: "Bio", value: "Lorem Ipsum is...", icon: "📝" },
  ];

  fields.forEach((f, i) => {
    const fy = 1.7 + i * 0.6;
    txt(s, f.icon, { x: 0.7, y: fy, w: 0.3, h: 0.25, fontSize: 10 });
    txt(s, f.label, { x: 1.0, y: fy, w: 1.2, h: 0.25, fontSize: 8, bold: true, color: C.grayLight });
    bar(s, 1.0, fy + 0.28, 3.5, 0.22, C.dark);
    txt(s, f.value, { x: 1.1, y: fy + 0.28, w: 3.3, h: 0.22, fontSize: 8, color: C.white });
  });

  // Right side: features
  featureCard(s, 5.3, 1.15, 4.2, 0.9, "📷", "Avatar Upload", "Drag & drop or click. Stored locally or Cloudflare R2", C.gold);
  featureCard(s, 5.3, 2.2, 4.2, 0.9, "🎨", "Accent Color", "Color picker to personalize your template theme", C.pink);
  featureCard(s, 5.3, 3.25, 4.2, 0.9, "📏", "Character Limits", "Live X/Y counters, red warning at >90% usage", C.green);
  featureCard(s, 5.3, 4.3, 4.2, 0.9, "🔗", "Social Links", "LinkedIn, GitHub, Instagram, TikTok, Discord, + more", C.blue);

  // ═══════════════════════════════════════════════════════════════════════
  // 4. QR CODE
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "04", "QR Code Management", "Generate, customize, download, and share", C.green);

  s = contentSlide(p, "QR Code Generation & Download", { accentColor: C.green });

  // QR mockup
  bar(s, 0.5, 1.2, 3.0, 3.5, C.darkCard);
  txt(s, "📱 QR Preview", { x: 0.5, y: 1.3, w: 3.0, h: 0.4, fontSize: 10, bold: true, color: C.white, align: "center" });
  // QR pattern mockup
  bar(s, 1.1, 1.9, 1.8, 1.8, C.white);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if ((r + c) % 3 === 0 || (r < 2 && c < 2) || (r > 3 && c < 2) || (r < 2 && c > 3)) {
        bar(s, 1.2 + c * 0.26, 2.0 + r * 0.26, 0.22, 0.22, C.dark);
      }
    }
  }
  txt(s, "www.nexcard.wetechmm.com/your-slug", { x: 0.5, y: 3.85, w: 3.0, h: 0.3, fontSize: 8, color: C.grayLight, align: "center" });

  // Download options
  txt(s, "Download Options", { x: 4.0, y: 1.2, w: 5.5, h: 0.4, fontSize: 12, bold: true, color: C.gold });

  const formats = [
    { name: "PNG", desc: "Best for digital use, social media, websites", color: C.blue, icon: "🖥️" },
    { name: "SVG", desc: "Best for print, scalable without quality loss", color: C.green, icon: "🖨️" },
    { name: "JPEG", desc: "Best for email, lightweight sharing", color: C.orange, icon: "📧" },
  ];

  formats.forEach((f, i) => {
    const fy = 1.8 + i * 0.85;
    bar(s, 4.0, fy, 5.2, 0.7, C.darkCard);
    bar(s, 4.0, fy, 0.04, 0.7, f.color);
    txt(s, f.icon, { x: 4.2, y: fy + 0.1, w: 0.5, h: 0.5, fontSize: 18 });
    txt(s, f.name, { x: 4.8, y: fy + 0.05, w: 1.0, h: 0.35, fontSize: 11, bold: true, color: f.color });
    txt(s, f.desc, { x: 4.8, y: fy + 0.35, w: 4.2, h: 0.3, fontSize: 8.5, color: C.grayLight });
  });

  bulletList(s, 4.0, 4.5, 5.2, [
    { text: "Filename: nexcard-{yourname}-qr.{format}", color: C.gold },
    "Username sanitized (special characters removed)",
    "Cache-busting with timestamp prevents stale images",
  ]);

  // ═══════════════════════════════════════════════════════════════════════
  // 5. ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "05", "Analytics & Insights", "Track profile views, QR scans, and engagement", C.blue);

  s = contentSlide(p, "Analytics Dashboard", { accentColor: C.blue });

  // Stats bar
  statCard(s, 0.5, 1.2, 1.8, 0.9, "12.4K", "Total Views", C.blue);
  statCard(s, 2.5, 1.2, 1.8, 0.9, "3.2K", "QR Scans", C.green);
  statCard(s, 4.5, 1.2, 1.8, 0.9, "89%", "Conversion", C.gold);
  statCard(s, 6.5, 1.2, 1.8, 0.9, "4.2min", "Avg. Time", C.purple);
  statCard(s, 8.5, 1.2, 1.3, 0.9, "↑ 12%", "Trend", C.green);

  // Chart mockup
  bar(s, 0.5, 2.4, 9, 2.5, C.darkCard);
  txt(s, "📈 Views Over Time", { x: 0.7, y: 2.5, w: 3, h: 0.3, fontSize: 10, bold: true, color: C.white });

  // Bar chart mockup
  const barHeights = [0.6, 0.9, 0.7, 1.2, 1.0, 1.5, 1.3, 1.8, 1.4, 1.6, 1.9, 2.0];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  barHeights.forEach((h, i) => {
    const bx = 0.9 + i * 0.7;
    const by = 4.6 - h;
    bar(s, bx, by, 0.45, h, i === 11 ? C.gold : C.blue);
    txt(s, months[i], { x: bx - 0.05, y: 4.65, w: 0.55, h: 0.2, fontSize: 6, color: C.gray, align: "center" });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 6. NFC
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "06", "NFC Tag Programming", "Write your profile URL for tap-to-share", C.purple);

  s = contentSlide(p, "NFC Tag Setup Process", { accentColor: C.purple });

  flowDiagram(s, ["Buy NFC\nTags", "Navigate to\nNFC Page", "Tap Phone\non Tag", "Web NFC\nWrites URL", "Verify by\nTapping Again"], 1.5, C.purple);

  // NFC tag mockup
  bar(s, 0.5, 3.0, 4.0, 2.2, C.darkCard);
  txt(s, "🏷️ NFC Tag", { x: 0.5, y: 3.1, w: 4.0, h: 0.4, fontSize: 11, bold: true, color: C.white, align: "center" });
  circle(s, 1.8, 3.7, 1.2, C.purple);
  txt(s, "NFC", { x: 1.8, y: 3.7, w: 1.2, h: 1.2, fontSize: 16, bold: true, color: C.white, align: "center" });
  txt(s, "NTAG213/215/216", { x: 0.5, y: 5.0, w: 4.0, h: 0.25, fontSize: 8, color: C.gray, align: "center" });

  bulletList(s, 5.0, 3.0, 4.5, [
    { text: "Compatible tags:", bold: true, color: C.gold },
    "NTAG213 (144 bytes) — most common",
    "NTAG215 (504 bytes) — more storage",
    "NTAG216 (888 bytes) — maximum",
    "",
    { text: "Device support:", bold: true, color: C.gold },
    "Android: Chrome browser (Web NFC API)",
    'iOS: Use "NFC Tools" app to write URL',
    "",
    { text: "Works with any NFC-enabled phone to read", color: C.green },
  ]);

  // ═══════════════════════════════════════════════════════════════════════
  // 7. THEME SYSTEM
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "07", "Theme System", "Dark/gold and light/navy dual themes", C.teal);

  s = contentSlide(p, "Dual Theme System", { accentColor: C.teal });

  // Dark theme mockup
  bar(s, 0.3, 1.2, 4.5, 3.5, C.dark);
  bar(s, 0.3, 1.2, 4.5, 0.4, C.darkCard);
  txt(s, "🌙 Dark Mode", { x: 0.5, y: 1.22, w: 3, h: 0.36, fontSize: 10, bold: true, color: C.gold });
  circle(s, 0.6, 1.8, 0.5, C.gold);
  txt(s, "Yu Ki", { x: 1.3, y: 1.8, w: 3, h: 0.3, fontSize: 12, bold: true, color: C.white });
  txt(s, "Senior Developer", { x: 1.3, y: 2.1, w: 3, h: 0.25, fontSize: 8, color: C.gold });
  bar(s, 0.6, 2.6, 3.5, 0.3, C.gold);
  txt(s, "💾 Save Contact", { x: 0.6, y: 2.6, w: 3.5, h: 0.3, fontSize: 8, bold: true, color: C.dark, align: "center" });
  bar(s, 0.6, 3.1, 3.5, 0.01, C.graySubtle);
  bar(s, 0.6, 3.3, 3.5, 0.3, C.darkCard);
  bar(s, 0.6, 3.7, 3.5, 0.3, C.darkSubtle);
  bar(s, 0.6, 4.1, 3.5, 0.3, C.darkCard);
  txt(s, "Background: #0F0F0F", { x: 0.6, y: 4.5, w: 4, h: 0.2, fontSize: 7, color: C.gray });

  // Light theme mockup
  bar(s, 5.2, 1.2, 4.5, 3.5, "FAFAF8");
  bar(s, 5.2, 1.2, 4.5, 0.4, "F0F0EE");
  txt(s, "☀️ Light Mode", { x: 5.4, y: 1.22, w: 3, h: 0.36, fontSize: 10, bold: true, color: C.navy });
  circle(s, 5.5, 1.8, 0.5, C.navy);
  txt(s, "Yu Ki", { x: 6.2, y: 1.8, w: 3, h: 0.3, fontSize: 12, bold: true, color: "#111111" });
  txt(s, "Senior Developer", { x: 6.2, y: 2.1, w: 3, h: 0.25, fontSize: 8, color: C.navy });
  bar(s, 5.5, 2.6, 3.5, 0.3, C.navy);
  txt(s, "💾 Save Contact", { x: 5.5, y: 2.6, w: 3.5, h: 0.3, fontSize: 8, bold: true, color: C.white, align: "center" });
  bar(s, 5.5, 3.1, 3.5, 0.01, "DDDDDD");
  bar(s, 5.5, 3.3, 3.5, 0.3, "F0F0EE");
  bar(s, 5.5, 3.7, 3.5, 0.3, "FAFAF8");
  bar(s, 5.5, 4.1, 3.5, 0.3, "F0F0EE");
  txt(s, "Background: #FAFAF8", { x: 5.5, y: 4.5, w: 4, h: 0.2, fontSize: 7, color: C.gray });

  // Toggle arrow
  txt(s, "⚡", { x: 4.6, y: 2.6, w: 0.7, h: 0.5, fontSize: 24, align: "center" });

  // ═══════════════════════════════════════════════════════════════════════
  // 8. MAINTENANCE MODE
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "08", "Maintenance Mode", "Platform-wide maintenance with admin bypass", C.orange);

  s = contentSlide(p, "Maintenance Mode — How It Works", { accentColor: C.orange });

  // Architecture diagram
  bar(s, 0.5, 1.3, 2.5, 1.2, C.darkCard);
  txt(s, "⚙️ Admin Settings", { x: 0.5, y: 1.35, w: 2.5, h: 0.3, fontSize: 9, bold: true, color: C.white, align: "center" });
  txt(s, "data/settings.json\n{ maintenance_mode: true }", { x: 0.5, y: 1.7, w: 2.5, h: 0.7, fontSize: 7, color: C.grayLight, align: "center" });

  arrowH(s, 3.1, 1.9, 0.6, C.orange);

  bar(s, 3.8, 1.3, 2.0, 1.2, C.darkCard);
  txt(s, "🔧 Root Layout", { x: 3.8, y: 1.35, w: 2.0, h: 0.3, fontSize: 9, bold: true, color: C.white, align: "center" });
  txt(s, "fs.readFileSync()\nreads settings.json", { x: 3.8, y: 1.7, w: 2.0, h: 0.7, fontSize: 7, color: C.grayLight, align: "center" });

  arrowH(s, 5.9, 1.9, 0.6, C.orange);

  bar(s, 6.6, 1.3, 2.0, 1.2, C.darkCard);
  txt(s, "🛡️ MaintenanceGuard", { x: 6.6, y: 1.35, w: 2.0, h: 0.3, fontSize: 9, bold: true, color: C.white, align: "center" });
  txt(s, "Client component\nredirects non-admins", { x: 6.6, y: 1.7, w: 2.0, h: 0.7, fontSize: 7, color: C.grayLight, align: "center" });

  arrowH(s, 8.7, 1.9, 0.6, C.orange);

  bar(s, 9.0, 1.3, 0.8, 1.2, C.red);
  txt(s, "🚫", { x: 9.0, y: 1.5, w: 0.8, h: 0.4, fontSize: 18, align: "center" });
  txt(s, "Blocked", { x: 9.0, y: 2.0, w: 0.8, h: 0.3, fontSize: 7, bold: true, color: C.white, align: "center" });

  // Two paths
  txt(s, "User Flow:", { x: 0.5, y: 2.8, w: 2, h: 0.3, fontSize: 10, bold: true, color: C.gold });

  bar(s, 0.5, 3.2, 4.3, 1.8, C.darkCard);
  txt(s, "👤 Regular User", { x: 0.5, y: 3.25, w: 4.3, h: 0.3, fontSize: 9, bold: true, color: C.red, align: "center" });
  txt(s, "→ Redirected to /maintenance\n→ Sees animated dark page\n→ Floating orbs + spinning gear\n→ \"We'll be back soon\" message", {
    x: 0.7, y: 3.6, w: 3.9, h: 1.3, fontSize: 8, color: C.grayLight,
  });

  bar(s, 5.2, 3.2, 4.3, 1.8, C.darkCard);
  txt(s, "👑 Admin User (role: ADMIN)", { x: 5.2, y: 3.25, w: 4.3, h: 0.3, fontSize: 9, bold: true, color: C.green, align: "center" });
  txt(s, "→ Bypasses maintenance check\n→ Sees normal site\n→ Can edit settings\n→ Full platform access", {
    x: 5.4, y: 3.6, w: 3.9, h: 1.3, fontSize: 8, color: C.grayLight,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 9. ADMIN PANEL
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "09", "Admin Panel", "Platform management, templates, users, and settings", C.gold);

  s = contentSlide(p, "Admin Dashboard Overview", { accentColor: C.gold });

  // Admin sidebar mockup
  bar(s, 0.3, 1.2, 1.6, 4.0, C.darkCard);
  bar(s, 0.3, 1.2, 1.6, 0.35, C.gold);
  txt(s, "⚙️ ADMIN", { x: 0.3, y: 1.2, w: 1.6, h: 0.35, fontSize: 9, bold: true, color: C.dark, align: "center" });
  const adminNav = ["📊 Dashboard", "👥 Users", "🎨 Templates", "💳 Payments", "📈 Analytics", "⚙️ Settings", "💾 Backups"];
  adminNav.forEach((item, i) => {
    bar(s, 0.3, 1.65 + i * 0.44, 1.6, 0.4, i === 0 ? C.goldDim : C.darkCard);
    txt(s, item, { x: 0.45, y: 1.65 + i * 0.44, w: 1.3, h: 0.4, fontSize: 8, color: i === 0 ? C.gold : C.grayLight });
  });

  // Stats
  statCard(s, 2.2, 1.2, 2.1, 0.85, "1,247", "Total Users", C.blue);
  statCard(s, 4.5, 1.2, 2.1, 0.85, "3,891", "Total Profiles", C.green);
  statCard(s, 6.8, 1.2, 2.1, 0.85, "$12.4K", "Revenue", C.gold);

  // Feature list
  featureCard(s, 2.2, 2.3, 3.3, 1.5, "👥", "User Management", "View all users, change roles (ADMIN/USER), activate/deactivate accounts", C.blue);
  featureCard(s, 5.7, 2.3, 3.8, 1.5, "🎨", "Template Management", "Add/edit templates, toggle active status, set accent colors, manage categories", C.pink);
  featureCard(s, 2.2, 4.0, 3.3, 1.2, "⚙️", "Platform Settings", "JSON-based config: maintenance, SMTP, payment gateway, platform name", C.gold);
  featureCard(s, 5.7, 4.0, 3.8, 1.2, "💾", "Database Backups", "SQL dump + gzip + email delivery. Weekly Vercel cron (Mon 8am UTC)", C.green);

  // ═══════════════════════════════════════════════════════════════════════
  // 10. LEGAL PAGES
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "10", "Legal Pages", "Privacy Policy, Terms of Service, Cookie Policy", C.cyan);

  s = contentSlide(p, "Legal Pages Structure", { accentColor: C.cyan });

  // Hub page mockup
  bar(s, 0.5, 1.2, 9, 0.5, C.darkCard);
  txt(s, "⚖️ /legal — Hub Page", { x: 0.7, y: 1.2, w: 4, h: 0.5, fontSize: 11, bold: true, color: C.white });

  // Three cards
  const legalPages = [
    { icon: "🔒", title: "Privacy Policy", path: "/legal/privacy", color: C.blue, items: ["Data collection", "Storage & sharing", "User rights", "Cookies"] },
    { icon: "📜", title: "Terms of Service", path: "/legal/terms", color: C.green, items: ["Acceptable use", "Payments", "Liability", "Termination"] },
    { icon: "🍪", title: "Cookie Policy", path: "/legal/cookies", color: C.orange, items: ["Session cookies", "Analytics", "Third-party", "Preferences"] },
  ];

  legalPages.forEach((pg, i) => {
    const x = 0.5 + i * 3.1;
    bar(s, x, 1.9, 2.9, 3.0, C.darkCard);
    bar(s, x, 1.9, 2.9, 0.04, pg.color);
    txt(s, pg.icon, { x, y: 2.05, w: 2.9, h: 0.5, fontSize: 22, align: "center" });
    txt(s, pg.title, { x, y: 2.6, w: 2.9, h: 0.35, fontSize: 11, bold: true, color: C.white, align: "center" });
    txt(s, pg.path, { x, y: 2.95, w: 2.9, h: 0.25, fontSize: 8, color: pg.color, align: "center" });

    pg.items.forEach((item, j) => {
      txt(s, `•  ${item}`, { x: x + 0.3, y: 3.35 + j * 0.35, w: 2.3, h: 0.32, fontSize: 9, color: C.grayLight });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 11. LANDING PAGE
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "11", "Landing Page", "Marketing page with features, templates, and social proof", C.navyLight);

  s = contentSlide(p, "Landing Page Sections", { accentColor: C.navyLight });

  // Section flow
  const sections = [
    { icon: "🏠", name: "Hero", color: C.gold, desc: "Gradient glow, animated badge, CTA buttons" },
    { icon: "📊", name: "Social Proof", color: C.green, desc: "10K+ users, 50K+ cards, 99.9% uptime" },
    { icon: "⚡", name: "Features", color: C.blue, desc: "6 bento cards with icons and hover effects" },
    { icon: "🎨", name: "Templates", color: C.pink, desc: "Category filter + 8 template preview cards" },
    { icon: "📋", name: "How It Works", color: C.purple, desc: "4-step timeline with connectors" },
    { icon: "🚀", name: "CTA + Footer", color: C.orange, desc: "Final call-to-action and footer links" },
  ];

  sections.forEach((sec, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.2 + row * 1.9;
    bar(s, x, y, 2.9, 1.6, C.darkCard);
    bar(s, x, y, 0.04, 1.6, sec.color);
    txt(s, sec.icon, { x: x + 0.15, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 20 });
    txt(s, sec.name, { x: x + 0.7, y: y + 0.15, w: 2, h: 0.35, fontSize: 11, bold: true, color: C.white });
    txt(s, sec.desc, { x: x + 0.15, y: y + 0.7, w: 2.6, h: 0.7, fontSize: 8.5, color: C.grayLight });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 12. ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "12", "Error Handling", "Graceful error boundaries and defensive rendering", C.red);

  s = contentSlide(p, "Error Handling Strategy", { accentColor: C.red });

  // Error flow
  featureCard(s, 0.5, 1.2, 4.3, 1.3, "🛡️", "Error Boundaries", "Custom error.tsx pages with retry buttons, error message display, and console logging", C.red);
  featureCard(s, 5.2, 1.2, 4.3, 1.3, "🔄", "Safe Parsing", "safeParseTemplateData() with Zod — never crashes on incomplete or invalid profile data", C.green);

  featureCard(s, 0.5, 2.7, 4.3, 1.3, "📝", "Draft Profiles", "Unpublished profiles show \"Profile is a Draft\" page instead of generic 404", C.orange);
  featureCard(s, 5.2, 2.7, 4.3, 1.3, "💻", "SSR + Hydration", "Server renders full HTML, client hydrates for interactivity — theme boot script handles class mismatch", C.blue);

  bulletList(s, 0.5, 4.3, 9, [
    "ProfileError: AlertTriangle icon, red glow, Retry button, error.digest for debugging",
    "QRError: Same pattern with fallback to NEX CARD Home",
    "getDefaultData(): spreads raw data over category defaults (empty strings, empty arrays)",
  ]);

  // ═══════════════════════════════════════════════════════════════════════
  // 13. RESPONSIVE DESIGN
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "13", "Responsive Design", "Mobile-first responsive layout across all pages", C.teal);

  s = contentSlide(p, "Responsive Breakpoints & Layout", { accentColor: C.teal });

  // Breakpoint table
  tableSlide(s, 0.5, 1.2, 9, ["Breakpoint", "Width", "Dashboard Grid", "Nav", "Editor", "Auth Pages"], [
    ["Mobile", "< 640px", "1 column", "Hamburger", "Stacked", "Single column"],
    ["Small", "640px+", "2 columns", "Hamburger", "Stacked", "Two columns"],
    ["Medium", "768px+", "3 columns", "Full nav", "Side-by-side", "Two columns"],
    ["Large", "1024px+", "4 columns", "Full nav", "Side-by-side", "Two columns"],
  ], { headerColor: C.teal, rowH: 0.36 });

  featureCard(s, 0.5, 3.0, 4.3, 1.2, "📱", "Mobile First", "All layouts designed mobile-first, progressively enhanced for larger screens", C.teal);
  featureCard(s, 5.2, 3.0, 4.3, 1.2, "🔄", "Sidebar Collapse", "Dashboard sidebar collapses to hamburger on mobile, hidden on preview routes", C.gold);
  featureCard(s, 0.5, 4.4, 4.3, 1.0, "🎨", "Template Preview", "Full-screen on mobile, side-by-side panel on desktop", C.pink);
  featureCard(s, 5.2, 4.4, 4.3, 1.0, "📊", "Data Tables", "Horizontally scrollable on mobile, full-width on desktop", C.blue);

  // ═══════════════════════════════════════════════════════════════════════
  // 14. SECURITY
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "14", "Security & Performance", "Headers, caching, and optimization strategies", C.gold);

  s = contentSlide(p, "Security Headers & Performance", { accentColor: C.gold });

  // Security table
  tableSlide(s, 0.5, 1.1, 4.2, ["Header", "Value"], [
    ["X-DNS-Prefetch-Control", "on"],
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "SAMEORIGIN"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Permissions-Policy", "camera=(), microphone=()"],
  ], { headerColor: C.red, rowH: 0.34 });

  // Performance table
  tableSlide(s, 5.0, 1.1, 4.5, ["Feature", "Strategy"], [
    ["ISR Cache", "1-hour revalidation"],
    ["Tag Revalidation", "Per-profile surgical purge"],
    ["Code Splitting", "next/dynamic per template"],
    ["Images", "AVIF/WebP, 7-day TTL"],
    ["Compression", "gzip enabled"],
    ["Static Assets", "1-year immutable cache"],
  ], { headerColor: C.green, rowH: 0.34 });

  // Auth card
  bar(s, 0.5, 3.5, 9, 1.5, C.darkCard);
  txt(s, "🔐 Session Management", { x: 0.7, y: 3.55, w: 4, h: 0.35, fontSize: 11, bold: true, color: C.gold });
  bulletList(s, 0.7, 3.95, 4, [
    "HTTP-only cookie (session_token)",
    "Not accessible via JavaScript (XSS protection)",
    "Secure flag for HTTPS in production",
    "SameSite=Lax for CSRF protection",
  ], { fontSize: 9 });
  bulletList(s, 5.0, 3.95, 4.2, [
    "Server-side validation via Prisma",
    "Automatic session expiry cleanup",
    "Single-session policy (new login clears old)",
    "bcrypt password hashing (12 salt rounds)",
  ], { fontSize: 9 });

  // ═══════════════════════════════════════════════════════════════════════
  // CLOSING
  // ═══════════════════════════════════════════════════════════════════════
  closingSlide(p, "Thank You", "NEX CARD — Your Digital Identity, Elevated\nwww.nexcard.wetechmm.com");

  return p;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESENTATION 2: PROJECT FLOW (Visual)
// ═══════════════════════════════════════════════════════════════════════════

function buildProjectFlow() {
  const p = new PptxGenJS();
  p.layout = "LAYOUT_16x9";
  p.title = "NEX CARD — Project Architecture & Flow";

  // ── TITLE ──
  titleSlide(p, "NEX CARD Project Flow", "Architecture, tech stack, data flow, and development journey");

  // ═══════════════════════════════════════════════════════════════════════
  // 1. PROJECT OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "01", "Project Overview", "What NEX CARD is and what it solves", C.gold);

  let s = contentSlide(p, "What is NEX CARD?", { accentColor: C.gold });

  // Hero value prop
  bar(s, 0.5, 1.2, 9, 1.0, C.darkCard);
  bar(s, 0.5, 1.2, 0.06, 1.0, C.gold);
  txt(s, "🚀", { x: 0.7, y: 1.3, w: 0.6, h: 0.6, fontSize: 28 });
  txt(s, "A platform to create, manage, and share digital identity pages", { x: 1.4, y: 1.25, w: 7.5, h: 0.5, fontSize: 14, bold: true, color: C.white });
  txt(s, "Users get a unique URL: www.nexcard.wetechmm.com/{slug}  •  Shareable via QR, NFC, or direct link", { x: 1.4, y: 1.75, w: 7.5, h: 0.35, fontSize: 10, color: C.grayLight });

  // Stats
  statCard(s, 0.5, 2.5, 1.7, 0.8, "20", "Templates", C.gold);
  statCard(s, 2.4, 2.5, 1.7, 0.8, "4", "Categories", C.cyan);
  statCard(s, 4.3, 2.5, 1.7, 0.8, "QR", "Code Gen", C.green);
  statCard(s, 6.2, 2.5, 1.7, 0.8, "NFC", "Tap Share", C.purple);
  statCard(s, 8.1, 2.5, 1.3, 0.8, "∞", "Custom", C.pink);

  // Two columns
  s = contentSlide(p, "Key Differentiators", { accentColor: C.gold });

  bar(s, 0.3, 1.15, 4.5, 0.4, C.green);
  txt(s, "✅ What We Offer", { x: 0.3, y: 1.15, w: 4.5, h: 0.4, fontSize: 10, bold: true, color: C.dark, align: "center" });
  bulletList(s, 0.5, 1.7, 4.2, [
    "20 handcrafted premium templates",
    "QR code generation & download",
    "NFC tag programming via Web NFC API",
    "Real-time template preview before publish",
    "Dual theme system (dark/light)",
    "Mobile-first responsive design",
    "vCard download (save contact to phone)",
  ], { fontSize: 9 });

  // Divider
  bar(s, 4.9, 1.2, 0.02, 4.0, C.darkBorder);

  bar(s, 5.2, 1.15, 4.5, 0.4, C.gold);
  txt(s, "🎯 Problems We Solve", { x: 5.2, y: 1.15, w: 4.5, h: 0.4, fontSize: 10, bold: true, color: C.dark, align: "center" });
  bulletList(s, 5.4, 1.7, 4.2, [
    "No more exchanging business cards",
    "One link for all digital presence",
    "QR codes for print materials & events",
    "NFC tap-to-share at conferences",
    "SEO-optimized profile pages",
    "No coding required — visual editor",
    "Revenue tracking for premium templates",
  ], { fontSize: 9 });

  // ═══════════════════════════════════════════════════════════════════════
  // 2. TECH STACK
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "02", "Tech Stack", "Technologies, frameworks, and tools", C.blue);

  s = contentSlide(p, "Technology Architecture", { accentColor: C.blue });

  // Tech stack visual grid
  const techStack = [
    { icon: "⚡", name: "Next.js 15", desc: "App Router, React 19", color: C.white, cat: "Frontend" },
    { icon: "🔷", name: "TypeScript", desc: "Strict mode", color: C.blue, cat: "Frontend" },
    { icon: "🎨", name: "Tailwind CSS", desc: "v4 utility-first", color: C.cyan, cat: "Frontend" },
    { icon: "🗄️", name: "Prisma ORM", desc: "MySQL database", color: C.grayLight, cat: "Backend" },
    { icon: "🔐", name: "Session Auth", desc: "Custom cookie-based", color: C.green, cat: "Backend" },
    { icon: "📧", name: "Nodemailer", desc: "SMTP email", color: C.orange, cat: "Backend" },
    { icon: "☁️", name: "Cloudflare R2", desc: "File storage", color: C.orange, cat: "Infrastructure" },
    { icon: "🚀", name: "Vercel", desc: "Hosting & Cron", C: C.white, cat: "Infrastructure" },
  ];

  techStack.forEach((tech, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.5 + col * 2.3;
    const y = 1.15 + row * 1.8;

    bar(s, x, y, 2.1, 1.5, C.darkCard);
    txt(s, tech.icon, { x, y: y + 0.1, w: 2.1, h: 0.5, fontSize: 24, align: "center" });
    txt(s, tech.name, { x, y: y + 0.65, w: 2.1, h: 0.35, fontSize: 11, bold: true, color: C.white, align: "center" });
    txt(s, tech.desc, { x, y: y + 1.0, w: 2.1, h: 0.3, fontSize: 8, color: C.grayLight, align: "center" });
    bar(s, x, y + 1.35, 2.1, 0.04, tech.color);
  });

  // File structure
  s = contentSlide(p, "Project File Structure", { accentColor: C.navyLight });

  bar(s, 0.3, 1.15, 9.4, 4.0, C.darkCard);
  bar(s, 0.3, 1.15, 0.04, 4.0, C.gold);

  const structure = [
    { text: "📁 src/", bold: true, color: C.gold },
    { text: "  📁 app/              — Next.js App Router pages", indent: 1 },
    { text: "    📁 (auth)/         — Login, register pages", indent: 2, color: C.cyan },
    { text: "    📁 admin/          — Admin panel (settings, templates, revenue, backups)", indent: 2, color: C.green },
    { text: "    📁 dashboard/      — User dashboard (profile cards, editor, QR, NFC, analytics)", indent: 2, color: C.blue },
    { text: "    📁 [slug]/         — Public profile renderer (SSR + client hydration)", indent: 2, color: C.gold },
    { text: "    📁 p/[slug]/       — QR scan landing page", indent: 2, color: C.pink },
    { text: "    📁 legal/          — Privacy, Terms, Cookies pages", indent: 2, color: C.purple },
    { text: "    📁 maintenance/    — Animated dark maintenance page", indent: 2, color: C.orange },
    { text: "  📁 components/       — Reusable UI and template components", indent: 1 },
    { text: "    📁 templates/      — 20 template components (5 per category)", indent: 2 },
    { text: "    📁 ui/             — Logo, theme toggle, shared components", indent: 2 },
    { text: "  📁 lib/              — Utilities, hooks, validators, auth, cache", indent: 1 },
    { text: "  📁 types/            — TypeScript interfaces", indent: 1 },
    { text: "📁 data/               — settings.json (platform config)", bold: true, color: C.grayLight },
    { text: "📁 public/             — Static assets, brand logos, uploads", bold: true, color: C.grayLight },
  ];

  structure.forEach((item, i) => {
    txt(s, item.text, {
      x: 0.5, y: 1.25 + i * 0.22, w: 9, h: 0.22,
      fontSize: 8, color: item.color || C.grayLight, bold: item.bold || false,
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 3. DATABASE
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "03", "Database Schema", "Prisma models and their relationships", C.purple);

  s = contentSlide(p, "Database Models & Relationships", { accentColor: C.purple });

  // ER diagram mockup
  const models = [
    { name: "User", fields: ["id", "name", "email", "role", "status"], color: C.blue, x: 0.5, y: 1.2 },
    { name: "Session", fields: ["token", "userId", "expires"], color: C.red, x: 3.5, y: 1.2 },
    { name: "Category", fields: ["id", "name", "slug"], color: C.green, x: 0.5, y: 3.2 },
    { name: "Template", fields: ["id", "name", "codeId", "accentColor"], color: C.pink, x: 3.5, y: 3.2 },
    { name: "UserProfile", fields: ["id", "slug", "dynamicJson", "isPublished"], color: C.gold, x: 6.5, y: 1.2 },
    { name: "Payment", fields: ["id", "tier", "amount", "status"], color: C.orange, x: 6.5, y: 3.2 },
  ];

  models.forEach((m) => {
    bar(s, m.x, m.y, 2.8, 1.7, C.darkCard);
    bar(s, m.x, m.y, 2.8, 0.35, m.color);
    txt(s, m.name, { x: m.x, y: m.y, w: 2.8, h: 0.35, fontSize: 10, bold: true, color: C.dark, align: "center" });
    m.fields.forEach((f, i) => {
      txt(s, `• ${f}`, { x: m.x + 0.15, y: m.y + 0.42 + i * 0.24, w: 2.5, h: 0.22, fontSize: 8, color: C.grayLight });
    });
  });

  // Relationship lines
  arrow(s, 3.3, 1.85, 3.5, 1.85, C.grayDark); // User → Session
  arrow(s, 1.9, 2.9, 1.9, 3.2, C.grayDark);    // User → Category
  arrow(s, 4.9, 2.9, 7.8, 1.7, C.grayDark);    // Template → UserProfile
  arrow(s, 3.3, 3.8, 3.5, 3.8, C.grayDark);     // Category → Template
  arrow(s, 7.9, 2.9, 7.9, 3.2, C.grayDark);    // UserProfile → Payment

  // ═══════════════════════════════════════════════════════════════════════
  // 4. AUTH FLOW
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "04", "Authentication Flow", "Session-based auth without third-party libraries", C.green);

  s = contentSlide(p, "Registration Flow", { accentColor: C.green });
  flowDiagram(s, ["User\nSubmits", "Zod\nValidate", "bcrypt\nHash", "DB\nCreate", "Session\nSet", "Redirect\nto Dashboard"], 1.8, C.green);

  bulletList(s, 0.5, 3.2, 9, [
    "No email verification required (can be added)",
    "Session token: random 64-char hex string",
    "Cookie: HTTP-only, Secure, SameSite=Lax",
    "Default expiry: 30 days (configurable)",
  ]);

  s = contentSlide(p, "Login & Session Validation", { accentColor: C.blue });

  // Login flow
  bar(s, 0.3, 1.15, 9.4, 0.4, C.darkCard);
  txt(s, "🔑 Login Flow", { x: 0.5, y: 1.15, w: 3, h: 0.4, fontSize: 10, bold: true, color: C.blue });

  flowDiagram(s, ["Submit\nCredentials", "bcrypt\nCompare", "Clear Old\nSessions", "Create\nSession", "Set\nCookie"], 1.7, C.blue);

  // Session validation flow
  bar(s, 0.3, 3.2, 9.4, 0.4, C.darkCard);
  txt(s, "🔍 Session Validation (every request)", { x: 0.5, y: 3.2, w: 5, h: 0.4, fontSize: 10, bold: true, color: C.gold });

  flowDiagram(s, ["Read\nCookie", "Query\nSession", "Check\nExpiry", "Check\nUser Status", "✅ Valid\nor ❌ Null"], 3.8, C.gold);

  // ═══════════════════════════════════════════════════════════════════════
  // 5. TEMPLATE RENDERING
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "05", "Template Rendering", "How templates are loaded, parsed, and rendered", C.pink);

  s = contentSlide(p, "Template Rendering Pipeline", { accentColor: C.pink });

  // Pipeline flow
  const pipeSteps = [
    { label: "DB Query", sub: "Prisma fetch", color: C.blue },
    { label: "Zod Parse", sub: "safeParseTemplateData", color: C.green },
    { label: "Switch", sub: "categorySlug → templateCode", color: C.gold },
    { label: "Dynamic Import", sub: "next/dynamic", color: C.pink },
    { label: "SSR Render", sub: "Server HTML", color: C.purple },
    { label: "Hydrate", sub: "Client interactivity", color: C.cyan },
  ];

  pipeSteps.forEach((step, i) => {
    const x = 0.3 + i * 1.6;
    bar(s, x, 1.5, 1.4, 1.0, C.darkCard);
    bar(s, x, 1.5, 1.4, 0.06, step.color);
    numCircle(s, x + 0.5, 1.35, 0.3, i + 1, step.color, C.dark);
    txt(s, step.label, { x, y: 1.65, w: 1.4, h: 0.35, fontSize: 9, bold: true, color: C.white, align: "center" });
    txt(s, step.sub, { x, y: 2.05, w: 1.4, h: 0.35, fontSize: 7, color: C.grayLight, align: "center" });
    if (i < pipeSteps.length - 1) {
      arrowH(s, x + 1.42, 2.0, 0.15, step.color);
    }
  });

  // Server vs Client
  bar(s, 0.5, 2.9, 4.3, 0.35, C.blue);
  txt(s, "🖥️ Server Side", { x: 0.5, y: 2.9, w: 4.3, h: 0.35, fontSize: 9, bold: true, color: C.white, align: "center" });
  bulletList(s, 0.7, 3.35, 4.0, [
    "Profile data fetched from database",
    "ISR cache checked first (1-hour TTL)",
    "safeParseTemplateData validates + normalizes",
    "Dynamic import loads only selected template",
    "Full HTML produced for SEO + performance",
  ], { fontSize: 8.5 });

  bar(s, 5.2, 2.9, 4.3, 0.35, C.pink);
  txt(s, "💻 Client Side", { x: 5.2, y: 2.9, w: 4.3, h: 0.35, fontSize: 9, bold: true, color: C.white, align: "center" });
  bulletList(s, 5.4, 3.35, 4.0, [
    "React hydrates pre-rendered HTML",
    "useState activates (copied, theme)",
    "onClick handlers work (save vCard, share)",
    "Image component optimizes avatars",
    "Theme toggle persists via localStorage",
  ], { fontSize: 8.5 });

  // ═══════════════════════════════════════════════════════════════════════
  // 6. CACHING
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "06", "Caching Strategy", "Multi-layer caching for performance", C.cyan);

  s = contentSlide(p, "Caching Layers", { accentColor: C.cyan });

  // Layer diagram - concentric-ish boxes
  bar(s, 0.5, 1.15, 9, 4.0, C.darkSubtle);
  txt(s, "🌐 Browser Cache", { x: 0.7, y: 1.2, w: 2, h: 0.3, fontSize: 9, bold: true, color: C.cyan });
  bulletList(s, 0.7, 1.55, 3.5, [
    "/_next/static/* — immutable, 1yr",
    "/uploads/* — 1-day, stale-while-revalidate",
  ], { fontSize: 8 });

  bar(s, 0.8, 2.3, 8.4, 2.7, C.darkCard);
  txt(s, "⚡ Next.js Data Cache (ISR)", { x: 1.0, y: 2.35, w: 4, h: 0.3, fontSize: 9, bold: true, color: C.green });
  bulletList(s, 1.0, 2.7, 4, [
    "Published profiles: 1-hour revalidation",
    "Draft profiles: bypass cache",
    "Cache key: profile-by-slug:{slug}",
  ], { fontSize: 8 });

  bar(s, 5.5, 2.3, 3.5, 2.7, C.darkSubtle);
  txt(s, "🏷️ Tag-Based Revalidation", { x: 5.7, y: 2.35, w: 3, h: 0.3, fontSize: 9, bold: true, color: C.gold });
  bulletList(s, 5.7, 2.7, 3.2, [
    "profile:{slug} — on save",
    "user-profiles:{userId} — on save",
    "admin-stats — on view",
    "templates — on admin change",
  ], { fontSize: 8 });

  // ═══════════════════════════════════════════════════════════════════════
  // 7. ADMIN WORKFLOW
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "07", "Admin Workflow", "Platform administration and monitoring", C.gold);

  s = contentSlide(p, "Admin Access & Navigation", { accentColor: C.gold });

  // Access control
  bar(s, 0.5, 1.2, 4.3, 1.5, C.darkCard);
  bar(s, 0.5, 1.2, 0.06, 1.5, C.red);
  txt(s, "🔐 Access Control", { x: 0.7, y: 1.25, w: 3, h: 0.3, fontSize: 10, bold: true, color: C.white });
  bulletList(s, 0.7, 1.6, 3.8, [
    "getServerSession() checks role",
    "Non-admin → redirected to /dashboard",
    "Admin layout wraps sidebar",
    "All admin pages use server components",
  ], { fontSize: 8.5 });

  // Admin features grid
  const adminFeatures = [
    { icon: "📊", name: "Dashboard", desc: "Overview stats & activity", color: C.blue },
    { icon: "👥", name: "Users", desc: "Manage accounts & roles", color: C.green },
    { icon: "🎨", name: "Templates", desc: "Add, edit, activate/deactivate", color: C.pink },
    { icon: "💳", name: "Payments", desc: "Review & verify", color: C.gold },
    { icon: "📈", name: "Analytics", desc: "Revenue + Excel export", color: C.purple },
    { icon: "⚙️", name: "Settings", desc: "Platform config (JSON)", color: C.cyan },
    { icon: "💾", name: "Backups", desc: "SQL dump + email", color: C.green },
  ];

  adminFeatures.forEach((f, i) => {
    const x = 5.2;
    const y = 1.2 + i * 0.53;
    bar(s, x, y, 4.3, 0.46, C.darkCard);
    bar(s, x, y, 0.04, 0.46, f.color);
    txt(s, f.icon, { x: x + 0.15, y, w: 0.4, h: 0.46, fontSize: 12 });
    txt(s, f.name, { x: x + 0.6, y, w: 1.5, h: 0.46, fontSize: 9, bold: true, color: C.white, valign: "middle" });
    txt(s, f.desc, { x: x + 2.1, y, w: 2.1, h: 0.46, fontSize: 8, color: C.grayLight, valign: "middle" });
  });

  // Revenue & backups
  s = contentSlide(p, "Revenue Reporting & Database Backups", { accentColor: C.gold });

  bar(s, 0.5, 1.15, 4.3, 3.8, C.darkCard);
  bar(s, 0.5, 1.15, 4.3, 0.4, C.gold);
  txt(s, "📈 Revenue Reporting", { x: 0.5, y: 1.15, w: 4.3, h: 0.4, fontSize: 10, bold: true, color: C.dark, align: "center" });

  bulletList(s, 0.7, 1.7, 3.8, [
    { text: "Data Sources:", bold: true, color: C.gold },
    "Payment records from database",
    "User profiles with payment status",
    "Template pricing tiers",
    "",
    { text: "Export Feature:", bold: true, color: C.gold },
    "xlsx library generates Excel files",
    "Columns: Date, User, Profile, etc.",
    "Themed export button",
    "",
    { text: "Filters:", bold: true, color: C.gold },
    "Date range, category, status",
    "Summary cards with totals",
  ], { fontSize: 8.5 });

  bar(s, 5.2, 1.15, 4.3, 3.8, C.darkCard);
  bar(s, 5.2, 1.15, 4.3, 0.4, C.green);
  txt(s, "💾 Database Backups", { x: 5.2, y: 1.15, w: 4.3, h: 0.4, fontSize: 10, bold: true, color: C.dark, align: "center" });

  flowDiagram(s, ["prisma\ndb pull", "SQL\nDump", "Gzip\nCompress", "Email\nDelivery", "Download\nButton"], 1.7, C.green);

  bulletList(s, 5.4, 3.0, 3.8, [
    { text: "Vercel Cron:", bold: true, color: C.green },
    "Weekly Monday 8am UTC",
    "Configured in vercel.json",
    "",
    { text: "Email Delivery:", bold: true, color: C.green },
    "Nodemailer + Gmail SMTP",
    "nangmya@dkmads.com",
    "Attachment: .sql.gz file",
  ], { fontSize: 8.5 });

  // ═══════════════════════════════════════════════════════════════════════
  // 8. DEVELOPMENT JOURNEY
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "08", "Development Journey", "Key milestones and iterations", C.purple);

  s = contentSlide(p, "Development Phases", { accentColor: C.purple });

  // Timeline
  const phases = [
    { num: 1, name: "Foundation", color: C.blue, items: ["Next.js 15 + TS + Tailwind", "Prisma + MySQL", "20 templates", "SSR + ISR"] },
    { num: 2, name: "Landing", color: C.green, items: ["Marketing page", "Scroll reveal", "Legal pages", "Brand assets"] },
    { num: 3, name: "Admin", color: C.gold, items: ["Revenue reports", "DB backups", "Settings page", "Maintenance mode"] },
    { num: 4, name: "Polish", color: C.pink, items: ["Editor UX", "QR improvements", "Bug fixes", "Auth flow"] },
  ];

  phases.forEach((phase, i) => {
    const x = 0.3 + i * 2.4;
    bar(s, x, 1.2, 2.2, 3.8, C.darkCard);
    bar(s, x, 1.2, 2.2, 0.45, phase.color);
    numCircle(s, x + 0.85, 1.25, 0.35, phase.num, C.dark, phase.color);
    txt(s, phase.name, { x, y: 1.7, w: 2.2, h: 0.3, fontSize: 10, bold: true, color: C.white, align: "center" });

    phase.items.forEach((item, j) => {
      txt(s, `•  ${item}`, { x: x + 0.15, y: 2.2 + j * 0.55, w: 1.9, h: 0.5, fontSize: 8.5, color: C.grayLight });
    });

    // Connector
    if (i < phases.length - 1) {
      arrowH(s, x + 2.22, 3.1, 0.16, C.grayDark);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 9. DEPLOYMENT
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "09", "Deployment & Infrastructure", "Hosting, CI/CD, and operations", C.cyan);

  s = contentSlide(p, "Deployment Architecture", { accentColor: C.cyan });

  // Infrastructure diagram
  const infra = [
    { icon: "🌐", name: "Vercel", desc: "Serverless + Edge", color: C.white, x: 0.5, y: 1.2 },
    { icon: "🗄️", name: "MySQL", desc: "Managed Database", color: C.blue, x: 3.0, y: 1.2 },
    { icon: "☁️", name: "Cloudflare R2", desc: "File Storage", color: C.orange, x: 5.5, y: 1.2 },
    { icon: "📧", name: "Gmail SMTP", desc: "Email Service", color: C.green, x: 8.0, y: 1.2 },
  ];

  infra.forEach((item) => {
    bar(s, item.x, item.y, 2.2, 1.2, C.darkCard);
    bar(s, item.x, item.y, 2.2, 0.04, item.color);
    txt(s, item.icon, { x: item.x, y: item.y + 0.15, w: 2.2, h: 0.4, fontSize: 20, align: "center" });
    txt(s, item.name, { x: item.x, y: item.y + 0.55, w: 2.2, h: 0.3, fontSize: 10, bold: true, color: C.white, align: "center" });
    txt(s, item.desc, { x: item.x, y: item.y + 0.85, w: 2.2, h: 0.25, fontSize: 8, color: C.grayLight, align: "center" });
  });

  // Connections
  arrow(s, 2.7, 1.8, 3.0, 1.8, C.grayDark);
  arrow(s, 5.2, 1.8, 5.5, 1.8, C.grayDark);
  arrow(s, 7.7, 1.8, 8.0, 1.8, C.grayDark);

  // Env vars table
  txt(s, "🔧 Environment Variables", { x: 0.5, y: 2.7, w: 4, h: 0.3, fontSize: 10, bold: true, color: C.gold });

  tableSlide(s, 0.5, 3.1, 4.2, ["Variable", "Purpose"], [
    ["DATABASE_URL", "MySQL connection string"],
    ["NEXT_PUBLIC_APP_URL", "Base URL"],
    ["SMTP_HOST/PORT/USER/PASS", "Email config"],
    ["R2_*", "Cloudflare R2 keys"],
    ["SESSION_SECRET", "Session signing"],
  ], { headerColor: C.gold, rowH: 0.3 });

  tableSlide(s, 5.0, 3.1, 4.5, ["Variable", "Purpose"], [
    ["VERCEL_CRON_SECRET", "Protects cron endpoint"],
    ["BACKUP_EMAIL", "Where dumps are sent"],
    ["R2_BUCKET_NAME", "Storage bucket"],
    ["SMTP_USER", "Sender email address"],
    ["", ""],
  ], { headerColor: C.cyan, rowH: 0.3 });

  // ═══════════════════════════════════════════════════════════════════════
  // 10. FUTURE ROADMAP
  // ═══════════════════════════════════════════════════════════════════════
  sectionSlide(p, "10", "Future Roadmap", "Planned features and improvements", C.gold);

  s = contentSlide(p, "Planned Features", { accentColor: C.gold });

  const roadmap = [
    { tier: "Tier 1 — High Priority", color: C.red, items: ["Email verification on registration", "Password reset flow", "Custom domain support"] },
    { tier: "Tier 2 — Medium Priority", color: C.blue, items: ["Team accounts", "Template marketplace", "A/B testing", "Multi-language (i18n)"] },
    { tier: "Tier 3 — Nice to Have", color: C.purple, items: ["AI content generation", "Animation presets", "Analytics integration", "Contact form + spam protection", "Calendar integration"] },
  ];

  roadmap.forEach((tier, i) => {
    const x = 0.3 + i * 3.2;
    bar(s, x, 1.15, 3.0, 3.8, C.darkCard);
    bar(s, x, 1.15, 3.0, 0.4, tier.color);
    txt(s, tier.tier, { x, y: 1.15, w: 3.0, h: 0.4, fontSize: 9, bold: true, color: C.white, align: "center" });

    tier.items.forEach((item, j) => {
      const ly = 1.75 + j * 0.55;
      bar(s, x + 0.15, ly, 2.7, 0.45, C.darkSubtle);
      txt(s, `→ ${item}`, { x: x + 0.25, y: ly, w: 2.5, h: 0.45, fontSize: 8.5, color: C.grayLight, valign: "middle" });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CLOSING
  // ═══════════════════════════════════════════════════════════════════════
  closingSlide(p, "Questions?", "NEX CARD — Your Digital Identity, Elevated\nwww.nexcard.wetechmm.com • Built with Next.js, Prisma, Tailwind CSS");

  return p;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const outDir = "C:\\Users\\Nang\\Desktop\\WeGrow\\nex_card";

  console.log("Generating visual User Guide...");
  const ug = buildUserGuide();
  await ug.writeFile({ fileName: `${outDir}\\NEX-CARD-User-Guide-v2.pptx` });
  console.log("  → NEX-CARD-User-Guide-v2.pptx");

  console.log("Generating visual Project Flow...");
  const pf = buildProjectFlow();
  await pf.writeFile({ fileName: `${outDir}\\NEX-CARD-Project-Flow-v2.pptx` });
  console.log("  → NEX-CARD-Project-Flow-v2.pptx");

  console.log("Done!");
}

main().catch(console.error);
