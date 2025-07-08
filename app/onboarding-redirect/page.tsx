"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user && (session.user as any).isNewUser) {
      router.replace("/onboarding");
    } else {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  return <div>Redirecting...</div>;
}
