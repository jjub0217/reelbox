import { getWithdrawalStats } from "@/lib/admin-actions";
import { WithdrawalsClient } from "./withdrawals-client";

export const dynamic = "force-dynamic";

export default async function WithdrawalsPage() {
  const stats = await getWithdrawalStats();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">탈퇴 관리</h2>
      <WithdrawalsClient withdrawals={stats.withdrawals} />
    </div>
  );
}
