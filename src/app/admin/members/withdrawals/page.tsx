import { getWithdrawalStats } from "@/lib/admin-actions";
import { WithdrawalsClient } from "./withdrawals-client";

export const dynamic = "force-dynamic";

export default async function WithdrawalsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1", 10);

  const stats = await getWithdrawalStats({ page });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">탈퇴 관리</h2>
      <WithdrawalsClient
        withdrawals={stats.withdrawals}
        total={stats.total}
        page={stats.page}
        pageSize={stats.pageSize}
        totalPages={stats.totalPages}
      />
    </div>
  );
}
