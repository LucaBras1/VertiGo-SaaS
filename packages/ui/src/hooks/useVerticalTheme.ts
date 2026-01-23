'use client';

import * as React from 'react';
import type { ThemeConfig } from '../types';

type VerticalType =
  | 'MUSICIANS'
  | 'PHOTOGRAPHY'
  | 'FITNESS'
  | 'EVENTS'
  | 'PERFORMING_ARTS'
  | 'TEAM_BUILDING'
  | 'KIDS_ENTERTAINMENT';

const verticalThemes: Record<VerticalType, ThemeConfig> = {
  MUSICIANS: {
    primaryColor: '#7C3AED',
    secondaryColor: '#3B82F6',
    productName: 'GigBook',
    tagline: 'AI-powered booking for musicians',
    icon: 'music',
  },
  PHOTOGRAPHY: {
    primaryColor: '#F59E0B',
    secondaryColor: '#374151',
    productName: 'ShootFlow',
    tagline: 'AI assistant for photographers',
    icon: 'camera',
  },
  FITNESS: {
    primaryColor: '#10B981',
    secondaryColor: '#1E293B',
    productName: 'FitAdmin',
    tagline: 'Smart management for fitness pros',
    icon: 'dumbbell',
  },
  EVENTS: {
    primaryColor: '#EF4444',
    secondaryColor: '#EAB308',
    productName: 'EventPro',
    tagline: 'Event entertainment, simplified',
    icon: 'sparkles',
  },
  PERFORMING_ARTS: {
    primaryColor: '#DC2626',
    secondaryColor: '#7C3AED',
    productName: 'StageManager',
    tagline: 'Manage your art, not paperwork',
    icon: 'theater-masks',
  },
  TEAM_BUILDING: {
    primaryColor: '#2563EB',
    secondaryColor: '#059669',
    productName: 'TeamForge',
    tagline: 'Build stronger teams with AI',
    icon: 'users',
  },
  KIDS_ENTERTAINMENT: {
    primaryColor: '#EC4899',
    secondaryColor: '#FACC15',
    productName: 'PartyPal',
    tagline: 'Magical moments, zero stress',
    icon: 'balloon',
  },
};

interface UseVerticalThemeReturn {
  theme: ThemeConfig;
  cssVariables: Record<string, string>;
  applyTheme: () => void;
}

export function useVerticalTheme(vertical: VerticalType): UseVerticalThemeReturn {
  const theme = verticalThemes[vertical] || verticalThemes.MUSICIANS;

  const cssVariables = React.useMemo(() => {
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    return {
      '--primary': hexToHsl(theme.primaryColor),
      '--primary-foreground': '0 0% 100%',
      '--secondary': hexToHsl(theme.secondaryColor),
      '--secondary-foreground': '0 0% 100%',
    };
  }, [theme]);

  const applyTheme = React.useCallback(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [cssVariables]);

  // Apply theme on mount and when it changes
  React.useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return {
    theme,
    cssVariables,
    applyTheme,
  };
}
