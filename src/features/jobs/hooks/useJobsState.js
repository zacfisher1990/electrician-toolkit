import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase/firebase';
import { getUserJobs, subscribeToJobs } from './../jobsService';
import { getUserEstimates } from '../../estimates/estimatesService';
import { saveJobs, getJobs, clearJobsCache } from '../../../utils/localStorageUtils';
import { saveEstimates, getEstimates, clearEstimatesCache } from '../../../utils/localStorageUtils';

/**
 * Custom hook to manage all jobs-related state and data fetching
 * NOW WITH REAL-TIME SYNC!
 */
export const useJobsState = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const unsubscribeRef = useRef(null);
  
  const loadJobs = async (skipCache = false) => {
    try {
      // First, load from cache for instant display (unless skipCache is true)
      if (!skipCache) {
        const cachedJobs = getJobs();
        if (cachedJobs) {
          setJobs(cachedJobs);
          setLoading(false);
        }
      }

      // Then fetch fresh data from Firebase - pass skipCache parameter
      const userJobs = await getUserJobs(skipCache);
      
      // Force a new array reference to ensure React detects the change
      setJobs([...userJobs]);
      
      // Save fresh data to cache
      saveJobs(userJobs);
      
      return userJobs; // Return the jobs so caller knows when loading is complete
    } catch (error) {
      console.error('Error loading jobs:', error);
      
      // If Firebase fails but we have cache, keep using it
      const cachedJobs = getJobs();
      if (cachedJobs && cachedJobs.length > 0) {
        console.log('Using cached jobs due to error');
      } else {
        alert('Failed to load jobs. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadEstimatesWithCache = async (skipCache = false) => {
    try {
      // Load from cache for instant display (unless skipCache is true)
      if (!skipCache) {
        const cachedEstimates = getEstimates();
        if (cachedEstimates) {
          setEstimates(cachedEstimates);
        }
      }

      // Fetch fresh data from Firebase
      const userEstimates = await getUserEstimates();
      setEstimates(userEstimates);
      saveEstimates(userEstimates);
    } catch (error) {
      console.error('Error loading estimates:', error);
      const cachedEstimates = getEstimates();
      if (cachedEstimates) {
        console.log('Using cached estimates due to error');
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsUserLoggedIn(true);
        
        // Initial load from cache for instant display
        const cachedJobs = getJobs();
        if (cachedJobs) {
          setJobs(cachedJobs);
          setLoading(false);
        }
        
        // Set up real-time listener for jobs
        console.log('📡 Setting up real-time job listener');
        unsubscribeRef.current = subscribeToJobs(user.uid, (updatedJobs) => {
          console.log('🔄 Jobs updated from Firestore:', updatedJobs.length);
          setJobs([...updatedJobs]);
          saveJobs(updatedJobs);
          setLoading(false);
        });
        
        // Load estimates
        loadEstimatesWithCache();
      } else {
        setIsUserLoggedIn(false);
        setLoading(false);
        setJobs([]);
        
        // Unsubscribe from real-time listener
        if (unsubscribeRef.current) {
          console.log('🔌 Unsubscribing from job listener');
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        
        // Clear cache on logout
        clearJobsCache();
        clearEstimatesCache();
      }
    });
    
    return () => {
      unsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    jobs,
    setJobs,
    loading,
    estimates,
    setEstimates,
    isUserLoggedIn,
    loadJobs,
    loadEstimatesWithCache
  };
};