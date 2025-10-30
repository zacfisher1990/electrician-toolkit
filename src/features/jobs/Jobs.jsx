import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, Briefcase, ChevronDown, X, Search } from 'lucide-react';
import { getUserJobs, createJob, deleteJob as deleteJobFromFirebase } from './jobsService';
import { getUserEstimates } from '../estimates/estimatesService';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './Jobs.module.css';
import JobCard from './JobCard';
import JobModal from './JobModal';
import JobEstimatesSummaryModal from './JobEstimatesSummaryModal';
import EstimateModal from './EstimateModal';
import JobForm from './JobForm';
import StatusTabs from './StatusTabs';
import AuthModal from '../profile/AuthModal';
import { saveJobs, getJobs, clearJobsCache } from '../../utils/localStorageUtils';
import { saveEstimates, getEstimates, clearEstimatesCache } from '../../utils/localStorageUtils';
import InvoiceViewModal from './InvoiceViewModal';

const Jobs = ({ isDarkMode, onNavigateToEstimates }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
  const [showEstimateMenu, setShowEstimateMenu] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const estimateMenuRef = useRef(null);
  const lastSyncedJobId = useRef(null);
  const [linkedEstimates, setLinkedEstimates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showCombinedEstimatesModal, setShowCombinedEstimatesModal] = useState(false);
  const [viewingSingleEstimate, setViewingSingleEstimate] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
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

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  const statusConfig = {
    'scheduled': { color: '#3b82f6', icon: Clock, label: 'Scheduled' },
    'in-progress': { color: '#f59e0b', icon: AlertCircle, label: 'In Progress' },
    'completed': { color: '#10b981', icon: CheckCircle, label: 'Completed' }
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (estimateMenuRef.current && !estimateMenuRef.current.contains(event.target)) {
        setShowEstimateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

useEffect(() => {
  // Only sync estimates when opening a NEW job (editingJob.id changes)
  if (editingJob && estimates.length > 0 && editingJob.estimateIds?.length > 0) {
    // Check if this is a different job than last time
    if (editingJob.id !== lastSyncedJobId.current) {
      const linkedEstimatesArray = estimates.filter(est => 
        editingJob.estimateIds.includes(est.id)
      );
      
      setLinkedEstimates(linkedEstimatesArray);
      lastSyncedJobId.current = editingJob.id; // Mark this job as synced
    }
  } else if (!editingJob) {
    // Reset when closing the modal
    lastSyncedJobId.current = null;
  }
}, [estimates, editingJob]);

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

  const resetForm = () => {
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
  };

  // New function to handle add job button click with auth check
  const handleAddJobClick = () => {
    if (!isUserLoggedIn) {
      setShowAuthModal(true); // Show auth modal if not logged in
    } else {
      setShowAddForm(!showAddForm); // Toggle form if logged in
    }
  };

  const handleAddJob = async () => {
    if (formData.title && formData.client) {
      try {
        const jobData = {
          name: formData.title,
          title: formData.title,
          client: formData.client,
          location: formData.location,
          status: formData.status,
          date: formData.date,
          time: formData.time,
          estimatedCost: formData.estimatedCost,
          duration: formData.duration,
          notes: formData.notes,
          estimateIds: formData.estimateIds || []
        };

        await createJob(jobData);
        resetForm();
        clearJobsCache();
        loadJobs();
      } catch (error) {
        console.error('Error adding job:', error);
        alert('Failed to add job. Please try again.');
      }
    }
  };

  const handleEditJob = async () => {
    if (formData.title && formData.client && editingJob) {
      try {
        const { updateJob } = await import('./jobsService');
        const jobData = {
          name: formData.title,
          title: formData.title,
          client: formData.client,
          location: formData.location,
          status: formData.status,
          date: formData.date,
          time: formData.time,
          estimatedCost: formData.estimatedCost,
          duration: formData.duration,
          notes: formData.notes,
          estimateIds: formData.estimateIds || []
        };

        await updateJob(editingJob.id, jobData);
        resetForm();
        loadJobs();
      } catch (error) {
        console.error('Error updating job:', error);
        alert('Failed to update job. Please try again.');
      }
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const { updateJob } = await import('./jobsService');
      const job = jobs.find(j => j.id === jobId);
      await updateJob(jobId, { ...job, status: newStatus });
      setStatusDropdownOpen(null);
      loadJobs();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

const openJobView = (job) => {
  setViewingJob(job);
  setEditingJob(job);
  setFormData({
    title: job.title || job.name,
    client: job.client,
    location: job.location || '',
    status: job.status,
    date: job.date || '',
    time: job.time || '',
    estimatedCost: job.estimatedCost || '',
    duration: job.duration || '',
    notes: job.notes || '',
    estimateIds: job.estimateIds || []
  });
  
  // Load linked estimates based on estimateIds array
  if (job.estimateIds && job.estimateIds.length > 0) {
    const linkedEstimatesArray = estimates.filter(est => 
      job.estimateIds.includes(est.id)
    );
    setLinkedEstimates(linkedEstimatesArray);
  } else {
    // Fallback: check for old singular estimateId format
    if (job.estimateId) {
      const estimate = estimates.find(e => e.id === job.estimateId);
      if (estimate) {
        setLinkedEstimates([estimate]);
      } else {
        setLinkedEstimates([]);
      }
    } else {
      setLinkedEstimates([]);
    }
  }
};

  const handleDeleteJob = async (id, jobTitle) => {
    if (window.confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      try {
        await deleteJobFromFirebase(id);
        if (viewingJob && viewingJob.id === id) {
          resetForm();
        }
        loadJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const handleSelectEstimate = (estimate) => {
  // Check if estimate is already linked
  if (formData.estimateIds.includes(estimate.id)) {
    alert('This estimate is already linked to this job');
    setShowEstimateMenu(false);
    return;
  }

  // Add estimate to the array
  const newEstimateIds = [...formData.estimateIds, estimate.id];
  const newLinkedEstimates = [...linkedEstimates, estimate];
  
  setLinkedEstimates(newLinkedEstimates);
  
  // Calculate new total cost
  const totalCost = calculateTotalFromEstimates(newEstimateIds);
  
  setFormData(prev => ({
    ...prev,
    title: prev.title || estimate.title,
    client: prev.client || estimate.client,
    location: prev.location || estimate.location,
    estimatedCost: totalCost.toString(),
    estimateIds: newEstimateIds
  }));
  setShowEstimateMenu(false);
};

  const handleCreateNewEstimate = async () => {
    setShowEstimateMenu(false);
    
    if (showAddForm && formData.title && formData.client) {
      try {
        const jobData = {
          name: formData.title,
          title: formData.title,
          client: formData.client,
          location: formData.location,
          status: formData.status,
          date: formData.date,
          time: formData.time,
          estimatedCost: formData.estimatedCost,
          duration: formData.duration,
          notes: formData.notes
        };

        const jobId = await createJob(jobData);
        
        const estimateData = {
          jobId: jobId,
          jobName: formData.title,
          jobClient: formData.client
        };
        
        if (onNavigateToEstimates) {
          onNavigateToEstimates(estimateData);
        }
        
        resetForm();
        loadJobs();
      } catch (error) {
        console.error('Error creating job:', error);
        alert('Failed to create job. Please try again.');
      }
    } else if (viewingJob) {
      const estimateData = {
        jobId: viewingJob.id,
        jobName: viewingJob.title || viewingJob.name,
        jobClient: viewingJob.client
      };
      
      if (onNavigateToEstimates) {
        onNavigateToEstimates(estimateData);
      }
    } else {
      alert('Please fill in the job title and client name first.');
    }
  };

  const handleViewCombinedEstimates = () => {
  setShowCombinedEstimatesModal(true);
};

const handleViewSingleEstimateFromCombined = (estimate) => {
  setShowCombinedEstimatesModal(false);
  setViewingSingleEstimate(estimate);
};

const handleCloseSingleEstimate = () => {
  setViewingSingleEstimate(null);
  setShowCombinedEstimatesModal(true); // Return to combined view
};

  const handleViewEstimate = (estimateId) => {
    if (onNavigateToEstimates) {
      onNavigateToEstimates({ viewEstimateId: estimateId });
    }
  };

  const handleRemoveEstimate = (estimateId) => {
  // Remove estimate from the array
  const newEstimateIds = formData.estimateIds.filter(id => id !== estimateId);
  const newLinkedEstimates = linkedEstimates.filter(e => e.id !== estimateId);
  
  setLinkedEstimates(newLinkedEstimates);
  
  // Recalculate total cost
  const totalCost = calculateTotalFromEstimates(newEstimateIds);
  
  setFormData(prev => ({
    ...prev,
    estimatedCost: totalCost.toString(),
    estimateIds: newEstimateIds
  }));
};

const handleAddAdditionalEstimate = () => {
  console.log('handleAddAdditionalEstimate called'); // Add this
  setShowEstimateMenu(true);
};

  const handleEstimateMenuOpen = async (value) => {
    setShowEstimateMenu(value);
    
    if (value === true) {
      try {
        const { getUserEstimates } = await import('../estimates/estimatesService');
        const userEstimates = await getUserEstimates();
        setEstimates(userEstimates);
      } catch (error) {
        console.error('Error loading estimates:', error);
      }
    }
  };

  // Filter by search and status tab
  const filteredJobs = jobs.filter(job => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const jobTitle = (job.title || job.name || '').toLowerCase();
      const client = (job.client || '').toLowerCase();
      const location = (job.location || '').toLowerCase();
      const notes = (job.notes || '').toLowerCase();
      
      const matchesSearch = jobTitle.includes(query) || 
                           client.includes(query) || 
                           location.includes(query) || 
                           notes.includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (activeStatusTab === 'all') return true;
    return job.status === activeStatusTab;
  });

  // Get counts for each status
  const statusCounts = {
    all: jobs.length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    'in-progress': jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: colors.subtext }}>Loading jobs...</div>
      </div>
    );
  }

  // Add this function to your Jobs.jsx component, before the return statement

const handleClockInOut = async (jobId, clockIn) => {
  try {
    const { updateJob } = await import('./jobsService');
    const job = jobs.find(j => j.id === jobId);
    
    let updatedJob;
    
    if (clockIn) {
      // Clock IN - start new session
      updatedJob = {
        ...job,
        clockedIn: true,
        currentSessionStart: new Date().toISOString()
      };
    } else {
      // Clock OUT - end current session
      const sessionEnd = new Date().toISOString();
      const sessionStart = job.currentSessionStart;
      
      // Add completed session to workSessions array
      const workSessions = job.workSessions || [];
      workSessions.push({
        startTime: sessionStart,
        endTime: sessionEnd
      });
      
      updatedJob = {
        ...job,
        clockedIn: false,
        currentSessionStart: null,
        workSessions: workSessions
      };
    }
    
    // Update local state IMMEDIATELY (optimistic update)
    setJobs(prevJobs => 
      prevJobs.map(j => j.id === jobId ? updatedJob : j)
    );
    
    // Then update in database in the background
    await updateJob(jobId, updatedJob);
    
  } catch (error) {
    console.error('Error updating clock status:', error);
    alert('Failed to update clock status. Please try again.');
    // Reload jobs on error to ensure consistency
    loadJobs();
  }
};


const calculateTotalFromEstimates = (estimateIds) => {
  if (!estimateIds || estimateIds.length === 0) return 0;
  
  return estimateIds.reduce((total, estimateId) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (estimate) {
      return total + Number(estimate.total || estimate.estimatedCost || 0);
    }
    return total;
  }, 0);
};

const generateInvoiceFromJob = async (job) => {
  // Get linked estimates
  const jobEstimates = estimates.filter(est => 
    job.estimateIds?.includes(est.id)
  );
  
  // Build line items from estimates
  const lineItems = [];
  
  jobEstimates.forEach(estimate => {
    // Add labor as line item
    if (estimate.laborHours && estimate.laborRate) {
      lineItems.push({
        description: `Labor: ${estimate.laborHours} hours @ $${estimate.laborRate}/hr`,
        quantity: 1,
        rate: estimate.laborHours * estimate.laborRate
      });
    }
    
    // Add materials as line items
    if (estimate.materials && estimate.materials.length > 0) {
      estimate.materials.forEach(material => {
        lineItems.push({
          description: material.name,
          quantity: material.quantity || 1,
          rate: parseFloat(material.cost) || 0
        });
      });
    }
  });
  
  // Calculate total
  const total = lineItems.reduce((sum, item) => 
    sum + (item.quantity * item.rate), 0
  );
  
  // Generate invoice number - FIXED: Use sequential numbering
  const { getNextInvoiceNumber } = await import('../invoices/invoicesService');
  const invoiceNumber = await getNextInvoiceNumber();
  
  return {
    invoiceNumber: invoiceNumber,
    client: job.client,
    clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    lineItems: lineItems,
    notes: `Invoice for job: ${job.title || job.name}`,
    status: 'Pending',
    amount: total,
    jobId: job.id,
    isNew: true
  };
};
const handleSaveInvoice = async (invoiceData) => {
  try {
    const { createInvoice } = await import('../invoices/invoicesService');
    
    // Remove the isNew flag
    const { isNew, ...dataToSave } = invoiceData;
    
    // Save invoice
    const invoiceId = await createInvoice(dataToSave);
    
    // Update job with invoice ID
    const { updateJob } = await import('./jobsService');
    const job = jobs.find(j => j.id === invoiceData.jobId);
    if (job) {
      await updateJob(invoiceData.jobId, {
        ...job,
        invoiceId: invoiceId
      });
    }
    
    // Close modal and refresh
    setViewingInvoice(null);
    clearJobsCache();
    loadJobs();
    
    alert('Invoice saved successfully!');
  } catch (error) {
    console.error('Error saving invoice:', error);
    alert('Failed to save invoice. Please try again.');
  }
};

  return (
    <div className="jobs-container">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isDarkMode={isDarkMode}
      />

      <div style={{ 
        minHeight: '100vh', 
        background: colors.bg,
        paddingBottom: '5rem'
      }}>
        <JobModal
          viewingJob={viewingJob}
          formData={formData}
          setFormData={setFormData}
          linkedEstimate={linkedEstimates.length > 0 ? linkedEstimates[0] : null}  // For backward compatibility
          linkedEstimates={linkedEstimates}  // NEW: Add this
          estimates={estimates}
          showEstimateMenu={showEstimateMenu}
          setShowEstimateMenu={handleEstimateMenuOpen}
          onSelectEstimate={handleSelectEstimate}
          onCreateNewEstimate={handleCreateNewEstimate}
          onViewEstimate={handleViewEstimate}
          onRemoveEstimate={handleRemoveEstimate}
          onAddAdditionalEstimate={handleAddAdditionalEstimate}  // NEW: Add this
          onViewAllEstimates={handleViewCombinedEstimates}
          estimateMenuRef={estimateMenuRef}
          onClose={resetForm}
          onSave={handleEditJob}
          onDelete={handleDeleteJob}
          isDarkMode={isDarkMode}
          colors={colors}
        />
        
        <div style={{ padding: '1rem 0.25rem' }}>

          {/* Status Tabs */}
          <StatusTabs
            activeStatusTab={activeStatusTab}
            setActiveStatusTab={setActiveStatusTab}
            statusCounts={statusCounts}
            statusConfig={statusConfig}
            colors={colors}
          />

          {/* Search Bar */}
          <div style={{
            marginBottom: '1rem',
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingLeft: '2.5rem',
                paddingRight: searchQuery ? '2.5rem' : '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                background: colors.inputBg,
                color: colors.text,
                boxSizing: 'border-box'
              }}
            />
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.subtext,
                pointerEvents: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.subtext,
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '0 0.25rem'
          }}>
            <h3 style={{ 
              margin: 0, 
              color: colors.text, 
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              {activeStatusTab === 'all' ? 'All Jobs' : 
               activeStatusTab === 'scheduled' ? 'Scheduled Jobs' :
               activeStatusTab === 'in-progress' ? 'In Progress Jobs' :
               'Completed Jobs'}
            </h3>
            <span style={{
              fontSize: '0.875rem',
              color: colors.subtext,
              background: colors.cardBg,
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              border: `1px solid ${colors.border}`
            }}>
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </span>
          </div>

          {/* Add New Job Button/Form */}
          <div className={styles.addJobContainer} style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`
          }}>
            <button
              onClick={handleAddJobClick} // Changed to use new function
              className={styles.addJobButton}
              style={{ color: colors.text }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <Plus size={18} />
                Add Job
              </div>
              <ChevronDown 
                size={18} 
                style={{
                  transform: showAddForm ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            </button>

            {showAddForm && (
              <div style={{
                padding: '0 1rem 1rem 1rem',
                borderTop: `1px solid ${colors.border}`
              }}>
                <div style={{ paddingTop: '1rem' }}>
                  <JobForm
                    formData={formData}
                    setFormData={setFormData}
                    linkedEstimate={linkedEstimates.length > 0 ? linkedEstimates[0] : null}  // For backward compatibility
                    linkedEstimates={linkedEstimates}  // NEW: Pass the array
                    estimates={estimates}
                    showEstimateMenu={showEstimateMenu}
                    setShowEstimateMenu={handleEstimateMenuOpen}
                    onSelectEstimate={handleSelectEstimate}
                    onCreateNewEstimate={handleCreateNewEstimate}
                    onViewEstimate={handleViewEstimate}
                    onRemoveEstimate={handleRemoveEstimate}
                    onAddAdditionalEstimate={handleAddAdditionalEstimate}
                    onViewAllEstimates={handleViewCombinedEstimates}
                    estimateMenuRef={estimateMenuRef}
                    isDarkMode={isDarkMode}
                    colors={colors}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleAddJob}
                      disabled={!formData.title || !formData.client}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: (!formData.title || !formData.client) ? colors.border : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        cursor: (!formData.title || !formData.client) ? 'not-allowed' : 'pointer',
                        opacity: (!formData.title || !formData.client) ? 0.5 : 1
                      }}
                    >
                      Add Job
                    </button>
                    <button
                      onClick={resetForm}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'transparent',
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job List */}
          {filteredJobs.length === 0 ? (
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              textAlign: 'center',
              padding: '3rem 1rem',
              color: colors.subtext
            }}>
              <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                {searchQuery ? 'No jobs match your search.' : 
                 activeStatusTab === 'all' ? 'No jobs yet. Add your first job above!' :
                 `No ${statusConfig[activeStatusTab]?.label.toLowerCase()} jobs.`}
              </p>
            </div>
          ) : (
            [...filteredJobs]
              .sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(b.date) - new Date(a.date);
              })
              .map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  statusConfig={statusConfig}
                  statusDropdownOpen={statusDropdownOpen}
                  setStatusDropdownOpen={setStatusDropdownOpen}
                  onUpdateStatus={handleUpdateStatus}
                  onViewJob={openJobView}
                  onViewEstimate={(job) => {
                  // If job has multiple estimates, show combined summary
                  if (job.estimateIds && job.estimateIds.length > 1) {
                    const jobEstimates = estimates.filter(est => 
                      job.estimateIds.includes(est.id)
                    );
                    setLinkedEstimates(jobEstimates);
                    setShowCombinedEstimatesModal(true);
                  } 
                  // If job has exactly 1 estimate, show single estimate modal
                  else if (job.estimateIds && job.estimateIds.length === 1) {
                    const estimate = estimates.find(e => e.id === job.estimateIds[0]);
                    if (estimate) {
                      setViewingSingleEstimate(estimate);
                    }
                  }
                  // Fallback for old estimateId format
                  else if (job.estimateId) {
                    const estimate = estimates.find(e => e.id === job.estimateId);
                    if (estimate) {
                      setViewingSingleEstimate(estimate);
                    }
                  }
                }}
                  onViewInvoice={async (job) => {
                    if (job.invoiceId) {
                      // Load and show existing invoice
                      const { getUserInvoices } = await import('../invoices/invoicesService');
                      const invoices = await getUserInvoices();
                      const invoice = invoices.find(inv => inv.id === job.invoiceId);
                      if (invoice) {
                        setViewingInvoice(invoice);
                      }
                    } else {
                      // Generate new invoice from job's estimates
                      if (!job.estimateIds || job.estimateIds.length === 0) {
                        alert('This job has no estimates. Add an estimate first.');
                        return;
                      }
                      
                      // Generate invoice from estimates
                      // Generate invoice from estimates
                      const generatedInvoice = await generateInvoiceFromJob(job);
                      setViewingInvoice(generatedInvoice);
                    }
                  }}
                  lockInOut={handleClockInOut}
                  isDarkMode={isDarkMode}
                  colors={colors}
                  estimates={estimates}
                />
              ))
          )}
          
        </div>
      </div>

      

              {/* Combined Estimates Summary Modal */}
        {showCombinedEstimatesModal && (
          <JobEstimatesSummaryModal
            estimates={linkedEstimates}
            isDarkMode={isDarkMode}
            onClose={() => setShowCombinedEstimatesModal(false)}
            onViewSingleEstimate={handleViewSingleEstimateFromCombined}
          />
        )}

        {/* Single Estimate Detail Modal */}
        {viewingSingleEstimate && (
          <EstimateModal
            estimate={viewingSingleEstimate}
            isDarkMode={isDarkMode}
            onClose={handleCloseSingleEstimate}
          />
        )}
        {/* Invoice View Modal */}
{viewingInvoice && (
  <InvoiceViewModal
    invoice={viewingInvoice}
    onClose={() => setViewingInvoice(null)}
    onSave={handleSaveInvoice}
    isDarkMode={isDarkMode}
  />
)}
    </div>
  );
};

export default Jobs;