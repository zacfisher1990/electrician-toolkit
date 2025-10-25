// dateUtils.js - Helper functions for handling dates

/**
 * Safely format a date value that might be:
 * - A Date object
 * - A Firebase Timestamp
 * - An ISO string
 * - null/undefined
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  
  try {
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    // If it's a Firebase Timestamp object
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    
    // If it's a string, try to parse it
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString();
      }
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Convert a value to a Date object safely
 */
export const toDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    }
    
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error converting to date:', error);
    return null;
  }
};

export default {
  formatDate,
  toDate
};