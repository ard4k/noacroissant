import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "NOA Croissant",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function MutfakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
