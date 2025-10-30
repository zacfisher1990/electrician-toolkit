// localStorageUtils.js
// Utility functions for managing local storage with proper error handling

const STORAGE_KEYS = {
  JOBS: 'electrician_toolkit_jobs',
  ESTIMATES: 'electrician_toolkit_estimates',
  JOBS_TIMESTAMP: 'electrician_toolkit_jobs_timestamp',
  ESTIMATES_TIMESTAMP: 'electrician_toolkit_estimates_timestamp'
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Save data to local storage
 */
export const saveToLocalStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Convert date strings back to Date objects
 * Handles both ISO strings and Firebase Timestamp objects
 */
const convertDates = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertDates(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if it's a date field
      if (key === 'createdAt' || key === 'updatedAt' || key === 'date') {
        // Handle Firebase Timestamp format
        if (value && typeof value === 'object' && value.seconds) {
          converted[key] = new Date(value.seconds * 1000);
        }
        // Handle ISO string dates
        else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          converted[key] = new Date(value);
        }
        else {
          converted[key] = value;
        }
      } else if (typeof value === 'object') {
        converted[key] = convertDates(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }
  
  return data;
};

/**
 * Get data from local storage
 */
export const getFromLocalStorage = (key) => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return null;
    }
    const data = JSON.parse(serialized);
    return convertDates(data);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Check if cached data is still valid (not expired)
 */
export const isCacheValid = (key, maxAge = CACHE_DURATION) => {
  try {
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    if (!timestamp) return false;
    
    const age = Date.now() - parseInt(timestamp);
    return age < maxAge;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

/**
 * Clear specific cached data
 */
export const clearCache = (key) => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

/**
 * Clear all app data from local storage
 */
export const clearAllCache = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

/**
 * Save jobs to local storage
 */
export const saveJobs = (jobs) => {
  return saveToLocalStorage(STORAGE_KEYS.JOBS, jobs);
};

/**
 * Get jobs from local storage
 */
export const getJobs = () => {
  if (isCacheValid(STORAGE_KEYS.JOBS)) {
    return getFromLocalStorage(STORAGE_KEYS.JOBS);
  }
  return null;
};

/**
 * Save estimates to local storage
 */
export const saveEstimates = (estimates) => {
  return saveToLocalStorage(STORAGE_KEYS.ESTIMATES, estimates);
};

/**
 * Get estimates from local storage
 */
export const getEstimates = () => {
  if (isCacheValid(STORAGE_KEYS.ESTIMATES)) {
    return getFromLocalStorage(STORAGE_KEYS.ESTIMATES);
  }
  return null;
};

/**
 * Clear jobs cache
 */
export const clearJobsCache = () => {
  return clearCache(STORAGE_KEYS.JOBS);
};

/**
 * Clear estimates cache
 */
export const clearEstimatesCache = () => {
  return clearCache(STORAGE_KEYS.ESTIMATES);
};

export default {
  saveJobs,
  getJobs,
  saveEstimates,
  getEstimates,
  clearJobsCache,
  clearEstimatesCache,
  clearAllCache
};

// Add these functions to your existing src/utils/localStorageUtils.js

/**
 * Save invoices to localStorage
 */
export const saveInvoices = (invoices) => {
  try {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  } catch (error) {
    console.error('Error saving invoices to localStorage:', error);
  }
};

/**
 * Get invoices from localStorage
 */
export const getInvoices = () => {
  try {
    const invoices = localStorage.getItem('invoices');
    return invoices ? JSON.parse(invoices) : null;
  } catch (error) {
    console.error('Error getting invoices from localStorage:', error);
    return null;
  }
};

/**
 * Clear invoices cache
 */
export const clearInvoicesCache = () => {
  try {
    localStorage.removeItem('invoices');
  } catch (error) {
    console.error('Error clearing invoices cache:', error);
  }
};