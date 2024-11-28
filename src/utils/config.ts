interface Config {
  apiBaseUrl: string;
  pinterestClientId: string;
  pinterestRedirectUri: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
  pinterestClientId: import.meta.env.VITE_PINTEREST_CLIENT_ID || '',
  pinterestRedirectUri: `${window.location.origin}/callback`,
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;