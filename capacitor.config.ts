import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fc26mobile.ninety",
  appName: "NINETY Mobile",
  webDir: "dist-mobile",
  android: {
    allowMixedContent: false,
  },
};

export default config;
