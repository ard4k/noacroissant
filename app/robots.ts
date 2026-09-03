import { MetadataRoute } from "next";
import { BUSINESS_INFO } from "@/lib/businessConfig";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BUSINESS_INFO.siteUrl;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/*",
          "/mutfak",
          "/mutfak/*",
          "/api/*",
          "/siparis",
          "/siparis/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
