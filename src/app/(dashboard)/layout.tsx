import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { SupportChatWidget } from "@/lib/supportbot";
import { VOICEMAGIC_SUPPORT_CONFIG } from "@/lib/supportbot/voicemagic-support";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);
  const isAdmin = !!userId && adminIds.includes(userId);

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
      <DashboardSidebar isAdmin={isAdmin} />
      <SidebarInset className="min-h-0 min-w-0">
        <main className="flex min-h-0 flex-1 flex-col">
          {children}
        </main>
      </SidebarInset>
      <SupportChatWidget config={VOICEMAGIC_SUPPORT_CONFIG} />
    </SidebarProvider>
  )
};
