"use client";

import { Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const handleSupportOpen = () => {
    window.dispatchEvent(new Event("voicemagic:support-open"));
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b px-4 py-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
         <Button variant="outline" size="sm" type="button" onClick={handleSupportOpen}>
          <Headphones />
          <span className="hidden lg:block">Need help?</span>
        </Button>
      </div>
    </div>
  );
};
