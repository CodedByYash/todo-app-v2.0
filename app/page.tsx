import { Appbar } from "@/components/appbar";
import { signIn, signOut } from "next-auth/react";

export default function Home() {
  return (
    <div>
      <Appbar />
    </div>
  );
}
