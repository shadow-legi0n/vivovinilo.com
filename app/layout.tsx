import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
// AÑADE ESTA LÍNEA PARA IMPORTAR EL FOOTER:
import Footer from "./components/Footer"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vivo Vinilo",
  description: "Donde las ideas cobran vida",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        {/* AHORA EL FOOTER YA ESTÁ IMPORTADO Y NO DARÁ ERROR */}
        <Footer />
      </body>
    </html>
  );
}