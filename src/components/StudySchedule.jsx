import '../styles/ScheduleStyles.css';
import ProgressTracker from './ProgressTracker';
import TopicBreakdown from './TopicBreakdown';
import StudyAnalytics from './StudyAnalytics';

const StudySchedule = ({ schedule, resetSchedule }) => {
  const { schedule: dailySchedule, totalStudyHours } = schedule;
  

  const totalDays = dailySchedule.length;
  const avgHoursPerDay = totalStudyHours / totalDays;
  

  const uniqueSubjects = new Set();
  dailySchedule.forEach(day => {
    day.subjects.forEach(subject => {
      uniqueSubjects.add(subject.name);
    });
  });
  

  const subjectColors = Array.from(uniqueSubjects).reduce((acc, subject, index) => {
    const colors = ['navy', 'slate', 'charcoal', 'steel', 'midnight', 'silver', 'graphite', 'onyx'];
    acc[subject] = colors[index % colors.length];
    return acc;
  }, {});

  const allSubjects = [];
  const subjectMap = {};
  
  dailySchedule.forEach(day => {
    day.subjects.forEach(subject => {
      if (!subjectMap[subject.name]) {
        subjectMap[subject.name] = {
          name: subject.name,
          difficulty: subject.difficulty,
          importance: subject.importance
        };
        allSubjects.push(subjectMap[subject.name]);
      }
    });
  });
  
  const isRestDay = (day) => {
    return day.subjects.length === 0;
  };

  const isCustomRestDay = (day) => {
    return isRestDay(day) && day.day % 6 !== 0;
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2 className="schedule-title">Your Optimized Study Schedule</h2>
        <button onClick={resetSchedule} className="reset-button">
          Reset
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Study Hours : </div>
          <div className="stat-value"> {totalStudyHours}</div>
          <div className="stat-help">Across {totalDays} days</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Average Per Day : </div>
          <div className="stat-value"> {avgHoursPerDay.toFixed(1)} hrs</div>
          <div className="stat-help">Balanced distribution</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Subjects : </div>
          <div className="stat-value"> {uniqueSubjects.size} </div>
          <div className="stat-help">Optimized by difficulty</div>
        </div>
      </div>
      
      <div className="schedule-overflow">
        <div className="days-grid">
          {dailySchedule.map((day) => (
            <div 
              key={day.day} 
              className={`day-card ${isRestDay(day) ? 'rest-day-card' : ''} ${isCustomRestDay(day) ? 'custom-rest-day-card' : ''}`}
            >
              <h3 className="day-title">
                Day {day.day}
              </h3>
              
              <div className="subjects-list">
                {day.subjects.map((subject, index) => (
                  <div key={index} className="subject-item">
                    <div className="subject-header">
                      <div className="subject-badge" style={{ backgroundColor: getColorHex(subjectColors[subject.name]) }}>
                        {subject.hours} hr{subject.hours > 1 ? 's' : ''}
                      </div>
                      <div className="subject-name">{subject.name}</div>
                    </div>
                    
                    <div className="subject-meta">
                      <div className="subject-meta-item">Difficulty: {subject.difficulty}/10</div>
                      <div className="subject-meta-item">Importance: {subject.importance}/10</div>
                    </div>
                    
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${(subject.hours / Math.max(...day.subjects.map(s => s.hours))) * 100}%`,
                          backgroundColor: getColorHex(subjectColors[subject.name])
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {isRestDay(day) && (
                  <div className={`rest-day ${isCustomRestDay(day) ? 'custom-rest-day' : ''}`}>
                    {isCustomRestDay(day) ? 'Custom Rest Day' : 'Rest Day'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <StudyAnalytics schedule={schedule} />
      
      <ProgressTracker 
        schedule={schedule}
        subjects={allSubjects}
      />
      
      <TopicBreakdown 
        subjects={allSubjects}
      />
      
      <div className="info-box">
        <h3 className="info-title">How This Schedule Works</h3>
        <p className="info-text">
          This study plan uses linear programming to optimize your study time based on:
        </p>
        <ul className="info-list">
          <li>Subject difficulty (harder subjects get more focused time)</li>
          <li>Subject importance (weighted by your ratings)</li>
          <li>Balanced daily workload to prevent burnout</li>
        </ul>
      </div>
    </div>
  );
};


function getColorHex(color) {
  const colorMap = {
    navy: '#1a365d',
    slate: '#4a5568',
    charcoal: '#2d3748',
    steel: '#718096',
    midnight: '#2c3e50',
    silver: '#a0aec0',
    graphite: '#4a5568',
    onyx: '#1a202c'
  };
  
  return colorMap[color] || '#4a5568';
}

export default StudySchedule; 