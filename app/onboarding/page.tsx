"use client";

// import OnboardingForm from "@/components/OnboardingForm";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react";

const OnboardingPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <div className="container max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font bold mb-6">Welcome to Todoer</h1>
        <p className="text-lg mb-8">
          Let&apos;s set up your account, {session?.user?.username || ""}.
          we&apos;ll need a few details to get you started
        </p>
        {/* <OnboardingForm
          userId={session?.user?.id}
          userEmail={session?.user?.email}
          userName={session?.user?.username}
        /> */}
      </div>
    </div>
  );
};

export default OnboardingPage;
