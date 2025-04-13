import { useState } from 'react'
import StudyPlannerForm from './components/StudyPlannerForm'
import StudySchedule from './components/StudySchedule'
import './styles/App.css'

function App() {
  const [schedule, setSchedule] = useState(null)

  return (
    <div className="app-container">
      <div className="app-content">
        <h1 className="app-title">Smart Study Planner</h1>
        <p className="app-description">
          Optimize your study schedule using linear programming
        </p>
        
        {!schedule ? (
          <StudyPlannerForm setSchedule={setSchedule} />
        ) : (
          <StudySchedule 
            schedule={schedule} 
            resetSchedule={() => setSchedule(null)} 
          />
        )}
      </div>
    </div>
  )
}

export default App
