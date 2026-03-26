const SUPPORTED_INSTAGRAM_PATHS = new Set(["reel", "reels", "p"]);

function normalizeSegment(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

export function normalizeInstagramUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname.endsWith("instagram.com")) {
    return null;
  }

  const segments = parsed.pathname
    .split("/")
    .map(normalizeSegment)
    .filter(Boolean);

  const [kind, shortcode] = segments;
  if (!kind || !shortcode || !SUPPORTED_INSTAGRAM_PATHS.has(kind.toLowerCase())) {
    return null;
  }

  const canonicalKind = kind.toLowerCase() === "reels" ? "reel" : kind.toLowerCase();

  return `https://www.instagram.com/${canonicalKind}/${shortcode}/`;
}

export function isValidInstagramUrl(input: string): boolean {
  return normalizeInstagramUrl(input) !== null;
}
