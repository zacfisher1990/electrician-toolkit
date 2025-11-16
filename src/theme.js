// theme.js - Centralized color theme for Pro X Trades apps
// Following industry best practices for dark mode (Material Design standards)

export const lightTheme = {
  // Backgrounds
  mainBg: '#f9fafb',        // Light gray background
  cardBg: '#ffffff',        // White cards/containers
  inputBg: '#ffffff',       // White input fields
  
  // Text
  text: '#111827',          // Near-black primary text
  subtext: '#6b7280',       // Gray secondary text
  
  // Borders
  border: '#e5e7eb',        // Light gray borders
  borderSubtle: '#f3f4f6',  // Very subtle borders
  
  // Interactive states
  hover: '#f3f4f6',         // Light hover state
  pressed: '#e5e7eb',       // Pressed/active state
  
  // Status colors
  blue: '#3b82f6',          // Primary blue
  green: '#10b981',         // Success/completed green
  amber: '#f59e0b',         // Warning/in-progress amber
  red: '#9f1239',           // Error/danger red
  purple: '#8b5cf6',        // Accent purple
  
  // Semantic colors for job statuses
  scheduled: {
    bg: '#dbeafe',
    text: '#1e40af',
    icon: '#3b82f6'
  },
  inProgress: {
    bg: '#fef3c7',
    text: '#92400e',
    icon: '#f59e0b'
  },
  completed: {
    bg: '#d1fae5',
    text: '#065f46',
    icon: '#10b981'
  },
  
  // Invoice/Estimate statuses
  paid: {
    bg: '#d1fae5',
    text: '#065f46'
  },
  pending: {
    bg: '#fef3c7',
    text: '#92400e'
  },
  overdue: {
    bg: '#fee2e2',
    text: '#991b1b'
  },
  sent: {
    bg: '#dbeafe',
    text: '#1e40af'
  },
  unsent: {
    bg: '#f3f4f6',
    text: '#4b5563'
  }
};

export const darkTheme = {
  // Backgrounds - Following Material Design dark theme standards
  mainBg: '#121212',        // Material Design standard (18, 18, 18)
  cardBg: '#1e1e1e',        // Elevated cards (30, 30, 30)
  inputBg: '#1a1a1a',       // Input fields (26, 26, 26)
  
  // Text - Not pure white to reduce eye strain
  text: '#e0e0e0',          // Primary text (224, 224, 224)
  subtext: '#a0a0a0',       // Secondary text (160, 160, 160)
  
  // Borders
  border: '#2a2a2a',        // Standard borders (42, 42, 42)
  borderSubtle: '#1a1a1a',  // Very subtle borders (26, 26, 26)
  
  // Interactive states
  hover: '#252525',         // Hover state (37, 37, 37)
  pressed: '#2f2f2f',       // Pressed/active state (47, 47, 47)
  
  // Status colors - Same as light mode for consistency
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#9f1239',
  purple: '#8b5cf6',
  
  // Semantic colors for job statuses (adjusted for dark mode)
  scheduled: {
    bg: '#1e3a8a',          // Darker blue background
    text: '#93c5fd',        // Light blue text
    icon: '#3b82f6'
  },
  inProgress: {
    bg: '#78350f',          // Darker amber background
    text: '#fcd34d',        // Light amber text
    icon: '#f59e0b'
  },
  completed: {
    bg: '#064e3b',          // Darker green background
    text: '#6ee7b7',        // Light green text
    icon: '#10b981'
  },
  
  // Invoice/Estimate statuses (adjusted for dark mode)
  paid: {
    bg: '#064e3b',
    text: '#6ee7b7'
  },
  pending: {
    bg: '#78350f',
    text: '#fcd34d'
  },
  overdue: {
    bg: '#7f1d1d',
    text: '#fca5a5'
  },
  sent: {
    bg: '#1e3a8a',
    text: '#93c5fd'
  },
  unsent: {
    bg: '#1a1a1a',
    text: '#9ca3af'
  }
};

// Helper function to get the current theme
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

// Export individual color getter for convenience
export const getColors = (isDarkMode) => {
  const theme = getTheme(isDarkMode);
  return theme;
};

export default { lightTheme, darkTheme, getTheme, getColors };