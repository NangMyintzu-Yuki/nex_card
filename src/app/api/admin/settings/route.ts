// src/app/api/admin/settings/route.ts — GET/PUT platform settings
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { getSettings, updateSettings, SettingsSchema } from "@/lib/settings";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const partial = SettingsSchema.partial().safeParse(body);
  if (!partial.success) {
    return NextResponse.json(
      { error: partial.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  try {
    const updated = await updateSettings(partial.data);
    await writeAuditLog({
      actorId: session.user.id,
      action: "settings.update",
      targetType: "SystemSetting",
      targetId: "platform",
      meta: partial.data,
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 }
    );
  }
}
