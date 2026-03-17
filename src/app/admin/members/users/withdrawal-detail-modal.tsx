"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getWithdrawalDetail } from "@/lib/admin-actions";

interface WithdrawalDetailData {
  id: string;
  email: string;
  reason: string;
  detail: string | null;
  createdAt: string;
}

export function WithdrawalDetailModal({
  withdrawalId,
  onClose,
}: {
  withdrawalId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<WithdrawalDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWithdrawalDetail(withdrawalId).then((result) => {
      setData(result as WithdrawalDetailData | null);
      setLoading(false);
    });
  }, [withdrawalId]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">
              {loading ? "로딩 중..." : data?.email || "탈퇴 회원 상세"}
            </h3>
            <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 rounded-full text-xs">탈퇴</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <p className="text-gray-400 text-center py-8">로딩 중...</p>
          )}
          {!loading && !data && (
            <p className="text-gray-400 text-center py-8">정보를 찾을 수 없습니다</p>
          )}
          {!loading && data && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">이메일</p>
                <p className="text-sm">{data.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">탈퇴 사유</p>
                <p className="text-sm">{data.reason}</p>
              </div>
              {data.detail && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">상세 사유</p>
                  <p className="text-sm text-gray-300">{data.detail}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400 mb-1">탈퇴일</p>
                <p className="text-sm">
                  {new Date(data.createdAt).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
