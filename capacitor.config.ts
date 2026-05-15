import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zerohunger.connect',
  appName: 'Zero Hunger Connect',
  webDir: 'dist',
  // Allow cleartext HTTP traffic for local dev backend
  // In production, use HTTPS and remove this
  android: {
    allowMixedContent: true,
  },
  server: {
    // Uncomment and set your backend URL if using a remote server
    // androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
