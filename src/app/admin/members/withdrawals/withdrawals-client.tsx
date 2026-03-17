"use client";

import { useState } from "react";
import { WithdrawalDetailModal } from "../users/withdrawal-detail-modal";

interface WithdrawalRow {
  id: string;
  email: string;
  reason: string;
  detail: string | null;
  createdAt: string;
}

export function WithdrawalsClient({ withdrawals }: { withdrawals: WithdrawalRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">이메일</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">탈퇴 사유</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">탈퇴 상세 사유</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium w-32">탈퇴일</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  탈퇴한 회원이 없습니다
                </td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-100">{w.email}</td>
                  <td className="px-4 py-3 text-gray-300">{w.reason}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.detail || "-"}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(w.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <WithdrawalDetailModal
          withdrawalId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
