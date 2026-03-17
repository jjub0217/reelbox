"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, deleteAccount } from "@/lib/actions";
import { Mail, Film, Star, FolderCog, KeyRound, LogOut, UserX, X } from "lucide-react";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDeleteAccount() {
    setDeleting(true);
    await deleteAccount();
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
            <Link
              href="/settings/password"
              onClick={onClose}
              className="flex items-center gap-2.5 text-gray-300 hover:text-gray-100 py-2"
            >
              <KeyRound size={16} className="text-gray-500" />
              <span className="text-sm">비밀번호 변경</span>
            </Link>
          </div>

          {/* Logout + Delete Account */}
          <div className="px-5 py-4 border-t border-gray-800 flex flex-col gap-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 text-gray-400 hover:text-red-400 w-full py-2"
            >
              <LogOut size={16} />
              <span className="text-sm">로그아웃</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2.5 text-gray-500 hover:text-red-400 w-full py-2"
            >
              <UserX size={16} />
              <span className="text-sm">회원탈퇴</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-6">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-xs">
            <h3 className="text-base font-semibold mb-2">회원탈퇴</h3>
            <p className="text-sm text-gray-400 mb-1">정말 탈퇴하시겠습니까?</p>
            <p className="text-xs text-gray-500 mb-6">저장된 모든 릴스, 카테고리, 태그가 삭제되며 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-700 py-2.5 rounded-xl text-sm"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-600 py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {deleting ? "탈퇴 중..." : "탈퇴"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
