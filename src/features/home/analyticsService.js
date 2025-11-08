/**
 * Analytics Service
 * Calculates revenue, jobs, estimates, invoices, and hours metrics
 */

/**
 * Calculate total revenue from jobs
 */
export const calculateJobRevenue = (jobs, timeframe = 'all') => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  return jobs
    .filter(job => {
      if (timeframe === 'all') return true;
      
      if (!job.date) return false;
      const jobDate = new Date(job.date);
      
      if (timeframe === 'year') {
        return jobDate.getFullYear() === currentYear;
      }
      
      if (timeframe === 'month') {
        return jobDate.getFullYear() === currentYear && 
               jobDate.getMonth() === currentMonth;
      }
      
      return false;
    })
    .reduce((total, job) => {
      const cost = Number(job.estimatedCost) || 0;
      return total + cost;
    }, 0);
};

/**
 * Calculate revenue from invoices
 */
export const calculateInvoiceRevenue = (invoices, timeframe = 'all') => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Calculate start of current week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return invoices
    .filter(invoice => {
      // Only count paid invoices - case insensitive check
      const status = (invoice.status || '').toLowerCase();
      if (status !== 'paid') return false;
      
      if (timeframe === 'all') return true;
      
      if (!invoice.createdAt) return false;
      const invoiceDate = invoice.createdAt.toDate ? invoice.createdAt.toDate() : new Date(invoice.createdAt);
      
      if (timeframe === 'year') {
        return invoiceDate.getFullYear() === currentYear;
      }
      
      if (timeframe === 'month') {
        return invoiceDate.getFullYear() === currentYear && 
               invoiceDate.getMonth() === currentMonth;
      }
      
      if (timeframe === 'week') {
        return invoiceDate >= startOfWeek;
      }
      
      return false;
    })
    .reduce((total, invoice) => {
      const amount = Number(invoice.total) || 0;
      return total + amount;
    }, 0);
};

/**
 * Count jobs by status
 */
export const countJobsByStatus = (jobs) => {
  return {
    total: jobs.length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };
};

/**
 * Count estimates by status
 */
export const countEstimatesByStatus = (estimates) => {
  return {
    total: estimates.length,
    draft: estimates.filter(e => e.status === 'Draft').length,
    pending: estimates.filter(e => e.status === 'Pending').length,
    accepted: estimates.filter(e => e.status === 'Accepted').length
  };
};

/**
 * Count invoices by status
 */
export const countInvoicesByStatus = (invoices) => {
  return {
    total: invoices.length,
    draft: invoices.filter(i => (i.status || '').toLowerCase() === 'draft').length,
    sent: invoices.filter(i => (i.status || '').toLowerCase() === 'sent' || (i.status || '').toLowerCase() === 'pending').length,
    paid: invoices.filter(i => (i.status || '').toLowerCase() === 'paid').length
  };
};

/**
 * Calculate total clocked hours from jobs
 */
export const calculateClockedHours = (jobs, timeframe = 'all') => {
  const now = new Date();
  
  // Calculate start of current week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  let totalMinutes = 0;
  
  jobs.forEach(job => {
    // Add completed work sessions
    if (job.workSessions && Array.isArray(job.workSessions)) {
      job.workSessions.forEach(session => {
        if (session.startTime && session.endTime) {
          const start = new Date(session.startTime);
          const end = new Date(session.endTime);
          
          // Filter by timeframe
          if (timeframe === 'week' && start < startOfWeek) {
            return; // Skip sessions before this week
          }
          
          const minutes = (end - start) / (1000 * 60);
          totalMinutes += minutes;
        }
      });
    }
    
    // Add current session if clocked in
    if (job.clockedIn && job.currentSessionStart) {
      const start = new Date(job.currentSessionStart);
      
      // Check if session started this week for weekly filter
      if (timeframe === 'all' || (timeframe === 'week' && start >= startOfWeek)) {
        const now = new Date();
        const minutes = (now - start) / (1000 * 60);
        totalMinutes += minutes;
      }
    }
  });
  
  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    formatted: formatHours(totalMinutes / 60)
  };
};

/**
 * Format hours as "Xh Ym"
 */
export const formatHours = (hours) => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
};

/**
 * Get all analytics data
 */
export const getAllAnalytics = (jobs, estimates, invoices) => {
  // Revenue comes ONLY from paid invoices
  const totalRevenue = {
    allTime: calculateInvoiceRevenue(invoices, 'all'),
    year: calculateInvoiceRevenue(invoices, 'year'),
    month: calculateInvoiceRevenue(invoices, 'month'),
    week: calculateInvoiceRevenue(invoices, 'week')
  };
  
  const hoursData = {
    allTime: calculateClockedHours(jobs, 'all'),
    week: calculateClockedHours(jobs, 'week')
  };
  
  return {
    revenue: totalRevenue,
    jobs: countJobsByStatus(jobs),
    estimates: countEstimatesByStatus(estimates),
    invoices: countInvoicesByStatus(invoices),
    hours: hoursData
  };
};