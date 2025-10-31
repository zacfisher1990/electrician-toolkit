import React from 'react';
import { Briefcase } from 'lucide-react';
import JobCard from './JobCard';
import { sortJobsByDate } from './utils/jobsUtils';

const JobsList = ({
  filteredJobs,
  searchQuery,
  activeStatusTab,
  statusConfig,
  statusDropdownOpen,
  setStatusDropdownOpen,
  onUpdateStatus,
  onViewJob,
  onViewEstimate,
  onViewInvoice,
  onClockInOut,
  estimates,
  isDarkMode,
  colors
}) => {
  if (filteredJobs.length === 0) {
    return (
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        textAlign: 'center',
        padding: '3rem 1rem',
        color: colors.subtext
      }}>
        <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: '0.9375rem' }}>
          {searchQuery ? 'No jobs match your search.' : 
           activeStatusTab === 'all' ? 'No jobs yet. Add your first job above!' :
           `No ${statusConfig[activeStatusTab]?.label.toLowerCase()} jobs.`}
        </p>
      </div>
    );
  }

  return (
    <>
      {sortJobsByDate(filteredJobs).map((job) => (
        <JobCard
          key={job.id}
          job={job}
          statusConfig={statusConfig}
          statusDropdownOpen={statusDropdownOpen}
          setStatusDropdownOpen={setStatusDropdownOpen}
          onUpdateStatus={onUpdateStatus}
          onViewJob={onViewJob}
          onViewEstimate={onViewEstimate}
          onViewInvoice={onViewInvoice}
          onClockInOut={onClockInOut}
          isDarkMode={isDarkMode}
          colors={colors}
          estimates={estimates}
        />
      ))}
    </>
  );
};

export default JobsList;