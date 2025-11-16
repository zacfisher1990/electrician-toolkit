// useThemeColor.js - Dynamically updates the Android/PWA status bar color
// Place this in your src/hooks/ folder (create the folder if needed)

import { useEffect } from 'react';
import { getColors } from '../theme';

/**
 * Hook to dynamically update the theme-color meta tag
 * This controls the Android status bar and PWA title bar color
 * 
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @param {object|null} clockedInJob - The currently clocked-in job (null if none)
 */
export const useThemeColor = (isDarkMode, clockedInJob) => {
  useEffect(() => {
    const themeColors = getColors(isDarkMode);
    
    // Determine the correct color based on state
    let themeColor;
    
    if (clockedInJob) {
      // Maroon when clocked in (matches header) - easier on eyes
      themeColor = '#9f1239';
    } else if (isDarkMode) {
      // Dark gray in dark mode (matches header)
      themeColor = '#1a1a1a';
    } else {
      // Theme blue in light mode (matches header)
      themeColor = themeColors.blue; // #3b82f6
    }
    
    // Update the meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
    
    console.log(`🎨 Theme color updated to: ${themeColor}`);
  }, [isDarkMode, clockedInJob]);
};

export default useThemeColor;