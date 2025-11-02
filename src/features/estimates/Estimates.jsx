import React, { useState, useEffect, useRef } from 'react';
import { FileText, Search, X, Plus, ChevronDown } from 'lucide-react';
import { getUserEstimates, createEstimate, updateEstimate, deleteEstimate as deleteEstimateFromFirebase } from './estimatesService';
import { sendEstimateViaEmail, downloadEstimate, getUserBusinessInfo } from './estimateSendService';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import EstimateCard from './EstimateCard';
import EstimateForm from './EstimateForm';
import SendEstimateModal from './SendEstimateModal';
import styles from './Estimates.module.css';
import { saveEstimates, getEstimates, clearEstimatesCache } from '../../utils/localStorageUtils';

const Estimates = ({ 
  isDarkMode, 
  jobs = [], 
  onApplyToJob, 
  pendingEstimateData, 
  onClearPendingData, 
  navigationData 
}) => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [sendingEstimate, setSendingEstimate] = useState(null); // NEW: For send modal
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // NEW: Store user business info
  const lastHandledEstimateId = useRef(null); // NEW: Track last handled navigation

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  // Load user business info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const info = await getUserBusinessInfo(auth.currentUser?.uid);
        setUserInfo(info);
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };

    if (auth.currentUser) {
      loadUserInfo();
    }
  }, []);

  // Load estimates from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadEstimates();
      } else {
        setLoading(false);
        clearEstimatesCache();
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle pending estimate data from Jobs page
  useEffect(() => {
    if (pendingEstimateData && onClearPendingData) {
      onClearPendingData();
    }
  }, [pendingEstimateData, onClearPendingData]);

  // Handle viewing an existing estimate from navigation
  useEffect(() => {
    const viewEstimateId = navigationData?.viewEstimateId;
    
    // Only handle if:
    // 1. We have a viewEstimateId
    // 2. We have loaded estimates
    // 3. We haven't already handled this specific estimate
    if (viewEstimateId && estimates.length > 0 && lastHandledEstimateId.current !== viewEstimateId) {
      const estimateToView = estimates.find(e => e.id === viewEstimateId);
      if (estimateToView) {
        setEditingEstimate(estimateToView);
        lastHandledEstimateId.current = viewEstimateId; // Mark as handled
      }
    }
    
    // Reset the tracking when navigationData is cleared
    if (!viewEstimateId && lastHandledEstimateId.current) {
      lastHandledEstimateId.current = null;
    }
  }, [navigationData, estimates]);

  const loadEstimates = async () => {
    try {
      const cachedEstimates = getEstimates();
      if (cachedEstimates) {
        setEstimates(cachedEstimates);
        setLoading(false);
      }

      const userEstimates = await getUserEstimates();
      setEstimates(userEstimates);
      saveEstimates(userEstimates);
    } catch (error) {
      console.error('Error loading estimates:', error);
      
      const cachedEstimates = getEstimates();
      if (cachedEstimates && cachedEstimates.length > 0) {
        console.log('Using cached estimates due to error');
      } else {
        alert('Failed to load estimates. Please try again.');
      }
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
      setShowAddForm(false);
      clearEstimatesCache();
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
    setShowAddForm(false);
  };

  const deleteEstimate = async (id, estimateName) => {
    if (window.confirm(`Delete "${estimateName}"?`)) {
      try {
        await deleteEstimateFromFirebase(id);
        clearEstimatesCache();
        loadEstimates();
      } catch (error) {
        console.error('Error deleting estimate. Please try again.');
        alert('Failed to delete estimate. Please try again.');
      }
    }
  };

  // NEW: Handle opening send modal
  const handleSendEstimate = (estimate) => {
    setSendingEstimate(estimate);
  };

  // NEW: Handle actual sending from modal
  const handleSendFromModal = async (email, message) => {
    try {
      // Ensure we have userInfo before sending
      let businessInfo = userInfo;
      
      if (!businessInfo) {
        console.log('Loading user info...');
        businessInfo = await getUserBusinessInfo(auth.currentUser?.uid);
        setUserInfo(businessInfo);
      }
      
      // Double check we have valid info with fallback
      if (!businessInfo || !businessInfo.businessName) {
        businessInfo = {
          businessName: 'Electrician Toolkit',
          email: 'onboarding@resend.dev',
          phone: '(555) 123-4567',
          address: ''
        };
      }
      
      console.log('Sending with userInfo:', businessInfo);
      
      await sendEstimateViaEmail(sendingEstimate, email, message, businessInfo);
      
      // Update estimate status to "Sent"
      await updateEstimate(sendingEstimate.id, {
        ...sendingEstimate,
        status: 'Sent',
        sentDate: new Date().toISOString(),
        sentTo: email
      });
      
      // Reload estimates
      clearEstimatesCache();
      await loadEstimates();
    } catch (error) {
      console.error('Error sending estimate:', error);
      throw error; // Let modal handle the error display
    }
  };

  // NEW: Handle download from modal
  const handleDownloadFromModal = async () => {
    try {
      await downloadEstimate(sendingEstimate, userInfo);
    } catch (error) {
      console.error('Error downloading estimate:', error);
      throw error;
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
    const matchesMaterials = estimate.materials?.some(mat => 
      mat.name.toLowerCase().includes(query)
    ) || false;
    const matchesTotal = estimate.total.toString().includes(query);
    
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
      <div style={{ padding: '1rem 0.25rem' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search estimates..."
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
            {searchQuery ? 'Search Results' : 'All Estimates'}
          </h3>
          <span style={{
            fontSize: '0.875rem',
            color: colors.subtext,
            background: colors.cardBg,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            {filteredEstimates.length} {filteredEstimates.length === 1 ? 'estimate' : 'estimates'}
          </span>
        </div>

        {/* Add Estimate Button */}
        <div className={styles.addEstimateContainer} style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`
        }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={styles.addEstimateButton}
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
              New Estimate
            </div>
            <ChevronDown 
              size={18} 
              style={{
                transform: showAddForm ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {showAddForm && !editingEstimate && (
            <div style={{
              padding: '0 1rem 1rem 1rem',
              borderTop: `1px solid ${colors.border}`
            }}>
              <div style={{ paddingTop: '1rem' }}>
                <EstimateForm
                  isDarkMode={isDarkMode}
                  editingEstimate={null}
                  onSave={saveEstimate}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Edit Estimate Modal */}
        {editingEstimate && !sendingEstimate && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            paddingBottom: '6rem',
            overflowY: 'auto'
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: 'calc(100vh - 8rem)',
              overflow: 'auto',
              margin: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  Edit Estimate
                </h3>
                <button
                  onClick={cancelEdit}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: colors.subtext
                  }}
                >
                  <X size={24} />
                </button>
              </div>
              
              <EstimateForm
                isDarkMode={isDarkMode}
                editingEstimate={editingEstimate}
                onSave={saveEstimate}
                onCancel={cancelEdit}
              />
            </div>
          </div>
        )}

        {/* Send Estimate Modal */}
        {sendingEstimate && (
          <SendEstimateModal
            estimate={sendingEstimate}
            isDarkMode={isDarkMode}
            onClose={() => setSendingEstimate(null)}
            onSend={handleSendFromModal}
            onDownload={handleDownloadFromModal}
          />
        )}

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
              No estimates match your search.
            </p>
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
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>No estimates yet. Create your first estimate above!</p>
          </div>
        )}

        {/* Estimates List */}
        {filteredEstimates.length > 0 && filteredEstimates.map((estimate) => (
          <EstimateCard
            key={estimate.id}
            estimate={estimate}
            isDarkMode={isDarkMode}
            colors={colors}
            onEdit={startEdit}
            onDelete={deleteEstimate}
            onSendEstimate={handleSendEstimate}
          />
        ))}
      </div>
    </div>
  );
};

export default Estimates;