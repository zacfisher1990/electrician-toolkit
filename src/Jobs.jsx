import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, MapPin, Calendar, DollarSign, Edit, Trash2, Briefcase, ChevronDown, X, Eye } from 'lucide-react';
import { getUserJobs, createJob, deleteJob as deleteJobFromFirebase } from './jobsService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Jobs = ({ isDarkMode, onNavigateToEstimates }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
  const statusDropdownRef = useRef(null);
  const [showEstimateMenu, setShowEstimateMenu] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const estimateMenuRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    status: 'scheduled',
    date: '',
    time: '',
    estimatedCost: '',
    duration: '',
    notes: ''
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadJobs();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    // Load estimates
    useEffect(() => {
    const loadEstimates = async () => {
        try {
        const { getUserEstimates } = await import('./estimatesService');
        const userEstimates = await getUserEstimates();
        setEstimates(userEstimates);
        } catch (error) {
        console.error('Error loading estimates:', error);
        }
    };

    if (auth.currentUser) {
        loadEstimates();
    }
    }, []);

    // Close estimate menu when clicking outside
    useEffect(() => {
    const handleClickOutside = (event) => {
        if (estimateMenuRef.current && !estimateMenuRef.current.contains(event.target)) {
        setShowEstimateMenu(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const userJobs = await getUserJobs();
      setJobs(userJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
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
      notes: ''
    });
    setShowAddForm(false);
    setEditingJob(null);
    setViewingJob(null);
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
          notes: formData.notes
        };

        await createJob(jobData);
        resetForm();
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
          notes: formData.notes
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
      notes: job.notes || ''
    });
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

  const handleSelectEstimate = (estimate) => {
  if (estimate) {
    // Apply estimate cost to the job
    setFormData(prev => ({
      ...prev,
      estimatedCost: estimate.total.toString()
    }));
  }
  setShowEstimateMenu(false);
};

const handleCreateNewEstimate = async () => {
  console.log('handleCreateNewEstimate called');
  console.log('onNavigateToEstimates:', onNavigateToEstimates);
  setShowEstimateMenu(false);
  
  // If we're in the "Add New Job" form, save the job first
  if (showAddForm && formData.title && formData.client) {
    try {
      console.log('Creating job with data:', formData);
      
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
      console.log('Job created with ID:', jobId);
      
      // Navigate to estimates page with job info
      const estimateData = {
        jobId: jobId,
        jobName: formData.title,
        jobClient: formData.client
      };
      
      console.log('Navigating with data:', estimateData);
      
      if (onNavigateToEstimates) {
        onNavigateToEstimates(estimateData);
      } else {
        console.error('onNavigateToEstimates is not defined!');
        alert('Navigation function not available. Please check the console.');
      }
      
      resetForm();
      loadJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    }
  } else if (viewingJob) {
    // If viewing an existing job, just navigate with that job's info
    const estimateData = {
      jobId: viewingJob.id,
      jobName: viewingJob.title || viewingJob.name,
      jobClient: viewingJob.client
    };
    
    console.log('Navigating from existing job with data:', estimateData);
    
    if (onNavigateToEstimates) {
      onNavigateToEstimates(estimateData);
    } else {
      console.error('onNavigateToEstimates is not defined!');
      alert('Navigation function not available. Please check the console.');
    }
  } else {
    console.log('Neither new job form nor viewing job condition met');
    alert('Please fill in the job title and client name first.');
  }
};

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg,
      paddingBottom: '5rem'
    }}>
      {/* Job Detail Modal */}
      {viewingJob && (
        <>
          {/* Backdrop */}
          <div 
            onClick={resetForm}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              animation: 'fadeIn 0.2s'
            }}
          />
          
        {/* Modal */}
        <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: colors.cardBg,
        borderRadius: '1rem',
        padding: '1.5rem',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))', // Much more padding at bottom
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh', // Reduced from 85vh
        overflowY: 'auto',
        zIndex: 1001,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        WebkitOverflowScrolling: 'touch'
        }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: colors.text
              }}>
                Job Details
              </h2>
              <button
                onClick={resetForm}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: colors.subtext,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Fields */}
            <div>
              <input
                type="text"
                placeholder="Job Title *"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="text"
                placeholder="Client Name *"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({...prev, client: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                  style={{
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />

                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                  style={{
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Add Estimate Button */}
<div style={{ position: 'relative', marginBottom: '0.75rem' }} ref={showEstimateMenu ? estimateMenuRef : null}>
  <button
    type="button"
    onClick={() => setShowEstimateMenu(!showEstimateMenu)}
    style={{
      width: '100%',
      padding: '0.75rem',
      background: colors.inputBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem',
      color: '#2563eb',
      cursor: 'pointer',
      fontSize: '0.9375rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    }}
  >
    <Plus size={18} />
    Add Estimate
  </button>

  {/* Estimate Dropdown Menu */}
  {showEstimateMenu && (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '0.5rem',
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      {/* Create New Estimate Option */}
      <button
        onClick={handleCreateNewEstimate}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${colors.border}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#2563eb',
          fontSize: '0.875rem',
          fontWeight: '600',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <Plus size={16} />
        Create New Estimate
      </button>

      {/* Existing Estimates */}
      {estimates.length === 0 ? (
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: colors.subtext,
          fontSize: '0.875rem'
        }}>
          No estimates available
        </div>
      ) : (
        estimates.map((estimate) => (
          <button
            key={estimate.id}
            onClick={() => handleSelectEstimate(estimate)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${colors.border}`,
              cursor: 'pointer',
              textAlign: 'left',
              color: colors.text,
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {estimate.name || 'Untitled Estimate'}
            </div>
            <div style={{ color: colors.subtext, fontSize: '0.75rem' }}>
              ${Number(estimate.total || 0).toLocaleString()}
            </div>
          </button>
        ))
      )}
    </div>
  )}
</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
  <input
    type="number"
    placeholder="Cost ($)"
    value={formData.estimatedCost}
                  onChange={(e) => setFormData(prev => ({...prev, estimatedCost: e.target.value}))}
                  style={{
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />

                <input
                  type="text"
                  placeholder="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                  style={{
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleEditJob}
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
                  Save Changes
                </button>
                <button
                  onClick={() => handleDeleteJob(viewingJob.id, viewingJob.title || viewingJob.name)}
                  style={{
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: `1px solid #ef4444`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ padding: '1rem' }}>
        {/* Add New Job Button/Form */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          {/* Header Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: colors.text
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              <Plus size={20} />
              Add New Job
            </div>
            <ChevronDown 
              size={20} 
              style={{
                transform: showAddForm ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {/* Expandable Form */}
          {showAddForm && (
            <div style={{
              padding: '0 1rem 1rem 1rem',
              borderTop: `1px solid ${colors.border}`
            }}>
              <div style={{ paddingTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Job Title *"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />

                <input
                  type="text"
                  placeholder="Client Name *"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({...prev, client: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />

                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />

                  <input
                    type="time"
                    placeholder="Time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Add Estimate Button */}
<div style={{ position: 'relative', marginBottom: '0.75rem' }} ref={showEstimateMenu ? estimateMenuRef : null}>
  <button
    type="button"
    onClick={() => setShowEstimateMenu(!showEstimateMenu)}
    style={{
      width: '100%',
      padding: '0.75rem',
      background: colors.inputBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem',
      color: '#2563eb',
      cursor: 'pointer',
      fontSize: '0.9375rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    }}
  >
    <Plus size={18} />
    Add Estimate
  </button>

  {/* Estimate Dropdown Menu */}
  {showEstimateMenu && (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '0.5rem',
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      {/* Create New Estimate Option */}
      <button
        onClick={handleCreateNewEstimate}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${colors.border}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#2563eb',
          fontSize: '0.875rem',
          fontWeight: '600',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <Plus size={16} />
        Create New Estimate
      </button>

      {/* Existing Estimates */}
      {estimates.length === 0 ? (
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: colors.subtext,
          fontSize: '0.875rem'
        }}>
          No estimates available
        </div>
      ) : (
        estimates.map((estimate) => (
          <button
            key={estimate.id}
            onClick={() => handleSelectEstimate(estimate)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${colors.border}`,
              cursor: 'pointer',
              textAlign: 'left',
              color: colors.text,
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {estimate.name || 'Untitled Estimate'}
            </div>
            <div style={{ color: colors.subtext, fontSize: '0.75rem' }}>
              ${Number(estimate.total || 0).toLocaleString()}
            </div>
          </button>
        ))
      )}
    </div>
  )}
</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
  <input
    type="number"
    placeholder="Cost ($)"
    value={formData.estimatedCost}
                    onChange={(e) => setFormData(prev => ({...prev, estimatedCost: e.target.value}))}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <textarea
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
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
            Job List
          </h3>
          <span style={{
            fontSize: '0.875rem',
            color: colors.subtext,
            background: colors.cardBg,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </span>
        </div>

        {/* Job List */}
        {jobs.length === 0 ? (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>No jobs yet. Add your first job above!</p>
          </div>
        ) : (
          [...jobs]
            .sort((a, b) => {
              if (!a.date && !b.date) return 0;
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(b.date) - new Date(a.date);
            })
            .map((job) => {
            const StatusIcon = statusConfig[job.status].icon;
            const jobTitle = job.title || job.name;
            
            return (
              <div
                key={job.id}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 0.25rem 0',
                      color: colors.text,
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      {jobTitle}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: colors.subtext,
                      fontSize: '0.875rem'
                    }}>
                      {job.client}
                    </p>
                  </div>
                  
                  {/* Status Badge with Dropdown */}
                  <div style={{ position: 'relative' }} ref={statusDropdownOpen === job.id ? statusDropdownRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusDropdownOpen(statusDropdownOpen === job.id ? null : job.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        background: `${statusConfig[job.status].color}20`,
                        color: statusConfig[job.status].color,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <StatusIcon size={14} />
                      <span>{statusConfig[job.status].label}</span>
                    </button>

                    {/* Status Dropdown Menu */}
                    {statusDropdownOpen === job.id && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: colors.cardBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 100,
                        minWidth: '140px',
                        overflow: 'hidden'
                      }}>
                        {Object.entries(statusConfig).map(([key, config]) => {
                          const OptionIcon = config.icon;
                          return (
                            <button
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(job.id, key);
                              }}
                              style={{
                                width: '100%',
                                padding: '0.625rem 0.75rem',
                                background: job.status === key ? `${config.color}20` : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: config.color,
                                fontSize: '0.875rem',
                                fontWeight: job.status === key ? '600' : '500',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (job.status !== key) {
                                  e.target.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (job.status !== key) {
                                  e.target.style.background = 'transparent';
                                }
                              }}
                            >
                              <OptionIcon size={16} />
                              <span>{config.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {job.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                )}

                {job.date && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <Calendar size={16} />
                    <span>
                      {new Date(job.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {job.time && ` at ${job.time}`}
                      {job.duration && ` (${job.duration})`}
                    </span>
                  </div>
                )}

                {job.estimatedCost && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <DollarSign size={16} />
                    <span>${Number(job.estimatedCost).toLocaleString()}</span>
                  </div>
                )}

                {job.notes && (
                  <p style={{
                    margin: '0.75rem 0 0 0',
                    padding: '0.75rem',
                    background: colors.bg,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {job.notes}
                  </p>
                )}

                <button
                onClick={() => openJobView(job)}
                style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                }}
                >
                <Eye size={16} />
                View Job
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Jobs;