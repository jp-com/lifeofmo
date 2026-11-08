import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/booksellers", "/contact"].map((path) => ({ url: `${siteUrl}${path}` }));
}
