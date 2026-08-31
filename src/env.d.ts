/// <reference types="astro/client" />

interface Window {
  umami?: {
    track: (eventName: string, data?: Record<string, unknown>) => void;
  };
}
