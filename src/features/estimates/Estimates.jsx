import React, { useState, useEffect } from 'react';
import { FileText, Search, X } from 'lucide-react';
import { getUserEstimates, createEstimate, updateEstimate, deleteEstimate as deleteEstimateFromFirebase } from './estimatesService';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import EstimateCard from './EstimateCard';
import EstimateForm from './EstimateForm';

const Estimates = ({ isDarkMode, jobs = [], onApplyToJob, pendingEstimateData, onClearPendingData, navigationData }) => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  // Load estimates from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadEstimates();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle pending estimate data from Jobs page
  useEffect(() => {
    if (pendingEstimateData && onClearPendingData) {
      // Just trigger the form to open - EstimateForm will handle the data
      onClearPendingData();
    }
  }, [pendingEstimateData, onClearPendingData]);

  // Handle viewing an existing estimate from navigation
  useEffect(() => {
    if (navigationData?.viewEstimateId) {
      const estimateToView = estimates.find(e => e.id === navigationData.viewEstimateId);
      if (estimateToView) {
        setEditingEstimate(estimateToView);
      }
    }
  }, [navigationData, estimates]);

  const loadEstimates = async () => {
    setLoading(true);
    try {
      const userEstimates = await getUserEstimates();
      setEstimates(userEstimates);
    } catch (error) {
      console.error('Error loading estimates:', error);
      alert('Failed to load estimates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveEstimate = async (estimateData) => {
    try {
      if (editingEstimate) {
        await updateEstimate(editingEstimate.id, estimateData);
      } else {
        await createEstimate(estimateData);
      }
      
      setEditingEstimate(null);
      loadEstimates();
    } catch (error) {
      console.error('Error saving estimate:', error);
      alert('Failed to save estimate. Please try again.');
    }
  };

  const startEdit = (estimate) => {
    setEditingEstimate(estimate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingEstimate(null);
  };

  const deleteEstimate = async (id, estimateName) => {
    if (window.confirm(`Delete "${estimateName}"?`)) {
      try {
        await deleteEstimateFromFirebase(id);
        loadEstimates();
      } catch (error) {
        console.error('Error deleting estimate:', error);
        alert('Failed to delete estimate. Please try again.');
      }
    }
  };

  const handleApplyToJob = (estimate, jobId) => {
    if (onApplyToJob) {
      onApplyToJob(estimate, jobId);
    }
  };

  // Filter estimates based on search query
  const filteredEstimates = estimates.filter(estimate => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const matchesName = estimate.name.toLowerCase().includes(query);
    const matchesMaterials = estimate.materials.some(mat => 
      mat.name.toLowerCase().includes(query)
    );
    const matchesTotal = estimate.total.toString().includes(query);
    
    // Check if linked to a job that matches
    const linkedJob = jobs.find(job => job.id === estimate.jobId);
    const matchesJob = linkedJob && (linkedJob.title || linkedJob.name || '').toLowerCase().includes(query);
    
    return matchesName || matchesMaterials || matchesTotal || matchesJob;
  });

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '5rem'
      }}>
        <div style={{ color: colors.subtext }}>Loading estimates...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: colors.bg,
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      <div style={{ padding: '1rem' }}>
        {/* Search Bar */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          marginBottom: '1rem',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Search size={20} style={{ color: colors.subtext, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: colors.text,
              fontSize: '0.9375rem',
              outline: 'none',
              padding: '0.25rem 0'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.subtext,
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Estimate Form Component */}
        <EstimateForm
          isDarkMode={isDarkMode}
          editingEstimate={editingEstimate}
          onSave={saveEstimate}
          onCancel={cancelEdit}
        />

        {/* Estimates List Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          paddingLeft: '0.25rem'
        }}>
          <h2 style={{
            margin: 0,
            color: colors.text,
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            {searchQuery ? 'Search Results' : 'All Estimates'}
          </h2>
          <span style={{
            color: colors.subtext,
            fontSize: '0.875rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            {filteredEstimates.length}
          </span>
        </div>

        {/* No Results Message */}
        {searchQuery && filteredEstimates.length === 0 && (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>
              No estimates found matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#2563eb',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && estimates.length === 0 && (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>No estimates yet. Create one above!</p>
          </div>
        )}

        {/* Estimates List - Using EstimateCard Component */}
        {filteredEstimates.length > 0 && filteredEstimates.map((estimate) => (
          <EstimateCard
            key={estimate.id}
            estimate={estimate}
            isDarkMode={isDarkMode}
            jobs={jobs}
            onEdit={startEdit}
            onDelete={deleteEstimate}
            onApplyToJob={handleApplyToJob}
          />
        ))}
      </div>
    </div>
  );
};

export default Estimates;