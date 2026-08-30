import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOA Croissant | QR Menü & Sipariş",
    short_name: "NOA Croissant",
    description: "Günlük taze el yapımı Fransız kruvasanları, Belçika çikolatalı özel lezzetler ve üçüncü nesil nitelikli kahveler.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F1EB",
    theme_color: "#381D05",
    icons: [
      {
        src: "/brand/logo-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
