import { Suspense } from "react";
import { VerifyTwoFactorContent } from "./verify-2fa-content";

export default function VerifyTwoFactorPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-dvh items-center justify-center" style={{ background: "var(--nc-bg)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--nc-border)] border-t-[var(--nc-brand)]" />
      </main>
    }>
      <VerifyTwoFactorContent />
    </Suspense>
  );
}
