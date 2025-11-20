import React, { useState } from 'react';
import { UserPlus, X, Mail, Check, Clock, XCircle, Users } from 'lucide-react';

const ElectricianInvite = ({
  invitedElectricians = [],
  onAddElectrician,
  onRemoveElectrician,
  isDarkMode,
  colors,
  disabled = false
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddElectrician = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if already invited
    const alreadyInvited = invitedElectricians.some(
      inv => inv.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (alreadyInvited) {
      setError('This electrician has already been invited');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await onAddElectrician(email.trim().toLowerCase());
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to add electrician');
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <Check size={14} style={{ color: '#10b981' }} />;
      case 'rejected':
        return <XCircle size={14} style={{ color: '#ef4444' }} />;
      case 'pending':
      default:
        return <Clock size={14} style={{ color: '#f59e0b' }} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Declined';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
      default:
        return '#f59e0b';
    }
  };

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: colors.text,
        marginBottom: '0.375rem',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} />
          Team Members
        </div>
      </label>

      {/* Add Electrician Input */}
      {!disabled && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Mail 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext,
                  pointerEvents: 'none'
                }}
              />
              <input
                type="email"
                placeholder="Enter electrician's email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddElectrician();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingLeft: '2.5rem',
                  border: `1px solid ${error ? '#ef4444' : colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleAddElectrician}
              disabled={isAdding || !email.trim()}
              style={{
                padding: '0.75rem',
                background: isAdding || !email.trim() ? colors.border : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isAdding || !email.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isAdding || !email.trim() ? 0.5 : 1
              }}
            >
              {isAdding ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              ) : (
                <UserPlus size={16} />
              )}
            </button>
          </div>

          {error && (
            <div style={{
              fontSize: '0.75rem',
              color: '#ef4444',
              marginBottom: '0.5rem',
              textAlign: 'left'
            }}>
              {error}
            </div>
          )}

          <p style={{
            fontSize: '0.75rem',
            color: colors.subtext,
            margin: 0,
            fontStyle: 'italic',
            textAlign: 'left'
          }}>
            Invited electricians can clock in/out and view job details, but won't see costs or invoices
          </p>
        </div>
      )}

      {/* Invited Electricians List */}
      {invitedElectricians.length > 0 && (
        <div style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}>
          {invitedElectricians.map((electrician, index) => (
            <div
              key={electrician.email || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderBottom: index < invitedElectricians.length - 1 
                  ? `1px solid ${colors.border}` 
                  : 'none'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: colors.text,
                  fontWeight: '500',
                  marginBottom: '0.25rem',
                  textAlign: 'left'
                }}>
                  {electrician.email}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  color: getStatusColor(electrician.status)
                }}>
                  {getStatusIcon(electrician.status)}
                  <span>{getStatusLabel(electrician.status)}</span>
                </div>
              </div>

              {!disabled && electrician.status !== 'accepted' && (
                <button
                  type="button"
                  onClick={() => onRemoveElectrician(electrician.email)}
                  style={{
                    padding: '0.375rem',
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Remove invitation"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {invitedElectricians.length === 0 && !disabled && (
        <div style={{
          padding: '1rem',
          background: colors.bg,
          border: `1px dashed ${colors.border}`,
          borderRadius: '0.5rem',
          textAlign: 'center',
          color: colors.subtext,
          fontSize: '0.875rem'
        }}>
          No team members added yet
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ElectricianInvite;