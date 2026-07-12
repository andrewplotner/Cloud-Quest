import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.andrewplotner.cloudquest',
  appName: 'Cloud Quest',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
