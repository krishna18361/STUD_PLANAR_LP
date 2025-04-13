import { useState, useEffect } from 'react';
import '../styles/ProgressTracker.css';

const ProgressTracker = ({ schedule, subjects }) => {
  const [stats, setStats] = useState({
    totalHours: 0,
    subjectCoverage: {},
    consistencyScore: 0
  });

  useEffect(() => {
    if (!schedule || !schedule.schedule) return;
    
    const dailySchedule = schedule.schedule;
    const totalHours = schedule.totalStudyHours;
    const totalDays = dailySchedule.length;
    
 
    const subjectCoverage = {};
    const subjectTotalHours = {};
    

    subjects.forEach(subject => {
      subjectCoverage[subject.name] = 0;
      subjectTotalHours[subject.name] = 0;
    });
    

    dailySchedule.forEach(day => {
      day.subjects.forEach(daySubject => {
        subjectTotalHours[daySubject.name] += daySubject.hours;
      });
    });
    

    subjects.forEach(subject => {
      const targetHours = (subject.importance * subject.difficulty) / 2;
      const coveragePercentage = Math.min(100, Math.round((subjectTotalHours[subject.name] / targetHours) * 100));
      subjectCoverage[subject.name] = {
        percentage: coveragePercentage,
        hours: subjectTotalHours[subject.name],
        targetHours: targetHours
      };
    });
    

    let consistencyScore = 0;
    

    const daysWithStudy = dailySchedule.filter(day => day.subjects.length > 0).length;
    const studyDayPercentage = (daysWithStudy / totalDays) * 100;
    

    const avgHoursPerDay = totalHours / totalDays;
    let variance = 0;
    
    dailySchedule.forEach(day => {
      const dayHours = day.subjects.reduce((sum, s) => sum + s.hours, 0);
      variance += Math.pow(dayHours - avgHoursPerDay, 2);
    });
    
    const normalizedVariance = Math.min(100, (variance / totalDays));
    const varianceScore = 100 - normalizedVariance;
    

    const subjectAttentionScores = subjects.map(subject => {
      const coverage = subjectCoverage[subject.name].percentage;

      return Math.min(100, coverage * 2);
    });
    
    const subjectBalanceScore = subjectAttentionScores.reduce((sum, score) => sum + score, 0) / subjects.length;
    

    consistencyScore = Math.round(
      (studyDayPercentage * 0.4) + 
      (varianceScore * 0.3) + 
      (subjectBalanceScore * 0.3)
    );
    
    setStats({
      totalHours,
      subjectCoverage,
      consistencyScore
    });
  }, [schedule, subjects]);

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#38A169';
    if (percentage >= 75) return '#3182CE'; 
    if (percentage >= 60) return '#DD6B20'; 
    return '#E53E3E';
  };
  
  const getConsistencyGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="progress-tracker">
      <h2 className="tracker-title">Progress Tracker Dashboard</h2>
      
      <div className="tracker-stats">
        <div className="stat-card total-hours">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Total Hours Studied</h3>
            <div className="stat-value">{stats.totalHours}</div>
          </div>
        </div>
        
        <div className="stat-card consistency">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Study Consistency Score</h3>
            <div className="stat-value">
              <span className="grade" style={{ backgroundColor: getGradeColor(stats.consistencyScore) }}>
                {getConsistencyGrade(stats.consistencyScore)}
              </span>
              <span className="score">{stats.consistencyScore}/100</span>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="section-title">Syllabus Coverage</h3>
      <div className="subject-coverage">
        {subjects.map(subject => {
          const coverage = stats.subjectCoverage[subject.name] || { percentage: 0, hours: 0 };
          return (
            <div key={subject.name} className="subject-progress">
              <div className="subject-info">
                <div className="subject-name">{subject.name}</div>
                <div className="subject-percentage">{coverage.percentage}%</div>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${coverage.percentage}%`,
                    backgroundColor: getGradeColor(coverage.percentage)
                  }}
                ></div>
              </div>
              <div className="subject-hours">
                {coverage.hours} hrs / {Math.round(coverage.targetHours)} hrs target
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="tracker-info">
        <h3>How it works</h3>
        <ul>
          <li>
            <strong>Syllabus Coverage:</strong> Shows estimated syllabus completion based on subject importance and difficulty.
          </li>
          <li>
            <strong>Consistency Score:</strong> Measures how well you're distributing your study time across subjects and days.
          </li>
          <li>
            <strong>Target Hours:</strong> Calculated based on subject difficulty and importance ratings.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProgressTracker; 