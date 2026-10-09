import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** /privacidad joins the sitemap once its legal text is approved (noindex until then). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.url}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/funcionalidades`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/demo`, lastModified, changeFrequency: "yearly", priority: 0.6 },
  ];
}
