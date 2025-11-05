import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import styles from './../Home.module.css';

const UpcomingJobsList = ({ 
  upcomingJobs, 
  colors, 
  statusColors 
}) => {
  return (
    <div 
      className={styles.upcomingJobsCard}
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`
      }}
    >
      <div className={styles.upcomingJobsHeader}>
        <h3 className={styles.upcomingJobsTitle} style={{ color: colors.text }}>
          Upcoming Jobs
        </h3>
      </div>

      {upcomingJobs.length === 0 ? (
        <div className={styles.upcomingJobEmpty} style={{ color: colors.subtext }}>
          <CalendarIcon size={48} className={styles.upcomingJobEmptyIcon} />
          <p className={styles.upcomingJobEmptyText}>No upcoming jobs scheduled</p>
        </div>
      ) : (
        <div className={styles.upcomingJobsList}>
          {upcomingJobs.map(job => (
            <div
              key={job.assignmentId || job.id}
              className={styles.upcomingJobItem}
              style={{
                background: colors.jobCardBg,
                border: `1px solid ${colors.border}`,
                borderLeft: `4px solid ${statusColors[job.status]}`
              }}
            >
              <div className={styles.upcomingJobInfo}>
                <h4 className={styles.upcomingJobTitle} style={{ color: colors.text }}>
                  {job.title || job.name}
                </h4>
                <p className={styles.upcomingJobDate} style={{ color: colors.subtext }}>
                  <CalendarIcon size={12} />
                  {job.dateObj?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {job.time && ` • ${job.time}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingJobsList;