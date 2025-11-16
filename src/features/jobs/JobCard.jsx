import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Calendar, Edit, FileText, Receipt, DollarSign, ChevronDown, ChevronUp, Play, Square, Trash2, Camera } from 'lucide-react';
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
  estimates = []
}) => {
  const statusDropdownRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Check if this is an optimistic (loading) job
  const isOptimistic = job._isOptimistic === true;
  const photosUploading = job._photosUploading || 0;
  
  const StatusIcon = statusConfig[job.status].icon;
  const jobTitle = job.title || job.name;
  
  // FIXED: Check for estimates in the estimateIds array (not singular estimateId)
  const linkedEstimates = estimates.filter(est => 
    job.estimateIds && job.estimateIds.includes(est.id)
  );
  const linkedEstimate = linkedEstimates.length > 0 ? linkedEstimates[0] : null;

  // Check if job has photos
  const hasPhotos = job.photos && job.photos.length > 0;

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

  const handleClockInOut = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClockInOut) {
      // Add confirmation dialog
      const action = job.clockedIn ? 'clock out of' : 'clock into';
      const jobName = job.title || job.name;
      
      if (window.confirm(`Are you sure you want to ${action} "${jobName}"?`)) {
        onClockInOut(job.id, !job.clockedIn);
      }
    }
  };

  const handleEstimateClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  
  if (linkedEstimates.length > 0 && onViewEstimate) {
    onViewEstimate(job);
  }
};

  const totalHours = calculateTotalHours();
  const currentSessionSeconds = getCurrentSessionDuration();

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
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
                  setStatusDropdownOpen(statusDropdownOpen === job.id ? null : job.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: `${statusConfig[job.status].color}20`,
                  color: statusConfig[job.status].color,
                  fontSize: '11px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  lineHeight: '1',
                  minHeight: 'unset',
                  minWidth: 'unset',
                  height: 'fit-content',
                  width: 'fit-content',
                  boxSizing: 'border-box'
                }}
              >
                <StatusIcon size={12} />
                <span>{statusConfig[job.status].label}</span>
              </button>

              {statusDropdownOpen === job.id && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  zIndex: 100,
                  minWidth: '140px',
                  overflow: 'hidden'
                }}>
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const OptionIcon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(job.id, key);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: job.status === key ? `${config.color}15` : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: config.color,
                          fontSize: '0.875rem',
                          fontWeight: job.status === key ? '600' : '500',
                          textAlign: 'left'
                        }}
                      >
                        <OptionIcon size={14} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timer */}
            {(job.clockedIn || totalHours > 0) && (
              <div style={{
                fontSize: '0.75rem',
                color: colors.subtext,
                textAlign: 'right'
              }}>
                {job.clockedIn && (
                  <div style={{
                    color: colors.text,
                    fontWeight: '600',
                    fontSize: '0.875rem',
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
                {job.duration && ` ${job.duration}`}
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
          {job.estimatedCost && (
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
                whiteSpace: 'pre-wrap'  // ADDED: Preserves line breaks and spacing
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleClockInOut(e);
          }}
          title={job.clockedIn ? "Clock Out" : "Clock In"}
          style={{
            flex: 1,
            background: job.clockedIn ? '#9f1239' : (isDarkMode ? '#374151' : '#f3f4f6'),
            border: 'none',
            borderRight: `1px solid ${colors.border}`,
            borderRadius: 0,
            color: job.clockedIn ? 'white' : colors.text,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem'
          }}
        >
          {job.clockedIn ? <Square size={12} /> : <Play size={12} />}
          <span style={{ fontSize: '0.5625rem' }}>
            {job.clockedIn ? 'Clock Out' : 'Clock In'}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onViewJob(job);
          }}
          title="Edit Job"
          style={{
            flex: 1,
            background: isDarkMode ? '#374151' : '#f3f4f6',
            border: 'none',
            borderRight: `1px solid ${colors.border}`,
            borderRadius: 0,
            color: colors.text,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem'
          }}
        >
          <Edit size={12} />
          <span style={{ fontSize: '0.5625rem' }}>Edit</span>
        </button>

        <button
          onClick={handleEstimateClick}
          title={linkedEstimate ? "View Estimate" : "No estimate linked"}
          style={{
            flex: 1,
            background: isDarkMode ? '#374151' : '#f3f4f6',
            border: 'none',
            borderRight: `1px solid ${colors.border}`,
            borderRadius: 0,
            color: linkedEstimate ? colors.text : colors.subtext,
            cursor: linkedEstimate ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem',
            opacity: linkedEstimate ? 1 : 0.5
          }}
          disabled={linkedEstimates.length === 0}
        >
          <FileText size={12} />
          <span style={{ fontSize: '0.5625rem' }}>Estimate</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewInvoice(job);
          }}
          disabled={
            !job.invoiceId && 
            !(job.estimateIds?.length > 0 || (job.estimatedCost && parseFloat(job.estimatedCost) > 0))
          }
          style={{
            flex: 1,
            background: isDarkMode ? '#374151' : '#f3f4f6',
            color: (job.invoiceId || job.estimateIds?.length > 0 || (job.estimatedCost && parseFloat(job.estimatedCost) > 0)) ? colors.text : colors.subtext,
            border: 'none',
            borderRadius: 0,
            fontWeight: '600',
            cursor: (job.invoiceId || job.estimateIds?.length > 0 || (job.estimatedCost && parseFloat(job.estimatedCost) > 0)) ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.375rem 0.25rem',
            gap: '0.125rem',
            opacity: (!job.invoiceId && !job.estimateIds?.length && (!job.estimatedCost || parseFloat(job.estimatedCost) === 0)) ? 0.5 : 1
          }}
          title={
            job.invoiceId 
              ? "View Invoice" 
              : (job.estimateIds?.length > 0 || (job.estimatedCost && parseFloat(job.estimatedCost) > 0))
                ? "Create Invoice"
                : "Add an estimate or cost first"
          }
        >
          <Receipt size={12} />
          <span style={{ fontSize: '0.5625rem' }}>Invoice</span>
        </button>
      </div>

      
    </div>
  );
};

export default JobCard;