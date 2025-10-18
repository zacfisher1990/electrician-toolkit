import React, { useRef, useState } from 'react';
import { MapPin, Calendar, Edit, FileText, Receipt, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
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
  isDarkMode,
  colors 
}) => {
  const statusDropdownRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const StatusIcon = statusConfig[job.status].icon;
  const jobTitle = job.title || job.name;

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        transition: 'all 0.2s',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none'
      }}
    >
        <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
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
        
        {/* Status Badge with Dropdown */}
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
              padding: '4px 8px',           // Use px instead of rem
              borderRadius: '4px',
              background: `${statusConfig[job.status].color}20`,
              color: statusConfig[job.status].color,
              fontSize: '11px',             // Use px instead of rem
              fontWeight: '600',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              lineHeight: '1',
              minHeight: 'unset',           // Override any default min-height
              minWidth: 'unset',            // Override any default min-width
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
      </div>

      {/* Location and Date on same line */}
      {(job.location || job.date) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          color: colors.subtext,
          fontSize: '0.875rem',
          gap: '1rem'
        }}>
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
              marginTop: '0.5rem'
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

      {/* Three Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={(e) => {
            e.stopPropagation();
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
          <span>Edit</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewEstimate(job);
          }}
          title={job.estimateId ? "View Estimate" : "No estimate linked"}
          style={{
            background: job.estimateId ? '#10b981' : colors.border,
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: job.estimateId ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            opacity: job.estimateId ? 1 : 0.5
          }}
          disabled={!job.estimateId}
        >
          <FileText size={16} />
          <span>Estimate</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewInvoice(job);
          }}
          title={job.invoiceId ? "View Invoice" : "No invoice linked"}
          style={{
            background: job.invoiceId ? '#f59e0b' : colors.border,
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: job.invoiceId ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            opacity: job.invoiceId ? 1 : 0.5
          }}
          disabled={!job.invoiceId}
        >
          <Receipt size={16} />
          <span>Invoice</span>
        </button>
      </div>
    </div>
  );
};

export default JobCard;