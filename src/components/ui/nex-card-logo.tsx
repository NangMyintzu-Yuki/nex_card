// src/components/ui/nex-card-logo.tsx
// NEX CARD Logo — SVG component matching the uploaded brand images exactly.
// Light mode: white bg, navy/blue gradient (Image 1)
// Dark/gold mode: black bg, gold gradient (Image 2)

"use client";

import { useTheme } from "@/lib/theme/theme-context";

interface NexCardLogoProps {
  size?: number;       // height in px
  showText?: boolean;  // show "NEX CARD" wordmark
  className?: string;
  forceMode?: "light" | "dark"; // override current theme
}

export function NexCardLogo({
  size = 40,
  showText = true,
  className = "",
  forceMode,
}: NexCardLogoProps) {
  const { theme } = useTheme();
  const mode = forceMode ?? theme;
  const isDark = mode === "dark";

  // Color values matching the logos
  const c1 = isDark ? "#c9973a" : "#1a3a6b"; // deep color
  const c2 = isDark ? "#f0c050" : "#2d6eb5"; // mid color
  const c3 = isDark ? "#d4af37" : "#4a9fd4"; // light/accent color
  const gradId = isDark ? "goldGrad" : "navyGrad";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="50%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        </defs>

        {/* NFC signal waves — left side */}
        <path d="M18 35 Q8 50 18 65" stroke={c3} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <path d="M26 28 Q11 50 26 72" stroke={c2} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7"/>

        {/* NFC signal waves — right side */}
        <path d="M82 35 Q92 50 82 65" stroke={c3} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <path d="M74 28 Q89 50 74 72" stroke={c2} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7"/>

        {/* Card frame — rounded square */}
        <rect x="30" y="18" width="40" height="64" rx="10" ry="10"
          stroke={`url(#${gradId})`} strokeWidth="5" fill="none"/>

        {/* QR code pattern — simplified grid */}
        {/* Top-left finder */}
        <rect x="37" y="28" width="10" height="10" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="39" y="30" width="6" height="6" rx="1" fill={isDark ? "#000" : "#fff"}/>
        <rect x="41" y="32" width="2" height="2" fill={`url(#${gradId})`}/>

        {/* Top-right finder */}
        <rect x="53" y="28" width="10" height="10" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="55" y="30" width="6" height="6" rx="1" fill={isDark ? "#000" : "#fff"}/>
        <rect x="57" y="32" width="2" height="2" fill={`url(#${gradId})`}/>

        {/* Bottom-left finder */}
        <rect x="37" y="62" width="10" height="10" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="39" y="64" width="6" height="6" rx="1" fill={isDark ? "#000" : "#fff"}/>
        <rect x="41" y="66" width="2" height="2" fill={`url(#${gradId})`}/>

        {/* Data modules — random-looking QR pattern */}
        {[
          [53,42],[55,42],[59,42],
          [53,44],[57,44],
          [55,46],[57,46],[59,46],
          [37,42],[39,42],[41,42],
          [37,44],[41,44],
          [37,46],[39,46],
          [37,48],[41,48],
          [37,50],[39,50],[41,50],
          [53,48],[55,48],[57,48],
          [53,50],[57,50],[59,50],
          [53,52],[55,52],
          [53,54],[59,54],
          [55,56],[57,56],
          [37,52],[39,52],[41,52],
          [37,54],[39,54],
          [41,56],[43,56],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="2" height="2" fill={`url(#${gradId})`} opacity="0.9"/>
        ))}
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          className="font-black tracking-widest leading-none"
          style={{
            fontSize: size * 0.45,
            background: `linear-gradient(135deg, ${c1}, ${c3})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          NEX CARD
        </span>
      )}
    </div>
  );
}

// Simplified version without theme context — for use in theme-provider itself
export function NexCardLogoStatic({
  size = 40,
  showText = true,
  isDark = false,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  isDark?: boolean;
  className?: string;
}) {
  const c1 = isDark ? "#c9973a" : "#1a3a6b";
  const c2 = isDark ? "#f0c050" : "#2d6eb5";
  const c3 = isDark ? "#d4af37" : "#4a9fd4";
  const gradId = `grad-${isDark ? "d" : "l"}-${size}`;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1}/>
            <stop offset="50%" stopColor={c2}/>
            <stop offset="100%" stopColor={c3}/>
          </linearGradient>
        </defs>
        <path d="M18 35 Q8 50 18 65" stroke={c3} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <path d="M26 28 Q11 50 26 72" stroke={c2} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M82 35 Q92 50 82 65" stroke={c3} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <path d="M74 28 Q89 50 74 72" stroke={c2} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <rect x="30" y="18" width="40" height="64" rx="10" ry="10" stroke={`url(#${gradId})`} strokeWidth="5" fill="none"/>
        <rect x="37" y="28" width="10" height="10" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="39" y="30" width="6" height="6" rx="1" fill={isDark ? "#000" : "#fff"}/>
        <rect x="41" y="32" width="2" height="2" fill={`url(#${gradId})`}/>
        <rect x="53" y="28" width="10" height="10" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="55" y="30" width="6" height="6" rx="1" fill={isDark ? "#000" : "#fff"}/>
        <rect x="57" y="32" width="2" height="2" fill={`url(#${gradId})`}/>
        <rect x="37" y="62" width="10" height="10" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="39" y="64" width="6" height="6" rx="1" fill={isDark ? "#000" : "#fff"}/>
        <rect x="41" y="66" width="2" height="2" fill={`url(#${gradId})`}/>
        {[[53,42],[55,42],[59,42],[53,44],[57,44],[55,46],[57,46],[59,46],[37,42],[39,42],[41,42],[37,44],[41,44],[37,46],[39,46],[37,48],[41,48],[37,50],[39,50],[41,50],[53,48],[55,48],[57,48],[53,50],[57,50],[59,50],[53,52],[55,52],[53,54],[59,54],[55,56],[57,56],[37,52],[39,52],[41,52],[37,54],[39,54],[41,56]].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="2" height="2" fill={`url(#${gradId})`} opacity="0.9"/>
        ))}
      </svg>
      {showText && (
        <span className="font-black tracking-widest leading-none" style={{
          fontSize: size * 0.45,
          background: `linear-gradient(135deg, ${c1}, ${c3})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          NEX CARD
        </span>
      )}
    </div>
  );
}