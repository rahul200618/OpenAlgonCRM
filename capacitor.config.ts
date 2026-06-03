import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.openalgon.orvixcrm',
  appName: 'OrvixCRM',
  webDir: 'public',
  server: {
    // When running in production, this should point to your hosted Next.js URL
    // e.g., url: 'https://your-crm-domain.com'
    // For local testing, you can use your local IP: url: 'http://192.168.1.xxx:3000'
    // url: 'https://app.openalgon.com', // Uncomment and set to actual production URL
    cleartext: true
  }
};

export default config;
