"use client";

import { useActionState, useRef, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { adminDeleteUserAction, type DeleteUserState } from "@/lib/actions/admin-actions";

interface UserDeleteButtonProps {
  userId: string;
  userName: string;
}

export function UserDeleteButton({ userId, userName }: UserDeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmText, setConfirmText] = useState("");
  const [state, dispatch, pending] = useActionState<DeleteUserState, FormData>(
    adminDeleteUserAction,
    { status: "idle" }
  );

  return (
    <>
      <button
        onClick={() => {
          setConfirmText("");
          dialogRef.current?.showModal();
        }}
        className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-red-500/10 text-red-400"
        title="Delete user"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50"
        style={{
          background: "var(--nc-bg-card)",
          borderColor: "var(--nc-border)",
          width: "min(420px, 90vw)",
        }}
      >
        <form method="dialog" className="absolute right-3 top-3">
          <button
            type="submit"
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: "var(--nc-text-3)" }}
          >
            &times;
          </button>
        </form>

        <div className="p-6">
          <h2 className="mb-2 text-lg font-bold text-red-400">Delete User</h2>
          <p className="mb-4 text-sm" style={{ color: "var(--nc-text-2)" }}>
            Are you sure you want to delete <strong>{userName}</strong>? This will
            permanently remove their account and all profiles.
          </p>

          <form action={dispatch} className="space-y-4">
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="confirm" value={confirmText} />

            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: "var(--nc-text-3)" }}
              >
                Type <span className="font-bold text-red-400">DELETE</span> to
                confirm
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="nc-input w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            {state.status === "error" && (
              <p className="text-xs text-red-400">{state.message}</p>
            )}
            {state.status === "success" && (
              <p className="text-xs text-emerald-400">{state.message}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="nc-btn-ghost rounded-xl px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending || confirmText !== "DELETE"}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
