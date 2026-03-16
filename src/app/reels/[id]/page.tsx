import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getReel } from "@/lib/actions";
import { ReelDetailActions } from "./detail-actions";

export const dynamic = "force-dynamic";

const BASE_URL = "https://reelbox-pi.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reel = await getReel(id);
  if (!reel) return {};

  const categories = reel.categories.map(({ category }: { category: { name: string } }) => category.name);
  const tags = reel.tags.map(({ tag }: { tag: { name: string } }) => tag.name);
  const description = [
    categories.length > 0 ? `[${categories.join(", ")}]` : "",
    tags.length > 0 ? tags.join(", ") : "",
    reel.memo || "",
  ].filter(Boolean).join(" · ") || "저장된 릴스";

  return {
    title: description.slice(0, 60),
    description: description.slice(0, 155),
    openGraph: {
      title: description.slice(0, 60),
      description: description.slice(0, 155),
      url: `${BASE_URL}/reels/${id}`,
      type: "article",
      ...(reel.thumbnail ? { images: [{ url: reel.thumbnail, width: 640, height: 640 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: description.slice(0, 60),
      description: description.slice(0, 155),
    },
  };
}

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reel = await getReel(id);
  if (!reel) notFound();

  const categories = reel.categories.map(({ category }: { category: { name: string } }) => category.name);
  const tags = reel.tags.map(({ tag }: { tag: { name: string } }) => tag.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: categories.length > 0 ? categories.join(", ") : "릴스",
    description: reel.memo || undefined,
    url: `${BASE_URL}/reels/${id}`,
    image: reel.thumbnail || undefined,
    datePublished: reel.createdAt.toISOString(),
    dateModified: reel.updatedAt.toISOString(),
    keywords: tags.join(", ") || undefined,
    publisher: {
      "@type": "Organization",
      name: "ReelBox",
      url: BASE_URL,
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <Link href="/" className="text-gray-400">← 뒤로</Link>
        <ReelDetailActions reelId={reel.id} />
      </div>
      <div className="p-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl h-50 flex items-center justify-center mb-5 overflow-hidden">
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
        {reel.categories.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">카테고리</p>
            <div className="flex gap-1.5 flex-wrap">
              {reel.categories.map(({ category }: { category: { id: string; name: string } }) => (
                <span key={category.id} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-xl text-sm">{category.name}</span>
              ))}
            </div>
          </div>
        )}
        {reel.tags.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">태그</p>
            <div className="flex gap-1.5 flex-wrap">
              {reel.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
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
        {reel.review && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">후기</p>
            <div className="bg-gray-800 rounded-xl px-4 py-3.5 text-sm text-gray-300 leading-relaxed">{reel.review}</div>
          </div>
        )}
        <p className="text-xs text-gray-600 text-right">
          저장일: {reel.createdAt.toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}
