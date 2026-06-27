import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://tarjeta-invitacion-weld.vercel.app'),
  title: "Lacre - Invitaciones Premium",
  description: "Crea experiencias digitales únicas e inalterables",
  openGraph: {
    title: "Lacre - Invitaciones Premium",
    description: "Crea experiencias digitales únicas e inalterables",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Lacre Logo",
      }
    ],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full w-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Great+Vibes&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full w-full flex flex-col font-sans m-0 p-0">{children}</body>
    </html>
  );
}
