import { MetadataRoute } from "next";
import { BUSINESS_INFO } from "@/lib/businessConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BUSINESS_INFO.siteUrl;
  const releaseDate = new Date("2026-08-31T00:00:00.000Z");

  return [
    {
      url: baseUrl,
      lastModified: releaseDate,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          tr: `${baseUrl}`,
          en: `${baseUrl}?lang=en`,
          de: `${baseUrl}?lang=de`,
          ru: `${baseUrl}?lang=ru`,
          nl: `${baseUrl}?lang=nl`,
          sv: `${baseUrl}?lang=sv`,
          no: `${baseUrl}?lang=no`,
          fi: `${baseUrl}?lang=fi`,
          pl: `${baseUrl}?lang=pl`,
          ar: `${baseUrl}?lang=ar`,
          "x-default": `${baseUrl}`,
        },
      },
    },
  ];
}
