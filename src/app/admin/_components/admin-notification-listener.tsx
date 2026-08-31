// src/app/admin/_components/admin-notification-listener.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface PaymentNotification {
  userName: string;
  userEmail: string;
  tier: string;
  amount: number;
  currency: string;
  profileSlug: string;
  timestamp: number;
}

export function AdminNotificationListener() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    let cancelled = false;

    import("pusher-js").then(({ default: Pusher }) => {
      if (cancelled) return;
      const pusher = new Pusher(key, { cluster });

      const channel = pusher.subscribe("superadmin");
      channel.bind("payment:pending", (data: PaymentNotification) => {
        setNotifications((prev) => [data, ...prev].slice(0, 5));

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("New Payment Pending", {
            body: `${data.userName} — ${data.amount.toLocaleString()} ${data.currency}`,
            icon: "/brand/nexcard-logo.svg",
          });
        }
      });

      return () => {
        pusher.unsubscribe("superadmin");
        pusher.disconnect();
      };
    });

    return () => { cancelled = true; };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-2)" }}
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
          {notifications.length}
        </span>
      </button>

      {show && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border p-3 shadow-2xl"
          style={{ background: "var(--nc-bg-card)", borderColor: "var(--nc-border)" }}
        >
          <p className="mb-2 text-xs font-bold" style={{ color: "var(--nc-text)" }}>
            New Payment Notifications
          </p>
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <a
                key={i}
                href="/admin/payments"
                className="block rounded-lg p-2 transition-colors hover:bg-white/5"
              >
                <p className="text-xs font-semibold" style={{ color: "var(--nc-text)" }}>
                  {n.userName}
                </p>
                <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>
                  {n.amount.toLocaleString()} {n.currency} · {n.tier === "NFC_QR" ? "NFC+QR" : "QR Only"}
                </p>
              </a>
            ))}
          </div>
          <a
            href="/admin/payments"
            className="mt-2 block text-center text-[10px] font-semibold"
            style={{ color: "var(--nc-brand)" }}
          >
            View all payments
          </a>
        </div>
      )}
    </div>
  );
}
