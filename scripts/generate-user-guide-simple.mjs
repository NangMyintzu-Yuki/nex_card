// scripts/generate-user-guide-simple.mjs
// Simple, friendly User Guide — easy for anyone to understand

import PptxGenJS from "pptxgenjs";

const C = {
  gold: "D4AF37", goldLight: "F0C050", goldDim: "3D3200",
  dark: "0F0F0F", darkCard: "1A1A1A", darkBorder: "2A2A2A",
  navy: "1E3A8A", navyLight: "2D6EB5",
  white: "FFFFFF", offWhite: "E8E8E8",
  gray: "888888", grayLight: "BBBBBB", grayDark: "444444",
  green: "22C55E", red: "EF4444", blue: "3B82F6", purple: "8B5CF6",
  pink: "EC4899", cyan: "06B6D4", orange: "F97316", teal: "14B8A6",
};

// ─── Helpers ───────────────────────────────────────────────────────────

function bar(s, x, y, w, h, color) {
  s.addShape("rect", { x, y, w, h, fill: { color }, rectRadius: 0.05 });
}

function circle(s, x, y, size, color) {
  s.addShape("ellipse", { x, y, w: size, h: size, fill: { color } });
}

function txt(s, text, opts) {
  s.addText(text, { fontFace: "Arial", color: C.white, valign: "middle", ...opts });
}

function numDot(s, x, y, num, color = C.gold) {
  circle(s, x, y, 0.45, color);
  txt(s, String(num), { x, y, w: 0.45, h: 0.45, fontSize: 16, bold: true, color: C.dark, align: "center" });
}

function bulletList(s, x, y, w, items, opts = {}) {
  const fs = opts.fontSize || 12;
  const lh = opts.lineH || 0.45;
  const color = opts.color || C.grayLight;
  items.forEach((item, i) => {
    if (typeof item === "string") {
      txt(s, `•  ${item}`, { x, y: y + i * lh, w, h: lh, fontSize: fs, color, valign: "middle" });
    } else {
      txt(s, `•  ${item.text}`, {
        x, y: y + i * lh, w, h: lh,
        fontSize: item.fontSize || fs,
        color: item.color || color,
        bold: item.bold || false,
        valign: "middle",
      });
    }
  });
}

function phoneMockup(s, x, y, accentColor, lines = []) {
  // Phone body
  bar(s, x, y, 2.0, 3.5, C.darkCard);
  s.addShape("rect", {
    x: x - 0.02, y: y - 0.02, w: 2.04, h: 3.54,
    fill: { type: "solid", color: C.dark },
    line: { color: C.grayDark, width: 1.5 },
    rectRadius: 0.18,
  });
  bar(s, x + 0.1, y + 0.22, 1.8, 3.06, C.dark);
  bar(s, x + 0.1, y + 0.22, 1.8, 0.4, accentColor);
  bar(s, x + 0.7, y + 0.05, 0.6, 0.12, C.dark);
  // Content lines
  lines.forEach((line, i) => {
    const ly = y + 0.8 + i * 0.32;
    const lw = typeof line === "number" ? line : 1.2;
    bar(s, x + 0.2, ly, Math.min(lw, 1.6), 0.12, C.grayDark);
  });
}

// ═══════════════════════════════════════════════════════════════════════

function generateSimpleUserGuide() {
  const p = new PptxGenJS();
  p.layout = "LAYOUT_16x9";
  p.title = "NEX CARD — User Guide";

  // ═══════════════════════════════════════════════════════════════════
  // TITLE
  // ═══════════════════════════════════════════════════════════════════
  let s = p.addSlide();
  s.background = { color: C.dark };
  s.addShape("ellipse", { x: 5.5, y: -1.5, w: 6, h: 6, fill: { color: C.goldDim } });
  bar(s, 0.8, 1.5, 2.0, 0.07, C.gold);
  txt(s, "NEX CARD", { x: 0.8, y: 1.7, w: 8, h: 1.0, fontSize: 44, bold: true, color: C.gold });
  txt(s, "User Guide", { x: 0.8, y: 2.6, w: 8, h: 0.8, fontSize: 28, color: C.white });
  txt(s, "Everything you need to create and share your digital card", {
    x: 0.8, y: 3.5, w: 8, h: 0.5, fontSize: 14, color: C.gray,
  });

  // ═══════════════════════════════════════════════════════════════════
  // 1. WHAT IS NEX CARD?
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "01", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "What is NEX CARD?", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // Big simple explanation
  bar(s, 0.8, 2.1, 8.4, 1.4, C.darkCard);
  txt(s, "📱  Create a beautiful online card", { x: 1.2, y: 2.2, w: 7.5, h: 0.45, fontSize: 16, color: C.white });
  txt(s, "🔗  Get a link like nexcard.io/your-name", { x: 1.2, y: 2.65, w: 7.5, h: 0.45, fontSize: 16, color: C.white });
  txt(s, "📲  Share via QR code, NFC tap, or just send the link", { x: 1.2, y: 3.1, w: 7.5, h: 0.45, fontSize: 16, color: C.white });

  bulletList(s, 0.8, 3.8, 8.4, [
    { text: "No coding needed", color: C.green },
    { text: "Free to start", color: C.green },
    "Choose from 20 beautiful templates",
    "Works on any phone, tablet, or computer",
  ], { fontSize: 13 });

  // ═══════════════════════════════════════════════════════════════════
  // 2. CREATE YOUR ACCOUNT
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "02", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Create Your Account", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // 3 steps with big numbers
  const regSteps = [
    { n: 1, text: "Go to nexcard.io\nand click \"Get Started\"", color: C.gold },
    { n: 2, text: "Enter your name,\nemail & password", color: C.green },
    { n: 3, text: "Check your email\nand click the link", color: C.blue },
  ];

  regSteps.forEach((step, i) => {
    const x = 0.8 + i * 3.0;
    bar(s, x, 2.2, 2.7, 2.0, C.darkCard);
    circle(s, x + 1.0, 2.35, 0.7, step.color);
    txt(s, String(step.n), { x: x + 1.0, y: 2.35, w: 0.7, h: 0.7, fontSize: 24, bold: true, color: C.dark, align: "center" });
    txt(s, step.text, { x: x + 0.2, y: 3.2, w: 2.3, h: 0.8, fontSize: 12, color: C.grayLight, align: "center" });
  });

  txt(s, "That's it! You're now logged in and ready to go.", {
    x: 0.8, y: 4.5, w: 8.4, h: 0.5, fontSize: 13, color: C.green, align: "center",
  });

  // ═══════════════════════════════════════════════════════════════════
  // 3. YOUR DASHBOARD
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "03", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Your Dashboard", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // Dashboard mockup
  bar(s, 0.5, 2.0, 9.0, 3.2, C.darkCard);
  bar(s, 0.5, 2.0, 9.0, 0.45, C.grayDark);
  txt(s, "📊 Dashboard", { x: 0.7, y: 2.02, w: 3, h: 0.42, fontSize: 11, bold: true, color: C.gold });

  // Mini profile cards
  const cardColors = [C.gold, C.green, C.blue, C.pink];
  const cardLabels = ["My Name Card", "My Portfolio", "Business Page", "Wedding Invite"];
  const cardStatus = ["Published ✓", "Draft", "Published ✓", "Draft"];
  const cardViews = ["245 views", "0 views", "1,203 views", "0 views"];

  cardColors.forEach((col, i) => {
    const cx = 0.7 + i * 2.15;
    bar(s, cx, 2.6, 1.95, 2.3, C.dark);
    bar(s, cx, 2.6, 1.95, 0.06, col);
    bar(s, cx + 0.2, 2.85, 1.55, 0.5, C.grayDark);
    txt(s, cardLabels[i], { x: cx + 0.1, y: 3.45, w: 1.75, h: 0.3, fontSize: 8, bold: true, color: C.white, align: "center" });
    txt(s, cardStatus[i], { x: cx + 0.1, y: 3.75, w: 1.75, h: 0.25, fontSize: 7, color: col, align: "center" });
    txt(s, cardViews[i], { x: cx + 0.1, y: 4.0, w: 1.75, h: 0.25, fontSize: 7, color: C.gray, align: "center" });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 4. CREATE YOUR FIRST CARD
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "04", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Create Your First Card", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // 4 simple steps
  const createSteps = [
    { n: 1, title: "Pick a Category", desc: "Name Card, Portfolio,\nBusiness, or Wedding", color: C.gold, icon: "📁" },
    { n: 2, title: "Choose a Template", desc: "20 beautiful designs\nto choose from", color: C.green, icon: "🎨" },
    { n: 3, title: "Add Your Details", desc: "Name, photo, links,\nand info about you", color: C.blue, icon: "✏️" },
    { n: 4, title: "Publish & Share!", desc: "Go live and share\nwith the world", color: C.pink, icon: "🚀" },
  ];

  createSteps.forEach((step, i) => {
    const x = 0.5 + i * 2.35;
    bar(s, x, 2.1, 2.15, 2.8, C.darkCard);
    bar(s, x, 2.1, 2.15, 0.06, step.color);
    txt(s, step.icon, { x, y: 2.25, w: 2.15, h: 0.6, fontSize: 28, align: "center" });
    circle(s, x + 0.82, 2.85, 0.5, step.color);
    txt(s, String(step.n), { x: x + 0.82, y: 2.85, w: 0.5, h: 0.5, fontSize: 18, bold: true, color: C.dark, align: "center" });
    txt(s, step.title, { x: x + 0.1, y: 3.5, w: 1.95, h: 0.35, fontSize: 11, bold: true, color: C.white, align: "center" });
    txt(s, step.desc, { x: x + 0.1, y: 3.9, w: 1.95, h: 0.8, fontSize: 9, color: C.grayLight, align: "center" });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 5. EDIT YOUR CARD
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "05", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Editing Your Card", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // Left: editor mockup
  bar(s, 0.5, 2.0, 4.3, 3.2, C.darkCard);
  bar(s, 0.5, 2.0, 4.3, 0.4, C.grayDark);
  txt(s, "✏️ Edit Profile", { x: 0.7, y: 2.02, w: 3, h: 0.38, fontSize: 10, bold: true, color: C.gold });

  const fields = ["Full Name", "Job Title", "Company", "Bio", "Phone", "Email"];
  fields.forEach((f, i) => {
    const fy = 2.55 + i * 0.42;
    txt(s, f, { x: 0.7, y: fy, w: 1.5, h: 0.25, fontSize: 8, bold: true, color: C.grayLight });
    bar(s, 0.7, fy + 0.25, 3.8, 0.14, C.dark);
  });

  // Right: what you can add
  txt(s, "What you can add:", { x: 5.2, y: 2.0, w: 4.5, h: 0.4, fontSize: 13, bold: true, color: C.gold });

  const editItems = [
    { icon: "👤", text: "Your name, title & company", color: C.white },
    { icon: "📷", text: "Profile photo (drag & drop)", color: C.white },
    { icon: "🎨", text: "Custom accent color", color: C.white },
    { icon: "📞", text: "Phone, email, address", color: C.white },
    { icon: "🔗", text: "Social links (LinkedIn, Instagram...)", color: C.white },
    { icon: "💬", text: "Bio, tagline & quote", color: C.white },
    { icon: "🔘", text: "Call-to-action button", color: C.white },
  ];

  editItems.forEach((item, i) => {
    const iy = 2.5 + i * 0.42;
    txt(s, item.icon, { x: 5.2, y: iy, w: 0.4, h: 0.35, fontSize: 14 });
    txt(s, item.text, { x: 5.7, y: iy, w: 4, h: 0.35, fontSize: 11, color: item.color, valign: "middle" });
  });

  // Tip
  bar(s, 5.2, 4.65, 4.3, 0.45, C.goldDim);
  txt(s, "💡 Changes save automatically — you can preview in real time!", {
    x: 5.3, y: 4.65, w: 4.1, h: 0.45, fontSize: 9, color: C.gold, valign: "middle",
  });

  // ═══════════════════════════════════════════════════════════════════
  // 6. CHOOSE YOUR TEMPLATE
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "06", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Choose Your Template", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  txt(s, "20 templates across 4 categories — you can switch anytime", {
    x: 0.8, y: 1.85, w: 8, h: 0.4, fontSize: 12, color: C.gray,
  });

  // Template grid with mini phone mockups
  const allTemplates = [
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

  allTemplates.forEach((t, i) => {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = 0.3 + col * 0.94;
    const y = 2.35 + row * 1.55;
    bar(s, x, y, 0.82, 1.3, C.darkCard);
    bar(s, x, y, 0.82, 0.06, t.color);
    // Mini phone
    bar(s, x + 0.11, y + 0.12, 0.6, 0.75, C.dark);
    bar(s, x + 0.11, y + 0.12, 0.6, 0.12, t.color);
    txt(s, t.name, { x, y: y + 0.92, w: 0.82, h: 0.18, fontSize: 6.5, bold: true, color: C.white, align: "center" });
    txt(s, t.cat, { x, y: y + 1.08, w: 0.82, h: 0.16, fontSize: 5.5, color: C.gray, align: "center" });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 7. PUBLISH YOUR CARD
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "07", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Publish Your Card", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // Toggle switch mockup
  bar(s, 1.5, 2.2, 7, 1.5, C.darkCard);
  txt(s, "Publish Now", { x: 1.8, y: 2.3, w: 3, h: 0.5, fontSize: 18, bold: true, color: C.white });
  txt(s, "Make your card visible to everyone", { x: 1.8, y: 2.8, w: 4, h: 0.4, fontSize: 11, color: C.grayLight });
  // Toggle ON
  bar(s, 7.0, 2.5, 1.0, 0.5, C.green);
  txt(s, "ON", { x: 7.0, y: 2.5, w: 1.0, h: 0.5, fontSize: 14, bold: true, color: C.white, align: "center" });

  // Your link
  bar(s, 1.5, 4.0, 7, 0.8, C.darkCard);
  txt(s, "🔗  Your link:", { x: 1.8, y: 4.05, w: 2, h: 0.35, fontSize: 11, color: C.gray });
  txt(s, "nexcard.io/your-name", { x: 1.8, y: 4.35, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.gold });

  bulletList(s, 0.8, 5.05, 8.4, [
    "Share this link anywhere — it works on any phone or computer",
  ], { fontSize: 12, color: C.green });

  // ═══════════════════════════════════════════════════════════════════
  // 8. SHARE WITH QR CODE
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "08", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Share with QR Code", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // QR mockup
  bar(s, 0.5, 2.1, 3.5, 3.0, C.darkCard);
  txt(s, "Your QR Code", { x: 0.5, y: 2.2, w: 3.5, h: 0.4, fontSize: 11, bold: true, color: C.white, align: "center" });
  // QR pattern
  bar(s, 1.1, 2.8, 1.8, 1.8, C.white);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if ((r + c) % 3 === 0 || (r < 2 && c < 2) || (r > 3 && c < 2) || (r < 2 && c > 3)) {
        bar(s, 1.2 + c * 0.26, 2.9 + r * 0.26, 0.22, 0.22, C.dark);
      }
    }
  }
  txt(s, "nexcard.io/your-name", { x: 0.5, y: 4.7, w: 3.5, h: 0.3, fontSize: 9, color: C.grayLight, align: "center" });

  // How to
  txt(s, "How to get your QR code:", { x: 4.5, y: 2.1, w: 5, h: 0.4, fontSize: 14, bold: true, color: C.gold });

  const qrSteps = [
    { n: 1, text: "Go to Dashboard → your card → QR Code" },
    { n: 2, text: "Click \"Generate QR\"" },
    { n: 3, text: "Choose format: PNG, SVG, or JPEG" },
    { n: 4, text: "Click Download — done!" },
  ];

  qrSteps.forEach((step, i) => {
    const sy = 2.7 + i * 0.6;
    numDot(s, 4.5, sy, step.n, C.green);
    txt(s, step.text, { x: 5.1, y: sy, w: 4.5, h: 0.45, fontSize: 12, color: C.grayLight, valign: "middle" });
  });

  bar(s, 4.5, 5.1, 5, 0.4, C.goldDim);
  txt(s, "💡 Print the QR on business cards, flyers, or posters!", {
    x: 4.6, y: 5.1, w: 4.8, h: 0.4, fontSize: 10, color: C.gold, valign: "middle",
  });

  // ═══════════════════════════════════════════════════════════════════
  // 9. SHARE WITH NFC
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "09", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Share with NFC Tap", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // NFC tag mockup
  bar(s, 0.5, 2.1, 3.5, 3.0, C.darkCard);
  circle(s, 1.3, 2.6, 1.5, C.purple);
  txt(s, "NFC", { x: 1.3, y: 2.6, w: 1.5, h: 1.5, fontSize: 22, bold: true, color: C.white, align: "center" });
  txt(s, "NFC Tag", { x: 0.5, y: 4.2, w: 3.5, h: 0.3, fontSize: 12, bold: true, color: C.white, align: "center" });
  txt(s, "(Buy online for ~$1 each)", { x: 0.5, y: 4.5, w: 3.5, h: 0.3, fontSize: 9, color: C.gray, align: "center" });

  // Steps
  txt(s, "How to set up:", { x: 4.5, y: 2.1, w: 5, h: 0.4, fontSize: 14, bold: true, color: C.gold });

  const nfcSteps = [
    { n: 1, text: "Buy blank NFC tags (NTAG213)" },
    { n: 2, text: "Go to Dashboard → your card → NFC" },
    { n: 3, text: "Hold your phone near the tag" },
    { n: 4, text: "The app writes your link to the tag" },
    { n: 5, text: "Done! Anyone can now tap to view" },
  ];

  nfcSteps.forEach((step, i) => {
    const sy = 2.65 + i * 0.55;
    numDot(s, 4.5, sy, step.n, C.purple);
    txt(s, step.text, { x: 5.1, y: sy, w: 4.5, h: 0.45, fontSize: 11, color: C.grayLight, valign: "middle" });
  });

  txt(s, "Works with any phone — just tap!", {
    x: 4.5, y: 5.35, w: 5, h: 0.35, fontSize: 11, color: C.green,
  });

  // ═══════════════════════════════════════════════════════════════════
  // 10. DARK & LIGHT MODE
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "10", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Dark & Light Mode", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  txt(s, "Choose the look that suits you — toggle anytime from the top menu", {
    x: 0.8, y: 1.9, w: 8, h: 0.4, fontSize: 12, color: C.gray,
  });

  // Dark theme phone
  phoneMockup(s, 1.0, 2.5, C.gold, [1.4, 1.0, 1.2, 0.8, 1.5]);
  txt(s, "🌙 Dark Mode", { x: 0.8, y: 6.1, w: 2.2, h: 0.35, fontSize: 11, bold: true, color: C.gold, align: "center" });
  txt(s, "Black background", { x: 0.8, y: 6.45, w: 2.2, h: 0.25, fontSize: 8, color: C.gray, align: "center" });

  // Arrow
  txt(s, "⚡", { x: 4.3, y: 3.8, w: 0.6, h: 0.6, fontSize: 28, align: "center" });

  // Light theme phone
  bar(s, 6.6, 2.5, 2.0, 3.5, "F0F0EE");
  s.addShape("rect", {
    x: 6.58, y: 2.48, w: 2.04, h: 3.54,
    fill: { type: "solid", color: "F0F0EE" },
    line: { color: "DDDDDD", width: 1.5 },
    rectRadius: 0.18,
  });
  bar(s, 6.7, 2.72, 1.8, 3.06, "FAFAF8");
  bar(s, 6.7, 2.72, 1.8, 0.4, C.navy);
  bar(s, 7.3, 2.55, 0.6, 0.12, "F0F0EE");
  // Content
  bar(s, 6.8, 3.25, 1.6, 0.12, "DDDDDD");
  bar(s, 6.8, 3.55, 1.2, 0.12, "DDDDDD");
  bar(s, 6.8, 3.85, 1.4, 0.12, "DDDDDD");
  bar(s, 6.8, 4.15, 0.8, 0.25, C.navy);
  bar(s, 7.65, 4.15, 0.65, 0.25, "DDDDDD");

  txt(s, "☀️ Light Mode", { x: 6.4, y: 6.1, w: 2.2, h: 0.35, fontSize: 11, bold: true, color: C.navyLight, align: "center" });
  txt(s, "White background", { x: 6.4, y: 6.45, w: 2.2, h: 0.25, fontSize: 8, color: C.gray, align: "center" });

  // ═══════════════════════════════════════════════════════════════════
  // 11. VIEW COUNT & ANALYTICS
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "11", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Track Your Views", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  txt(s, "See how many people view your card and scan your QR code", {
    x: 0.8, y: 1.9, w: 8, h: 0.4, fontSize: 12, color: C.gray,
  });

  // Stats mockup
  const stats = [
    { value: "1,247", label: "Total Views", color: C.blue, icon: "👀" },
    { value: "342", label: "QR Scans", color: C.green, icon: "📱" },
    { value: "89", label: "Saved Contacts", color: C.gold, icon: "💾" },
  ];

  stats.forEach((st, i) => {
    const sx = 0.8 + i * 3.0;
    bar(s, sx, 2.5, 2.7, 1.5, C.darkCard);
    txt(s, st.icon, { x: sx, y: 2.6, w: 2.7, h: 0.5, fontSize: 20, align: "center" });
    txt(s, st.value, { x: sx, y: 3.1, w: 2.7, h: 0.5, fontSize: 28, bold: true, color: st.color, align: "center" });
    txt(s, st.label, { x: sx, y: 3.6, w: 2.7, h: 0.3, fontSize: 10, color: C.grayLight, align: "center" });
  });

  bulletList(s, 0.8, 4.4, 8.4, [
    "View count updates automatically every time someone visits your card",
    "QR scans are tracked when people scan your code",
    "Check the Analytics page in your dashboard for detailed charts",
  ], { fontSize: 12 });

  // ═══════════════════════════════════════════════════════════════════
  // 12. TIPS & SUPPORT
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  txt(s, "12", { x: 0.8, y: 0.4, w: 1, h: 0.6, fontSize: 28, bold: true, color: C.gold });
  txt(s, "Tips & Help", { x: 0.8, y: 1.0, w: 8, h: 0.7, fontSize: 28, bold: true, color: C.white });
  bar(s, 0.8, 1.7, 8, 0.02, C.darkBorder);

  // Tips
  const tips = [
    { icon: "💡", text: "Keep your bio short — 2-3 sentences is perfect", color: C.gold },
    { icon: "📷", text: "Use a clear, professional profile photo", color: C.green },
    { icon: "🎨", text: "Pick an accent color that matches your brand", color: C.blue },
    { icon: "🔗", text: "Add your most important links first", color: C.pink },
    { icon: "📱", text: "Test your QR code before printing it", color: C.purple },
  ];

  tips.forEach((tip, i) => {
    const ty = 2.1 + i * 0.6;
    bar(s, 0.8, ty, 8.4, 0.5, C.darkCard);
    txt(s, tip.icon, { x: 1.0, y: ty, w: 0.5, h: 0.5, fontSize: 18 });
    txt(s, tip.text, { x: 1.6, y: ty, w: 7.5, h: 0.5, fontSize: 13, color: C.white, valign: "middle" });
  });

  // Help
  bar(s, 0.8, 5.15, 8.4, 0.4, C.goldDim);
  txt(s, "Need help?  Visit nexcard.io/support  or  email support@nexcard.io", {
    x: 0.8, y: 5.15, w: 8.4, h: 0.4, fontSize: 11, color: C.gold, align: "center", valign: "middle",
  });

  // ═══════════════════════════════════════════════════════════════════
  // CLOSING
  // ═══════════════════════════════════════════════════════════════════
  s = p.addSlide();
  s.background = { color: C.dark };
  s.addShape("ellipse", { x: 3.5, y: 0.8, w: 3, h: 3, fill: { color: C.goldDim } });
  bar(s, 3.5, 1.8, 3, 0.07, C.gold);
  txt(s, "You're All Set!", { x: 1, y: 2.0, w: 8, h: 1.0, fontSize: 36, bold: true, color: C.white, align: "center" });
  txt(s, "Create your NEX CARD today and share\nyour identity with the world.", {
    x: 1, y: 3.1, w: 8, h: 0.8, fontSize: 14, color: C.gray, align: "center",
  });
  bar(s, 3.8, 4.2, 2.4, 0.5, C.gold);
  txt(s, "nexcard.io", { x: 3.8, y: 4.2, w: 2.4, h: 0.5, fontSize: 16, bold: true, color: C.dark, align: "center" });

  return p;
}

// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const outDir = "C:\\Users\\Nang\\Desktop\\WeGrow\\nex_card";
  console.log("Generating simple User Guide...");
  const pptx = generateSimpleUserGuide();
  await pptx.writeFile({ fileName: `${outDir}\\NEX-CARD-User-Guide-Simple.pptx` });
  console.log("  → NEX-CARD-User-Guide-Simple.pptx");
  console.log("Done!");
}

main().catch(console.error);
