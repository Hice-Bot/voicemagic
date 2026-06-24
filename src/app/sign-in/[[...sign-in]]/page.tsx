import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PublicFooter } from "@/components/marketing/PublicFooter";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/text-to-speech");
  }

  return (
    <main className="min-h-screen bg-[#07040f] bg-[radial-gradient(ellipse_at_top,rgba(189,97,255,0.24),transparent_55%)]">
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <SignIn
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/text-to-speech"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
            },
          }}
        />
      </div>
      <PublicFooter />
    </main>
  );
}
