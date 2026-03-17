import type { Metadata } from "next";
import { AdminSidebar } from "./admin-nav";

export const metadata: Metadata = {
  title: "Admin | ReelBox",
};

const navItems = [
  { href: "/admin", label: "대시보드", icon: "LayoutDashboard" as const },
  {
    label: "회원 관리",
    icon: "Users" as const,
    children: [
      { href: "/admin/members/users", label: "유저 관리" },
      { href: "/admin/members/withdrawals", label: "탈퇴 관리" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <AdminSidebar items={navItems} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
