export interface ProductImageMeta {
  src: string;
  alt: string;
  objectPosition?: string;
  variantImages?: Record<string, string>;
}

// Central typed image registry matching all public/ assets in clean kebab-case
export const PRODUCT_IMAGES: Record<string, ProductImageMeta> = {
  // Danish Kruvasanlar
  "limonlu-danish": {
    src: "/limonlu-danish.jpg",
    alt: "Limonlu Danish",
    objectPosition: "center",
  },
  "cilekli-danish": {
    src: "/cilekli-danish.jpg",
    alt: "Çilekli Danish",
    objectPosition: "center",
  },
  "yaban-mersinli-danish": {
    src: "/yaban-mersinli-danish.jpg",
    alt: "Yaban Mersinli Danish",
    objectPosition: "center",
  },
  "orman-meyveli-danish": {
    src: "/orman-meyveli-danish.jpg",
    alt: "Orman Meyveli Danish",
    objectPosition: "center",
  },
  "frambuazli-danish": {
    src: "/frambuazli-danish.jpg",
    alt: "Frambuazlı Danish",
    objectPosition: "center",
  },
  "mangolu-danish": {
    src: "/mangolu-danish.jpg",
    alt: "Mangolu Danish",
    objectPosition: "center",
  },

  // Amora Çeşitleri
  "sutlu-amora": {
    src: "/sutlu-amora.jpg",
    alt: "Sütlü Belçika Çikolatalı Amora",
    objectPosition: "center",
  },
  "bitter-amora": {
    src: "/bitter-amora.jpg",
    alt: "Bitter Çikolatalı Amora",
    objectPosition: "center",
  },
  "beyaz-amora": {
    src: "/beyaz-belcika-cikolatali-amora.jpg",
    alt: "Beyaz Belçika Çikolatalı Amora",
    objectPosition: "center",
  },
  "amora": {
    src: "/sutlu-amora.jpg",
    alt: "Amora Kalp Kruvasan",
    objectPosition: "center",
    variantImages: {
      "Sütlü": "/sutlu-amora.jpg",
      "Bitter": "/bitter-amora.jpg",
      "Beyaz": "/beyaz-belcika-cikolatali-amora.jpg",
    },
  },

  // Roll Kruvasan Çeşitleri
  "sutlu-roll-kruvasan": {
    src: "/sutlu-roll-kruvasan.jpg",
    alt: "Sütlü Çikolatalı Roll Kruvasan",
    objectPosition: "center",
  },
  "bitter-roll-kruvasan": {
    src: "/bitter-roll-kruvasan.jpg",
    alt: "Bitter Çikolatalı Roll Kruvasan",
    objectPosition: "center",
  },
  "beyaz-roll-kruvasan": {
    src: "/beyaz-cikolata-roll-kruvasan.jpg",
    alt: "Beyaz Çikolatalı Roll Kruvasan",
    objectPosition: "center",
  },
  "roll-kruvasan": {
    src: "/sutlu-roll-kruvasan.jpg",
    alt: "Roll Kruvasan",
    objectPosition: "center",
    variantImages: {
      "Sütlü": "/sutlu-roll-kruvasan.jpg",
      "Bitter": "/bitter-roll-kruvasan.jpg",
      "Beyaz": "/beyaz-cikolata-roll-kruvasan.jpg",
    },
  },

  // Küp Kruvasan Çeşitleri
  "sutlu-kup-kruvasan": {
    src: "/sutlu-kup-kruvasan.jpg",
    alt: "Sütlü Çikolatalı Küp Kruvasan",
    objectPosition: "center",
  },
  "bitter-kup-kruvasan": {
    src: "/bitter-kup-kruvasan.jpg",
    alt: "Bitter Çikolatalı Küp Kruvasan",
    objectPosition: "center",
  },
  "beyaz-kup-kruvasan": {
    src: "/beyaz-cikolata-kup-kruvasan.jpg",
    alt: "Beyaz Çikolatalı Küp Kruvasan",
    objectPosition: "center",
  },
  "kup-kruvasan": {
    src: "/sutlu-kup-kruvasan.jpg",
    alt: "Küp Kruvasan",
    objectPosition: "center",
    variantImages: {
      "Sütlü": "/sutlu-kup-kruvasan.jpg",
      "Bitter": "/bitter-kup-kruvasan.jpg",
      "Beyaz": "/beyaz-cikolata-kup-kruvasan.jpg",
    },
  },

  // Twissy Çeşitleri
  "limonlu-twissy": {
    src: "/limonlu-twissy.jpg",
    alt: "Limonlu Twissy",
    objectPosition: "center",
  },
  "antep-fistikli-twissy": {
    src: "/antep-fistikli-twissy.jpg",
    alt: "Antep Fıstıklı Twissy",
    objectPosition: "center",
  },
  "cikolatali-twissy": {
    src: "/sutlu-belcika-cikolatali-twissy.jpg",
    alt: "Sütlü Belçika Çikolatalı Twissy",
    objectPosition: "center",
  },

  // Klasik & Tatlı Kruvasanlar
  "sade-kruvasan": {
    src: "/noa-klasik.jpg",
    alt: "Sade Kruvasan",
    objectPosition: "center",
  },
  "antep-fistikli": {
    src: "/antep-fistikli.jpg",
    alt: "Antep Fıstıklı Kruvasan",
    objectPosition: "center",
  },
  "cilekli-muzlu-kremali": {
    src: "/cilekli-muzlu-kremali-kruvasan.jpg",
    alt: "Çilekli Muzlu Kremalı Kruvasan",
    objectPosition: "center",
  },
  "cilekli-muzlu-nutella": {
    src: "/cilekli-muzlu-nutella.jpg",
    alt: "Çilekli Muzlu Nutella",
    objectPosition: "center",
  },
  "lotus-cruffin": {
    src: "/lotus-cruffin.jpg",
    alt: "Lotus Cruffin",
    objectPosition: "center",
  },
  "orman-meyveli-kruvasan": {
    src: "/orman-meyveli-kruvasan.jpg",
    alt: "Orman Meyveli Kruvasan",
    objectPosition: "center",
  },
  "mini-kruvasan": {
    src: "/mini-kruvasan.jpg",
    alt: "Mini Kruvasan Tabağı",
    objectPosition: "center",
  },
  "limonlu-cheesecake-dilim": {
    src: "/limonlu-cheesecake-dilim.jpg",
    alt: "Limonlu Cheesecake (Dilim)",
    objectPosition: "center",
  },
  "limonlu-cheesecake": {
    src: "/limonlu-cheesecake.jpg",
    alt: "Limonlu Cheesecake (Bütün)",
    objectPosition: "center",
  },
  "limonlu-cheesecake-butun": {
    src: "/limonlu-cheesecake.jpg",
    alt: "Limonlu Cheesecake (Bütün)",
    objectPosition: "center",
  },
  "lotuslu-cheesecake-dilim": {
    src: "/lotuslu-cheesecake-dilim.jpg",
    alt: "Lotuslu Cheesecake (Dilim)",
    objectPosition: "center",
  },
  "lotuslu-cheesecake": {
    src: "/lotuslu-cheesecake.jpg",
    alt: "Lotuslu Cheesecake (Bütün)",
    objectPosition: "center",
  },
  "lotuslu-cheesecake-butun": {
    src: "/lotuslu-cheesecake.jpg",
    alt: "Lotuslu Cheesecake (Bütün)",
    objectPosition: "center",
  },
  "san-sebastian-cheesecake-dilim": {
    src: "/san-sebastian-cheesecake-dilim.jpg",
    alt: "San Sebastian Cheesecake (Dilim)",
    objectPosition: "center",
  },
  "san-sebastian-cheesecake": {
    src: "/san-sebastian-cheesecake-dilim.jpg",
    alt: "San Sebastian Cheesecake",
    objectPosition: "center",
  },
  "san-sebastian-cheesecake-butun": {
    src: "/san-sebastian-cheesecake.jpg",
    alt: "San Sebastian Cheesecake (Bütün)",
    objectPosition: "center",
  },
  "san-sebastian": {
    src: "/san-sebastian-cheesecake-dilim.jpg",
    alt: "San Sebastian Cheesecake",
    objectPosition: "center",
  },

  // Waffle Çeşitleri
  "bardakta-waffle": {
    src: "/bardakta-waffle.jpg",
    alt: "Bardakta Waffle",
    objectPosition: "center",
  },
  "waffle-kova": {
    src: "/waffle-kova.jpg",
    alt: "Kovada Waffle",
    objectPosition: "center",
  },
  "kovada-waffle": {
    src: "/waffle-kova.jpg",
    alt: "Kovada Waffle",
    objectPosition: "center",
  },

  // NOA Spesiyaller & Menüler
  "noa-turbo": {
    src: "/noa-turbo.jpg",
    alt: "Noa Turbo Spesiyal",
    objectPosition: "center",
  },
  "noa-full-depo": {
    src: "/noa-full-depo.jpg",
    alt: "Noa Full Depo",
    objectPosition: "center",
  },
  "noa-roll-kup-ikili": {
    src: "/noa-roll-kup-ikili.jpg",
    alt: "NOA Roll & Küp İkili Menü",
    objectPosition: "center",
  },
  "noa-tatli-tuzlu-ikili": {
    src: "/noa-tatli-tuzlu-ikili.jpg",
    alt: "Noa Tatlı & Tuzlu İkili Menü",
    objectPosition: "center",
  },
  "noa-tatli-ikili": {
    src: "/noa-tatli-ikili.jpg",
    alt: "Noa Tatlı İkili Menü",
    objectPosition: "center",
  },
  "noa-tuzlu-ikili": {
    src: "/noa-tuzlu-ikili.jpg",
    alt: "Noa Tuzlu İkili Menü",
    objectPosition: "center",
  },
  "noa-tatli-croissant-olustur": {
    src: "/noa-tatli-croissant-olustur.jpg",
    alt: "Kendi Tatlı Kruvasanını Oluştur",
    objectPosition: "center",
  },
  "noa-tuzlu-kruvasan-olustur": {
    src: "/noa-tuzlu-kruvasan-olustur.jpg",
    alt: "Kendi Tuzlu Kruvasanını Oluştur",
    objectPosition: "center",
  },
  "noa-kahvalti-tabagi": {
    src: "/kahvalti-tabagi.jpg",
    alt: "NOA Kahvaltı Tabağı",
    objectPosition: "center",
  },
  "kahvalti-tabagi": {
    src: "/kahvalti-tabagi.jpg",
    alt: "NOA Kahvaltı Tabağı",
    objectPosition: "center",
  },

  // Dondurma
  "dondurma": {
    src: "/dondurma.jpg",
    alt: "Doğal Dondurma",
    objectPosition: "center",
  },

  // Tuzlu Kruvasanlar
  "yesil-lezzet": {
    src: "/yesil-lezzet-kruvasan.jpg",
    alt: "Yeşil Lezzet Kruvasan",
    objectPosition: "center",
  },
  "ege-esintisi": {
    src: "/ege-esintisi-kruvasan.jpg",
    alt: "Ege Esintisi Kruvasan",
    objectPosition: "center",
  },
  "avokado-royale": {
    src: "/avokado-royale-kruvasan.jpg",
    alt: "Avokado Royale Kruvasan",
    objectPosition: "center",
  },
  "kaburga-deluxe": {
    src: "/kaburga-deluxe-kruvasan.jpg",
    alt: "Kaburga Deluxe Kruvasan",
    objectPosition: "center",
  },
  "pesto-milano": {
    src: "/pesto-milano-kruvasan.jpg",
    alt: "Pesto Milano Kruvasan",
    objectPosition: "center",
  },
  "kozlu-peynirli": {
    src: "/kozlu-peynir-kruvasan.jpg",
    alt: "Közlü Peynirli Kruvasan",
    objectPosition: "center",
  },
  "hot-dog": {
    src: "/hot-dog-kruvasan.jpg",
    alt: "Hot Dog Kruvasan",
    objectPosition: "center",
  },

  // İçecekler
  "benzin": {
    src: "/benzin.jpg",
    alt: "Benzin Soğuk İçecek",
    objectPosition: "center",
  },
  "dizel": {
    src: "/dizel.jpg",
    alt: "Dizel Soğuk İçecek",
    objectPosition: "center",
  },
  "el-yapimi-limonata": {
    src: "/el-yapimi-limonata.jpg",
    alt: "El Yapımı Limonata",
    objectPosition: "center",
  },
  "el-yapimi-cilekli-limonata": {
    src: "/el-yapimi-cilekli-limonata.jpg",
    alt: "El Yapımı Çilekli Limonata",
    objectPosition: "center",
  },
  "el-yapimi-nar-suyu": {
    src: "/el-yapimi-nar-suyu.jpg",
    alt: "El Yapımı Nar Suyu",
    objectPosition: "center",
  },
  "taze-sikma-nar-suyu": {
    src: "/el-yapimi-nar-suyu.jpg",
    alt: "Taze Sıkma Nar Suyu",
    objectPosition: "center",
  },
};

export const BRAND_ASSETS = {
  logo: "/noa_icon.jpg",
  icon: "/noa_icon.jpg",
  logo192: "/brand/logo-192.png",
  logo512: "/brand/logo-512.png",
  favicon: "/noa_icon.jpg",
  heroBanner: "/noa-croissant.jpg",
  tatliIkili: "/noa-tatli-ikili.jpg",
  tuzluIkili: "/noa-tuzlu-ikili.jpg",
  turbo: "/noa-turbo.jpg",
  fullDepo: "/noa-full-depo.jpg",
};

export function getProductImage(slug: string, selectedVariant?: string): string {
  const meta = PRODUCT_IMAGES[slug];
  if (!meta) {
    return "";
  }
  if (selectedVariant && meta.variantImages && meta.variantImages[selectedVariant]) {
    return meta.variantImages[selectedVariant];
  }
  return meta.src;
}
