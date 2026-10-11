import type { MetadataRoute } from "next";
import { site } from "@/lib/data";

const SITE_URL = site.seo.siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/research", "/experience", "/about", "/contact"];
  const now = new Date();
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
