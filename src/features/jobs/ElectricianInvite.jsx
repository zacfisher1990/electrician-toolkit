import React, { useState } from 'react';
import { Mail, X, Users } from 'lucide-react';

const ElectricianInvite = ({
  invitedElectricians = [],
  onAddElectrician,
  onRemoveElectrician,
  isDarkMode,
  colors,
  disabled = false
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const MAX_TEAM_MEMBERS = 30;

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddClick = () => {
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if already invited
    const alreadyInvited = invitedElectricians.some(
      inv => inv.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadyInvited) {
      setError('This electrician has already been invited');
      return;
    }

    // Check limit
    if (invitedElectricians.length >= MAX_TEAM_MEMBERS) {
      setError(`Maximum of ${MAX_TEAM_MEMBERS} team members reached`);
      return;
    }

    // Add the electrician
    if (onAddElectrician) {
      onAddElectrician(email.trim());
      setEmail('');
    }
  };

  const handleRemoveClick = (emailToRemove) => {
    if (onRemoveElectrician) {
      onRemoveElectrician(emailToRemove);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddClick();
    }
  };

  // Determine counter color based on how full it is
  const getCounterColor = () => {
    const count = invitedElectricians.length;
    if (count >= MAX_TEAM_MEMBERS) return '#ef4444'; // Red when full
    if (count >= 25) return '#f59e0b'; // Orange when close
    return colors.subtext; // Normal color
  };

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {/* Header with counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: colors.text,
          textAlign: 'left'
        }}>
          <Users size={16} />
          Team Members
        </label>
        
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: getCounterColor(),
          padding: '0.125rem 0.5rem',
          background: invitedElectricians.length >= 25 
            ? (invitedElectricians.length >= MAX_TEAM_MEMBERS ? '#fee2e2' : '#fef3c7')
            : colors.bg,
          borderRadius: '0.25rem'
        }}>
          {invitedElectricians.length}/{MAX_TEAM_MEMBERS}
        </span>
      </div>

      {/* Input field */}
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
              setError('');
            }}
            onKeyPress={handleKeyPress}
            disabled={disabled || invitedElectricians.length >= MAX_TEAM_MEMBERS}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: `1px solid ${error ? '#ef4444' : colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              background: colors.inputBg,
              color: colors.text,
              boxSizing: 'border-box',
              opacity: disabled || invitedElectricians.length >= MAX_TEAM_MEMBERS ? 0.5 : 1
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          disabled={disabled || invitedElectricians.length >= MAX_TEAM_MEMBERS}
          style={{
            padding: '0.75rem 1.25rem',
            background: invitedElectricians.length >= MAX_TEAM_MEMBERS 
              ? colors.border 
              : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: disabled || invitedElectricians.length >= MAX_TEAM_MEMBERS 
              ? 'not-allowed' 
              : 'pointer',
            opacity: disabled || invitedElectricians.length >= MAX_TEAM_MEMBERS ? 0.5 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          Invite
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: '0.5rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          marginBottom: '0.5rem',
          textAlign: 'left'
        }}>
          {error}
        </div>
      )}

      {/* Helper text */}
      <div style={{
        fontSize: '0.75rem',
        color: colors.subtext,
        fontStyle: 'italic',
        marginBottom: '0.75rem',
        textAlign: 'left'
      }}>
        Invited electricians can clock in/out and view job details, but won't have access to costs, estimates, or invoices.
      </div>

      {/* List of invited electricians */}
      {invitedElectricians.length > 0 && (
        <div style={{
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}>
          {invitedElectricians.map((invitation, index) => (
            <div
              key={invitation.email || index}
              style={{
                padding: '0.75rem',
                background: colors.cardBg,
                borderBottom: index < invitedElectricians.length - 1 
                  ? `1px solid ${colors.border}` 
                  : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: colors.text,
                  fontWeight: '500'
                }}>
                  {invitation.email}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: invitation.status === 'accepted' ? '#10b981' :
                         invitation.status === 'rejected' ? '#ef4444' :
                         '#f59e0b',
                  fontWeight: '500',
                  marginTop: '0.125rem'
                }}>
                  {invitation.status === 'accepted' && '✓ Accepted'}
                  {invitation.status === 'rejected' && '✗ Declined'}
                  {invitation.status === 'pending' && '⏳ Pending'}
                </div>
              </div>
              
              {/* Only show remove button for pending invitations */}
              {invitation.status === 'pending' && !disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveClick(invitation.email)}
                  style={{
                    padding: '0.375rem',
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
    </div>
  );
};

export default ElectricianInvite;