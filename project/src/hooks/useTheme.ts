import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SiteTheme {
  id: string;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_gradient_from: string;
  background_gradient_to: string;
  header_background: string;
  button_gradient_from: string;
  button_gradient_to: string;
  custom_css: string | null;
  active: boolean;
}

export function useTheme() {
  const [theme, setTheme] = useState<SiteTheme | null>(null);

  useEffect(() => {
    fetchActiveTheme();

    const subscription = supabase
      .channel('theme_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_theme_settings' }, () => {
        fetchActiveTheme();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('site_theme_settings')
        .select('*')
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      setTheme(data);
      applyTheme(data);
    } catch (error) {
      console.error('Error fetching active theme:', error);
    }
  };

  const applyTheme = (themeData: SiteTheme | null) => {
    if (!themeData) return;

    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeData.primary_color);
    root.style.setProperty('--secondary-color', themeData.secondary_color);
    root.style.setProperty('--accent-color', themeData.accent_color);
    root.style.setProperty('--bg-gradient-from', themeData.background_gradient_from);
    root.style.setProperty('--bg-gradient-to', themeData.background_gradient_to);
    root.style.setProperty('--header-bg', themeData.header_background);
    root.style.setProperty('--button-gradient-from', themeData.button_gradient_from);
    root.style.setProperty('--button-gradient-to', themeData.button_gradient_to);

    if (themeData.custom_css) {
      let styleEl = document.getElementById('custom-theme-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-theme-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = themeData.custom_css;
    }
  };

  return theme;
}
