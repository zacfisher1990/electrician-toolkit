import React, { useState, useEffect } from 'react';
import { Mail, Check, X, MapPin, Calendar, User, Clock, RefreshCw } from 'lucide-react';
import { 
  getMyPendingInvitations, 
  acceptJobInvitation, 
  rejectJobInvitation 
} from './invitationService';

const InvitationInbox = ({ 
  isDarkMode, 
  colors,
  onInvitationAccepted,
  onRefresh
}) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const pendingInvitations = await getMyPendingInvitations();
      setInvitations(pendingInvitations);
    } catch (err) {
      console.error('Error loading invitations:', err);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAccept = async (invitation) => {
    try {
      setProcessingId(invitation.id);
      setError(null);
      
      const result = await acceptJobInvitation(invitation.id);
      
      // Remove from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      // Notify parent
      if (onInvitationAccepted) {
        onInvitationAccepted(result);
      }
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitation) => {
    try {
      setProcessingId(invitation.id);
      setError(null);
      
      await rejectJobInvitation(invitation.id);
      
      // Remove from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError(err.message || 'Failed to decline invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: colors.subtext
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '3px solid',
          borderColor: `${colors.text} transparent ${colors.text} transparent`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
        Loading invitations...
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          margin: 0,
          color: colors.text,
          fontSize: '1.125rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Mail size={20} />
          Job Invitations
          {invitations.length > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              padding: '0.125rem 0.5rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}>
              {invitations.length}
            </span>
          )}
        </h3>
        
        <button
          onClick={loadInvitations}
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
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '0.75rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: colors.subtext,
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem'
        }}>
          <Mail size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: '0.9375rem' }}>
            No pending job invitations
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '1rem',
                opacity: processingId === invitation.id ? 0.7 : 1
              }}
            >
              {/* Job Title */}
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: colors.text,
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                {invitation.jobTitle}
              </h4>

              {/* Job Details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: colors.subtext,
                  fontSize: '0.875rem'
                }}>
                  <User size={14} />
                  <span>{invitation.jobClient}</span>
                </div>

                {invitation.jobLocation && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <MapPin size={14} />
                    <span>{invitation.jobLocation}</span>
                  </div>
                )}

                {invitation.jobDate && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <Calendar size={14} />
                    <span>
                      {new Date(invitation.jobDate + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: colors.subtext,
                  fontSize: '0.875rem'
                }}>
                  <Clock size={14} />
                  <span>Invited {formatDate(invitation.createdAt)}</span>
                </div>
              </div>

              {/* Invited By */}
              <div style={{
                padding: '0.5rem',
                background: colors.bg,
                borderRadius: '0.375rem',
                marginBottom: '0.75rem',
                fontSize: '0.8125rem',
                color: colors.text
              }}>
                <span style={{ color: colors.subtext }}>From: </span>
                <span style={{ fontWeight: '500' }}>{invitation.jobOwnerEmail}</span>
              </div>

              {/* Permission Notice */}
              <div style={{
                padding: '0.5rem',
                background: '#fef3c7',
                borderRadius: '0.375rem',
                marginBottom: '0.75rem',
                fontSize: '0.75rem',
                color: '#92400e'
              }}>
                ⚡ You'll be able to clock in/out and view job details, but won't have access to costs, estimates, or invoices.
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => handleAccept(invitation)}
                  disabled={processingId === invitation.id}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: processingId === invitation.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {processingId === invitation.id ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  ) : (
                    <>
                      <Check size={16} />
                      Accept
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleReject(invitation)}
                  disabled={processingId === invitation.id}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: processingId === invitation.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <X size={16} />
                  Decline
                </button>
              </div>
            </div>
          ))}
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

export default InvitationInbox;