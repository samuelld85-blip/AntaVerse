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
  description: "Cinq jeux d’ambiance, une seule application.",
  applicationName: "AntaVerse",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AntaVerse",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
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
        {process.env.NODE_ENV === "development" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `if("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(function(r){if(r.length){return Promise.all(r.map(function(x){return x.unregister()})).then(function(){location.reload()})}})}`,
            }}
          />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("antaverse:theme");document.documentElement.dataset.theme=s==="light"?"light":"dark"}catch(e){}`,
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
