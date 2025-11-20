import React from 'react';
import EstimateSelector from './EstimateSelector';
import PhotoUploader from './PhotoUploader';
import ElectricianInvite from './ElectricianInvite';
import { X } from 'lucide-react';

const JobForm = ({
  formData,
  setFormData,
  linkedEstimate,
  linkedEstimates = [],
  estimates,
  showEstimateMenu,
  setShowEstimateMenu,
  onSelectEstimate,
  onCreateNewEstimate,
  onViewEstimate,
  onRemoveEstimate,
  onAddAdditionalEstimate,
  onViewAllEstimates,
  estimateMenuRef,
  isDarkMode,
  colors,
  // NEW: Electrician invitation props
  onAddElectrician,
  onRemoveElectrician,
  isSharedJob = false // If true, this is a job shared with the user (limited permissions)
}) => {
  // Calculate total cost from all linked estimates
  const calculateTotalFromEstimates = () => {
    if (!linkedEstimates || linkedEstimates.length === 0) return 0;
    return linkedEstimates.reduce((total, estimate) => {
      const estimateTotal = estimate.total || estimate.estimatedCost || 0;
      return total + Number(estimateTotal);
    }, 0);
  };

  const totalFromEstimates = calculateTotalFromEstimates();

  // Label style - LEFT ALIGNED
  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: colors.text,
    marginBottom: '0.375rem',
    textAlign: 'left'
  };

  // Input style
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    background: colors.inputBg,
    color: colors.text,
    boxSizing: 'border-box',
    textAlign: 'left'
  };

  return (
    <>
      {/* Shared Job Notice */}
      {isSharedJob && (
        <div style={{
          padding: '0.75rem',
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '0.5rem',
          marginBottom: '0.75rem',
          fontSize: '0.8125rem',
          color: '#92400e'
        }}>
          ⚡ This is a shared job. You can view details and clock in/out, but cannot edit job information.
        </div>
      )}

      {/* Job Title */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>
          Job Title <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Enter job title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
          style={inputStyle}
          disabled={isSharedJob}
        />
      </div>

      {/* Client Name */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>
          Client Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Enter client name"
          value={formData.client}
          onChange={(e) => setFormData(prev => ({...prev, client: e.target.value}))}
          style={inputStyle}
          disabled={isSharedJob}
        />
      </div>

      {/* Location */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Location</label>
        <input
          type="text"
          placeholder="Enter location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
          style={inputStyle}
          disabled={isSharedJob}
        />
      </div>

      {/* Start Date and Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
            style={{
              ...inputStyle,
              colorScheme: isDarkMode ? 'dark' : 'light'
            }}
            disabled={isSharedJob}
          />
        </div>

        <div>
          <label style={labelStyle}>Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
            style={{
              ...inputStyle,
              colorScheme: isDarkMode ? 'dark' : 'light'
            }}
            disabled={isSharedJob}
          />
        </div>
      </div>

      {/* Electrician Invitation Section - ONLY for job owners */}
      {!isSharedJob && onAddElectrician && (
        <ElectricianInvite
          invitedElectricians={formData.invitedElectricians || []}
          onAddElectrician={onAddElectrician}
          onRemoveElectrician={onRemoveElectrician}
          isDarkMode={isDarkMode}
          colors={colors}
          disabled={isSharedJob}
        />
      )}

      {/* Estimate Section - HIDDEN for shared jobs */}
      {!isSharedJob && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>Estimate</label>
          
          {/* Show linked estimates if any */}
          {linkedEstimates && linkedEstimates.length > 0 ? (
            <div>
              {linkedEstimates.map((estimate, index) => (
                <div
                  key={estimate.id || index}
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: '0.25rem',
                      textAlign: 'left'
                    }}>
                      {estimate.title || estimate.name || 'Untitled Estimate'}
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: colors.subtext,
                      textAlign: 'left'
                    }}>
                      ${Number(estimate.total || estimate.estimatedCost || 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onViewEstimate(estimate)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'transparent',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        color: colors.text,
                        fontSize: '0.8125rem',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveEstimate(estimate.id)}
                      style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total from estimates */}
              {linkedEstimates.length > 1 && (
                <div style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: colors.text,
                    textAlign: 'left'
                  }}>
                    Total from Estimates
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#10b981'
                  }}>
                    ${totalFromEstimates.toLocaleString()}
                  </div>
                </div>
              )}

              {/* View All Estimates Summary Button */}
              {linkedEstimates.length > 1 && (
                <button
                  type="button"
                  onClick={onViewAllEstimates}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '0.5rem'
                  }}
                >
                  📊 View Combined Summary
                </button>
              )}

              {/* Add Additional Estimate Button */}
              <button
                type="button"
                onClick={onAddAdditionalEstimate}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'transparent',
                  border: `1px dashed ${colors.border}`,
                  borderRadius: '0.5rem',
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                + Add Additional Estimate
              </button>

              {/* EstimateSelector for adding additional estimates - only show when menu is active */}
              {showEstimateMenu && (
                <div style={{ 
                  marginTop: '0.5rem'
                }}>
                  <EstimateSelector
                    linkedEstimate={null}
                    estimates={estimates}
                    showMenu={true}
                    setShowMenu={setShowEstimateMenu}
                    onSelectEstimate={onSelectEstimate}
                    onCreateNewEstimate={onCreateNewEstimate}
                    onViewEstimate={onViewEstimate}
                    onRemoveEstimate={onRemoveEstimate}
                    menuRef={estimateMenuRef}
                    isDarkMode={isDarkMode}
                    colors={colors}
                    hideButton={true}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Show estimate selector if no estimates linked yet */
            <EstimateSelector
              linkedEstimate={linkedEstimate}
              estimates={estimates}
              showMenu={showEstimateMenu}
              setShowMenu={setShowEstimateMenu}
              onSelectEstimate={onSelectEstimate}
              onCreateNewEstimate={onCreateNewEstimate}
              onViewEstimate={onViewEstimate}
              onRemoveEstimate={onRemoveEstimate}
              menuRef={estimateMenuRef}
              isDarkMode={isDarkMode}
              colors={colors}
            />
          )}
        </div>
      )}

      {/* Cost - HIDDEN for shared jobs */}
      {!isSharedJob && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>Cost ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={formData.estimatedCost}
            onChange={(e) => setFormData(prev => ({...prev, estimatedCost: e.target.value}))}
            style={inputStyle}
            disabled={linkedEstimates && linkedEstimates.length > 0}
          />
        </div>
      )}

      {!isSharedJob && linkedEstimates && linkedEstimates.length > 0 && (
        <div style={{
          fontSize: '0.75rem',
          color: colors.subtext,
          marginTop: '-0.5rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic',
          textAlign: 'left'
        }}>
          Cost is automatically calculated from linked estimates (${totalFromEstimates.toLocaleString()})
        </div>
      )}

      {/* Status */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
          style={inputStyle}
          disabled={isSharedJob}
        >
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Photo Upload Section */}
      <div style={{ marginBottom: '0.75rem' }}>
        <PhotoUploader
          photos={formData.photos || []}
          onPhotosChange={(newPhotos) => {
            setFormData(prev => ({...prev, photos: newPhotos}))
          }}
          maxPhotos={10}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          placeholder="Add any additional notes..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
          rows="3"
          style={{
            ...inputStyle,
            resize: 'vertical',
            textAlign: 'left'
          }}
          disabled={isSharedJob}
        />
      </div>
    </>
  );
};

export default JobForm;