import { useState, useEffect } from 'react';
import '../styles/TopicBreakdown.css';

const TopicBreakdown = ({ subjects }) => {
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [subjectTopics, setSubjectTopics] = useState({});
  const [showChart, setShowChart] = useState(false);


  useEffect(() => {
    const initialTopics = {};
    
    subjects.forEach(subject => {

      if (!initialTopics[subject.name]) {
        initialTopics[subject.name] = getDefaultTopics(subject.name);
      }
    });
    
    setSubjectTopics(initialTopics);
  }, [subjects]);


  const toggleSubject = (subjectName) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };


  const addTopic = (subjectName) => {
    setSubjectTopics(prev => {
      const updatedTopics = {...prev};
      if (!updatedTopics[subjectName]) {
        updatedTopics[subjectName] = [];
      }
      
      updatedTopics[subjectName] = [
        ...updatedTopics[subjectName],
        { name: 'New Topic', hours: 1, completed: false }
      ];
      
      return updatedTopics;
    });
  };

  const updateTopic = (subjectName, topicIndex, field, value) => {
    setSubjectTopics(prev => {
      const updatedTopics = {...prev};
      if (!updatedTopics[subjectName]) return prev;
      
      const topicsCopy = [...updatedTopics[subjectName]];
      if (!topicsCopy[topicIndex]) return prev;
      
      topicsCopy[topicIndex] = {
        ...topicsCopy[topicIndex],
        [field]: value
      };
      
      updatedTopics[subjectName] = topicsCopy;
      return updatedTopics;
    });
  };


  const deleteTopic = (subjectName, topicIndex) => {
    setSubjectTopics(prev => {
      const updatedTopics = {...prev};
      if (!updatedTopics[subjectName]) return prev;
      
      const topicsCopy = [...updatedTopics[subjectName]];
      topicsCopy.splice(topicIndex, 1);
      
      updatedTopics[subjectName] = topicsCopy;
      return updatedTopics;
    });
  };


  const calculateCompletion = (subjectName) => {
    const topics = subjectTopics[subjectName] || [];
    if (topics.length === 0) return 0;
    
    const completedCount = topics.filter(topic => topic.completed).length;
    return Math.round((completedCount / topics.length) * 100);
  };


  const calculateTotalHours = (subjectName) => {
    const topics = subjectTopics[subjectName] || [];
    return topics.reduce((sum, topic) => sum + (Number(topic.hours) || 0), 0);
  };
  

  const getChartData = () => {
    return subjects.map(subject => ({
      name: subject.name,
      completion: calculateCompletion(subject.name),
      totalHours: calculateTotalHours(subject.name)
    })).sort((a, b) => b.completion - a.completion);
  };


  const toggleChart = () => {
    setShowChart(!showChart);
  };

  return (
    <div className="topic-breakdown">
      <div className="breakdown-header">
        <h2 className="breakdown-title">Topic Breakdown</h2>
        <button 
          className="toggle-chart-btn"
          onClick={toggleChart}
        >
          {showChart ? 'Hide Chart' : 'Show Progress Chart'}
        </button>
      </div>
      
      {showChart && (
        <div className="progress-chart-container">
          <h3 className="chart-title">Subject Progress Overview</h3>
          <div className="chart">
            {getChartData().map((subject, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-label">{subject.name}</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      width: `${subject.completion}%`,
                      backgroundColor: getProgressColor(subject.completion)
                    }}
                  >
                    {subject.completion > 15 ? `${subject.completion}%` : ''}
                  </div>
                  {subject.completion <= 15 && (
                    <span className="chart-value">{subject.completion}%</span>
                  )}
                </div>
                <div className="chart-hours">{subject.totalHours} hrs</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#FC8181'}}></span>
              <span>Less than 30%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#F6AD55'}}></span>
              <span>30-70%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#68D391'}}></span>
              <span>More than 70%</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="subjects-grid">
        {subjects.map((subject) => (
          <div key={subject.name} className="subject-block">
            <div 
              className="subject-header" 
              onClick={() => toggleSubject(subject.name)}
            >
              <div className="subject-title">{subject.name}</div>
              <div className="subject-stats">
                <span className="completion">{calculateCompletion(subject.name)}% Done</span>
                <span className="expand-icon">
                  {expandedSubjects[subject.name] ? '▼' : '▶'}
                </span>
              </div>
            </div>
            
            <div className="progress-container">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${calculateCompletion(subject.name)}%`,
                  backgroundColor: getProgressColor(calculateCompletion(subject.name))
                }}
              ></div>
            </div>
            
            {expandedSubjects[subject.name] && (
              <div className="topics-container">
                <div className="topics-header">
                  <div>Topic Name</div>
                  <div>Hours</div>
                  <div>Done?</div>
                  <div></div>
                </div>
                
                <div className="topics-list">
                  {(subjectTopics[subject.name] || []).map((topic, topicIndex) => (
                    <div key={topicIndex} className="topic-item">
                      <input
                        type="text"
                        className="topic-name-input"
                        value={topic.name}
                        onChange={(e) => updateTopic(subject.name, topicIndex, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        className="topic-hours-input"
                        value={topic.hours}
                        min="0"
                        onChange={(e) => updateTopic(subject.name, topicIndex, 'hours', Number(e.target.value))}
                      />
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          className="topic-completed-checkbox"
                          checked={topic.completed}
                          onChange={(e) => updateTopic(subject.name, topicIndex, 'completed', e.target.checked)}
                        />
                        <span className="custom-checkbox"></span>
                      </label>
                      <button
                        className="delete-topic-btn"
                        onClick={() => deleteTopic(subject.name, topicIndex)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="add-topic-btn"
                  onClick={() => addTopic(subject.name)}
                >
                  + Add Topic
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="breakdown-info">
        <h3>How to Use This Tool:</h3>
        <ul>
          <li>Click "<strong>Show Progress Chart</strong>" to see your overall progress visually</li>
          <li>Click on a subject to show/hide its topics</li>
          <li>Add topics for each subject</li>
          <li>Set the number of hours needed for each topic</li>
          <li>Check the box when you finish a topic</li>
          <li>Use the progress bar to track your overall progress</li>
        </ul>
      </div>
    </div>
  );
};


function getDefaultTopics(subjectName) {
  const defaultTopics = {
    'Mathematics': [
      { name: 'Algebra', hours: 3, completed: false },
      { name: 'Geometry', hours: 2, completed: false },
      { name: 'Calculus', hours: 4, completed: false }
    ],
    'Physics': [
      { name: 'Mechanics', hours: 3, completed: false },
      { name: 'Thermodynamics', hours: 2, completed: false },
      { name: 'Electricity', hours: 3, completed: false }
    ],
    'Chemistry': [
      { name: 'Organic Chemistry', hours: 4, completed: false },
      { name: 'Inorganic Chemistry', hours: 3, completed: false },
      { name: 'Physical Chemistry', hours: 3, completed: false }
    ],
    'Biology': [
      { name: 'Cell Biology', hours: 3, completed: false },
      { name: 'Genetics', hours: 2, completed: false },
      { name: 'Ecology', hours: 2, completed: false }
    ],
    'History': [
      { name: 'Ancient History', hours: 2, completed: false },
      { name: 'Modern History', hours: 3, completed: false }
    ],
    'English': [
      { name: 'Grammar', hours: 2, completed: false },
      { name: 'Literature', hours: 3, completed: false },
      { name: 'Writing', hours: 2, completed: false }
    ],
    'Computer Science': [
      { name: 'Programming', hours: 4, completed: false },
      { name: 'Data Structures', hours: 3, completed: false },
      { name: 'Algorithms', hours: 3, completed: false }
    ]
  };
  
  return defaultTopics[subjectName] || [
    { name: 'Topic 1', hours: 1, completed: false },
    { name: 'Topic 2', hours: 1, completed: false }
  ];
}


function getProgressColor(percentage) {
  if (percentage < 30) return '#FC8181'; 
  if (percentage < 70) return '#F6AD55'; 
  return '#68D391';
}

export default TopicBreakdown; 