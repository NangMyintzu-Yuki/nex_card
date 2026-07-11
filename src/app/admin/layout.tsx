// src/app/admin/layout.tsx
// Admin layout — role-gated, separate sidebar from dashboard

import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, BarChart3, Users, Layers, Settings, ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";

const ADMIN_NAV = [
  { icon: BarChart3, label: "Analytics",  href: "/admin" },
  { icon: Users,     label: "Users",      href: "/admin/users" },
  { icon: Layers,    label: "Templates",  href: "/admin/templates" },
  { icon: Settings,  label: "Settings",   href: "/admin/settings" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      {/* Admin sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-56 flex-col border-r border-white/5 bg-neutral-900 lg:flex z-40">
        <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
            <Sparkles className="h-3.5 w-3.5 text-black" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">PresenceCard</span>
            <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-400">
              ADMIN
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-500 transition-all hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-600 hover:bg-white/5 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-56">
        {children}
      </div>
    </div>
  );
}
