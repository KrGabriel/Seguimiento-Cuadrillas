import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuadrillas OS · Gestión y desempeño técnico",
  description:
    "Plataforma de control de cuadrillas, seguimiento de desempeño técnico y trazabilidad de equipos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
