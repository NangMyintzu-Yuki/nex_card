// src/lib/notify/pusher.ts
import Pusher from "pusher";

let _pusher: Pusher | null = null;

export function getPusher(): Pusher | null {
  if (_pusher) return _pusher;
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) return null;
  _pusher = new Pusher({ appId, key, secret, cluster });
  return _pusher;
}

export async function notifySuperAdmin(event: string, data: Record<string, unknown>) {
  const pusher = getPusher();
  if (pusher) {
    try {
      await pusher.trigger("superadmin", event, data);
    } catch (err) {
      console.error("[notify] pusher error:", err);
    }
  }
}
