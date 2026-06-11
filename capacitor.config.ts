import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.openalgon.orvixcrm',
  appName: 'OrvixCRM',
  webDir: 'public',
  server: {
    // ⬇️ FOR LOCAL ANDROID EMULATOR TESTING ⬇️
    // 10.0.2.2 is how the Android Emulator connects to your computer's localhost (Next.js server).
    // If testing on a PHYSICAL phone, change this to your computer's WiFi IP (e.g. http://192.168.1.xxx:3000)
    // Once you have a production URL, change this to your live site (e.g. https://crm.yourcompany.com)
    url: 'http://10.238.103.180:3000',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
