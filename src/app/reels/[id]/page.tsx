import Link from "next/link";
import { notFound } from "next/navigation";
import { getReel } from "@/lib/actions";
import { ReelDetailActions } from "./detail-actions";

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reel = await getReel(id);
  if (!reel) notFound();

  return (
    <div>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <Link href="/" className="text-gray-400">← 뒤로</Link>
        <ReelDetailActions reelId={reel.id} />
      </div>
      <div className="p-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl h-[200px] flex items-center justify-center mb-5 overflow-hidden">
          {reel.thumbnail ? (
            <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 text-3xl">🎬</span>
          )}
        </div>
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-pink-600 py-3 rounded-xl text-center text-sm font-semibold mb-6"
        >
          인스타그램에서 보기 ↗
        </a>
        {reel.category && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">카테고리</p>
            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-xl text-sm">{reel.category.name}</span>
          </div>
        )}
        {reel.tags.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">태그</p>
            <div className="flex gap-1.5 flex-wrap">
              {reel.tags.map(({ tag }) => (
                <span key={tag.id} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-xl text-sm">{tag.name}</span>
              ))}
            </div>
          </div>
        )}
        {reel.memo && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">메모</p>
            <div className="bg-gray-800 rounded-xl px-4 py-3.5 text-sm text-gray-300 leading-relaxed">{reel.memo}</div>
          </div>
        )}
        <p className="text-xs text-gray-600 text-right">
          저장일: {reel.createdAt.toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}
