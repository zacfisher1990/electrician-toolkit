import React, { useState } from 'react';
import { Trash2, Edit, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const EstimateCard = ({ 
  estimate, 
  isDarkMode, 
  onEdit, 
  onDelete, 
  onSendEstimate, // NEW: Add send handler prop
  colors 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use provided colors or fallback to defaults
  const cardColors = colors || {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
  };

  return (
    <div
      style={{
        background: cardColors.cardBg,
        border: `1px solid ${cardColors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        transition: 'all 0.2s'
      }}
    >
      {/* Header - Always visible, clickable to expand/collapse */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          cursor: 'pointer',
          marginBottom: isExpanded ? '0.75rem' : 0
        }}
      >
        {/* Estimate Name and Date */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 0.25rem 0',
            color: cardColors.text,
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
            color: cardColors.subtext,
            fontSize: '0.875rem'
          }}>
            {formatDate(estimate.createdAt)}
          </p>
        </div>

        {/* Total Amount */}
        <div style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#10b981'
        }}>
          ${Number(estimate.total || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: `1px solid ${cardColors.border}`
        }}>
          {/* Labor Details */}
          {estimate.laborHours && estimate.laborRate && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.375rem 0',
              fontSize: '0.875rem',
              color: cardColors.subtext
            }}>
              <span>Labor: {estimate.laborHours}h × ${estimate.laborRate}/hr</span>
              <span>${(estimate.laborHours * estimate.laborRate).toFixed(2)}</span>
            </div>
          )}

          {/* Materials List */}
          {estimate.materials && estimate.materials.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              {estimate.materials.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.375rem 0',
                    fontSize: '0.875rem',
                    color: cardColors.subtext
                  }}
                >
                  <span>{item.name}</span>
                  <span>${parseFloat(item.cost || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {estimate.notes && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: cardColors.bg,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: cardColors.text
            }}>
              {estimate.notes}
            </div>
          )}

          {/* Action Buttons - Matching Invoice Layout */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.75rem'
          }}>
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(estimate);
              }}
              style={{
                flex: 1,
                padding: '0.625rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              <Edit size={16} />
              Edit
            </button>

            {/* Send Button */}
            {onSendEstimate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendEstimate(estimate);
                }}
                style={{
                  padding: '0.625rem 0.75rem',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                <Send size={16} />
                Send
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(estimate.id, estimate.name);
                }}
                style={{
                  padding: '0.625rem 0.75rem',
                  background: 'transparent',
                  color: '#ef4444',
                  border: `1px solid #ef4444`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#ef4444';
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateCard;