import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/siparis/"],
        disallow: [
          "/admin",
          "/admin/*",
          "/mutfak",
          "/mutfak/*",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://noacroissant.com/sitemap.xml",
    host: "https://noacroissant.com",
  };
}
