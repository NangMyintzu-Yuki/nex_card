import { DM_Sans, IBM_Plex_Sans } from "next/font/google";

export const districtDisplay = DM_Sans({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-district-display",
});

export const districtBody = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-district-body",
});
