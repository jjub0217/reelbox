export function normalizeTagName(input: string): string {
  return input
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function normalizeTagNames(inputs: string[]): string[] {
  return Array.from(
    new Set(inputs.map(normalizeTagName).filter(Boolean))
  );
}
