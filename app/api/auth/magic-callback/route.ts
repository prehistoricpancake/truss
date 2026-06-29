import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    redirect("/magic-verify?error=1");
  }

  try {
    await signIn("credentials", { email, token, redirectTo: "/onboarding" });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/magic-verify?error=1");
    }
    // Re-throw NEXT_REDIRECT so Next.js performs the navigation
    throw err;
  }
}
