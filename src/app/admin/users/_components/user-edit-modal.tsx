"use client";

import { useActionState, useRef, useEffect } from "react";
import { Pencil, X, Loader2 } from "lucide-react";
import { adminEditUserAction, type EditUserState } from "@/lib/actions/admin-actions";

interface UserEditModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function UserEditModal({ user }: UserEditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, dispatch, pending] = useActionState<EditUserState, FormData>(
    adminEditUserAction,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
    }
  }, [state.status]);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-blue-500/10"
        style={{ color: "var(--nc-brand)" }}
        title="Edit user"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50"
        style={{
          background: "var(--nc-bg-card)",
          borderColor: "var(--nc-border)",
          width: "min(480px, 90vw)",
        }}
      >
        <form method="dialog" className="absolute right-3 top-3">
          <button
            type="submit"
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: "var(--nc-text-3)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        <div className="p-6">
          <h2
            className="mb-4 text-lg font-bold"
            style={{ color: "var(--nc-text)" }}
          >
            Edit User
          </h2>

          <form action={dispatch} className="space-y-4">
            <input type="hidden" name="userId" value={user.id} />

            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: "var(--nc-text-3)" }}
              >
                Name
              </label>
              <input
                name="name"
                defaultValue={user.name}
                required
                className="nc-input w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: "var(--nc-text-3)" }}
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="nc-input w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: "var(--nc-text-3)" }}
              >
                Role
              </label>
              <select
                name="role"
                defaultValue={user.role}
                className="nc-input w-full rounded-xl px-3 py-2 text-sm"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
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
                disabled={pending}
                className="nc-btn-brand flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
              >
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
