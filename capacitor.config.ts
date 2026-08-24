import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.antaverse.app",
  appName: "AntaVerse",
  webDir: "out",
  backgroundColor: "#0B1118",
  loggingBehavior: "production",
  android: {
    allowMixedContent: false,
    backgroundColor: "#0B1118",
    webContentsDebuggingEnabled: false,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
