import { useState, useEffect } from 'react';
import '../styles/StudyAnalytics.css';

const StudyAnalytics = ({ schedule }) => {
  const [analytics, setAnalytics] = useState({
    timeDistribution: {},
    productiveHours: {},
    weeklyReport: {},
    monthlyReport: {}
  });

  useEffect(() => {
    if (!schedule || !schedule.schedule) return;
    
    const dailySchedule = schedule.schedule;
    
    // Calculate time distribution by subject
    const timeDistribution = {};
    const productiveHours = {};
    
    dailySchedule.forEach(day => {
      day.subjects.forEach(subject => {
        // Time distribution by subject
        if (!timeDistribution[subject.name]) {
          timeDistribution[subject.name] = 0;
        }
        timeDistribution[subject.name] += subject.hours;
        
        // Productive hours tracking
        const hour = Math.floor(subject.hours);
        if (!productiveHours[hour]) {
          productiveHours[hour] = 0;
        }
        productiveHours[hour] += subject.hours;
      });
    });
    
    // Calculate weekly and monthly reports
    const weeklyReport = calculateWeeklyReport(dailySchedule);
    const monthlyReport = calculateMonthlyReport(dailySchedule);
    
    setAnalytics({
      timeDistribution,
      productiveHours,
      weeklyReport,
      monthlyReport
    });
  }, [schedule]);

  const calculateWeeklyReport = (dailySchedule) => {
    const weeks = {};
    
    dailySchedule.forEach(day => {
      const weekNumber = Math.ceil(day.day / 7);
      if (!weeks[weekNumber]) {
        weeks[weekNumber] = {
          totalHours: 0,
          subjects: {},
          consistency: 0
        };
      }
      
      // Calculate total hours for the week
      const dayHours = day.subjects.reduce((sum, s) => sum + s.hours, 0);
      weeks[weekNumber].totalHours += dayHours;
      
      // Track subject distribution
      day.subjects.forEach(subject => {
        if (!weeks[weekNumber].subjects[subject.name]) {
          weeks[weekNumber].subjects[subject.name] = 0;
        }
        weeks[weekNumber].subjects[subject.name] += subject.hours;
      });
      
      // Calculate consistency (days studied / total days)
      const studyDays = dailySchedule.filter(d => 
        Math.ceil(d.day / 7) === weekNumber && d.subjects.length > 0
      ).length;
      weeks[weekNumber].consistency = (studyDays / 7) * 100;
    });
    
    return weeks;
  };

  const calculateMonthlyReport = (dailySchedule) => {
    const months = {};
    
    dailySchedule.forEach(day => {
      const monthNumber = Math.ceil(day.day / 30);
      if (!months[monthNumber]) {
        months[monthNumber] = {
          totalHours: 0,
          subjects: {},
          consistency: 0,
          averageHoursPerDay: 0
        };
      }
      
      // Calculate total hours for the month
      const dayHours = day.subjects.reduce((sum, s) => sum + s.hours, 0);
      months[monthNumber].totalHours += dayHours;
      
      // Track subject distribution
      day.subjects.forEach(subject => {
        if (!months[monthNumber].subjects[subject.name]) {
          months[monthNumber].subjects[subject.name] = 0;
        }
        months[monthNumber].subjects[subject.name] += subject.hours;
      });
      
      // Calculate consistency and average hours
      const studyDays = dailySchedule.filter(d => 
        Math.ceil(d.day / 30) === monthNumber && d.subjects.length > 0
      ).length;
      months[monthNumber].consistency = (studyDays / 30) * 100;
      months[monthNumber].averageHoursPerDay = months[monthNumber].totalHours / 30;
    });
    
    return months;
  };

  const getChartColor = (index) => {
    const colors = [
      '#4299E1', '#48BB78', '#ED8936', '#9F7AEA',
      '#F56565', '#38B2AC', '#ECC94B', '#667EEA'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Study Analytics Dashboard</h2>
      
      <div className="analytics-grid">
        {/* Time Distribution Chart */}
        <div className="analytics-card">
          <h3>Time Distribution by Subject</h3>
          <div className="chart-container">
            {Object.entries(analytics.timeDistribution).map(([subject, hours], index) => (
              <div key={subject} className="chart-bar-container">
                <div className="chart-label">{subject}</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{
                      width: `${(hours / Math.max(...Object.values(analytics.timeDistribution))) * 100}%`,
                      backgroundColor: getChartColor(index)
                    }}
                  >
                    <span className="chart-value">{hours.toFixed(1)} hrs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Productive Hours Chart */}
        <div className="analytics-card">
          <h3>Most Productive Study Hours</h3>
          <div className="chart-container">
            {Object.entries(analytics.productiveHours)
              .sort((a, b) => b[1] - a[1])
              .map(([hours, total], index) => (
                <div key={hours} className="chart-bar-container">
                  <div className="chart-label">{hours} hrs/day</div>
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{
                        width: `${(total / Math.max(...Object.values(analytics.productiveHours))) * 100}%`,
                        backgroundColor: getChartColor(index)
                      }}
                    >
                      <span className="chart-value">{total.toFixed(1)} hrs</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Weekly Report */}
        <div className="analytics-card">
          <h3>Weekly Progress</h3>
          <div className="report-container">
            {Object.entries(analytics.weeklyReport).map(([week, data]) => (
              <div key={week} className="report-item">
                <h4>Week {week}</h4>
                <div className="report-stats">
                  <div className="stat">
                    <span className="stat-label">Total Hours:</span>
                    <span className="stat-value">{data.totalHours.toFixed(1)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Consistency:</span>
                    <span className="stat-value">{data.consistency.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="subject-breakdown">
                  {Object.entries(data.subjects).map(([subject, hours]) => (
                    <div key={subject} className="subject-stat">
                      <span className="subject-name">{subject}:</span>
                      <span className="subject-hours">{hours.toFixed(1)} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Monthly Report */}
        <div className="analytics-card">
          <h3>Monthly Overview</h3>
          <div className="report-container">
            {Object.entries(analytics.monthlyReport).map(([month, data]) => (
              <div key={month} className="report-item">
                <h4>Month {month}</h4>
                <div className="report-stats">
                  <div className="stat">
                    <span className="stat-label">Total Hours:</span>
                    <span className="stat-value">{data.totalHours.toFixed(1)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Daily Average:</span>
                    <span className="stat-value">{data.averageHoursPerDay.toFixed(1)} hrs</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Consistency:</span>
                    <span className="stat-value">{data.consistency.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="subject-breakdown">
                  {Object.entries(data.subjects).map(([subject, hours]) => (
                    <div key={subject} className="subject-stat">
                      <span className="subject-name">{subject}:</span>
                      <span className="subject-hours">{hours.toFixed(1)} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyAnalytics; 