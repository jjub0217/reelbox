"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-gray-500 hover:text-gray-300 text-xs"
    >
      로그아웃
    </button>
  );
}
