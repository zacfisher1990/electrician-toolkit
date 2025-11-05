import React, { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import styles from './../Home.module.css';

const ScheduledJobCard = ({ 
  job, 
  colors, 
  statusColors,
  onUpdateTime 
}) => {
  const [editingTime, setEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState('');

  const handleTimeClick = () => {
    setEditingTime(true);
    setTempTime(job.time || '08:00');
  };

  const handleTimeBlur = () => {
    if (tempTime && tempTime !== job.time) {
      onUpdateTime(job.id, tempTime);
    }
    setEditingTime(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onUpdateTime(job.id, tempTime);
      setEditingTime(false);
    } else if (e.key === 'Escape') {
      setEditingTime(false);
      setTempTime('');
    }
  };

  return (
    <div
      className={styles.jobCard}
      style={{
        background: colors.jobCardBg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${statusColors[job.status]}`
      }}
    >
      <div className={styles.jobHeader}>
        <div>
          <h4 className={styles.jobTitle} style={{ color: colors.text }}>
            {job.title || job.name}
          </h4>
          <p className={styles.jobClient} style={{ color: colors.subtext }}>
            {job.client}
          </p>
        </div>
      </div>
      
      <div className={styles.jobDetails} style={{ color: colors.subtext }}>
        {/* Editable Time Field */}
        <div className={styles.jobDetail} style={{ 
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clock size={14} />
          {editingTime ? (
            <input
              type="time"
              value={tempTime}
              onChange={(e) => setTempTime(e.target.value)}
              onBlur={handleTimeBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                padding: '0.25rem 0.5rem',
                border: `1px solid ${colors.selectedDay}`,
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                background: colors.cardBg,
                color: colors.text,
                outline: 'none'
              }}
            />
          ) : (
            <button
              onClick={handleTimeClick}
              style={{
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                border: `1px dashed ${colors.border}`,
                background: 'transparent',
                color: job.time ? colors.text : colors.subtext,
                fontSize: '0.875rem',
                fontWeight: job.time ? '500' : '400',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bg;
                e.currentTarget.style.borderColor = colors.selectedDay;
                e.currentTarget.style.borderStyle = 'solid';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.borderStyle = 'dashed';
              }}
            >
              <span>{job.time || 'Set time'}</span>
              {job.time && (
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: colors.subtext,
                  fontStyle: 'italic'
                }}>
                  (click to edit)
                </span>
              )}
            </button>
          )}
          {job.duration && (
            <span style={{ fontSize: '0.75rem', color: colors.subtext }}>
              ({job.duration})
            </span>
          )}
        </div>
        
        {/* Location */}
        {job.location && (
          <div className={styles.jobDetail}>
            <MapPin size={14} />
            <span>{job.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledJobCard;