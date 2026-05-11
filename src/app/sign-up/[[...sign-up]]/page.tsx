import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07040f] bg-[radial-gradient(ellipse_at_top,rgba(189,97,255,0.24),transparent_55%)] px-4">
      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/text-to-speech"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-2xl",
          },
        }}
      />
    </div>
  );
}
