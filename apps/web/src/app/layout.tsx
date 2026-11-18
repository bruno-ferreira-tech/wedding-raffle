import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Corta-Gravata — A Tradição da Gravata dos Noivos, Elegante e Digital",
  description: "Arrecadação festiva para a lua de mel com cartela ao vivo e sorteio no telão do casamento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn(playfair.variable, jakarta.variable)}
    >
      <body className="min-h-dvh font-sans antialiased bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
