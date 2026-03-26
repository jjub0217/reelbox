import Link from "next/link";
import { getTags } from "@/lib/actions";
import { TagManager } from "./tag-manager";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <Link href="/" className="text-gray-400" aria-label="뒤로가기">←</Link>
        <h1 className="text-lg font-bold text-purple-100">태그 관리</h1>
      </div>
      <TagManager tags={tags} />
    </div>
  );
}
