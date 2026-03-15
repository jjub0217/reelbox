import Link from "next/link";
import { ReelWithRelations } from "@/types";

export function ReelCard({ reel }: { reel: ReelWithRelations }) {
  return (
    <Link href={`/reels/${reel.id}`}>
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="bg-gray-700 h-[120px] flex items-center justify-center">
          {reel.thumbnail ? (
            <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 text-2xl">🎬</span>
          )}
        </div>
        <div className="p-3">
          <div className="flex gap-1 flex-wrap">
            {reel.category && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
                {reel.category.name}
              </span>
            )}
            {reel.tags.map(({ tag }) => (
              <span key={tag.id} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px]">
                {tag.name}
              </span>
            ))}
          </div>
          {reel.memo && (
            <p className="text-[11px] text-gray-400 truncate">{reel.memo}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
