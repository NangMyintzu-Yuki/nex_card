"use client";

import { useEffect, useState } from "react";

export type PublicWallets = {
  accountName: string;
  KBZPay: string;
  WavePay: string;
  AYAPay: string;
};

const FALLBACK: PublicWallets = {
  accountName: "Shwe Yee Win",
  KBZPay: "09974133003",
  WavePay: "",
  AYAPay: "09974133003",
};

export function usePublicWallets(): PublicWallets {
  const [wallets, setWallets] = useState<PublicWallets>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/wallets")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data) return;
        setWallets({
          accountName: data.accountName || FALLBACK.accountName,
          KBZPay: data.KBZPay || "",
          WavePay: data.WavePay || "",
          AYAPay: data.AYAPay || "",
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return wallets;
}
