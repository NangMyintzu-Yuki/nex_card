// src/app/api/revalidate/route.ts
// POST /api/revalidate — webhook endpoint to purge ISR cache by slug or tag
// Protected by a shared secret token. Used by external systems (CMS, webhooks).

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";

const RevalidateSchema = z.object({
  secret: z.string(),
  type: z.enum(["slug", "tag", "path"]),
  value: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RevalidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const { secret, type, value } = parsed.data;

    // Validate secret
    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ message: "Invalid secret." }, { status: 401 });
    }

    switch (type) {
      case "slug":
        // Purge a specific public profile page
        revalidateTag(`profile:${value}`);
        revalidatePath(`/${value}`);
        return NextResponse.json({
          revalidated: true,
          type: "slug",
          slug: value,
          timestamp: new Date().toISOString(),
        });

      case "tag":
        // Purge by arbitrary tag (e.g. "templates", "admin-stats")
        revalidateTag(value);
        return NextResponse.json({
          revalidated: true,
          type: "tag",
          tag: value,
          timestamp: new Date().toISOString(),
        });

      case "path":
        // Purge a specific Next.js path
        revalidatePath(value);
        return NextResponse.json({
          revalidated: true,
          type: "path",
          path: value,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ message: "Unknown type." }, { status: 400 });
    }
  } catch (error) {
    console.error("[Revalidate API]", error);
    return NextResponse.json(
      { message: "Revalidation failed." },
      { status: 500 }
    );
  }
}
