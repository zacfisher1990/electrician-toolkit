import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to manage job form state and related UI states
 */
export const useJobForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    status: 'scheduled',
    date: '',
    time: '',
    estimatedCost: '',
    duration: '',
    notes: '',
    estimateIds: []
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [linkedEstimates, setLinkedEstimates] = useState([]);
  const [showEstimateMenu, setShowEstimateMenu] = useState(false);
  const estimateMenuRef = useRef(null);
  const lastSyncedJobId = useRef(null);

  const resetForm = (clearModals) => {
    setFormData({
      title: '',
      client: '',
      location: '',
      status: 'scheduled',
      date: '',
      time: '',
      estimatedCost: '',
      duration: '',
      notes: '',
      estimateIds: []
    });
    setShowAddForm(false);
    setEditingJob(null);
    setViewingJob(null);
    setLinkedEstimates([]);
    
    // Clear estimate-related modals if callback provided
    if (clearModals) {
      clearModals();
    }
  };

  // Handle click outside estimate menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (estimateMenuRef.current && !estimateMenuRef.current.contains(event.target)) {
        setShowEstimateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    formData,
    setFormData,
    showAddForm,
    setShowAddForm,
    viewingJob,
    setViewingJob,
    editingJob,
    setEditingJob,
    linkedEstimates,
    setLinkedEstimates,
    showEstimateMenu,
    setShowEstimateMenu,
    estimateMenuRef,
    lastSyncedJobId,
    resetForm
  };
};