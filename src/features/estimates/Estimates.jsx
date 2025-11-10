import React, { useState, useEffect, useRef } from 'react';
import { FileText, Search, X } from 'lucide-react';
import { getColors } from '../../theme';
import { getUserEstimates, createEstimate, updateEstimate, deleteEstimate as deleteEstimateFromFirebase, recordEstimateSent } from './estimatesService';
import { sendEstimateViaEmail, downloadEstimate, getUserBusinessInfo } from './estimateSendService';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import EstimateCard from './EstimateCard';
import EstimateModal from './EstimateModal';
import AddEstimateSection from './AddEstimateSection';
import SendEstimateModal from './SendEstimateModal';
import EstimateStatusTabs from './EstimateStatusTabs';
import { saveEstimates, getEstimates, clearEstimatesCache } from '../../utils/localStorageUtils';
import AuthModal from '../profile/AuthModal';
import VerificationRequiredModal from '../../components/VerificationRequiredModal';

const Estimates = ({ 
  isDarkMode, 
  jobs = [], 
  onApplyToJob, 
  pendingEstimateData, 
  onClearPendingData, 
  navigationData,
  onNavigateToJobs,
  isEmailVerified,
  onResendVerification
}) => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [sendingEstimate, setSendingEstimate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [userInfo, setUserInfo] = useState(null);
  const lastHandledEstimateId = useRef(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Get colors from centralized theme
  const colors = getColors(isDarkMode);

  // Load user business info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          return;
        }
        
        console.log('Loading business info for user:', user.uid);
        const info = await getUserBusinessInfo(user.uid);
        console.log('Loaded business info:', info);
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
        setIsUserLoggedIn(true);
      } else {
        setLoading(false);
        clearEstimatesCache();
        setIsUserLoggedIn(false);
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
    
    if (viewEstimateId && estimates.length > 0 && lastHandledEstimateId.current !== viewEstimateId) {
      const estimateToView = estimates.find(e => e.id === viewEstimateId);
      if (estimateToView) {
        setEditingEstimate(estimateToView);
        lastHandledEstimateId.current = viewEstimateId;
      }
    }
    
    if (!viewEstimateId && lastHandledEstimateId.current) {
      lastHandledEstimateId.current = null;
    }
  }, [navigationData, estimates]);

  // Handle creating a new estimate from navigation (from Jobs page)
  useEffect(() => {
    if (navigationData?.createNew) {
      console.log('📝 Opening estimate form from navigation with data:', navigationData);
      
      // Check if user is verified before allowing creation
      if (!isEmailVerified) {
        setShowVerificationModal(true);
        return;
      }
      
      setShowAddForm(true);
      setEditingEstimate(null);
    }
  }, [navigationData, isEmailVerified]);

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
      // If navigationData has a jobId, include it in the estimate
      const dataToSave = {
        ...estimateData,
        jobId: navigationData?.jobId || estimateData.jobId || null
      };
      
      if (editingEstimate) {
        await updateEstimate(editingEstimate.id, dataToSave);
      } else {
        const newEstimateId = await createEstimate(dataToSave);
        console.log('✅ New estimate created:', newEstimateId);
        
        // If this estimate was created from a job, navigate back to Jobs
        if (navigationData?.jobId && onNavigateToJobs) {
          console.log('🔙 Navigating back to Jobs with jobId:', navigationData.jobId);
          onNavigateToJobs({ 
            openJobId: navigationData.jobId,
            newEstimateId: newEstimateId 
          });
        }
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

  // Handle opening send modal
  const handleSendEstimate = (estimate) => {
    setSendingEstimate(estimate);
  };

  // Handle status update
  const handleUpdateStatus = async (estimateId, newStatus) => {
    try {
      const estimate = estimates.find(est => est.id === estimateId);
      
      if (!estimate) {
        console.error('Estimate not found');
        return;
      }
      
      await updateEstimate(estimateId, {
        ...estimate,
        status: newStatus
      });
      
      clearEstimatesCache();
      loadEstimates();
      
    } catch (error) {
      console.error('Error updating estimate status:', error);
      alert('Failed to update estimate status. Please try again.');
    }
  };

  // Handle actual sending from modal
  const handleSendFromModal = async (email, message) => {
    try {
      let businessInfo = userInfo;
      
      if (!businessInfo) {
        console.log('Loading user info...');
        businessInfo = await getUserBusinessInfo(auth.currentUser?.uid);
        setUserInfo(businessInfo);
      }
      
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
      
      // Record that the estimate was sent
      await recordEstimateSent(sendingEstimate.id, email);

      clearEstimatesCache();
      await loadEstimates();
      
      clearEstimatesCache();
      await loadEstimates();
    } catch (error) {
      console.error('Error sending estimate:', error);
      alert('Failed to send estimate. Please try again.');
    } finally {
      setSendingEstimate(null);
    }
  };

  // Handle download from modal
  const handleDownloadFromModal = async () => {
    try {
      await downloadEstimate(sendingEstimate, userInfo);
      setSendingEstimate(null);
    } catch (error) {
      console.error('Error downloading estimate:', error);
      alert('Failed to download estimate. Please try again.');
    }
  };

  // Handle add estimate click
  const handleAddEstimateClick = () => {
    if (!isUserLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    if (!isEmailVerified) {
      setShowVerificationModal(true);
      return;
    }
    
    setShowAddForm(true);
    setEditingEstimate(null);
  };

  // Calculate status counts
  const statusCounts = {
    all: estimates.length,
    Draft: estimates.filter(est => est.status === 'Draft' || !est.status).length,
    Pending: estimates.filter(est => est.status === 'Pending').length,
    Accepted: estimates.filter(est => est.status === 'Accepted').length
  };

  // Filter estimates
  const filteredEstimates = estimates.filter(est => {
    // Status filter
    if (activeStatusTab === 'Draft' && est.status !== 'Draft' && est.status) return false;
    if (activeStatusTab === 'Pending' && est.status !== 'Pending') return false;
    if (activeStatusTab === 'Accepted' && est.status !== 'Accepted') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        est.name?.toLowerCase().includes(query) ||
        est.clientName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.mainBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: colors.subtext }}>Loading estimates...</div>
      </div>
    );
  }

  return (
    <div className="estimates-container">
      {/* Verification Modal */}
      <VerificationRequiredModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        isDarkMode={isDarkMode}
        featureName="create new estimates"
        onResendVerification={onResendVerification}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Add Estimate Modal */}
      {showAddForm && !editingEstimate && (
        <EstimateModal
          editingEstimate={null}
          onSave={saveEstimate}
          onCancel={() => setShowAddForm(false)}
          onDelete={null}
          isDarkMode={isDarkMode}
          colors={colors}
          isNewEstimate={true}
          prefilledData={navigationData} 
        />
      )}

      {/* Edit Estimate Modal */}
      {editingEstimate && !showAddForm && !sendingEstimate && (
        <EstimateModal
          editingEstimate={editingEstimate}
          onSave={saveEstimate}
          onCancel={cancelEdit}
          onDelete={deleteEstimate}
          isDarkMode={isDarkMode}
          colors={colors}
          isNewEstimate={false}
        />
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

      <div style={{ 
        minHeight: '100vh', 
        background: colors.mainBg,
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '1rem 0.25rem' }}>
          {/* Status Tabs */}
          <EstimateStatusTabs
            activeStatusTab={activeStatusTab}
            setActiveStatusTab={setActiveStatusTab}
            statusCounts={statusCounts}
            colors={colors}
          />

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
          <AddEstimateSection
            handleAddEstimateClick={handleAddEstimateClick}
            isDarkMode={isDarkMode}
            colors={colors}
          />

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
              <Search size={48} color={colors.subtext} style={{ margin: '0 auto 1rem' }} />
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
              <FileText size={48} color={colors.subtext} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
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
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Estimates;