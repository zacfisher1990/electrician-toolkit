import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Calendar, Edit, FileText, Receipt, DollarSign, ChevronDown, ChevronUp, Play, Square, Trash2 } from 'lucide-react';
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
  estimates = [] // FIXED: Added this prop with default empty array
}) => {
  const statusDropdownRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  
  const StatusIcon = statusConfig[job.status].icon;
  const jobTitle = job.title || job.name;
  
  // FIXED: Check for estimates in the estimateIds array (not singular estimateId)
  const linkedEstimates = estimates.filter(est => 
    job.estimateIds && job.estimateIds.includes(est.id)
  );
  const linkedEstimate = linkedEstimates.length > 0 ? linkedEstimates[0] : null;

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
      onClockInOut(job.id, !job.clockedIn);
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
        userSelect: 'none'
      }}
    >
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
                          padding: '0.625rem 0.75rem',
                          background: job.status === key ? `${config.color}20` : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: config.color,
                          fontSize: '0.875rem',
                          fontWeight: job.status === key ? '600' : '500',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (job.status !== key) {
                            e.target.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (job.status !== key) {
                            e.target.style.background = 'transparent';
                          }
                        }}
                      >
                        <OptionIcon size={16} />
                        <span>{config.label}</span>
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
                lineHeight: '1.5'
              }}>
                {job.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Four Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleClockInOut(e);
          }}
          title={job.clockedIn ? "Clock Out" : "Clock In"}
          style={{
            background: job.clockedIn ? '#ef4444' : '#10b981',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}
        >
          {job.clockedIn ? <Square size={16} /> : <Play size={16} />}
          <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
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
            background: '#2563eb',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600' 
          }}
        >
          <Edit size={16} />
          <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Edit</span>
        </button>

        <button
          onClick={handleEstimateClick}
          title={linkedEstimate ? "View Estimate" : "No estimate linked"}
          style={{
            background: linkedEstimate ? '#f97316' : colors.border,
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: linkedEstimate ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            opacity: linkedEstimate ? 1 : 0.5
          }}
          disabled={linkedEstimates.length === 0}
        >
          <FileText size={16} />
          <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Estimate</span>
        </button>

        {/* Invoice Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewInvoice(job);
          }}
          disabled={!job.estimateIds || job.estimateIds.length === 0}
          style={{
            flex: 1,
            padding: '0.625rem 1rem',
            background: (job.estimateIds && job.estimateIds.length > 0) 
              ? (job.invoiceId ? '#10b981' : '#10b981')  // Always green if has estimate
              : colors.border,  // Gray if no estimate
            color: (job.estimateIds && job.estimateIds.length > 0) ? 'white' : colors.subtext,
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: '600',
            cursor: (job.estimateIds && job.estimateIds.length > 0) ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            opacity: (job.estimateIds && job.estimateIds.length === 0) ? 0.5 : 1
          }}
          title={
            !job.estimateIds || job.estimateIds.length === 0 
              ? "Add an estimate first" 
              : job.invoiceId 
                ? "View Invoice" 
                : "Create Invoice"
          }
        >
          <FileText size={16} />
          Invoice
        </button>
        
      </div>

      
    </div>
  );
};

export default JobCard;