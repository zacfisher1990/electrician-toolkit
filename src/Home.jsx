import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = ({ isDarkMode, jobs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const colors = {
    bg: isDarkMode ? '#1f2937' : '#f9fafb',
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    text: isDarkMode ? '#f9fafb' : '#111827',
    subtext: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#4b5563' : '#e5e7eb',
    calendarBg: isDarkMode ? '#111827' : '#ffffff',
    selectedDay: '#3b82f6',
    todayBg: isDarkMode ? '#374151' : '#f3f4f6',
  };

  const statusColors = {
    'scheduled': '#3b82f6',
    'in-progress': '#f59e0b',
    'completed': '#10b981'
  };

  // Convert job dates from strings to Date objects for calendar display
  const jobsWithDates = jobs.map(job => ({
    ...job,
    dateObj: job.date ? new Date(job.date + 'T00:00:00') : null
  }));

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
    return jobsWithDates.filter(job => job.dateObj && isSameDay(job.dateObj, date));
  };

  const hasJobsOnDate = (date) => {
    return jobsWithDates.some(job => job.dateObj && isSameDay(job.dateObj, date));
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
  const upcomingJobs = jobsWithDates
    .filter(job => job.dateObj && job.dateObj >= today && job.status === 'scheduled')
    .sort((a, b) => a.dateObj - b.dateObj)
    .slice(0, 5);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg,
      paddingBottom: '5rem',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <div style={{ padding: '1rem' }}>
        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.5rem',
          marginBottom: '1rem',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '0.75rem',
            textAlign: 'center',
            minWidth: 0
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#3b82f6', 
              marginBottom: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {upcomingJobs.length}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.subtext,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Upcoming
            </div>
          </div>
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '0.75rem',
            textAlign: 'center',
            minWidth: 0
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#f59e0b', 
              marginBottom: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {jobs.filter(j => j.status === 'in-progress').length}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.subtext,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              In Progress
            </div>
          </div>
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '0.75rem',
            textAlign: 'center',
            minWidth: 0
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#10b981', 
              marginBottom: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.subtext,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Completed
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Calendar Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: colors.text }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={previousMonth}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: colors.text
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextMonth}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: colors.text
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Day Names */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            {dayNames.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: colors.subtext,
                  padding: '0.5rem 0'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.125rem'
          }}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} />;
              }
              
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const hasJobs = hasJobsOnDate(date);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    aspectRatio: '1',
                    border: 'none',
                    borderRadius: '0.375rem',
                    background: isSelected ? colors.selectedDay : isTodayDate ? colors.todayBg : 'transparent',
                    color: isSelected ? 'white' : colors.text,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: isSelected || isTodayDate ? '600' : '400',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    padding: '0.25rem',
                    minWidth: 0,
                    width: '100%'
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
                    <div style={{
                      position: 'absolute',
                      bottom: '0.125rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '0.0625rem'
                    }}>
                      {getJobsForDate(date).slice(0, 3).map((job, i) => (
                        <div
                          key={i}
                          style={{
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
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
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: colors.text }}>
              {isSameDay(selectedDate, new Date()) ? 'Today' : selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            <span style={{
              fontSize: '0.75rem',
              color: colors.subtext,
              background: colors.bg,
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem'
            }}>
              {selectedDayJobs.length} {selectedDayJobs.length === 1 ? 'job' : 'jobs'}
            </span>
          </div>

          {selectedDayJobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: colors.subtext
            }}>
              <CalendarIcon size={48} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No jobs scheduled for this day</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {selectedDayJobs.map(job => (
                <div
                  key={job.id}
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderLeft: `4px solid ${statusColors[job.status]}`,
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <h4 style={{
                        margin: '0 0 0.25rem 0',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: colors.text
                      }}>
                        {job.title}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: colors.subtext
                      }}>
                        {job.client}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.875rem', color: colors.subtext }}>
                    {job.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} />
                        <span>{job.time}{job.duration && ` (${job.duration})`}</span>
                      </div>
                    )}
                    {job.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.estimatedCost && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={14} />
                        <span>${Number(job.estimatedCost).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Jobs */}
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600', color: colors.text }}>
            Upcoming Jobs
          </h3>

          {upcomingJobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: colors.subtext
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No upcoming jobs scheduled</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {upcomingJobs.map(job => (
                <div
                  key={job.id}
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: colors.text
                    }}>
                      {job.title}
                    </h4>
                    <p style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '0.8125rem',
                      color: colors.subtext
                    }}>
                      {job.client}
                    </p>
                    <div style={{
                      fontSize: '0.75rem',
                      color: colors.subtext,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <CalendarIcon size={12} />
                      {job.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{job.time && ` at ${job.time}`}
                    </div>
                  </div>
                  <div style={{
                    width: '4px',
                    height: '40px',
                    borderRadius: '2px',
                    background: statusColors[job.status]
                  }} />
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