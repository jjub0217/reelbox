"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/actions";
import { Mail, Film, Star, FolderCog, LogOut, X } from "lucide-react";

export function Sidebar({
  open,
  onClose,
  email,
  totalReels,
  visitedReels,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  totalReels: number;
  visitedReels: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gray-900 border-l border-gray-800 z-50 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
            <span className="text-sm font-semibold text-gray-100">메뉴</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
              <X size={20} />
            </button>
          </div>

          {/* Profile */}
          <div className="px-5 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2.5 text-gray-300">
              <Mail size={16} className="text-gray-500" />
              <span className="text-sm truncate">{email}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 py-4 border-b border-gray-800 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-gray-300">
              <Film size={16} className="text-gray-500" />
              <span className="text-sm">내 릴스 {totalReels}개</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Star size={16} className="text-gray-500" />
              <span className="text-sm">방문 완료 {visitedReels}개</span>
            </div>
          </div>

          {/* Menu */}
          <div className="px-5 py-4 flex-1">
            <Link
              href="/categories"
              onClick={onClose}
              className="flex items-center gap-2.5 text-gray-300 hover:text-gray-100 py-2"
            >
              <FolderCog size={16} className="text-gray-500" />
              <span className="text-sm">카테고리 관리</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="px-5 py-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 text-gray-400 hover:text-red-400 w-full py-2"
            >
              <LogOut size={16} />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
