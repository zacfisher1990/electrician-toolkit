import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase/firebase';
import { getUserJobs, createJob, deleteJob as deleteJobFromFirebase } from './../jobsService';
import { getUserEstimates } from '../../estimates/estimatesService';
import { saveJobs, getJobs, clearJobsCache } from '../../../utils/localStorageUtils';
import { saveEstimates, getEstimates, clearEstimatesCache } from '../../../utils/localStorageUtils';

/**
 * Custom hook to manage all jobs-related state and data fetching
 */
export const useJobsState = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  const loadJobs = async () => {
    try {
      // First, load from cache for instant display
      const cachedJobs = getJobs();
      if (cachedJobs) {
        setJobs(cachedJobs);
        setLoading(false);
      }

      // Then fetch fresh data from Firebase
      const userJobs = await getUserJobs();
      setJobs(userJobs);
      
      // Save fresh data to cache
      saveJobs(userJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      
      // If Firebase fails but we have cache, keep using it
      const cachedJobs = getJobs();
      if (cachedJobs && cachedJobs.length > 0) {
        console.log('Using cached jobs due to error');
      } else {
        alert('Failed to load jobs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEstimatesWithCache = async () => {
    try {
      const cachedEstimates = getEstimates();
      if (cachedEstimates) {
        setEstimates(cachedEstimates);
      }

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
        loadJobs();
        loadEstimatesWithCache();
      } else {
        setIsUserLoggedIn(false);
        setLoading(false);
        // Clear cache on logout
        clearJobsCache();
        clearEstimatesCache();
      }
    });
    return () => unsubscribe();
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