import React, { useState } from 'react';
import { Trash2, Edit, ChevronDown, ChevronUp, DollarSign, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const EstimateCard = ({ 
  estimate, 
  isDarkMode, 
  jobs = [], 
  onEdit, 
  onDelete, 
  onApplyToJob 
}) => {
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // NEW: Add expanded state

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
  };

  const handleApplyToJob = (jobId) => {
    if (onApplyToJob) {
      onApplyToJob(estimate, jobId);
    }
    setShowJobDropdown(false);
  };

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        boxShadow: 'none'
      }}
    >
      {/* Header: Name and Total - CLICKABLE */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: isExpanded ? '0.75rem' : '0',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div>
          <h3 style={{
            margin: '0 0 0.25rem 0',
            color: colors.text,
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {estimate.name}
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </h3>
          <p style={{
            margin: 0,
            color: colors.subtext,
            fontSize: '0.75rem'
          }}>
            {formatDate(estimate.createdAt)}
          </p>
        </div>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#10b981'
        }}>
          ${estimate.total.toFixed(2)}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <>
          {/* Labor Details */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            color: colors.subtext,
            fontSize: '0.875rem'
          }}>
            <Clock size={16} />
            <span>
              {estimate.laborHours}h × ${estimate.laborRate}/hr = ${(estimate.laborHours * estimate.laborRate).toFixed(2)}
            </span>
          </div>

          {/* Materials List */}
          {estimate.materials.length > 0 && (
            <div style={{
              padding: '0.75rem',
              background: colors.bg,
              borderRadius: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              {estimate.materials.map((mat, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  color: colors.subtext,
                  marginBottom: idx < estimate.materials.length - 1 ? '0.25rem' : 0
                }}>
                  <span>{mat.name}</span>
                  <span>${parseFloat(mat.cost).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Apply to Job Dropdown */}
            <div style={{ position: 'relative', flex: 1 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowJobDropdown(!showJobDropdown);
                }}
                style={{
                  width: '100%',
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
                  fontWeight: '500'
                }}
              >
                <DollarSign size={16} />
                Add to Job
                <ChevronDown size={14} />
              </button>

              {showJobDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowJobDropdown(false);
                    }}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 9998
                    }}
                  />
                  
                  {/* Dropdown Menu */}
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                    marginBottom: '0.5rem',
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 9999
                  }}>
                    {/* Create New Job Option */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyToJob('new');
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${colors.border}`,
                        color: '#2563eb',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      + Create New Job
                    </button>
                    
                    {/* Existing Jobs */}
                    {jobs.map(job => (
                      <button
                        key={job.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyToJob(job.id);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `1px solid ${colors.border}`,
                          color: colors.text,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.875rem'
                        }}
                      >
                        {job.title || job.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(estimate);
              }}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Edit estimate"
            >
              <Edit size={16} />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(estimate.id, estimate.name);
              }}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: '1px solid #ef4444',
                borderRadius: '0.5rem',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Delete estimate"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EstimateCard;