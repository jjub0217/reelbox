import { getAdminUsers } from "@/lib/admin-actions";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1", 10);

  const data = await getAdminUsers({ search, page });

  return <UsersClient data={data} search={search} page={page} />;
}
