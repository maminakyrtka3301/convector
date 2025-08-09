'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const LIGHT_COLOR = '#f4f4f5'; // zinc-100
const DARK_COLOR = '#18181b'; // zinc-900

export default function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const desired = resolvedTheme === 'dark' ? DARK_COLOR : LIGHT_COLOR;

    let meta = document.querySelector('meta[name="theme-color"][data-dynamic="true"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('data-dynamic', 'true');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desired);
  }, [resolvedTheme]);

  return null;
}


