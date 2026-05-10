import { redirect } from "next/navigation";

export default function SignInPage() {
  redirect("https://strong-frog-15.clerk.accounts.dev/sign-in");
}
