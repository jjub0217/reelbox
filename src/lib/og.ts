import { isValidInstagramUrl } from "./reel-url";

async function extractViaMicrolink(url: string): Promise<string | null> {
  try {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    return data?.data?.image?.url || null;
  } catch {
    return null;
  }
}

async function extractViaOgTags(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      signal: AbortSignal.timeout(5000),
    });

    const html = await response.text();

    const match1 = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    );
    if (match1) return match1[1];

    const match2 = html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );
    return match2?.[1] || null;
  } catch {
    return null;
  }
}

export async function extractThumbnail(url: string): Promise<string | null> {
  if (isValidInstagramUrl(url)) {
    return extractViaMicrolink(url);
  }
  return extractViaOgTags(url);
}
