import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistro } from "@/components/service-worker-registro";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuadrillas OS · Gestión y desempeño técnico",
  description:
    "Plataforma de control de cuadrillas, seguimiento de desempeño técnico y trazabilidad de equipos.",
  applicationName: "Cuadrillas OS",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "Cuadrillas OS", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b1120",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        {children}
        <ServiceWorkerRegistro />
      </body>
    </html>
  );
}
