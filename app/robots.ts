import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Search engines and AI assistants are welcome (SEO + AEO + GEO): Tu Quipu wants
 * to be found and cited. AI search/answer crawlers are named explicitly so the
 * intent is unambiguous. To keep answers but opt out of model training later,
 * disallow only GPTBot, Google-Extended and ClaudeBot.
 */
const AI_CRAWLERS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // /privacidad stays crawlable so its noindex is seen (blocking it would hide the noindex).
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
