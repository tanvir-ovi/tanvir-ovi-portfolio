import type { MetadataRoute } from "next";

const SITE_URL = "https://tanvir-hossain-ovi.me";

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
