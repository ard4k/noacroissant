import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://noacroissant.com";
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          tr: `${baseUrl}?lang=tr`,
          en: `${baseUrl}?lang=en`,
          de: `${baseUrl}?lang=de`,
          ru: `${baseUrl}?lang=ru`,
          nl: `${baseUrl}?lang=nl`,
          sv: `${baseUrl}?lang=sv`,
          no: `${baseUrl}?lang=no`,
          fi: `${baseUrl}?lang=fi`,
          pl: `${baseUrl}?lang=pl`,
          ar: `${baseUrl}?lang=ar`,
        },
      },
    },
  ];
}
