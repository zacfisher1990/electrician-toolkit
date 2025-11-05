import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, DollarSign, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getUserJobs } from "../jobs/jobsService";
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './Home.module.css';

const Home = ({ isDarkMode, onAddJobClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [jobAssignments, setJobAssignments] = useState([]); // NEW: Store job-date assignments
  const [editingTime, setEditingTime] = useState(null); // Track which job's time is being edited
  const [tempTime, setTempTime] = useState(''); // Temporary time value while editing

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

  // Load jobs from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userJobs = await getUserJobs();
          setJobs(userJobs);
          
          // Load job calendar assignments
          const { getAllJobAssignments } = await import('./jobCalendarService');
          const assignments = await getAllJobAssignments();
          setJobAssignments(assignments);
          
          // Auto-migration: Check if any jobs with dates need calendar assignments
          const jobsWithDates = userJobs.filter(job => job.date && job.date !== '');
          
          if (jobsWithDates.length > 0) {
            // Check if any jobs with dates are missing assignments
            const assignedJobDates = new Set(
              assignments.map(a => `${a.jobId}-${a.date}`)
            );
            
            const needsMigration = jobsWithDates.some(job => 
              !assignedJobDates.has(`${job.id}-${job.date}`)
            );
            
            if (needsMigration) {
              console.log('📅 Found jobs without calendar assignments - running migration...');
              try {
                const { migrateExistingJobsToCalendar } = await import('./migrateJobsToCalendar');
                const result = await migrateExistingJobsToCalendar();
                
                if (result.success && result.migrated > 0) {
                  console.log(`✅ Migrated ${result.migrated} jobs to calendar`);
                  // Reload assignments after migration
                  const updatedAssignments = await getAllJobAssignments();
                  setJobAssignments(updatedAssignments);
                }
              } catch (error) {
                console.error('⚠️ Migration failed:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error loading jobs:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setJobs([]);
        setJobAssignments([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Convert job assignments to a map for easy lookup
  const assignmentsByDate = jobAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.date]) {
      acc[assignment.date] = [];
    }
    acc[assignment.date].push(assignment);
    return {};
  }, {});

  // Get jobs for a specific date from assignments
  const getJobsForDateFromAssignments = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const assignmentsForDate = jobAssignments.filter(a => a.date === dateStr);
    
    // Map assignments back to full job objects
    return assignmentsForDate.map(assignment => {
      const job = jobs.find(j => j.id === assignment.jobId);
      return job ? { ...job, assignmentId: assignment.id } : null;
    }).filter(Boolean);
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const getJobsForDate = (date) => {
    return getJobsForDateFromAssignments(date);
  };

  const hasJobsOnDate = (date) => {
    return getJobsForDateFromAssignments(date).length > 0;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

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
  
  //Get upcoming jobs from assignments
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

  // Get all jobs (scheduled or in-progress) - these can be assigned to multiple dates
  const availableJobs = jobs.filter(job => 
    job.status === 'scheduled' || job.status === 'in-progress'
  );

  // Debug logging
  useEffect(() => {
    console.log('📊 Total jobs:', jobs.length);
    console.log('📅 Total assignments:', jobAssignments.length);
    console.log('✅ Available jobs for scheduling:', availableJobs.length);
    console.log('📝 Available jobs:', availableJobs);
  }, [jobs, jobAssignments]);

  // Handle toggling job dropdown
  const handleToggleJobDropdown = () => {
    setShowJobDropdown(!showJobDropdown);
  };

  // Handle assigning a job to the selected date
  const handleAssignJob = async (job) => {
    try {
      // Format date as YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log('📅 Assigning job to date:', formattedDate, 'Job:', job);
      
      // Use the new calendar assignment service
      const { assignJobToDate, getAllJobAssignments } = await import('./jobCalendarService');
      await assignJobToDate(job.id, formattedDate, {
        title: job.title || job.name,
        client: job.client,
        status: job.status
      });
      
      console.log('✅ Job assigned successfully');
      
      // Refresh assignments
      const updatedAssignments = await getAllJobAssignments();
      setJobAssignments(updatedAssignments);
      
      // Close dropdown
      setShowJobDropdown(false);
      
    } catch (error) {
      console.error('❌ Error assigning job:', error);
      alert('Failed to assign job. Please try again.');
    }
  };

  // Handle creating new job for this date
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

  // Handle updating job time
  const handleUpdateJobTime = async (jobId, newTime) => {
    try {
      const { updateJob } = await import('../jobs/jobsService');
      await updateJob(jobId, { time: newTime });
      
      // Update local jobs state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? { ...j, time: newTime } : j)
      );
      
      setEditingTime(null);
      setTempTime('');
      console.log('✅ Job time updated');
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
                  key={job.id}
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

          {/* Day Names */}
          <div className={styles.dayNames}>
            {dayNames.map(day => (
              <div
                key={day}
                className={styles.dayName}
                style={{ color: colors.dayNameText }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className={styles.calendarGrid}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className={styles.emptyDay}
                    style={{ background: colors.emptyDay }}
                  />
                );
              }

              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const hasJobs = hasJobsOnDate(date);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`${styles.calendarDay} ${isSelected ? styles.selected : ''} ${isTodayDate ? styles.today : ''}`}
                  style={{
                    background: isSelected 
                      ? colors.selectedDay 
                      : isTodayDate 
                        ? colors.todayBg 
                        : 'transparent',
                    color: isSelected ? 'white' : colors.text,
                    fontWeight: isSelected || isTodayDate ? '600' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = colors.todayBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isTodayDate) {
                      e.currentTarget.style.background = 'transparent';
                    } else if (!isSelected && isTodayDate) {
                      e.currentTarget.style.background = colors.todayBg;
                    }
                  }}
                >
                  {date.getDate()}
                  {hasJobs && (
                    <div className={styles.jobIndicators}>
                      {getJobsForDate(date).slice(0, 3).map((job, i) => (
                        <div
                          key={i}
                          className={styles.jobIndicator}
                          style={{
                            background: isSelected ? 'white' : statusColors[job.status]
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
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

                {/* Dropdown Menu */}
                {showJobDropdown && (
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
                      onClick={() => handleCreateNewJob(selectedDate)}
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
                            onClick={() => handleAssignJob(job)}
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
                )}
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
                <div
                  key={job.id}
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
                      {editingTime === job.id ? (
                        <input
                          type="time"
                          value={tempTime}
                          onChange={(e) => setTempTime(e.target.value)}
                          onBlur={() => {
                            if (tempTime && tempTime !== job.time) {
                              handleUpdateJobTime(job.id, tempTime);
                            } else {
                              setEditingTime(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateJobTime(job.id, tempTime);
                            } else if (e.key === 'Escape') {
                              setEditingTime(null);
                              setTempTime('');
                            }
                          }}
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
                          onClick={() => {
                            setEditingTime(job.id);
                            setTempTime(job.time || '08:00');
                          }}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;