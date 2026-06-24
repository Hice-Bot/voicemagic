import type { MetadataRoute } from "next";

const BASE_URL = "https://voicemagic.dev";

const publicRoutes = [
  "",
  "/pricing",
  "/about",
  "/contact",
  "/faq",
  "/docs",
  "/privacy",
  "/terms",
  "/acceptable-use",
  "/sitemap",
  "/sign-up",
  "/sign-in",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
