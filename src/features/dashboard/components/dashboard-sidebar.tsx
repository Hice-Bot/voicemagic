"use client";

import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import {
  type LucideIcon,
  Home,
  LayoutGrid,
  Volume2,
  Headphones,
  ShieldCheck,
  LogOut,
  Braces,
} from "lucide-react";
import Link from "next/link";
import { BrandGlyph } from "@/components/brand/brand-mark";
import { UsageContainer } from "@/features/billing/components/usage-container";

interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
};

interface NavSectionProps {
  label?: string;
  items: MenuItem[];
  pathname: string;
};

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!!item.url}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
              >
                {item.url ? (
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const handleSignOut = () => {
    // Server-side sign-out: revokes the Clerk session via backend API (avoids
    // iOS/Safari blocking cross-origin cookies to clerk.accounts.dev).
    window.location.href = "/api/sign-out";
  };

  const handleSupportOpen = () => {
    window.dispatchEvent(new Event("voicemagic:support-open"));
  };

  const displayName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.username ||
    "";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const initials = (user?.firstName?.[0] || email[0] || "?").toUpperCase();

  const mainMenuItems: MenuItem[] = [
    {
      title: "Text to speech",
      url: "/text-to-speech",
      icon: Home,
    },
    {
      title: "Explore voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Voice cloning",
      url: "/voice-cloning",
      icon: Volume2,
    },
    {
      title: "API/MCP",
      url: "/api-mcp",
      icon: Braces,
    },
  ];

  const othersMenuItems: MenuItem[] = [
    {
      title: "Help and support",
      onClick: handleSupportOpen,
      icon: Headphones,
    },
  ];

  return (
    <>
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col gap-4 pt-4">
        <div 
        className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
          <BrandGlyph className="size-7 shrink-0 text-[var(--app-brand-soft)]" />
          <span className="group-data-[collapsible=icon]:hidden font-[var(--app-font-display)] text-[20px] font-bold tracking-[-0.02em] text-foreground">
            Voicemagic
          </span>
          <SidebarTrigger className="ml-auto lg:hidden" />
        </div>
      </SidebarHeader>
      <div className="border-b border-dashed border-border" />
      <SidebarContent>
        <NavSection items={mainMenuItems} pathname={pathname} />
        <NavSection
          label="Others"
          items={othersMenuItems}
          pathname={pathname}
        />
      </SidebarContent>
      <div className="border-b border-dashed border-border" />
      <SidebarFooter className="gap-3 py-3">
        <UsageContainer />
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-1">
              <SidebarMenuButton
                asChild
                size="lg"
                tooltip={displayName || "Account"}
                className="h-12 flex-1 min-w-0 px-2 py-2 data-[state=open]:bg-sidebar-accent"
              >
                <Link href="/account">
                  <Avatar className="size-7 shrink-0 rounded-md">
                    {isLoaded && user?.imageUrl && (
                      <AvatarImage src={user.imageUrl} alt={displayName} />
                    )}
                    <AvatarFallback className="rounded-md text-[11px] font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13px] font-medium tracking-tight">
                      {displayName || (isLoaded ? "Signed in" : "Loading…")}
                    </span>
                    {email && email !== displayName && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        {email}
                      </span>
                    )}
                  </div>
                </Link>
              </SidebarMenuButton>
              {isAdmin && (
                <Link
                  href="/admin"
                  title="Admin"
                  className="group-data-[collapsible=icon]:hidden flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <ShieldCheck className="size-4" />
                </Link>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign out"
              className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </>
  );
}
