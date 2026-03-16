import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/reels/new", "/reels/*/edit", "/categories"],
    },
    sitemap: "https://reelbox-pi.vercel.app/sitemap.xml",
  };
}
