import Link from "next/link";
import { notFound } from "next/navigation";
import { getReel, getCategories } from "@/lib/actions";
import { ReelForm } from "@/components/reel-form";

export const dynamic = "force-dynamic";

export default async function EditReelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reel, categories] = await Promise.all([
    getReel(id),
    getCategories(),
  ]);
  if (!reel) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <Link href={`/reels/${id}`} className="text-gray-400">← 뒤로</Link>
        <h1 className="text-lg font-bold text-purple-100">릴스 수정</h1>
      </div>
      <ReelForm categories={categories} reel={reel} />
    </div>
  );
}
