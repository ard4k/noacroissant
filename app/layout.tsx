import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/seedData";

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

const SITE_URL = "https://noacroissant.com";
const SITE_TITLE = "NOA Croissant | Menü";
const SITE_DESC =
  "Günlük taze pişirilen çıtır Fransız kruvasanları, Belçika çikolatalı özel tatlılar, doyurucu tuzlu menüler, waffle ve 3. nesil aromalı kahveler. Masadan temassız QR sipariş deneyimi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESC,
  applicationName: "NOA Croissant",
  authors: [{ name: "NOA Croissant", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "NOA Croissant",
    "NOA",
    "kruvasan",
    "croissant",
    "Alanya kruvasan",
    "tatlı kruvasan",
    "tuzlu kruvasan",
    "Belçika çikolatası",
    "Antep fıstıklı kruvasan",
    "çilekli kruvasan",
    "Twissy",
    "Danish",
    "Roll kruvasan",
    "Küp kruvasan",
    "Amora kruvasan",
    "Cheesecake",
    "Limonlu cheesecake",
    "Lotus cheesecake",
    "Waffle",
    "Bardakta waffle",
    "Waffle kova",
    "üçüncü nesil kahve",
    "specialty coffee",
    "latte",
    "mocha",
    "karamel macchiato",
    "QR menü",
    "temassız sipariş",
    "bakery",
    "patisserie",
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
      "tr-TR": `${SITE_URL}?lang=tr`,
      "en-US": `${SITE_URL}?lang=en`,
      "de-DE": `${SITE_URL}?lang=de`,
      "ru-RU": `${SITE_URL}?lang=ru`,
      "nl-NL": `${SITE_URL}?lang=nl`,
      "sv-SE": `${SITE_URL}?lang=sv`,
      "no-NO": `${SITE_URL}?lang=no`,
      "fi-FI": `${SITE_URL}?lang=fi`,
      "pl-PL": `${SITE_URL}?lang=pl`,
      "ar-AE": `${SITE_URL}?lang=ar`,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: "NOA Croissant",
    locale: "tr_TR",
    alternateLocale: ["en_US", "de_DE", "ru_RU", "nl_NL", "sv_SE", "no_NO", "fi_FI", "pl_PL", "ar_AE"],
    type: "website",
    images: [
      {
        url: "/Noa%20Croissant.jpg",
        width: 1200,
        height: 800,
        alt: "NOA Croissant — Taze Pişirilen Artisan Kruvasan & Kahve",
      },
      {
        url: "/brand/logo.png",
        width: 800,
        height: 600,
        alt: "NOA Croissant Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/Noa%20Croissant.jpg"],
    creator: "@noacroissant",
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=5", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png?v=5",
    apple: [
      { url: "/favicon.png?v=5", sizes: "512x512", type: "image/png" },
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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F8F1EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rich Menu Structure for all 104 products across 15 categories
  const menuSections = INITIAL_CATEGORIES.map((cat) => {
    const items = INITIAL_PRODUCTS.filter((p) => p.category_id === cat.id);
    return {
      "@type": "MenuSection",
      name: cat.name,
      hasMenuItem: items.map((prod) => ({
        "@type": "MenuItem",
        name: prod.name,
        description: prod.description,
        image: prod.image_url ? `${SITE_URL}${encodeURI(prod.image_url)}` : `${SITE_URL}/Noa%20Croissant.jpg`,
        offers: {
          "@type": "Offer",
          price: prod.base_price,
          priceCurrency: "TRY",
          availability: "https://schema.org/InStock",
        },
        suitableForDiet: "https://schema.org/HalalDiet",
      })),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Bakery",
        "@id": `${SITE_URL}/#bakery`,
        name: "NOA Croissant",
        description: SITE_DESC,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logo.png`,
        image: `${SITE_URL}/Noa%20Croissant.jpg`,
        servesCuisine: ["French", "Bakery", "Desserts", "Specialty Coffee"],
        priceRange: "₺₺",
        currenciesAccepted: "TRY",
        paymentAccepted: "Cash, Credit Card, Contactless",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Alanya",
          addressRegion: "Antalya",
          addressCountry: "TR",
        },
        hasMenu: {
          "@type": "Menu",
          name: "NOA Croissant Resmi Menü",
          url: `${SITE_URL}/#menu`,
          hasMenuSection: menuSections,
        },
      },
    ],
  };

  return (
    <html lang="tr" className={`${jakarta.variable} ${playfair.variable} bg-[#F8F1EB] m-0 p-0`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png?v=5" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png?v=5" />
        <link rel="apple-touch-icon" href="/favicon.png?v=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Automatic Service Worker Registration for Instant Offline & PWA Caching */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
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
