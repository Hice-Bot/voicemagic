"use client";

import { UserProfile } from "@clerk/nextjs";

export function AccountProfilePanel() {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Edit your name, email, password, and connected accounts.
        </p>
      </header>
      <div className="rounded-lg border border-border bg-card p-2">
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none border-0 w-full",
            },
          }}
        />
      </div>
    </section>
  );
}
