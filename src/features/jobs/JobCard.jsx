import React, { useRef } from 'react';
import { MapPin, Calendar, DollarSign, Eye } from 'lucide-react';

const JobCard = ({ 
  job, 
  statusConfig, 
  statusDropdownOpen, 
  setStatusDropdownOpen,
  onUpdateStatus,
  onViewJob,
  isDarkMode,
  colors 
}) => {
  const statusDropdownRef = useRef(null);
  const StatusIcon = statusConfig[job.status].icon;
  const jobTitle = job.title || job.name;

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 0.25rem 0',
            color: colors.text,
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            {jobTitle}
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              background: `${statusConfig[job.status].color}20`,
              color: statusConfig[job.status].color,
              fontSize: '0.75rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <StatusIcon size={14} />
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

      {job.location && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          color: colors.subtext,
          fontSize: '0.875rem'
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
          marginBottom: '0.5rem',
          color: colors.subtext,
          fontSize: '0.875rem'
        }}>
          <Calendar size={16} />
          <span>
            {new Date(job.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {job.time && ` at ${job.time}`}
            {job.duration && ` (${job.duration})`}
          </span>
        </div>
      )}

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
        <p style={{
          margin: '0.75rem 0 0 0',
          padding: '0.75rem',
          background: colors.bg,
          borderRadius: '0.5rem',
          color: colors.text,
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}>
          {job.notes}
        </p>
      )}

      <button
        onClick={() => onViewJob(job)}
        style={{
          width: '100%',
          marginTop: '0.75rem',
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
          fontWeight: '600'
        }}
      >
        <Eye size={16} />
        View Job
      </button>
    </div>
  );
};

export default JobCard;