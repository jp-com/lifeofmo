import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/books/ellas-night-flight", "/booksellers", "/contact"].map((path) => ({ url: `${siteUrl}${path}` }));
}
