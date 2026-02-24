import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // User is authenticated, redirect to dashboard
    redirect("/dashboard");
  } else {
    // User is not authenticated, redirect to sign in
    redirect("/auth/signin");
  }
}
