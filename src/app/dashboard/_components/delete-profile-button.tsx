// src/app/dashboard/_components/delete-profile-button.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProfileAction,
  type DeleteProfileState,
} from "@/lib/actions/profile-actions";

export function DeleteProfileButton({
  profileId,
  slug,
}: {
  profileId: string;
  slug: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<DeleteProfileState, FormData>(
    deleteProfileAction,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm(
          `Delete /${slug}? This frees the slug for reclaim and cannot be undone.`
        );
        if (!ok) {
          e.preventDefault();
          return;
        }
      }}
      className="inline"
    >
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="confirmation" value="DELETE" />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-semibold text-red-400 hover:underline disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.status === "error" && (
        <span className="ml-2 text-xs text-red-400">{state.message}</span>
      )}
    </form>
  );
}
