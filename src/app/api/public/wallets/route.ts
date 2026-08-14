// src/app/api/public/wallets/route.ts
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const s = await getSettings();
  return NextResponse.json({
    accountName: s.wallet_account_name,
    KBZPay: s.wallet_kbzpay,
    WavePay: s.wallet_wavepay,
    AYAPay: s.wallet_ayapay,
  });
}
