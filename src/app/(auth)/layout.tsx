"use client";

import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const { session } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  return (
    <div className="">
      <div className="">{children}</div>
    </div>
  );
};

export default Layout;
