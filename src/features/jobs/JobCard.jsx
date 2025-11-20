import React, { useRef, useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Edit, FileText, Receipt, DollarSign, 
  ChevronDown, ChevronUp, Play, Square, Camera, Users, Share2 
} from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import styles from './JobCard.module.css';

const JobCard = ({ 
  job, 
  statusConfig, 
  statusDropdownOpen, 
  setStatusDropdownOpen,
  onUpdateStatus,
  onViewJob,
  onViewEstimate,
  onViewInvoice,
  onClockInOut,
  isDarkMode,
  colors,
  estimates = [],
  onShowToast
}) => {
  const statusDropdownRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Check if this is an optimistic (loading) job
  const isOptimistic = job._isOptimistic === true;
  const photosUploading = job._photosUploading || 0;
  
  // NEW: Check if this is a shared job (user is team member, not owner)
  const isSharedJob = job.isSharedJob === true;
  const permissions = job.permissions || {};
  
  const StatusIcon = statusConfig[job.status]?.icon;
  const jobTitle = job.title || job.name;
  
  // FIXED: Check for estimates in the estimateIds array (not singular estimateId)
  // For shared jobs, don't show estimates
  const linkedEstimates = !isSharedJob 
    ? estimates.filter(est => job.estimateIds && job.estimateIds.includes(est.id))
    : [];
  const linkedEstimate = linkedEstimates.length > 0 ? linkedEstimates[0] : null;

  // Check if job has photos
  const hasPhotos = job.photos && job.photos.length > 0;

  // Check if job has team members
  const hasTeamMembers = job.invitedElectricians && job.invitedElectricians.length > 0;
  const acceptedTeamMembers = hasTeamMembers 
    ? job.invitedElectricians.filter(inv => inv.status === 'accepted')
    : [];

  // ⚡ PRELOAD IMAGES as soon as component mounts (before user expands)
  useEffect(() => {
    if (hasPhotos) {
      job.photos.forEach(photo => {
        const img = new Image();
        img.src = photo.url || photo.preview;
      });
    }
  }, [job.photos, hasPhotos]);

  // Update timer every second when clocked in
  useEffect(() => {
    if (job.clockedIn) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [job.clockedIn]);

  // Calculate total hours from all work sessions
  const calculateTotalHours = () => {
    if (!job.workSessions || job.workSessions.length === 0) return 0;
    
    let totalMs = 0;
    job.workSessions.forEach(session => {
      if (session.startTime && session.endTime) {
        totalMs += new Date(session.endTime) - new Date(session.startTime);
      }
    });
    
    return totalMs / (1000 * 60 * 60); // Convert to hours
  };

  // Calculate current session duration
  const getCurrentSessionDuration = () => {
    if (!job.clockedIn || !job.currentSessionStart) return 0;
    return (currentTime - new Date(job.currentSessionStart)) / 1000; // Return in seconds
  };

  // Format duration for display (HH:MM format)
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Format time for toast message
  const formatTimeForToast = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleClockInOut = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClockInOut) {
      const jobName = job.title || job.name;
      const isClockingIn = !job.clockedIn;
      
      // Perform the clock action immediately (no confirmation)
      onClockInOut(job.id, isClockingIn);
      
      // Show toast notification
      if (onShowToast) {
        if (isClockingIn) {
          onShowToast(`Clocked into ${jobName} at ${formatTimeForToast()}`, 'clock-in');
        } else {
          const sessionDuration = formatDuration(getCurrentSessionDuration());
          onShowToast(`Clocked out of ${jobName} - Session: ${sessionDuration}`, 'clock-out');
        }
      }
    }
  };

  const handleEstimateClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Don't allow estimate viewing for shared jobs
    if (isSharedJob) return;
    
    if (linkedEstimates.length > 0 && onViewEstimate) {
      onViewEstimate(job);
    }
  };

  const totalHours = calculateTotalHours();
  const currentSessionSeconds = getCurrentSessionDuration();

  // Determine if buttons should be enabled based on permissions
  const canViewEstimate = !isSharedJob && linkedEstimates.length > 0;
  const canViewInvoice = !isSharedJob && (
    job.invoiceId || 
    job.estimateIds?.length > 0 || 
    (job.estimatedCost && parseFloat(job.estimatedCost) > 0)
  );
  const canEditJob = !isSharedJob || permissions.canEditJob;
  const canClockInOut = !isSharedJob || permissions.canClockInOut !== false;

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${isSharedJob ? '#3b82f6' : colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        transition: 'all 0.2s',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        position: 'relative',
        opacity: isOptimistic ? 0.7 : 1
      }}
    >
      {/* Shared Job Badge */}
      {isSharedJob && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '12px',
          background: '#3b82f6',
          color: 'white',
          padding: '0.125rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.625rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Share2 size={10} />
          SHARED JOB
        </div>
      )}

      {/* Loading overlay for optimistic jobs */}
      {isOptimistic && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: colors.cardBg,
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
          fontSize: '0.75rem',
          color: colors.subtext,
          zIndex: 10
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            border: '2px solid',
            borderColor: `${colors.text} transparent ${colors.text} transparent`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          {photosUploading > 0 && (
            <span>Uploading {photosUploading} photo{photosUploading > 1 ? 's' : ''}...</span>
          )}
          {photosUploading === 0 && <span>Saving...</span>}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className={styles.cardHeader}>
        <div 
          className={styles.cardTitle}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <h3 style={{
            margin: '0 0 0.25rem 0',
            color: colors.text,
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {jobTitle}
            {hasPhotos && (
              <Camera 
                size={14} 
                style={{ 
                  color: colors.subtext,
                  opacity: 0.7
                }} 
              />
            )}
            {/* Team Members Indicator */}
            {hasTeamMembers && !isSharedJob && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#3b82f6',
                fontSize: '0.75rem'
              }}>
                <Users size={14} />
                <span>{acceptedTeamMembers.length}</span>
              </div>
            )}
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </h3>
          <p style={{
            margin: 0,
            color: colors.subtext,
            fontSize: '0.875rem'
          }}>
            {job.client}
          </p>
        </div>
      

        {/* Status Badge with Timer - right side */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end', 
          gap: '0.25rem',
          alignSelf: 'flex-start'
        }}>
          <div style={{ position: 'relative' }} ref={statusDropdownOpen === job.id ? statusDropdownRef : null}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isSharedJob) {
                  setStatusDropdownOpen(statusDropdownOpen === job.id ? null : job.id);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                padding: '4px 8px',
                borderRadius: '4px',
                background: `${statusConfig[job.status]?.color || '#6b7280'}20`,
                color: statusConfig[job.status]?.color || '#6b7280',
                fontSize: '11px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: isSharedJob ? 'default' : 'pointer',
                transition: 'all 0.2s',
                lineHeight: '1'
              }}
            >
              {StatusIcon && <StatusIcon size={12} />}
              <span>{statusConfig[job.status]?.label || job.status}</span>
              {!isSharedJob && <ChevronDown size={10} />}
            </button>

            {/* Status Dropdown */}
            {statusDropdownOpen === job.id && !isSharedJob && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.25rem',
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                minWidth: '120px'
              }}>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(job.id, status);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: job.status === status ? `${config.color}15` : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: config.color,
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    <config.icon size={12} />
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clock Timer Display */}
          {(job.clockedIn || totalHours > 0) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              color: job.clockedIn ? '#dc2626' : colors.subtext
            }}>
              {job.clockedIn && (
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {formatDuration(currentSessionSeconds)}
                </div>
              )}
              {totalHours > 0 && (
                <div style={{
                  fontSize: '0.7rem'
                }}>
                  Total: {totalHours.toFixed(2)}h
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location and Date on same line */}
      {(job.location || job.date) && (
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            color: colors.subtext,
            fontSize: '0.875rem',
            gap: '1rem',
            cursor: 'pointer'
          }}
        >
          {job.location && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MapPin size={16} />
              <span>{job.location}</span>
            </div>
          )}
          
          {job.date && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginLeft: 'auto'
            }}>
              <Calendar size={16} />
              <span>
                {new Date(job.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {job.time && ` (${job.time})`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: `1px solid ${colors.border}`
        }}>
          {/* Cost - ONLY for job owners */}
          {!isSharedJob && job.estimatedCost && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              color: colors.subtext,
              fontSize: '0.875rem'
            }}>
              <DollarSign size={16} />
              <span>${Number(job.estimatedCost).toLocaleString()}</span>
            </div>
          )}

          {/* Team Members List - for job owners */}
          {hasTeamMembers && !isSharedJob && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.5rem',
              background: colors.bg,
              borderRadius: '0.375rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}>
                <Users size={14} />
                Team Members
              </div>
              {job.invitedElectricians.map((member, idx) => (
                <div
                  key={member.email || idx}
                  style={{
                    fontSize: '0.75rem',
                    color: colors.subtext,
                    padding: '0.25rem 0',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{member.email}</span>
                  <span style={{
                    color: member.status === 'accepted' ? '#10b981' : 
                           member.status === 'rejected' ? '#ef4444' : '#f59e0b',
                    fontWeight: '500'
                  }}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Shared Job Info - for team members */}
          {isSharedJob && job.originalOwnerEmail && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.5rem',
              background: '#eff6ff',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              color: '#1e40af'
            }}>
              <strong>Job Owner:</strong> {job.originalOwnerEmail}
            </div>
          )}

          {/* Photo Gallery - Compact view in card */}
          {hasPhotos && (
            <div style={{ marginBottom: '0.75rem' }}>
              <PhotoGallery
                photos={job.photos}
                compact={true}
                maxVisible={4}
                isDarkMode={isDarkMode}
                colors={colors}
              />
            </div>
          )}

          {job.notes && (
            <div style={{
              marginBottom: '0.75rem'
            }}>
              <p style={{
                margin: 0,
                padding: '0.75rem',
                background: colors.bg,
                borderRadius: '0.5rem',
                color: colors.text,
                fontSize: '0.875rem',
                lineHeight: '1.5',
                textAlign: 'left',
                whiteSpace: 'pre-wrap'
              }}>
                {job.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Four Action Buttons - Unified Bar Style */}
      <div style={{
        display: 'flex',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        marginTop: '0.5rem'
      }}>
        {/* Clock In/Out - Always available for shared jobs */}
        <button
          onClick={canClockInOut ? handleClockInOut : undefined}
          title={job.clockedIn ? "Clock Out" : "Clock In"}
          disabled={!canClockInOut}
          style={{
            flex: 1,
            background: job.clockedIn ? '#9f1239' : (isDarkMode ? '#374151' : '#f3f4f6'),
            border: 'none',
            borderRight: `1px solid ${colors.border}`,
            borderRadius: 0,
            color: job.clockedIn ? 'white' : colors.text,
            cursor: canClockInOut ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem',
            opacity: canClockInOut ? 1 : 0.5
          }}
        >
          {job.clockedIn ? <Square size={14} /> : <Play size={14} />}
          <span style={{ fontSize: '0.625rem' }}>
            {job.clockedIn ? 'Clock Out' : 'Clock In'}
          </span>
        </button>

        {/* Edit - Disabled for shared jobs */}
        <button
          onClick={canEditJob ? (e) => {
            e.stopPropagation();
            e.preventDefault();
            onViewJob(job);
          } : undefined}
          title={isSharedJob ? "View Only" : "Edit Job"}
          disabled={!canEditJob}
          style={{
            flex: 1,
            background: isDarkMode ? '#374151' : '#f3f4f6',
            border: 'none',
            borderRight: `1px solid ${colors.border}`,
            borderRadius: 0,
            color: canEditJob ? colors.text : colors.subtext,
            cursor: canEditJob ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem',
            opacity: canEditJob ? 1 : 0.5
          }}
        >
          <Edit size={14} />
          <span style={{ fontSize: '0.625rem' }}>
            {isSharedJob ? 'View' : 'Edit'}
          </span>
        </button>

        {/* Estimate - Hidden/Disabled for shared jobs */}
        <button
          onClick={canViewEstimate ? handleEstimateClick : undefined}
          title={
            isSharedJob 
              ? "Not available for shared jobs" 
              : linkedEstimate 
                ? "View Estimate" 
                : "No estimate linked"
          }
          disabled={!canViewEstimate}
          style={{
            flex: 1,
            background: isDarkMode ? '#374151' : '#f3f4f6',
            border: 'none',
            borderRight: `1px solid ${colors.border}`,
            borderRadius: 0,
            color: canViewEstimate ? colors.text : colors.subtext,
            cursor: canViewEstimate ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem',
            opacity: canViewEstimate ? 1 : 0.3
          }}
        >
          <FileText size={14} />
          <span style={{ fontSize: '0.625rem' }}>Estimate</span>
        </button>

        {/* Invoice - Hidden/Disabled for shared jobs */}
        <button
          onClick={canViewInvoice ? (e) => {
            e.stopPropagation();
            onViewInvoice(job);
          } : undefined}
          disabled={!canViewInvoice}
          style={{
            flex: 1,
            background: isDarkMode ? '#374151' : '#f3f4f6',
            color: canViewInvoice ? colors.text : colors.subtext,
            border: 'none',
            borderRadius: 0,
            fontWeight: '600',
            cursor: canViewInvoice ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem',
            opacity: canViewInvoice ? 1 : 0.3
          }}
          title={
            isSharedJob
              ? "Not available for shared jobs"
              : job.invoiceId 
                ? "View Invoice" 
                : (job.estimateIds?.length > 0 || (job.estimatedCost && parseFloat(job.estimatedCost) > 0))
                  ? "Create Invoice"
                  : "Add an estimate or cost first"
          }
        >
          <Receipt size={14} />
          <span style={{ fontSize: '0.625rem' }}>Invoice</span>
        </button>
      </div>
    </div>
  );
};

export default JobCard;