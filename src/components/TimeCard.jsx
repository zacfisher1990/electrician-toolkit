import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ChevronRight, Calendar, Briefcase, ArrowLeft } from 'lucide-react';
import { getColors } from '../theme';
import { auth } from '../firebase/firebase';
import { getUserJobs } from '../features/jobs/jobsService';

const TimeCard = ({ isDarkMode, onNavigateBack }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const colors = getColors(isDarkMode);

  // Load all jobs to extract work sessions
  useEffect(() => {
    const loadJobs = async () => {
      try {
        if (auth.currentUser) {
          // First load - will use cache if available (instant)
          const userJobs = await getUserJobs();
          setJobs(userJobs);
          setLoading(false);
          
          // Background refresh to ensure we have latest data
          // getUserJobs already does this internally, but we can force it
          const freshJobs = await getUserJobs(true); // Skip cache, get fresh
          if (JSON.stringify(freshJobs) !== JSON.stringify(userJobs)) {
            setJobs(freshJobs);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading jobs for time cards:', error);
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Helper function to get the start of the week (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    // Adjust for Monday start: if Sunday (0), go back 6 days; otherwise go back (day - 1) days
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Helper function to get the end of the week (Sunday)
  const getWeekEnd = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  };

  // Format week range for display
  const formatWeekRange = (weekStart) => {
    const weekEnd = getWeekEnd(weekStart);
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  // Process all work sessions and group by week
  const weeklyData = useMemo(() => {
    const weeksMap = new Map();

    jobs.forEach(job => {
      if (!job.workSessions || job.workSessions.length === 0) return;

      job.workSessions.forEach(session => {
        if (!session.startTime || !session.endTime) return;

        const sessionStart = new Date(session.startTime);
        const weekStart = getWeekStart(sessionStart);
        const weekKey = weekStart.toISOString();

        if (!weeksMap.has(weekKey)) {
          weeksMap.set(weekKey, {
            weekStart,
            weekKey,
            sessions: [],
            totalHours: 0,
            jobsWorked: new Set()
          });
        }

        const weekData = weeksMap.get(weekKey);
        const sessionDuration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60);
        
        weekData.sessions.push({
          ...session,
          jobId: job.id,
          jobTitle: job.title || job.name,
          jobClient: job.client,
          duration: sessionDuration
        });
        weekData.totalHours += sessionDuration;
        weekData.jobsWorked.add(job.id);
      });
    });

    // Convert to array and sort by date (most recent first)
    const weeksArray = Array.from(weeksMap.values()).map(week => ({
      ...week,
      jobsWorked: week.jobsWorked.size
    }));

    weeksArray.sort((a, b) => b.weekStart - a.weekStart);

    return weeksArray;
  }, [jobs]);

  // Get detailed breakdown for selected week
  const getWeekDetails = (weekData) => {
    const dailyBreakdown = {};
    // Monday-Sunday order for work week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // Map day names to their JS getDay() values (0=Sun, 1=Mon, etc.)
    const dayIndexMap = [1, 2, 3, 4, 5, 6, 0]; // Mon=1, Tue=2, ... Sun=0

    // Initialize all days
    daysOfWeek.forEach((day, index) => {
      dailyBreakdown[index] = {
        dayName: day,
        dayIndex: dayIndexMap[index],
        sessions: [],
        totalHours: 0
      };
    });

    // Group sessions by day
    weekData.sessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const dayOfWeek = sessionDate.getDay(); // 0=Sun, 1=Mon, etc.
      
      // Convert JS day index to our Monday-first index
      const ourIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      dailyBreakdown[ourIndex].sessions.push(session);
      dailyBreakdown[ourIndex].totalHours += session.duration;
    });

    return dailyBreakdown;
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format hours
  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.mainBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'calc(env(safe-area-inset-top) + 60px)'
      }}>
        <div style={{ color: colors.subtext }}>Loading time cards...</div>
      </div>
    );
  }

  // Week Detail View
  if (selectedWeek) {
    const dailyBreakdown = getWeekDetails(selectedWeek);

    return (
      <div style={{
        minHeight: '100vh',
        background: colors.mainBg,
        paddingTop: 'calc(env(safe-area-inset-top) + 60px)',
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '1rem' }}>
          {/* Back Button */}
          <button
            onClick={() => setSelectedWeek(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: colors.blue,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0.5rem 0',
              marginBottom: '1rem'
            }}
          >
            <ArrowLeft size={18} />
            Back to All Weeks
          </button>

          {/* Week Header */}
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <Calendar size={24} style={{ color: colors.blue }} />
              <h2 style={{
                margin: 0,
                color: colors.text,
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                {formatWeekRange(selectedWeek.weekStart)}
              </h2>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                {selectedWeek.jobsWorked} job{selectedWeek.jobsWorked !== 1 ? 's' : ''} worked
              </span>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: colors.green
              }}>
                {formatHours(selectedWeek.totalHours)}
              </span>
            </div>
          </div>

          {/* Daily Breakdown */}
          {Object.entries(dailyBreakdown).map(([dayIndex, dayData]) => (
            <div
              key={dayIndex}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.75rem',
                opacity: dayData.sessions.length === 0 ? 0.5 : 1
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: dayData.sessions.length > 0 ? '0.75rem' : 0
              }}>
                <span style={{
                  color: colors.text,
                  fontSize: '0.9375rem',
                  fontWeight: '600'
                }}>
                  {dayData.dayName}
                </span>
                <span style={{
                  color: dayData.totalHours > 0 ? colors.green : colors.subtext,
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {dayData.totalHours > 0 ? formatHours(dayData.totalHours) : 'No hours'}
                </span>
              </div>

              {/* Sessions for the day */}
              {dayData.sessions.map((session, idx) => (
                <div
                  key={idx}
                  style={{
                    background: colors.bg,
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: idx < dayData.sessions.length - 1 ? '0.5rem' : 0
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{
                      color: colors.text,
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {session.jobTitle}
                    </span>
                    <span style={{
                      color: colors.blue,
                      fontSize: '0.8125rem',
                      fontWeight: '600'
                    }}>
                      {formatHours(session.duration)}
                    </span>
                  </div>
                  <div style={{
                    color: colors.subtext,
                    fontSize: '0.8125rem'
                  }}>
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </div>
                  {session.jobClient && (
                    <div style={{
                      color: colors.subtext,
                      fontSize: '0.75rem',
                      marginTop: '0.25rem'
                    }}>
                      Client: {session.jobClient}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main Week List View
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.mainBg,
      paddingTop: 'calc(env(safe-area-inset-top) + 60px)',
      paddingBottom: '5rem'
    }}>
      <div style={{ padding: '1rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <Clock size={28} style={{ color: colors.blue }} />
          <div>
            <h1 style={{
              margin: 0,
              color: colors.text,
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              Time Cards
            </h1>
            <p style={{
              margin: '0.25rem 0 0 0',
              color: colors.subtext,
              fontSize: '0.875rem'
            }}>
              Weekly time tracking history
            </p>
          </div>
        </div>

        {/* Week List */}
        {weeklyData.length === 0 ? (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '3rem 1rem',
            textAlign: 'center'
          }}>
            <Clock size={48} style={{ color: colors.subtext, opacity: 0.5, marginBottom: '1rem' }} />
            <p style={{
              margin: 0,
              color: colors.subtext,
              fontSize: '0.9375rem'
            }}>
              No time entries yet. Clock in to a job to start tracking your time.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: colors.subtext,
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  Total Weeks
                </div>
                <div style={{
                  color: colors.text,
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {weeklyData.length}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: colors.subtext,
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  All-Time Hours
                </div>
                <div style={{
                  color: colors.green,
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {formatHours(weeklyData.reduce((sum, week) => sum + week.totalHours, 0))}
                </div>
              </div>
            </div>

            {/* Week Cards */}
            {weeklyData.map((week) => (
              <button
                key={week.weekKey}
                onClick={() => setSelectedWeek(week)}
                style={{
                  width: '100%',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: colors.text,
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {formatWeekRange(week.weekStart)}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        color: colors.subtext,
                        fontSize: '0.8125rem'
                      }}>
                        <Briefcase size={14} />
                        <span>{week.jobsWorked} job{week.jobsWorked !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        color: colors.subtext,
                        fontSize: '0.8125rem'
                      }}>
                        <Clock size={14} />
                        <span>{week.sessions.length} session{week.sessions.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      color: colors.green,
                      fontSize: '1.125rem',
                      fontWeight: '700'
                    }}>
                      {formatHours(week.totalHours)}
                    </span>
                    <ChevronRight size={20} style={{ color: colors.subtext }} />
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TimeCard;