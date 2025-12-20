import { useState, useEffect, useCallback } from 'react';

const REST_MODE_KEY = 'meoluna_rest_mode';

export function useRestMode() {
  const [isRestMode, setIsRestMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(REST_MODE_KEY);
    return stored === 'true';
  });

  // Apply rest mode class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isRestMode) {
      root.classList.add('rest-mode');
      root.classList.add('dark'); // Rest mode is always dark
    } else {
      root.classList.remove('rest-mode');
      // Don't remove dark class - let user control that separately
    }

    // Store preference
    localStorage.setItem(REST_MODE_KEY, String(isRestMode));
  }, [isRestMode]);

  const toggleRestMode = useCallback(() => {
    setIsRestMode(prev => !prev);
  }, []);

  const enableRestMode = useCallback(() => {
    setIsRestMode(true);
  }, []);

  const disableRestMode = useCallback(() => {
    setIsRestMode(false);
  }, []);

  return {
    isRestMode,
    toggleRestMode,
    enableRestMode,
    disableRestMode
  };
}
