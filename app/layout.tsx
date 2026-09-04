import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/seedData";
import { BUSINESS_INFO } from "@/lib/businessConfig";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-jakarta",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-playfair",
});

const SITE_URL = BUSINESS_INFO.siteUrl;
const DEFAULT_TITLE = "NOA Croissant | Menü";
const DEFAULT_DESC = BUSINESS_INFO.description.tr;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESC,
  applicationName: "NOA Croissant",
  authors: [{ name: "NOA Croissant", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "NOA Croissant",
    "NOA Croissant Alanya",
    "Alanya kruvasan",
    "Alanya croissant",
    "Alanya cafe",
    "Alanya kahve",
    "Alanya tatlı",
    "Alanya kahvaltı",
    "Alanya kruvasan menüsü",
    "Alanya cheesecake",
    "Alanya waffle",
    "croissant Alanya",
    "cafe in Alanya",
    "croissant cafe Alanya",
    "breakfast cafe Alanya",
    "desserts in Alanya",
    "coffee and croissant Alanya",
    "Roll kruvasan",
    "Küp kruvasan",
    "Danish",
    "Amora",
    "San Sebastian cheesecake",
    "specialty coffee Alanya",
    "QR menü",
  ],
  creator: "NOA Croissant",
  publisher: "NOA Croissant",
  category: "Food & Beverage",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "tr": `${SITE_URL}`,
      "en": `${SITE_URL}?lang=en`,
      "de": `${SITE_URL}?lang=de`,
      "ru": `${SITE_URL}?lang=ru`,
      "nl": `${SITE_URL}?lang=nl`,
      "sv": `${SITE_URL}?lang=sv`,
      "no": `${SITE_URL}?lang=no`,
      "fi": `${SITE_URL}?lang=fi`,
      "pl": `${SITE_URL}?lang=pl`,
      "ar": `${SITE_URL}?lang=ar`,
      "x-default": `${SITE_URL}`,
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    url: SITE_URL,
    siteName: "NOA Croissant",
    locale: "tr_TR",
    alternateLocale: ["en_US", "de_DE", "ru_RU", "nl_NL", "sv_SE", "no_NO", "fi_FI", "pl_PL", "ar_AE"],
    type: "website",
    images: [
      {
        url: "/noa-croissant.jpg",
        width: 1200,
        height: 630,
        alt: "NOA Croissant Alanya — Taze Pişirilen Artisan Kruvasan, Tatlı & Nitelikli Kahve",
      },
      {
        url: "/brand/logo.png",
        width: 512,
        height: 512,
        alt: "NOA Croissant Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: ["/noa-croissant.jpg"],
    creator: "@noacroissant",
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=6", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png?v=6",
    apple: [
      { url: "/favicon.png?v=6", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#F8F1EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rich Menu Structure for all active products across active categories
  const menuSections = INITIAL_CATEGORIES
    .filter((cat) => cat.is_active !== false)
    .map((cat) => {
      const items = INITIAL_PRODUCTS.filter(
        (p) => p.category_id === cat.id && p.is_available !== false && p.is_active !== false
      );
      return {
        "@type": "MenuSection",
        name: cat.name,
        hasMenuItem: items.map((prod) => ({
          "@type": "MenuItem",
          name: prod.name,
          description: prod.description,
          image: prod.image_url ? `${SITE_URL}${encodeURI(prod.image_url)}` : `${SITE_URL}/noa-croissant.jpg`,
          offers: {
            "@type": "Offer",
            price: prod.base_price,
            priceCurrency: "TRY",
            availability: "https://schema.org/InStock",
          },
        })),
      };
    })
    .filter((section) => section.hasMenuItem.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": BUSINESS_INFO.schemaTypes,
        "@id": `${SITE_URL}/#bakery`,
        name: BUSINESS_INFO.name,
        legalName: BUSINESS_INFO.legalName,
        description: DEFAULT_DESC,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logo.png`,
        image: `${SITE_URL}/noa-croissant.jpg`,
        servesCuisine: BUSINESS_INFO.servesCuisine,
        priceRange: BUSINESS_INFO.priceRange,
        currenciesAccepted: BUSINESS_INFO.currenciesAccepted,
        paymentAccepted: BUSINESS_INFO.paymentAccepted,
        telephone: BUSINESS_INFO.telephone,
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS_INFO.address.streetAddress,
          postalCode: BUSINESS_INFO.address.postalCode,
          addressLocality: BUSINESS_INFO.address.addressLocality,
          addressRegion: BUSINESS_INFO.address.addressRegion,
          addressCountry: BUSINESS_INFO.address.addressCountry,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: BUSINESS_INFO.geo.latitude,
          longitude: BUSINESS_INFO.geo.longitude,
        },
        openingHoursSpecification: BUSINESS_INFO.openingHoursSpecification,
        sameAs: [BUSINESS_INFO.social.instagram],
        hasMenu: {
          "@type": "Menu",
          name: "NOA Croissant Resmi Menü",
          url: `${SITE_URL}/menu`,
          hasMenuSection: menuSections,
        },
      },
    ],
  };

  return (
    <html lang="tr" className={`${jakarta.variable} ${playfair.variable} bg-[#F8F1EB] m-0 p-0`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Automatic Service Worker Registration for Instant Offline & PWA Caching */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F8F1EB] text-noa-chocolate antialiased selection:bg-noa-caramel selection:text-white m-0 p-0 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
