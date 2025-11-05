import React from 'react';
import styles from './../Home.module.css';

const CalendarGrid = ({ 
  currentDate,
  selectedDate,
  calendarDays,
  dayNames,
  colors,
  isSameDay,
  isToday,
  hasJobsOnDate,
  getJobsForDate,
  setSelectedDate,
  statusColors
}) => {
  return (
    <>
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
                  {getJobsForDate(date).slice(0, 3).map((job) => (
                    <div
                      key={job.id || job.assignmentId}
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
    </>
  );
};

export default CalendarGrid;