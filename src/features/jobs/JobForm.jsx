import React from 'react';
import EstimateSelector from './EstimateSelector';
import { X } from 'lucide-react';

const JobForm = ({
  formData,
  setFormData,
  linkedEstimate,
  linkedEstimates = [], // Array of linked estimates
  estimates,
  showEstimateMenu,
  setShowEstimateMenu,
  onSelectEstimate,
  onCreateNewEstimate,
  onViewEstimate,
  onRemoveEstimate,
  onAddAdditionalEstimate, // New prop for adding additional estimates
  onViewAllEstimates,
  estimateMenuRef,
  isDarkMode,
  colors
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

  return (
    <>
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
            width: '100%',
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
            width: '100%',
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

      {/* Estimate Section */}
      <div style={{ marginBottom: '0.75rem' }}>
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
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '0.25rem'
                  }}>
                    {estimate.title || estimate.name || 'Untitled Estimate'}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: colors.subtext
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
                  color: colors.text
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <input
          type="number"
          placeholder="Cost ($)"
          value={formData.estimatedCost}
          onChange={(e) => setFormData(prev => ({...prev, estimatedCost: e.target.value}))}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            background: colors.inputBg,
            color: colors.text,
            boxSizing: 'border-box'
          }}
          disabled={linkedEstimates && linkedEstimates.length > 0}
        />

        <input
          type="text"
          placeholder="Duration"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
          style={{
            width: '100%',
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

      {linkedEstimates && linkedEstimates.length > 0 && (
        <div style={{
          fontSize: '0.75rem',
          color: colors.subtext,
          marginTop: '-0.5rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic'
        }}>
          Cost is automatically calculated from linked estimates (${totalFromEstimates.toLocaleString()})
        </div>
      )}

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
    </>
  );
};

export default JobForm;