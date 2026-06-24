"use client";

import { useUser } from "@clerk/nextjs";
import { Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { isLoaded, user } = useUser();
  const handleSupportOpen = () => {
    window.dispatchEvent(new Event("voicemagic:support-open"));
  };

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Nice to see you
        </p>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
          {isLoaded ? (user?.fullName ?? user?.firstName ?? "there") : "..."}
        </h1>
      </div>

      <div className="lg:flex items-center gap-3 hidden">
        <Button variant="outline" size="sm" type="button" onClick={handleSupportOpen}>
          <Headphones />
          <span className="hidden lg:block">Need help?</span>
        </Button>
      </div>

      
    </div>
  );
};
