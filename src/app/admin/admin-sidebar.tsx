"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  Users,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/generations", label: "Generations", icon: Zap },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/support", label: "Support Chat", icon: MessageCircle },
];

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 border-b border-border bg-sidebar/95 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-60 lg:flex-col lg:border-b-0 lg:border-r lg:bg-sidebar">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:block lg:p-0">
        <Link
          href="/text-to-speech"
          className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:flex lg:rounded-none lg:border-b lg:border-border lg:px-4 lg:py-3"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          <span className="hidden sm:inline lg:inline">Back to dashboard</span>
        </Link>
        <div className="flex items-center gap-2 lg:px-4 lg:py-4">
          <BarChart3 className="size-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Admin</span>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-2 lg:py-3">
        {ADMIN_NAV.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                active && "bg-accent text-foreground shadow-sm"
              )}
            >
              <item.icon className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
