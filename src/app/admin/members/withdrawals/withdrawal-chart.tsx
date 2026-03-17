"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#a78bfa", "#f87171", "#fbbf24", "#4ade80", "#60a5fa"];

export function WithdrawalReasonChart({ data }: { data: { reason: string; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">탈퇴 사유 분석</h4>
        <div className="h-52 flex items-center justify-center">
          <p className="text-sm text-gray-500">데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
      <h4 className="text-sm font-semibold text-gray-300 mb-4">탈퇴 사유 분석</h4>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="reason"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={false}
              animationDuration={500}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => <span style={{ color: "#d1d5db" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
