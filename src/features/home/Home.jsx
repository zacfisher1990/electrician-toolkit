import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUserJobs } from "../jobs/jobsService";
import { getUserEstimates } from "../estimates/estimatesService";
import { getUserInvoices } from "../invoices/invoicesService";
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './Home.module.css';
import { getAllAnalytics } from './analyticsService';

// Components
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UpcomingJobsList from './components/UpcomingJobsList';
import CalendarGrid from './components/CalendarGrid';
import JobAssignmentDropdown from './components/JobAssignmentDropdown';
import ScheduledJobCard from './components/ScheduledJobCard';

const Home = ({ isDarkMode, onAddJobClick }) => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [jobs, setJobs] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [jobAssignments, setJobAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Colors
  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    calendarBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    calendarBorder: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    dayNameText: isDarkMode ? '#999999' : '#6b7280',
    selectedDay: '#3b82f6',
    todayBg: isDarkMode ? '#262626' : '#f3f4f6',
    emptyDay: isDarkMode ? '#0a0a0a' : 'transparent',
    jobCardBg: isDarkMode ? '#0f0f0f' : '#f9fafb',
  };

  const statusColors = {
    'scheduled': '#3b82f6',
    'in-progress': '#f59e0b',
    'completed': '#10b981'
  };

  // Load jobs and assignments
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Load all data
          const [userJobs, userEstimates, userInvoices] = await Promise.all([
            getUserJobs(),
            getUserEstimates(),
            getUserInvoices()
          ]);
          
          setJobs(userJobs);
          setEstimates(userEstimates);
          setInvoices(userInvoices);
          
          // Calculate analytics
          const analyticsData = getAllAnalytics(userJobs, userEstimates, userInvoices);
          setAnalytics(analyticsData);
          
          const { getAllJobAssignments } = await import('./jobCalendarService');
          const assignments = await getAllJobAssignments();
          setJobAssignments(assignments);
          
          // Auto-migration
          const jobsWithDates = userJobs.filter(job => job.date && job.date !== '');
          
          if (jobsWithDates.length > 0) {
            const assignedJobDates = new Set(
              assignments.map(a => `${a.jobId}-${a.date}`)
            );
            
            const needsMigration = jobsWithDates.some(job => 
              !assignedJobDates.has(`${job.id}-${job.date}`)
            );
            
            if (needsMigration) {
              const { migrateExistingJobsToCalendar } = await import('./migrateJobsToCalendar');
              const result = await migrateExistingJobsToCalendar();
              
              if (result.success && result.migrated > 0) {
                const updatedAssignments = await getAllJobAssignments();
                setJobAssignments(updatedAssignments);
              }
            }
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setJobs([]);
        setEstimates([]);
        setInvoices([]);
        setJobAssignments([]);
        setAnalytics(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Get jobs for a date from assignments
  const getJobsForDateFromAssignments = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const assignmentsForDate = jobAssignments.filter(a => a.date === dateStr);
    
    return assignmentsForDate.map(assignment => {
      const job = jobs.find(j => j.id === assignment.jobId);
      return job ? { ...job, assignmentId: assignment.id } : null;
    }).filter(Boolean);
  };

  const getJobsForDate = (date) => getJobsForDateFromAssignments(date);
  const hasJobsOnDate = (date) => getJobsForDateFromAssignments(date).length > 0;

  // Calendar helpers
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date) => isSameDay(date, new Date());

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Data
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  const selectedDayJobs = getJobsForDate(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingJobs = jobAssignments
    .filter(assignment => {
      const assignmentDate = new Date(assignment.date + 'T00:00:00');
      return assignmentDate >= today && assignment.jobStatus !== 'completed';
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)
    .map(assignment => {
      const job = jobs.find(j => j.id === assignment.jobId);
      return job ? { ...job, dateObj: new Date(assignment.date + 'T00:00:00'), assignmentId: assignment.id } : null;
    })
    .filter(Boolean);

  const availableJobs = jobs.filter(job => 
    job.status === 'scheduled' || job.status === 'in-progress'
  );

  // Handlers
  const handleToggleJobDropdown = () => setShowJobDropdown(!showJobDropdown);

  const handleAssignJob = async (job) => {
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const { assignJobToDate, getAllJobAssignments } = await import('./jobCalendarService');
      await assignJobToDate(job.id, formattedDate, {
        title: job.title || job.name,
        client: job.client,
        status: job.status
      });
      
      const updatedAssignments = await getAllJobAssignments();
      setJobAssignments(updatedAssignments);
      setShowJobDropdown(false);
    } catch (error) {
      console.error('❌ Error assigning job:', error);
      alert('Failed to assign job. Please try again.');
    }
  };

  const handleCreateNewJob = (date) => {
    if (onAddJobClick) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      onAddJobClick(formattedDate);
      setShowJobDropdown(false);
    }
  };

  const handleUpdateJobTime = async (jobId, newTime) => {
    try {
      const { updateJob } = await import('../jobs/jobsService');
      await updateJob(jobId, { time: newTime });
      
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? { ...j, time: newTime } : j)
      );
    } catch (error) {
      console.error('❌ Error updating job time:', error);
      alert('Failed to update time');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showJobDropdown && !event.target.closest('[data-dropdown-container]')) {
        setShowJobDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showJobDropdown]);

  if (loading) {
    return (
      <div className={styles.loading} style={{ background: colors.bg }}>
        <div style={{ color: colors.text }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ background: colors.bg }}>
      <div className={styles.content}>
        {/* Upcoming Jobs */}
        <UpcomingJobsList 
          upcomingJobs={upcomingJobs}
          colors={colors}
          statusColors={statusColors}
        />

        {/* Calendar */}
        <div 
          className={styles.calendarCard}
          style={{
            background: colors.calendarBg,
            border: `1px solid ${colors.calendarBorder}`
          }}
        >
          <div className={styles.calendarHeader}>
            <h3 className={styles.calendarMonth} style={{ color: colors.text }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className={styles.calendarNavigation}>
              <button
                onClick={previousMonth}
                className={styles.calendarNavButton}
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextMonth}
                className={styles.calendarNavButton}
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            calendarDays={calendarDays}
            dayNames={dayNames}
            colors={colors}
            isSameDay={isSameDay}
            isToday={isToday}
            hasJobsOnDate={hasJobsOnDate}
            getJobsForDate={getJobsForDate}
            setSelectedDate={setSelectedDate}
            statusColors={statusColors}
          />
        </div>

        {/* Jobs for Selected Date */}
        <div 
          className={styles.selectedDateCard}
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`
          }}
        >
          <div className={styles.selectedDateHeader}>
            <h3 className={styles.selectedDateTitle} style={{ color: colors.text }}>
              {isSameDay(selectedDate, new Date()) ? 'Today' : selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <span 
                className={styles.selectedDateCount}
                style={{
                  color: colors.subtext,
                  background: colors.bg
                }}
              >
                {selectedDayJobs.length} {selectedDayJobs.length === 1 ? 'job' : 'jobs'}
              </span>
              <div style={{ position: 'relative' }} data-dropdown-container>
                <button
                  onClick={handleToggleJobDropdown}
                  style={{
                    background: colors.selectedDay,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Plus size={14} />
                  Add Job
                </button>

                <JobAssignmentDropdown
                  showDropdown={showJobDropdown}
                  availableJobs={availableJobs}
                  onCreateNewJob={() => handleCreateNewJob(selectedDate)}
                  onAssignJob={handleAssignJob}
                  colors={colors}
                />
              </div>
            </div>
          </div>

          {selectedDayJobs.length === 0 ? (
            <div className={styles.selectedDateEmpty} style={{ color: colors.subtext }}>
              <CalendarIcon size={48} className={styles.selectedDateEmptyIcon} />
              <p className={styles.selectedDateEmptyText}>No jobs scheduled for this day</p>
            </div>
          ) : (
            <div className={styles.jobsList}>
              {selectedDayJobs.map(job => (
                <ScheduledJobCard
                  key={job.assignmentId || job.id}
                  job={job}
                  colors={colors}
                  statusColors={statusColors}
                  onUpdateTime={handleUpdateJobTime}
                />
              ))}
            </div>
          )}
        </div>

        {/* Analytics Dashboard - MOVED HERE */}
        {analytics && (
          <AnalyticsDashboard 
            analytics={analytics}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default Home;