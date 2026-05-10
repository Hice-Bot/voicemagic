import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, Users, Zap, LayoutDashboard, CreditCard, MessageCircle, ArrowLeft } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/generations", label: "Generations", icon: Zap },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/support", label: "Support Chat", icon: MessageCircle },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);

  if (!userId || !adminIds.includes(userId)) {
    redirect("/text-to-speech");
  }

  return (
    <div className="flex min-h-svh">
      <aside className="w-52 shrink-0 border-r border-border bg-sidebar flex flex-col">
        <Link
          href="/text-to-speech"
          className="flex items-center gap-2 px-4 py-3 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-b border-border"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <BarChart3 className="size-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Admin</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="size-3.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
