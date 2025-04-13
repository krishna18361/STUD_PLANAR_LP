import { useState } from 'react';
import { generateOptimizedSchedule } from '../utils/lpSolver';
import '../styles/FormStyles.css';

const StudyPlannerForm = ({ setSchedule }) => {
  const [subjects, setSubjects] = useState([
    { name: '', difficulty: 5, importance: 5 }
  ]);
  const [constraints, setConstraints] = useState({
    maxHoursPerDay: 8,
    daysUntilExam: 14,
    minStudyHoursTotal: 40
  });
  const [customRestDays, setCustomRestDays] = useState([]);
  const [error, setError] = useState('');

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', difficulty: 5, importance: 5 }]);
  };

  const handleRemoveSubject = (index) => {
    if (subjects.length > 1) {
      const newSubjects = [...subjects];
      newSubjects.splice(index, 1);
      setSubjects(newSubjects);
    }
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const handleConstraintChange = (field, value) => {
    setConstraints({ ...constraints, [field]: value });
  };

  const handleAddRestDay = () => {
    if (customRestDays.length < constraints.daysUntilExam) {
      setCustomRestDays([...customRestDays, { day: 1 }]);
    }
  };

  const handleRemoveRestDay = (index) => {
    const newRestDays = [...customRestDays];
    newRestDays.splice(index, 1);
    setCustomRestDays(newRestDays);
  };

  const handleRestDayChange = (index, value) => {
    const newRestDays = [...customRestDays];
    newRestDays[index] = { day: Number(value) };
    setCustomRestDays(newRestDays);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate input
    const emptySubjects = subjects.filter(s => !s.name.trim());
    if (emptySubjects.length > 0) {
      setError('Please fill in all subject names');
      return;
    }

    // Validate rest days
    const invalidRestDays = customRestDays.filter(rd => 
      rd.day < 1 || rd.day > constraints.daysUntilExam
    );
    if (invalidRestDays.length > 0) {
      setError('Rest days must be between 1 and days until exam');
      return;
    }
    
    // Check for duplicate rest days
    const restDayValues = customRestDays.map(rd => rd.day);
    const uniqueRestDays = new Set(restDayValues);
    if (uniqueRestDays.size !== restDayValues.length) {
      setError('You have duplicate rest days. Please remove duplicates.');
      return;
    }
    
    // Check if rest days overlap with fixed rest days
    const fixedRestDays = [];
    for (let day = 1; day <= constraints.daysUntilExam; day++) {
      if (day % 6 === 0) {
        fixedRestDays.push(day);
      }
    }
    
    const overlappingDays = restDayValues.filter(day => fixedRestDays.includes(day));
    if (overlappingDays.length > 0) {
      setError(`Days ${overlappingDays.join(', ')} are already fixed rest days. Please choose different days.`);
      return;
    }
    
    try {
      const result = generateOptimizedSchedule(subjects, {
        ...constraints,
        customRestDays: customRestDays.map(rd => rd.day)
      });
      
      if (!result.feasible) {
        setError('No feasible solution. Try adjusting your constraints.');
        return;
      }
      
      setSchedule(result);
    } catch (error) {
      setError('Failed to generate schedule: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="study-form">
      <div className="form-section">
        <h2 className="section-heading">Subjects</h2>
        {error && <div className="error-message">{error}</div>}
        
        {subjects.map((subject, index) => (
          <div key={index} className="subject-card">
            <div className="subject-grid">
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input 
                  className="form-input"
                  type="text"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Difficulty (1-10): {subject.difficulty}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={subject.difficulty}
                  onChange={(e) => handleSubjectChange(index, 'difficulty', Number(e.target.value))}
                  className="slider"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Importance (1-10): {subject.importance}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={subject.importance}
                  onChange={(e) => handleSubjectChange(index, 'importance', Number(e.target.value))}
                  className="slider"
                />
              </div>
              
              <div className="form-group button-container">
                <button 
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveSubject(index)}
                  disabled={subjects.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          type="button" 
          className="add-button"
          onClick={handleAddSubject}
        >
          Add Subject
        </button>
      </div>

      <div className="form-section">
        <h2 className="section-heading">Study Constraints</h2>
        <div className="constraints-grid">
          <div className="form-group">
            <label className="form-label">Max Hours Per Day</label>
            <input
              type="number"
              min="1"
              max="16"
              value={constraints.maxHoursPerDay}
              onChange={(e) => handleConstraintChange('maxHoursPerDay', Number(e.target.value))}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Days Until Exam</label>
            <input
              type="number"
              min="1"
              max="90"
              value={constraints.daysUntilExam}
              onChange={(e) => handleConstraintChange('daysUntilExam', Number(e.target.value))}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Minimum Total Study Hours</label>
            <input
              type="number"
              min="1"
              value={constraints.minStudyHoursTotal}
              onChange={(e) => handleConstraintChange('minStudyHoursTotal', Number(e.target.value))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-heading">Custom Rest Days</h2>
        <p className="section-description">Add specific days you want to take as rest days</p>
        
        <div className="rest-days-container">
          {customRestDays.map((restDay, index) => (
            <div key={index} className="rest-day-item">
              <div className="form-group">
                <label className="form-label">Rest Day</label>
                <input
                  type="number"
                  min="1"
                  max={constraints.daysUntilExam}
                  value={restDay.day}
                  onChange={(e) => handleRestDayChange(index, e.target.value)}
                  className="form-input"
                />
              </div>
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemoveRestDay(index)}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            className="add-button"
            onClick={handleAddRestDay}
            disabled={customRestDays.length >= constraints.daysUntilExam}
          >
            Add Rest Day
          </button>
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-button"
      >
        Generate Optimized Study Plan
      </button>
    </form>
  );
};

export default StudyPlannerForm; 