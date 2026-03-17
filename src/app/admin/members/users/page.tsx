import { getAdminUsers } from "@/lib/admin-actions";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const status = searchParams.status || "";
  const page = parseInt(searchParams.page || "1", 10);

  const data = await getAdminUsers({ search, status, page });

  return <UsersClient data={data} search={search} status={status} page={page} />;
}
