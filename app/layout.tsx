import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Cada página define su título y acá se le agrega el nombre del sitio.
  title: { default: "Vivo Vinilo", template: "%s | Vivo Vinilo" },
  description: "Donde las ideas cobran vida",
  // Base para las URLs absolutas del ícono y de la imagen que se ve al compartir el link.
  metadataBase: new URL("https://www.vivovinilo.com"),
  openGraph: {
    title: "Vivo Vinilo",
    description: "Donde las ideas cobran vida",
    siteName: "Vivo Vinilo",
    locale: "es_UY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen flex flex-col`}>
        <CartProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}