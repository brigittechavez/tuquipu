import { readFileSync } from "node:fs";
import path from "node:path";

const cache = new Map<string, string>();

function load(file: string): string {
  let svg = cache.get(file);
  if (!svg) {
    svg = readFileSync(path.join(process.cwd(), "public", file), "utf8");
    cache.set(file, svg);
  }
  return svg;
}

/**
 * Inlines an approved SVG so its semantic groups (bars, status, check…) can be
 * animated separately. IDs are prefixed per instance to keep the DOM valid.
 * Decorative by default: text around it carries the meaning.
 */
export function InlineSvg({ file, idPrefix, className }: { file: string; idPrefix: string; className?: string }) {
  const markup = load(file)
    .replace(/<title[^>]*>[\s\S]*?<\/title>/g, "")
    .replace(/<desc[^>]*>[\s\S]*?<\/desc>/g, "")
    .replace(/\srole="img"/, "")
    .replace(/\saria-labelledby="[^"]*"/, "")
    .replace(/<svg /, '<svg aria-hidden="true" focusable="false" ')
    .replace(/id="([^"]+)"/g, `id="${idPrefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${idPrefix}-$1)`);
  return <span className={className} dangerouslySetInnerHTML={{ __html: markup }} />;
}
