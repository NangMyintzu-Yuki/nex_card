// src/lib/observability.ts
// Lightweight error reporting — posts to Sentry ingest when SENTRY_DSN is set

type CaptureContext = Record<string, unknown>;

function parseSentryDsn(dsn: string): {
  publicKey: string;
  host: string;
  projectId: string;
} | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "").split("/")[0];
    if (!publicKey || !projectId) return null;
    return { publicKey, host: url.host, projectId };
  } catch {
    return null;
  }
}

export async function captureException(
  error: unknown,
  context?: CaptureContext
): Promise<void> {
  const err =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown error");

  console.error("[captureException]", err.message, context ?? "");

  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;

  const parsed = parseSentryDsn(dsn);
  if (!parsed) return;

  const payload = {
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: "node",
    level: "error",
    server_name: process.env.NEXT_PUBLIC_APP_URL ?? "nexcard",
    environment: process.env.NODE_ENV ?? "development",
    exception: {
      values: [
        {
          type: err.name,
          value: err.message,
          stacktrace: err.stack
            ? {
                frames: err.stack
                  .split("\n")
                  .slice(1, 20)
                  .map((line) => ({ filename: line.trim() })),
              }
            : undefined,
        },
      ],
    },
    extra: context,
  };

  try {
    const endpoint = `https://${parsed.host}/api/${parsed.projectId}/store/`;
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=nexcard/1.0`,
      },
      body: JSON.stringify(payload),
    });
  } catch (sendErr) {
    console.error("[captureException] failed to send to Sentry", sendErr);
  }
}

export function captureExceptionSync(
  error: unknown,
  context?: CaptureContext
): void {
  void captureException(error, context);
}
