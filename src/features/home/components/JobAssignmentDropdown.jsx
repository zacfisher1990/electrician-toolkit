import React from 'react';
import { Plus } from 'lucide-react';

const JobAssignmentDropdown = ({
  showDropdown,
  availableJobs,
  onCreateNewJob,
  onAssignJob,
  colors
}) => {
  if (!showDropdown) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        right: 0,
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        minWidth: '200px',
        maxWidth: '280px',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 1000
      }}
    >
      {/* Create New Job Option */}
      <button
        onClick={onCreateNewJob}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${colors.border}`,
          textAlign: 'left',
          cursor: 'pointer',
          color: colors.selectedDay,
          fontSize: '0.875rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = colors.bg}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Plus size={16} />
        Create New Job
      </button>

      {/* Available Jobs List */}
      {availableJobs.length > 0 ? (
        <>
          <div style={{
            padding: '0.5rem 0.75rem',
            fontSize: '0.65rem',
            fontWeight: '600',
            color: colors.subtext,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Assign Existing Job
          </div>
          {availableJobs.map(job => (
            <button
              key={job.id}
              onClick={() => onAssignJob(job)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: 'none',
                borderTop: `1px solid ${colors.border}`,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.bg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '0.125rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {job.title || job.name}
              </div>
              {job.client && (
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {job.client}
                </div>
              )}
              <div style={{
                fontSize: '0.65rem',
                color: job.status === 'scheduled' ? '#3b82f6' : '#f59e0b',
                marginTop: '0.25rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {job.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
              </div>
            </button>
          ))}
        </>
      ) : (
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: colors.subtext,
          fontSize: '0.875rem'
        }}>
          No unscheduled jobs available
        </div>
      )}
    </div>
  );
};

export default JobAssignmentDropdown;