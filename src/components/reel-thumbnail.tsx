"use client";

import { useEffect, useState } from "react";
import { isRejectedThumbnailUrl } from "@/lib/thumbnail-url";

export function ReelThumbnail({
  src,
  alt = "",
  className,
  loading = "lazy",
  fetchPriority = "low",
  iconClassName = "text-gray-500 text-2xl",
  fallbackLabel,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  iconClassName?: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(!src || isRejectedThumbnailUrl(src));

  useEffect(() => {
    setFailed(!src || isRejectedThumbnailUrl(src));
  }, [src]);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-700/90 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <span className={iconClassName}>🎬</span>
        </div>
        {fallbackLabel ? (
          <p className="max-w-[11rem] whitespace-pre-line text-xs leading-relaxed text-gray-300">
            {fallbackLabel}
          </p>
        ) : (
          <p className="text-xs text-gray-300">썸네일이 없습니다</p>
        )}
        </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
