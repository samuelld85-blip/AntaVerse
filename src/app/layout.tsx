import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { RouteThemeSync } from "@/components/route-theme-sync";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AntaVerse",
    template: "%s · AntaVerse",
  },
  description: "Trois jeux d’ambiance, une seule application.",
  applicationName: "AntaVerse",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AntaVerse",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/app-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1118",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=location.pathname,g=p.startsWith("/quoi-de-9")?"qui-des-9:theme":p.startsWith("/la-relance")?"la-relance:theme":p.startsWith("/sans-le-dire")?"sans-le-dire:theme":"",k=g||"antaverse:theme",s=localStorage.getItem(k);document.documentElement.dataset.theme=s==="dark"?"dark":s==="light"?"light":g?"light":"dark"}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <RouteThemeSync />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
