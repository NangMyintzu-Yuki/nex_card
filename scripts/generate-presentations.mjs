// scripts/generate-presentations.mjs
// Generates two PowerPoint presentations:
// 1. NEX CARD User Guide — detailed walkthrough for end users
// 2. NEX CARD Project Flow — architecture & development overview

import PptxGenJS from "pptxgenjs";

const COLORS = {
  gold: "D4AF37",
  goldLight: "F0C050",
  dark: "0F0F0F",
  darkCard: "1A1A1A",
  darkBorder: "2A2A2A",
  navy: "1E3A8A",
  navyLight: "2D6EB5",
  white: "FFFFFF",
  gray: "888888",
  grayLight: "CCCCCC",
  grayDark: "555555",
  green: "22C55E",
  red: "EF4444",
  blue: "3B82F6",
  purple: "8B5CF6",
  pink: "EC4899",
  cyan: "06B6D4",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function addTitleSlide(pptx, title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  // Gold accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.6, w: 2.0, h: 0.06,
    fill: { color: COLORS.gold },
  });

  slide.addText(title, {
    x: 0.8, y: 1.8, w: 8.4, h: 1.2,
    fontSize: 36, fontFace: "Arial",
    color: COLORS.white, bold: true,
  });

  slide.addText(subtitle, {
    x: 0.8, y: 3.1, w: 8.4, h: 0.6,
    fontSize: 14, fontFace: "Arial",
    color: COLORS.gray,
  });

  slide.addText("NEX CARD", {
    x: 0.8, y: 4.5, w: 4, h: 0.5,
    fontSize: 11, fontFace: "Arial",
    color: COLORS.gold, bold: true,
  });

  return slide;
}

function addSectionSlide(pptx, number, title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  slide.addText(number, {
    x: 0.8, y: 1.2, w: 1.5, h: 1.5,
    fontSize: 60, fontFace: "Arial",
    color: COLORS.gold, bold: true,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 2.8, w: 8.4, h: 0.04,
    fill: { color: COLORS.darkBorder },
  });

  slide.addText(title, {
    x: 0.8, y: 3.0, w: 8.4, h: 0.8,
    fontSize: 28, fontFace: "Arial",
    color: COLORS.white, bold: true,
  });

  slide.addText(subtitle, {
    x: 0.8, y: 3.8, w: 8.4, h: 0.5,
    fontSize: 13, fontFace: "Arial",
    color: COLORS.gray,
  });

  return slide;
}

function addContentSlide(pptx, title, bullets, options = {}) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  // Title bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.9,
    fill: { color: COLORS.darkCard },
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.88, w: 10, h: 0.02,
    fill: { color: COLORS.gold },
  });

  slide.addText(title, {
    x: 0.6, y: 0.15, w: 8.8, h: 0.6,
    fontSize: 18, fontFace: "Arial",
    color: COLORS.white, bold: true,
  });

  // Bullets
  const startY = 1.2;
  const lineH = options.compact ? 0.38 : 0.45;
  const maxBullets = Math.min(bullets.length, options.compact ? 14 : 11);

  for (let i = 0; i < maxBullets; i++) {
    const b = bullets[i];
    const y = startY + i * lineH;

    if (typeof b === "string") {
      slide.addText(`•  ${b}`, {
        x: 0.6, y, w: 8.8, h: lineH,
        fontSize: options.compact ? 11 : 12,
        fontFace: "Arial",
        color: COLORS.grayLight,
        valign: "middle",
      });
    } else {
      // { text, indent, color, bold }
      const indent = b.indent || 0;
      const bulletText = indent > 0 ? `    ${"–".repeat(indent)}  ${b.text}` : `•  ${b.text}`;
      slide.addText(bulletText, {
        x: 0.6, y, w: 8.8, h: lineH,
        fontSize: options.compact ? 11 : (b.fontSize || 12),
        fontFace: "Arial",
        color: b.color || COLORS.grayLight,
        bold: b.bold || false,
        valign: "middle",
      });
    }
  }

  if (bullets.length > maxBullets) {
    slide.addText(`… and ${bullets.length - maxBullets} more`, {
      x: 0.6, y: startY + maxBullets * lineH, w: 8.8, h: 0.35,
      fontSize: 10, fontFace: "Arial",
      color: COLORS.grayDark, italic: true,
    });
  }

  return slide;
}

function addTwoColSlide(pptx, title, leftTitle, leftBullets, rightTitle, rightBullets) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.9,
    fill: { color: COLORS.darkCard },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.88, w: 10, h: 0.02,
    fill: { color: COLORS.gold },
  });
  slide.addText(title, {
    x: 0.6, y: 0.15, w: 8.8, h: 0.6,
    fontSize: 18, fontFace: "Arial",
    color: COLORS.white, bold: true,
  });

  // Left column
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.15, w: 4.2, h: 0.45,
    fill: { color: COLORS.navy },
    rectRadius: 0.05,
  });
  slide.addText(leftTitle, {
    x: 0.7, y: 1.15, w: 3.8, h: 0.45,
    fontSize: 12, fontFace: "Arial",
    color: COLORS.white, bold: true,
    valign: "middle",
  });

  for (let i = 0; i < Math.min(leftBullets.length, 9); i++) {
    slide.addText(`•  ${leftBullets[i]}`, {
      x: 0.7, y: 1.75 + i * 0.4, w: 4.0, h: 0.38,
      fontSize: 11, fontFace: "Arial",
      color: COLORS.grayLight,
      valign: "middle",
    });
  }

  // Divider
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.95, y: 1.2, w: 0.02, h: 3.9,
    fill: { color: COLORS.darkBorder },
  });

  // Right column
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1.15, w: 4.3, h: 0.45,
    fill: { color: COLORS.purple },
    rectRadius: 0.05,
  });
  slide.addText(rightTitle, {
    x: 5.4, y: 1.15, w: 3.9, h: 0.45,
    fontSize: 12, fontFace: "Arial",
    color: COLORS.white, bold: true,
    valign: "middle",
  });

  for (let i = 0; i < Math.min(rightBullets.length, 9); i++) {
    slide.addText(`•  ${rightBullets[i]}`, {
      x: 5.4, y: 1.75 + i * 0.4, w: 4.0, h: 0.38,
      fontSize: 11, fontFace: "Arial",
      color: COLORS.grayLight,
      valign: "middle",
    });
  }

  return slide;
}

function addClosingSlide(pptx, title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  slide.addShape(pptx.ShapeType.rect, {
    x: 3.0, y: 2.0, w: 4.0, h: 0.06,
    fill: { color: COLORS.gold },
  });

  slide.addText(title, {
    x: 1.0, y: 2.2, w: 8.0, h: 1.0,
    fontSize: 32, fontFace: "Arial",
    color: COLORS.white, bold: true,
    align: "center",
  });

  slide.addText(subtitle, {
    x: 1.0, y: 3.3, w: 8.0, h: 0.6,
    fontSize: 13, fontFace: "Arial",
    color: COLORS.gray,
    align: "center",
  });

  slide.addText("NEX CARD", {
    x: 3.5, y: 4.5, w: 3.0, h: 0.5,
    fontSize: 14, fontFace: "Arial",
    color: COLORS.gold, bold: true,
    align: "center",
  });

  return slide;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESENTATION 1: USER GUIDE
// ═══════════════════════════════════════════════════════════════════════════════

function generateUserGuide() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = "NEX CARD — User Guide";
  pptx.author = "NEX CARD Team";

  // ── Title ──
  addTitleSlide(pptx,
    "NEX CARD User Guide",
    "Complete walkthrough for creating, managing, and sharing your digital identity"
  );

  // ── 1. Getting Started ──
  addSectionSlide(pptx, "01", "Getting Started",
    "Account creation, login, and first-time setup"
  );

  addContentSlide(pptx, "Account Registration", [
    'Navigate to www.nexcard.wetechmm.com and click "Get Started Free"',
    "Enter your full name, email address, and password",
    "Verify your email via the confirmation link",
    "You are automatically logged in after verification",
    { text: "No credit card required for the free tier", color: COLORS.green },
  ]);

  addContentSlide(pptx, "Logging In", [
    'Click "Sign In" on the navbar at the top-right of the landing page',
    "Enter your registered email and password",
    "Session is stored as a secure HTTP-only cookie",
    "You are redirected to your Dashboard upon successful login",
    { text: "Sessions expire after a configurable period (default: 30 days)", color: COLORS.grayLight },
  ]);

  addContentSlide(pptx, "Dashboard Overview", [
    { text: "Your central hub after login", bold: true, color: COLORS.gold },
    "View all your created profiles as card tiles",
    "Each card shows: template name, category, publish status, and view count",
    "Draft cards display a semi-transparent \"Draft\" badge overlay",
    "Hover effects: cards lift up (translateY -4px) with enhanced shadow",
    "Staggered fade-in animation on page load (CSS @keyframes staggered-fade-in)",
    "Quick actions per card: Edit, QR Code, Analytics, NFC",
  ]);

  // ── 2. Creating a Profile ──
  addSectionSlide(pptx, "02", "Creating a Profile",
    "Category selection, template choice, and onboarding flow"
  );

  addContentSlide(pptx, "Step 1 — Choose a Category", [
    { text: "Four profile categories available:", bold: true, color: COLORS.gold },
    { text: "Digital Name Card", indent: 1, color: COLORS.cyan },
    "Contact info, social links, vCard, and CTA button",
    { text: "Portfolio", indent: 1, color: COLORS.pink },
    "Projects, skills, experience, education",
    { text: "Business Page", indent: 1, color: COLORS.green },
    "Services, testimonials, hours, gallery, history",
    { text: "Wedding Invitation", indent: 1, color: COLORS.purple },
    "Partners, love story, events, RSVP, gallery",
  ]);

  addContentSlide(pptx, "Step 2 — Pick a Template", [
    { text: "20 premium templates across all categories:", bold: true, color: COLORS.gold },
    "Name Card (5): Aurora, Obsidian, Prism, Coral, Titanium",
    "Portfolio (5): Canvas, Studio, Forge, Spectrum, Blueprint",
    "Business (5): Marquee, District, Empire, Neon, Vault",
    "Wedding (5): Eternal, Blossom, Noir, Celestial, Rustic",
    "Each template has a unique design language and accent color",
    "Preview any template before committing — switch templates anytime",
  ]);

  addContentSlide(pptx, "Step 3 — Fill Your Content", [
    { text: "Use the profile editor to add your details:", bold: true, color: COLORS.gold },
    "Basic info: Full name, job title, company, tagline, bio",
    { text: "Avatar upload: Drag & drop or click to upload (stored locally or Cloudflare R2)", indent: 1 },
    { text: "Accent color: Color picker to personalize your template theme", indent: 1 },
    "Contact fields: Phone, email, address, website, WhatsApp, Viber, Telegram, Skype",
    "Social links: LinkedIn, Twitter/X, GitHub, Instagram, Facebook, YouTube, TikTok, Discord, etc.",
    "Character limits with live counters: X/Y display, red warning at >90% usage",
    "CTA button: Custom label (e.g., \"Call Me\") and URL",
    "Template-specific fields: skills, projects, services, love story, events, gallery",
  ]);

  addContentSlide(pptx, "Step 4 — Publish & Share", [
    { text: "Toggle the \"Publish Now\" switch to make your profile live", bold: true, color: COLORS.green },
    "Your profile becomes accessible at: www.nexcard.wetechmm.com/{your-slug}",
    { text: "Unpublished profiles show \"Profile is a Draft\" page to visitors", indent: 1 },
    "Share via direct link, QR code, or NFC tag",
    "SEO metadata auto-generated from your profile data",
    "Open Graph image auto-generated for social media sharing",
  ]);

  // ── 3. Template Preview System ──
  addSectionSlide(pptx, "03", "Template Preview System",
    "Real-time template switching and live preview"
  );

  addContentSlide(pptx, "How Template Preview Works", [
    { text: "Server-Side Rendering (SSR):", bold: true, color: COLORS.gold },
    "Profile data is fetched from database with caching (1-hour ISR)",
    "Template renderer dynamically imports the correct template component",
    "Safe parsing with fallback defaults — incomplete data does not crash",
    { text: "Client-Side Hydration:", bold: true, color: COLORS.blue },
    "React hydrates the pre-rendered HTML for interactivity",
    "Client components handle: copy, share, save vCard, theme toggle",
    { text: "Only the selected template's JS/CSS is loaded (code splitting via next/dynamic)", indent: 1 },
  ]);

  addContentSlide(pptx, "Available Templates — Name Cards", [
    { text: "Aurora — Soft gradients, rounded cards, modern minimal", color: COLORS.cyan },
    "Best for: Creative professionals, designers",
    { text: "Obsidian — Editorial brutalism, dark, bold, full contact suite", color: COLORS.gold },
    "Best for: Executives, lawyers, architects, senior engineers",
    { text: "Prism — Geometric shapes, vibrant colors, structured layout", color: COLORS.pink },
    { text: "Coral — Warm tones, friendly design, approachable feel", color: COLORS.red },
    { text: "Titanium — Industrial aesthetic, strong typography, metallic accents", color: COLORS.grayLight },
  ]);

  // ── 4. QR Code Management ──
  addSectionSlide(pptx, "04", "QR Code Management",
    "Generate, customize, download, and share your QR codes"
  );

  addContentSlide(pptx, "Generating Your QR Code", [
    "Navigate to Dashboard → your card → QR Code",
    { text: "Click \"Generate QR\" to create a branded QR code for your profile URL", bold: true, color: COLORS.green },
    "Loading spinner shows while the QR image loads",
    "Fade-in animation on successful generation",
    "Bouncing \"QR Generated!\" success badge appears after load",
    { text: "QR codes are cached with timestamp to prevent stale versions", indent: 1 },
  ]);

  addContentSlide(pptx, "Downloading Your QR Code", [
    { text: "Three format options:", bold: true, color: COLORS.gold },
    "PNG — Best for digital use, social media, websites",
    "SVG — Best for print, scalable to any size without quality loss",
    "JPEG — Best for email signatures, lightweight sharing",
    { text: "Filename: nexcard-{yourname}-qr.{format}", color: COLORS.blue },
    "Username is sanitized (special characters removed)",
    "Download triggers immediately — no popup blockers",
  ]);

  // ── 5. Analytics ──
  addSectionSlide(pptx, "05", "Analytics & Insights",
    "Track profile views, QR scans, and engagement"
  );

  addContentSlide(pptx, "Profile Analytics", [
    { text: "Real-time view counter on each dashboard card", bold: true, color: COLORS.gold },
    "View count increments atomically on each profile visit",
    "Background (fire-and-forget) — does not affect page load speed",
    "QR scan count tracked separately from profile views",
    "Analytics page with filters: date range, category, template",
    "Export to Excel (XLSX) with formatted headers and themed buttons",
    { text: "Revenue reporting for premium template sales (admin)", indent: 1 },
  ]);

  // ── 6. NFC Tag Programming ──
  addSectionSlide(pptx, "06", "NFC Tag Programming",
    "Write your profile URL to NFC tags for tap-to-share"
  );

  addContentSlide(pptx, "NFC Tag Setup", [
    "Navigate to Dashboard → your card → NFC",
    "Buy blank NFC tags (NTAG213/215/216 recommended)",
    { text: "Web NFC API writes your profile URL directly to the tag", bold: true, color: COLORS.green },
    "Compatible with most Android devices (Chrome browser required)",
    { text: "iOS: Use the \"NFC Tools\" app to write the URL manually", indent: 1 },
    "Tap your phone on the tag to verify it opens your profile",
    { text: "Supports: URL, text, vCard, and WiFi credentials", indent: 1 },
  ]);

  // ── 7. Theme System ──
  addSectionSlide(pptx, "07", "Theme System",
    "Dark/gold and light/navy dual themes with instant switching"
  );

  addContentSlide(pptx, "Theme Toggle", [
    { text: "Two built-in themes:", bold: true, color: COLORS.gold },
    { text: "Dark Mode (default):", indent: 1, color: COLORS.gold },
    "Black background (#0F0F0F), gold accents (#D4AF37)",
    "CSS variables: --nc-bg, --nc-text, --nc-brand-grad, --nc-shadow, etc.",
    { text: "Light Mode:", indent: 1, color: COLORS.navyLight },
    "White/cream background, navy blue accents (#1E3A8A)",
    "Toggle via theme icon in the navbar (sun/moon icon)",
    { text: "Theme persists across sessions via localStorage", indent: 1 },
    "Theme boot script runs before React hydrates (no flash of wrong theme)",
    "Each page section wraps ThemeProvider independently (layout is Server Component)",
  ]);

  addContentSlide(pptx, "Theme Architecture", [
    { text: "CSS Variable System:", bold: true, color: COLORS.gold },
    { text: "Dark theme: :root { --nc-bg: #0F0F0F; --nc-text: #fff; ... }", indent: 1, color: COLORS.grayLight },
    { text: "Light theme: .nc-light { --nc-bg: #FAFAF8; --nc-text: #111; ... }", indent: 1, color: COLORS.grayLight },
    "ThemeProvider wraps landing page and dashboard independently",
    "useTheme() hook provides { theme, setTheme } to client components",
    { text: "Logo CSS filters:", bold: true, color: COLORS.gold },
    "Dark: brightness(0) invert(1) sepia(1) hue-rotate(10deg) saturate(3)",
    "Light: brightness(0) invert(0.15) saturate(5) hue-rotate(190deg)",
    "Maintenance mode: always dark theme (animated gear, floating orbs)",
  ]);

  // ── 8. Maintenance Mode ──
  addSectionSlide(pptx, "08", "Maintenance Mode",
    "Platform-wide maintenance with admin bypass"
  );

  addContentSlide(pptx, "How Maintenance Mode Works", [
    { text: "Admin enables via: Admin → Settings → Maintenance Mode toggle", bold: true, color: COLORS.gold },
    "Setting stored in data/settings.json (JSON file, not database)",
    "Root layout.tsx reads settings via fs.readFileSync on every request",
    "MaintenanceGuard client component wraps all non-admin children",
    { text: "Non-admin users see the Maintenance Page:", indent: 1, color: COLORS.grayLight },
    "Animated dark page with floating orb particles",
    "Spinning gear icon, fade-in text, pulsing status dot",
    "Progress bar with continuous CSS animation",
    "No user data is accessible during maintenance",
    { text: "Admin users (role: ADMIN) bypass maintenance and see normal site", indent: 1, color: COLORS.green },
  ]);

  // ── 9. Admin Features ──
  addSectionSlide(pptx, "09", "Admin Panel",
    "Platform management, templates, users, and settings"
  );

  addContentSlide(pptx, "Admin Dashboard", [
    { text: "Access: Admin role required (role: ADMIN in database)", bold: true, color: COLORS.gold },
    "Total users, profiles, templates, and revenue summary cards",
    "Recent activity feed with real-time updates",
    { text: "Separate admin sidebar with navigation:", indent: 1 },
    "Dashboard, Users, Templates, Payments, Analytics, Settings, Backups",
    "Admin sidebar is hidden from regular users",
    "Full-screen loading overlay on template save operations",
  ]);

  addContentSlide(pptx, "Admin Templates Management", [
    { text: "Full CRUD operations for templates:", bold: true, color: COLORS.gold },
    "Add new templates with name, category, code identifier, accent color",
    "Toggle template active/inactive status",
    "Template thumbnail preview in admin grid",
    "SubmitButton component shows full-screen loading overlay on save",
    "Uses React useFormStatus for pending state detection",
    { text: "Cache invalidation: purgeTemplateCache() clears template listing cache", indent: 1 },
  ]);

  addContentSlide(pptx, "Admin Settings", [
    { text: "Fully editable platform settings:", bold: true, color: COLORS.gold },
    "Maintenance mode toggle (on/off)",
    "Platform name, contact email, support URL",
    "SMTP configuration for email sending",
    "Payment gateway settings",
    "Changes persist to data/settings.json via API route",
    "Settings API: GET/PUT /api/admin/settings",
    { text: "Read by server component layout for maintenance mode check", indent: 1 },
  ]);

  addContentSlide(pptx, "Revenue Reporting & Database Backups", [
    { text: "Revenue Reporting:", bold: true, color: COLORS.gold },
    "Filters: date range, category, payment status",
    "Data table with sortable columns",
    "Excel export (XLSX) with formatted headers",
    { text: "Database Backups:", bold: true, color: COLORS.gold },
    "SQL dump via prisma db pull → mysqldump equivalent",
    "Gzip compression for smaller file size",
    "Email delivery via Nodemailer (Gmail SMTP)",
    "Download directly from browser",
    { text: "Vercel cron job: weekly Monday 8am UTC auto-backup", indent: 1 },
  ]);

  // ── 10. Legal Pages ──
  addSectionSlide(pptx, "10", "Legal Pages",
    "Privacy Policy, Terms of Service, Cookie Policy"
  );

  addContentSlide(pptx, "Legal Page Structure", [
    { text: "Shared LegalLayout component for consistent styling:", bold: true, color: COLORS.gold },
    "Dark-themed centered content with max-width container",
    "NEX CARD logo header, last updated date, gold accent line",
    "Back to Home link at bottom",
    { text: "Three legal pages:", bold: true, color: COLORS.blue },
    "/legal — Hub page linking to all three policies",
    "/legal/privacy — Privacy Policy (data collection, storage, sharing)",
    "/legal/terms — Terms of Service (acceptable use, payments, liability)",
    "/legal/cookies — Cookie Policy (session cookies, analytics)",
    { text: "Hub page: 3-column card grid with hover effects", indent: 1 },
  ]);

  // ── 11. Landing Page ──
  addSectionSlide(pptx, "11", "Landing Page",
    "Marketing page with features, templates, and social proof"
  );

  addContentSlide(pptx, "Landing Page Sections", [
    { text: "Hero Section:", bold: true, color: COLORS.gold },
    "Gradient glow background, animated badge, headline with gradient text",
    "CTA buttons: Create Your Card (primary) + View Live Demo (secondary)",
    { text: "Features Section:", bold: true, color: COLORS.gold },
    "6 bento-style cards: Digital Name Card, Portfolio, Business, Wedding, QR, NFC",
    "Each card has an SVG icon, hover lift, and gradient accent line",
    { text: "Templates Section:", bold: true, color: COLORS.gold },
    "Category filter pills (All, Name Card, Portfolio, Business, Wedding)",
    "8 template cards with phone mockup preview and shimmer hover effect",
    { text: "Social Proof:", bold: true, color: COLORS.gold },
    "10K+ Users, 50K+ Cards, 99.9% Uptime, 4.9★ Rating",
    "Scroll reveal animations via Intersection Observer",
  ]);

  addContentSlide(pptx, "Scroll Reveal System", [
    { text: "Implementation:", bold: true, color: COLORS.gold },
    "useScrollReveal<T>() — single element fade-in on scroll",
    "useScrollRevealChildren<T>() — staggered children fade-in on scroll",
    "Intersection Observer with threshold: 0.15, rootMargin: '0px 0px -50px 0px'",
    { text: "CSS classes applied:", bold: true, color: COLORS.blue },
    ".sr-item — opacity: 0 → 1, translateY(30px) → 0, transition: 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
    ".sr-stagger — children get sequential 120ms delay via CSS :nth-child",
    ".sr-scale — additional scale(0.95) → scale(1) animation",
    { text: "Trigger: each element animates once when it enters the viewport", indent: 1 },
  ]);

  // ── 12. Error Handling ──
  addSectionSlide(pptx, "12", "Error Handling & Edge Cases",
    "Graceful error boundaries, fallback UIs, and defensive rendering"
  );

  addContentSlide(pptx, "Error Boundaries", [
    { text: "Public Profile Page (/[slug]):", bold: true, color: COLORS.gold },
    "Custom error.tsx with red glow, AlertTriangle icon, Retry button",
    "Shows error.message and error.digest for debugging",
    "Console.error logging in useEffect for server-side visibility",
    { text: "QR Scan Page (/p/[slug]):", bold: true, color: COLORS.gold },
    "Same error boundary pattern with fallback to NEX CARD Home",
    { text: "Profile Not Published:", bold: true, color: COLORS.gold },
    "Draft profiles show custom \"Profile is a Draft\" page (not generic 404)",
    "Links to Edit & Publish and Dashboard",
    { text: "Safe Template Parsing:", bold: true, color: COLORS.gold },
    "safeParseTemplateData() with Zod safeParse — never throws",
    "getDefaultData() spreads raw data over category defaults",
    "Missing fields filled with sensible defaults (empty strings, empty arrays)",
  ]);

  addContentSlide(pptx, "Hydration & SSR Considerations", [
    { text: "Theme boot script:", bold: true, color: COLORS.gold },
    "Runs before React hydration via <script dangerouslySetInnerHTML>",
    "Reads localStorage('nexcard-theme') and sets html class",
    "suppressHydrationWarning on <html> element prevents React warnings",
    { text: "Server Components (default):", bold: true, color: COLORS.blue },
    "page.tsx files — no client JS shipped, DB queries run on server",
    "TemplateRenderer, ProfileJsonLd, LandingPage — all Server Components",
    { text: "Client Components (\"use client\"):", bold: true, color: COLORS.pink },
    "ObsidianNameCard, AuroraNameCard — interactive template components",
    "SocialLinksEditor, QRManager — interactive form/preview components",
    "ThemeProvider, ThemeToggle — browser API access required",
  ]);

  // ── 13. Responsive Design ──
  addSectionSlide(pptx, "13", "Responsive Design",
    "Mobile-first responsive layout across all pages"
  );

  addContentSlide(pptx, "Auth Pages Responsiveness", [
    { text: "Login & Register pages:", bold: true, color: COLORS.gold },
    "Full-width single column on mobile (<640px)",
    "Two-column layout on desktop: form left, branding right",
    "Logo + headline + feature bullets on the branding side",
    "Demo credentials section removed from public pages",
    "Form validation with inline error messages",
    "Loading states with button spinner during submission",
  ]);

  addContentSlide(pptx, "Dashboard & Editor Responsiveness", [
    { text: "Dashboard Grid:", bold: true, color: COLORS.gold },
    "1 column on mobile, 2 on sm, 3 on md, 4 on lg",
    "Sidebar collapses on mobile with hamburger menu",
    "Sidebar hidden on template preview routes (/dashboard/onboarding/preview/*)",
    { text: "Profile Editor:", bold: true, color: COLORS.gold },
    "Two-column layout: form fields left, live preview right",
    "Stacks to single column on mobile",
    "Tabbed sections: Basic Info, Contacts, Social Links, Template Settings",
    { text: "QR Manager:", bold: true, color: COLORS.gold },
    "Centered card layout with QR preview and download options",
    "Format selector: PNG / SVG / JPEG buttons",
  ]);

  // ── 14. Security & Performance ──
  addSectionSlide(pptx, "14", "Security & Performance",
    "Security headers, caching, and optimization strategies"
  );

  addContentSlide(pptx, "Security Headers", [
    { text: "Applied via next.config.ts headers():", bold: true, color: COLORS.gold },
    "X-DNS-Prefetch-Control: on",
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: SAMEORIGIN",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy: camera=(), microphone=(), geolocation=()",
    { text: "Session Management:", bold: true, color: COLORS.gold },
    "HTTP-only cookie (session_token) — not accessible via JavaScript",
    "Server-side session validation via Prisma DB lookup",
    "Automatic session cleanup on expiry or missing user",
  ]);

  addContentSlide(pptx, "Performance Optimizations", [
    { text: "Caching Strategy:", bold: true, color: COLORS.gold },
    "ISR (Incremental Static Regeneration): 1-hour revalidation for published profiles",
    "Tag-based cache invalidation for surgical purge (per-profile, per-user)",
    "Next.js Data Cache with unstable_cache for DB queries",
    { text: "Code Splitting:", bold: true, color: COLORS.gold },
    "Dynamic imports via next/dynamic — only selected template JS is loaded",
    "Template-specific CSS loaded on demand",
    { text: "Image Optimization:", bold: true, color: COLORS.gold },
    "next/image with AVIF/WebP formats, 7-day cache TTL",
    "Remote patterns configured for localhost, R2, Cloudinary, Supabase, CDN",
    { text: "Compression: gzip enabled, poweredByHeader disabled", indent: 1 },
  ]);

  // ── Closing ──
  addClosingSlide(pptx, "Thank You",
    "NEX CARD — Your Digital Identity, Elevated\nwww.nexcard.wetechmm.com"
  );

  return pptx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESENTATION 2: PROJECT FLOW
// ═══════════════════════════════════════════════════════════════════════════════

function generateProjectFlow() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = "NEX CARD — Project Architecture & Flow";
  pptx.author = "NEX CARD Team";

  // ── Title ──
  addTitleSlide(pptx,
    "NEX CARD Project Flow",
    "Architecture overview, tech stack, data flow, and development journey"
  );

  // ── 1. Project Overview ──
  addSectionSlide(pptx, "01", "Project Overview",
    "What NEX CARD is and what it solves"
  );

  addContentSlide(pptx, "What is NEX CARD?", [
    { text: "A platform to create, manage, and share digital identity pages", bold: true, color: COLORS.gold },
    "Users create personalized profiles (name cards, portfolios, business pages, wedding invites)",
    "Each profile gets a unique URL: www.nexcard.wetechmm.com/{slug}",
    "Profiles shareable via QR code, NFC tap, or direct link",
    "20 premium templates with distinct design languages",
    "Target: professionals, businesses, event planners, freelancers",
  ]);

  addTwoColSlide(pptx, "Key Differentiators",
    "What We Offer",
    [
      "20 handcrafted premium templates",
      "QR code generation & download (PNG/SVG/JPEG)",
      "NFC tag programming via Web NFC API",
      "Real-time template preview before publish",
      "Dual theme system (dark/light)",
      "Mobile-first responsive design",
      "vCard download (save contact to phone)",
    ],
    "Problems We Solve",
    [
      "No more exchanging business cards",
      "One link for all your digital presence",
      "QR codes for print materials & events",
      "NFC tap-to-share at conferences",
      "SEO-optimized profile pages",
      "No coding required — visual editor",
      "Revenue tracking for premium templates",
    ]
  );

  // ── 2. Tech Stack ──
  addSectionSlide(pptx, "02", "Tech Stack",
    "Technologies, frameworks, and tools powering the platform"
  );

  addTwoColSlide(pptx, "Core Technologies",
    "Frontend",
    [
      "Next.js 15 App Router (React 19)",
      "TypeScript (strict mode)",
      "Tailwind CSS v4 (utility-first)",
      "pptxgenjs (presentation generation)",
      "lucide-react (icon library)",
      "xlsx (Excel export for admin)",
    ],
    "Backend & Database",
    [
      "Next.js Server Actions",
      "Prisma ORM (MySQL)",
      "Custom session-based auth",
      "Nodemailer (SMTP email)",
      "Cloudflare R2 (file storage)",
      "Vercel (hosting & cron jobs)",
    ]
  );

  addContentSlide(pptx, "Project File Structure", [
    { text: "src/", bold: true, color: COLORS.gold },
    { text: "  app/                  — Next.js App Router pages", indent: 1 },
    { text: "    (auth)/             — Login, register pages", indent: 1 },
    { text: "    admin/              — Admin panel (settings, templates, revenue, backups)", indent: 1 },
    { text: "    dashboard/          — User dashboard (profile cards, editor, QR, NFC, analytics)", indent: 1 },
    { text: "    [slug]/             — Public profile renderer (SSR + client hydration)", indent: 1 },
    { text: "    p/[slug]/           — QR scan landing page", indent: 1 },
    { text: "    legal/              — Privacy, Terms, Cookies pages", indent: 1 },
    { text: "    maintenance/        — Maintenance page (animated, dark)", indent: 1 },
    { text: "  components/           — Reusable UI and template components", indent: 1 },
    { text: "  lib/                  — Utilities, hooks, validators, auth, cache", indent: 1 },
    { text: "  types/                — TypeScript interfaces", indent: 1 },
    { text: "data/                   — settings.json (platform config)", indent: 1 },
    { text: "public/                 — Static assets, brand logos, uploads", indent: 1 },
  ]);

  // ── 3. Data Model ──
  addSectionSlide(pptx, "03", "Database Schema",
    "Prisma models and their relationships"
  );

  addContentSlide(pptx, "Core Database Models", [
    { text: "User:", bold: true, color: COLORS.gold },
    "id, name, email, password, role (ADMIN/USER), status (ACTIVE/INACTIVE), avatarUrl",
    { text: "Session:", bold: true, color: COLORS.gold },
    "sessionToken, userId, expires — HTTP-only cookie auth",
    { text: "Category:", bold: true, color: COLORS.gold },
    "id, name, slug (digital-name-card, portfolio, business-ad, wedding-invitation)",
    { text: "Template:", bold: true, color: COLORS.gold },
    "id, name, codeIdentifier, categoryId, accentColor, thumbnailUrl, isPremium, isActive, pricing fields",
    { text: "UserProfile:", bold: true, color: COLORS.gold },
    "id, userId, slug, categoryId, templateId, dynamicJsonData (JSON), isPublished, viewCount, qrScanCount",
    { text: "Payment:", bold: true, color: COLORS.gold },
    "id, userProfileId, tier, amount, status, screenshotUrl, verifiedBy, verifiedAt",
  ]);

  addContentSlide(pptx, "Data Flow — Profile Creation", [
    { text: "1. User selects category → onboarding flow begins", bold: true, color: COLORS.gold },
    "2. User picks a template from the category's template list",
    "3. Default profile created in DB with templateId, categoryId, and empty dynamicJsonData",
    "4. User is redirected to /dashboard/edit/{slug}",
    "5. Profile editor loads current data from DB",
    "6. User fills fields → real-time preview updates on right panel",
    { text: "7. User clicks Save → Server Action (updateProfile) persists to DB", bold: true, color: COLORS.green },
    "8. Cache invalidated: purgeProfileCache(slug, userId)",
    { text: "9. Profile is now accessible at www.nexcard.wetechmm.com/{slug} (if published)", bold: true, color: COLORS.blue },
  ]);

  addContentSlide(pptx, "Data Flow — Profile Viewing", [
    { text: "1. Visitor navigates to www.nexcard.wetechmm.com/{slug}", bold: true, color: COLORS.gold },
    "2. [slug]/page.tsx Server Component executes",
    "3. getProfileBySlug(slug) checks ISR cache first",
    { text: "4. If cache hit → returns cached data (no DB query)", indent: 1, color: COLORS.green },
    { text: "5. If cache miss → queries DB, caches for 1 hour", indent: 1, color: COLORS.blue },
    "6. Profile data passed to TemplateRenderer as props",
    "7. safeParseTemplateData() validates and normalizes data with Zod",
    "8. TemplateRenderer selects correct template via switch statement",
    "9. Dynamic import loads only the selected template's JS chunk",
    { text: "10. SSR produces full HTML → client hydrates for interactivity", bold: true, color: COLORS.gold },
  ]);

  // ── 4. Authentication Flow ──
  addSectionSlide(pptx, "04", "Authentication Flow",
    "Session-based authentication without third-party libraries"
  );

  addContentSlide(pptx, "Registration Flow", [
    "1. User submits name, email, password on /register",
    "2. Server Action validates input with Zod",
    "3. Password hashed with bcrypt (salt rounds: 12)",
    "4. User record created in database",
    "5. Session record created with token and expiry",
    "6. session_token cookie set (HTTP-only, Secure, SameSite=Lax)",
    "7. User redirected to /dashboard",
    { text: "No email verification required (can be added)", color: COLORS.grayLight },
  ]);

  addContentSlide(pptx, "Login & Session Management", [
    "1. User submits email + password on /login",
    "2. Server Action looks up user by email",
    "3. Password verified with bcrypt.compare()",
    "4. Existing sessions for user cleared (single-session policy)",
    "5. New session record created",
    "6. session_token cookie set with configurable expiry",
    { text: "Session Validation (on every request):", bold: true, color: COLORS.gold },
    "getServerSession() reads session_token from cookies",
    "Queries Session table with user join",
    "Validates: token exists, not expired, user status = ACTIVE",
    "Returns null if invalid → cookie cleared automatically",
  ]);

  // ── 5. Template System ──
  addSectionSlide(pptx, "05", "Template Rendering System",
    "How templates are loaded, parsed, and rendered"
  );

  addContentSlide(pptx, "Template Rendering Pipeline", [
    { text: "Server Side:", bold: true, color: COLORS.gold },
    "1. TemplateRenderer receives: categorySlug, templateCode, dynamicJsonData, accentColor",
    "2. safeParseTemplateData() runs Zod schema validation",
    "3. If valid → parsed data used; if invalid → getDefaultData() fallback",
    "4. Switch on categorySlug renders DigitalNameCardSwitch / PortfolioSwitch / etc.",
    { text: "5. Switch on templateCode selects exact template component", indent: 1 },
    { text: "Client Side:", bold: true, color: COLORS.blue },
    "6. next/dynamic() lazy-loads only the selected template chunk",
    "7. React hydrates the pre-rendered HTML",
    "8. useState, onClick handlers activate for interactivity",
    { text: "9. Image component optimizes avatar on-demand (next/image)", indent: 1 },
  ]);

  addContentSlide(pptx, "Zod Validation Schemas", [
    { text: "DigitalNameCardSchema:", bold: true, color: COLORS.gold },
    "fullName (required), jobTitle, company, bio, tagline, avatarUrl, accentColor",
    "contacts: array of { type: enum, value: string, label }",
    "socialLinks: array of { platform: enum, url: string, label }",
    "ctaLabel, ctaUrl, skills, featuredQuote",
    { text: "PortfolioSchema:", bold: true, color: COLORS.pink },
    "fullName, headline, bio, avatarUrl, resumeUrl",
    "projects: array of { title, description, techStack, liveUrl, imageUrl }",
    "experience, education, skills, testimonials, socialLinks, contacts",
    { text: "BusinessAdSchema:", bold: true, color: COLORS.green },
    "businessName, tagline, description, logoUrl, heroImageUrl",
    "services, testimonials, businessHours, gallery, history",
    { text: "WeddingInvitationSchema:", bold: true, color: COLORS.purple },
    "partner1, partner2 (each: name, title), weddingDate, venue",
    "events, loveHistory, gallery, rsvpConfig, dressCode, giftRegistry",
  ]);

  // ── 6. Caching Strategy ──
  addSectionSlide(pptx, "06", "Caching Strategy",
    "Multi-layer caching for performance"
  );

  addContentSlide(pptx, "Cache Layers", [
    { text: "Layer 1 — Next.js Data Cache (ISR):", bold: true, color: COLORS.gold },
    "Published profiles: 1-hour revalidation",
    "Draft profiles: bypass cache (owners see live edits)",
    "Cache key: profile-by-slug:{slug}",
    { text: "Layer 2 — Tag-Based Revalidation:", bold: true, color: COLORS.blue },
    "profile:{slug} — invalidated on profile save",
    "user-profiles:{userId} — invalidated on profile save",
    "admin-stats — invalidated on profile view",
    "templates, categories — invalidated on admin template changes",
    { text: "Layer 3 — Browser Cache:", bold: true, color: COLORS.green },
    "/_next/static/* — immutable, 1-year cache",
    "/uploads/* — public, 1-day cache, stale-while-revalidate 7 days",
  ]);

  // ── 7. Admin Workflow ──
  addSectionSlide(pptx, "07", "Admin Workflow",
    "Platform administration and monitoring"
  );

  addContentSlide(pptx, "Admin Access & Navigation", [
    { text: "Access Control:", bold: true, color: COLORS.gold },
    "getServerSession() checks user.role === 'ADMIN'",
    "Admin layout wraps with admin sidebar",
    "Non-admin users redirected to /dashboard",
    { text: "Admin Sidebar Navigation:", bold: true, color: COLORS.gold },
    "Dashboard — overview stats and activity",
    "Users — manage user accounts and roles",
    "Templates — add, edit, activate/deactivate templates",
    "Payments — review payment screenshots and verify",
    "Analytics — revenue reporting with Excel export",
    "Settings — platform config (maintenance mode, SMTP, etc.)",
    "Backups — database dump, email, and download",
  ]);

  addContentSlide(pptx, "Revenue Reporting System", [
    { text: "Data Sources:", bold: true, color: COLORS.gold },
    "Payment records from database",
    "User profiles with payment status",
    "Template pricing tiers (QR-only, NFC-card, NFC+QR)",
    { text: "Export Feature:", bold: true, color: COLORS.gold },
    "xlsx library generates formatted Excel files",
    "Columns: Date, User, Profile, Template, Tier, Amount, Status",
    "Themed export button (nc-btn-brand for light/dark mode)",
    { text: "Filters:", bold: true, color: COLORS.blue },
    "Date range picker, category dropdown, status filter",
    "Summary cards: total revenue, pending, approved, rejected",
  ]);

  // ── 8. Development Journey ──
  addSectionSlide(pptx, "08", "Development Journey",
    "Key milestones and iterations"
  );

  addContentSlide(pptx, "Phase 1 — Foundation", [
    { text: "Core platform setup:", bold: true, color: COLORS.gold },
    "Next.js 15 App Router + TypeScript + Tailwind CSS",
    "Prisma schema design with MySQL database",
    "Custom session-based authentication system",
    "20 template components (5 per category)",
    "Public profile rendering with SSR and ISR",
    "Template switching engine with dynamic imports",
    "Zod validation schemas for all profile types",
  ]);

  addContentSlide(pptx, "Phase 2 — Landing & Branding", [
    { text: "Landing page redesign:", bold: true, color: COLORS.gold },
    "Full marketing page with 6 sections",
    "Scroll reveal animations (Intersection Observer)",
    "Legal pages hub with shared layout",
    "Brand assets: nex-qr-icon.png, nex-qr-full.png",
    "Logo system with CSS filters for theme-aware coloring",
    '"NEX CARD" text with solid theme-aware color',
    "Favicon, apple-touch-icon, and manifest.webmanifest",
  ]);

  addContentSlide(pptx, "Phase 3 — Admin & Operations", [
    { text: "Admin panel features:", bold: true, color: COLORS.gold },
    "Revenue reporting with Excel export",
    "Database backup system (SQL dump + gzip + email)",
    "Admin settings page (JSON file persistence)",
    "Maintenance mode (server-component read + client guard)",
    "Admin templates management with loading overlay",
    { text: "Maintenance page: animated dark page with orbs and gear", indent: 1 },
    { text: "Auth pages: responsive with demo credentials removed", indent: 1 },
  ]);

  addContentSlide(pptx, "Phase 4 — Polish & Bug Fixes", [
    { text: "Profile editor improvements:", bold: true, color: COLORS.gold },
    "Character limits with live counters (X/Y)",
    "Viber + Discord social platforms added",
    "QR generation: loading spinner, cache-busting, success badge",
    "QR download: nexcard-{username}-qr.{format} filename",
    "Pronouns field removed from schema, templates, and editor",
    { text: "Dashboard card animations:", bold: true, color: COLORS.gold },
    "Staggered fade-in, hover lift, enhanced shadow",
    "Template thumbnails scale 110% on hover",
    { text: "Bug fixes:", bold: true, color: COLORS.gold },
    "Export Excel button light-mode color fix",
    "Template renderer: safeParseTemplateData (crash-proof)",
    "next.config.ts: localhost added to image remotePatterns",
    "Profile page: draft shows custom page instead of 404",
    "Landing page: logged-in users → dashboard redirect",
  ]);

  // ── 9. Deployment ──
  addSectionSlide(pptx, "09", "Deployment & Infrastructure",
    "Hosting, CI/CD, and operational considerations"
  );

  addContentSlide(pptx, "Deployment Architecture", [
    { text: "Hosting: Vercel (serverless functions + edge network)", bold: true, color: COLORS.gold },
    "Output mode: standalone (Docker-compatible)",
    { text: "Database: MySQL (managed service)", bold: true, color: COLORS.gold },
    "Prisma Client with connection pooling",
    "Migrations via prisma migrate deploy",
    { text: "File Storage: Cloudflare R2 (S3-compatible)", bold: true, color: COLORS.gold },
    "Avatar uploads, template thumbnails, payment screenshots",
    "CDN: cdn.www.nexcard.wetechmm.com for production assets",
    { text: "Email: Gmail SMTP via Nodemailer", bold: true, color: COLORS.gold },
    "Backup delivery, password reset, notifications",
    { text: "Cron: Vercel Cron Jobs", bold: true, color: COLORS.gold },
    "Weekly Monday 8am UTC database backups",
  ]);

  addContentSlide(pptx, "Environment Variables", [
    { text: "Required Environment Variables:", bold: true, color: COLORS.gold },
    "DATABASE_URL — MySQL connection string",
    "NEXT_PUBLIC_APP_URL — Base URL (https://www.nexcard.wetechmm.com)",
    "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — Email config",
    "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY — File storage",
    "R2_BUCKET_NAME — Cloudflare R2 bucket",
    "SESSION_SECRET — Session token signing key",
    { text: "Optional:", bold: true, color: COLORS.blue },
    "VERCEL_CRON_SECRET — Protects cron endpoint",
    "BACKUP_EMAIL — Where database dumps are sent",
  ]);

  // ── 10. Future Roadmap ──
  addSectionSlide(pptx, "10", "Future Roadmap",
    "Planned features and improvements"
  );

  addContentSlide(pptx, "Planned Features", [
    { text: "Tier 1 — High Priority:", bold: true, color: COLORS.gold },
    "Email verification on registration",
    "Password reset flow",
    "Custom domain support (yourname.com → your profile)",
    { text: "Tier 2 — Medium Priority:", bold: true, color: COLORS.blue },
    "Team accounts (multiple users per organization)",
    "Template marketplace (user-submitted templates)",
    "A/B testing for template conversion rates",
    "Multi-language support (i18n)",
    { text: "Tier 3 — Nice to Have:", bold: true, color: COLORS.purple },
    "AI-powered content generation for bios and descriptions",
    "Animation presets for profile pages",
    "Integration with Google Analytics / Plausible",
    "Contact form with spam protection",
    "Calendar integration for wedding RSVPs",
  ]);

  // ── Closing ──
  addClosingSlide(pptx, "Questions?",
    "NEX CARD — Your Digital Identity, Elevated\nwww.nexcard.wetechmm.com | Built with Next.js, Prisma, and Tailwind CSS"
  );

  return pptx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const outDir = "C:\\Users\\Nang\\Desktop\\WeGrow\\nex_card";

  console.log("Generating User Guide...");
  const userGuide = generateUserGuide();
  await userGuide.writeFile({ fileName: `${outDir}\\NEX-CARD-User-Guide.pptx` });
  console.log("  → NEX-CARD-User-Guide.pptx");

  console.log("Generating Project Flow...");
  const projectFlow = generateProjectFlow();
  await projectFlow.writeFile({ fileName: `${outDir}\\NEX-CARD-Project-Flow.pptx` });
  console.log("  → NEX-CARD-Project-Flow.pptx");

  console.log("Done!");
}

main().catch(console.error);
