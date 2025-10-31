/**
 * Utilities for filtering and searching jobs
 */

export const filterJobs = (jobs, searchQuery, activeStatusTab) => {
  return jobs.filter(job => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const jobTitle = (job.title || job.name || '').toLowerCase();
      const client = (job.client || '').toLowerCase();
      const location = (job.location || '').toLowerCase();
      const notes = (job.notes || '').toLowerCase();
      
      const matchesSearch = jobTitle.includes(query) || 
                           client.includes(query) || 
                           location.includes(query) || 
                           notes.includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (activeStatusTab === 'all') return true;
    return job.status === activeStatusTab;
  });
};

export const getStatusCounts = (jobs) => {
  return {
    all: jobs.length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    'in-progress': jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };
};

export const sortJobsByDate = (jobs) => {
  return [...jobs].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });
};