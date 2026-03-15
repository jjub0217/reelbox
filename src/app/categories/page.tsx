import Link from "next/link";
import { getCategories } from "@/lib/actions";
import { CategoryManager } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <Link href="/" className="text-gray-400">← 뒤로</Link>
        <h1 className="text-lg font-bold text-purple-100">카테고리 관리</h1>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
