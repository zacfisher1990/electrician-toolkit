import React from 'react';
import { Plus } from 'lucide-react';

const EstimateSelector = ({ 
  linkedEstimate, 
  estimates, 
  showMenu, 
  setShowMenu, 
  onSelectEstimate, 
  onCreateNewEstimate, 
  onViewEstimate,
  onRemoveEstimate,
  menuRef,
  isDarkMode,
  colors 
}) => {
  if (linkedEstimate) {
    return (
      <div style={{ marginBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => onViewEstimate(linkedEstimate.id)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: colors.text,
              marginBottom: '0.25rem'
            }}>
              {linkedEstimate.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.subtext }}>
              ${Number(linkedEstimate.total || 0).toLocaleString()}
            </div>
          </div>
          <div style={{
            padding: '0.25rem 0.5rem',
            background: '#2563eb',
            color: 'white',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            View
          </div>
        </button>
        <button
          type="button"
          onClick={onRemoveEstimate}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginTop: '0.5rem',
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            color: colors.subtext,
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          Remove Estimate
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', marginBottom: '0.75rem' }} ref={showMenu ? menuRef : null}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
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

      {showMenu && (
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
          <button
            type="button"
            onClick={onCreateNewEstimate}
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
                type="button"
                onClick={() => onSelectEstimate(estimate)}
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
  );
};

export default EstimateSelector;