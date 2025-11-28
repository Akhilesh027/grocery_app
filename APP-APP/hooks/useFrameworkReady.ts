import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Use globalThis to avoid ReferenceError on native where window may be undefined
    const w = typeof window !== 'undefined' ? window : (globalThis as any);
    w?.frameworkReady?.();
  });
}
