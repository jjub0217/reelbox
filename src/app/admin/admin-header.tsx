"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/actions";

export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end px-8 py-3 border-b border-gray-800">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          <span>{email}</span>
          <ChevronDown size={14} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg cursor-pointer"
              >
                <LogOut size={14} />
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
