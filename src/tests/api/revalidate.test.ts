// src/tests/api/revalidate.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/revalidate/route";
import { revalidateTag, revalidatePath } from "next/cache";
import { jsonRequest, readJson } from "./helpers";

describe("POST /api/revalidate", () => {
  const originalSecret = process.env.REVALIDATION_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVALIDATION_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.REVALIDATION_SECRET = originalSecret;
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(jsonRequest("http://localhost/api/revalidate", "POST", {}));
    expect(res.status).toBe(400);
  });

  it("returns 401 for wrong secret", async () => {
    const res = await POST(
      jsonRequest("http://localhost/api/revalidate", "POST", {
        secret: "wrong",
        type: "slug",
        value: "alex",
      })
    );
    expect(res.status).toBe(401);
  });

  it("revalidates by slug", async () => {
    const res = await POST(
      jsonRequest("http://localhost/api/revalidate", "POST", {
        secret: "test-secret",
        type: "slug",
        value: "alex-rivera",
      })
    );

    expect(res.status).toBe(200);
    const body = await readJson<{ revalidated: boolean; type: string }>(res);
    expect(body.revalidated).toBe(true);
    expect(body.type).toBe("slug");
    expect(revalidateTag).toHaveBeenCalledWith("profile:alex-rivera");
    expect(revalidatePath).toHaveBeenCalledWith("/alex-rivera");
  });

  it("revalidates by tag", async () => {
    const res = await POST(
      jsonRequest("http://localhost/api/revalidate", "POST", {
        secret: "test-secret",
        type: "tag",
        value: "templates",
      })
    );

    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("templates");
  });

  it("revalidates by path", async () => {
    const res = await POST(
      jsonRequest("http://localhost/api/revalidate", "POST", {
        secret: "test-secret",
        type: "path",
        value: "/dashboard",
      })
    );

    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
