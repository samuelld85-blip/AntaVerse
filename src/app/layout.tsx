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
  description: "Sept jeux d’ambiance, une seule application.",
  applicationName: "AntaVerse",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AntaVerse",
  },
  icons: {
    icon: [{ url: "/icons/web/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/web/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1118",
  colorScheme: "dark",
};

// Filet de sécurité inscrit dans le document lui-même, donc actif même si les chunks React
// ne se chargent pas. Il recharge la page quand un nouveau service worker prend la main, et,
// si le HTML servi provient d'un déploiement supprimé (feuille de style en 404), purge les
// caches puis se désinscrit une seule fois : la PWA se répare sans réinstallation.
const CACHE_RECOVERY_SCRIPT = `(function(){
if(!("serviceWorker" in navigator))return;
var KEY="antaverse:sw-recovery";
var reloading=false;
function reload(){if(reloading)return;reloading=true;location.reload()}
function recover(reason){
try{if(sessionStorage.getItem(KEY))return;sessionStorage.setItem(KEY,reason)}catch(e){}
var jobs=[];
try{if(window.caches)jobs.push(caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}))}catch(e){}
jobs.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister()}))}));
Promise.all(jobs).then(reload,reload);
}
var hadController=!!navigator.serviceWorker.controller;
navigator.serviceWorker.addEventListener("controllerchange",function(){if(hadController)reload()});
navigator.serviceWorker.addEventListener("message",function(e){if(e.data&&e.data.type==="antaverse:stale-asset")recover("asset")});
if(navigator.serviceWorker.startMessages)navigator.serviceWorker.startMessages();
function isLoaded(link){
var sheet=link.sheet;
if(!sheet)return false;
try{return sheet.cssRules.length>0}catch(e){return true}
}
addEventListener("load",function(){
var links=document.querySelectorAll('link[rel="stylesheet"]');
for(var i=0;i<links.length;i++){if(!isLoaded(links[i])){recover("css");return}}
try{sessionStorage.removeItem(KEY)}catch(e){}
});
})();`;

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
            __html: `document.documentElement.dataset.theme="dark";try{localStorage.removeItem("antaverse:theme")}catch(e){}`,
          }}
        />
        {process.env.NODE_ENV === "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: CACHE_RECOVERY_SCRIPT,
            }}
          />
        ) : null}
      </head>
      <body>
        {children}
        <RouteThemeSync />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
