import solver from 'javascript-lp-solver';

/**
 * Generate an optimized study schedule using Linear Programming.
 * 

 * 
 * @param {Array} subjects
 * @param {Object} constraints 
 * @returns {Object} 
 */
export function generateOptimizedSchedule(subjects, constraints) {
  const { maxHoursPerDay, daysUntilExam, minStudyHoursTotal } = constraints;
  

  const variables = {};
  const totalDays = daysUntilExam;
  
  subjects.forEach(subject => {
    for (let day = 1; day <= totalDays; day++) {
      const varName = `${subject.name}_${day}`;
      variables[varName] = {

        [subject.name]: subject.importance,
        total: 1,

        [`day_${day}`]: 1,
        [`subject_${subject.name}`]: 1,
      };
    }
  });
  

  const maxPossibleHours = totalDays * maxHoursPerDay;
  const adjustedMinStudyHours = Math.min(minStudyHoursTotal, maxPossibleHours * 0.8);
  

  const modelConstraints = {
    total: { min: adjustedMinStudyHours },
  };
  

  for (let day = 1; day <= totalDays; day++) {
    modelConstraints[`day_${day}`] = { max: maxHoursPerDay };
    

    if (day % 6 !== 0) { 
      modelConstraints[`day_${day}`].min = 1;
    }
  }
  

  const totalImportance = subjects.reduce((sum, s) => sum + s.importance, 0);
  

  subjects.forEach(subject => {

    const importanceRatio = subject.importance / totalImportance;
    const minHours = Math.max(2, Math.floor(adjustedMinStudyHours * importanceRatio * 0.6));
    
    modelConstraints[`subject_${subject.name}`] = { min: minHours };
  });
  

  const model = {
    optimize: {},
    constraints: modelConstraints,
    variables,
    ints: Object.keys(variables), 
  };
  

  subjects.forEach(subject => {
    model.optimize[subject.name] = subject.difficulty;
  });
  

  let result = solver.Solve(model);
  

  if (!result.feasible) {

    for (let day = 1; day <= totalDays; day++) {
      if (modelConstraints[`day_${day}`].min) {
        delete modelConstraints[`day_${day}`].min;
      }
    }
    

    result = solver.Solve(model);
    

    if (!result.feasible) {
      subjects.forEach(subject => {
        const prevMin = modelConstraints[`subject_${subject.name}`].min;
        modelConstraints[`subject_${subject.name}`].min = Math.max(1, Math.floor(prevMin * 0.7));
      });
      

      result = solver.Solve(model);
      

      if (!result.feasible) {
        subjects.forEach(subject => {
          delete modelConstraints[`subject_${subject.name}`];
        });
        

        modelConstraints.total.min = Math.max(totalDays, Math.floor(adjustedMinStudyHours * 0.5));
        

        result = solver.Solve(model);
      }
    }
  }
  

  let actualTotalHours = 0;
  

  const schedule = [];
  
  for (let day = 1; day <= totalDays; day++) {
    const daySchedule = {
      day,
      subjects: []
    };
    
    let dayHours = 0;
    
    subjects.forEach(subject => {
      const varName = `${subject.name}_${day}`;
      const hours = Math.round(result[varName] || 0); 
      
      if (hours > 0) {
        daySchedule.subjects.push({
          name: subject.name,
          hours,
          difficulty: subject.difficulty,
          importance: subject.importance
        });
        
        dayHours += hours;
        actualTotalHours += hours;
      }
    });
    
    schedule.push(daySchedule);
  }
  

  if (!result.feasible || countRestDays(schedule) > 3) {
    return createFallbackSchedule(subjects, constraints);
  }
  
  return {
    schedule,
    totalStudyHours: actualTotalHours, 
    feasible: true
  };
}


function countRestDays(schedule) {
  return schedule.filter(day => day.subjects.length === 0).length;
}

function createFallbackSchedule(subjects, constraints) {
  const { maxHoursPerDay, daysUntilExam } = constraints;
  const schedule = [];
  let totalHours = 0;
  

  const sortedSubjects = [...subjects].sort((a, b) => 
    (b.importance * b.difficulty) - (a.importance * a.difficulty)
  );
  

  for (let day = 1; day <= daysUntilExam; day++) {
    const daySchedule = {
      day,
      subjects: []
    };
    

    const restDays = Math.min(3, Math.floor(daysUntilExam / 7));
    const isRestDay = day % 7 === 0 && Math.floor(day / 7) <= restDays;
    
    if (!isRestDay) {

      let remainingHours = maxHoursPerDay;
      

      for (let i = 0; i < sortedSubjects.length && remainingHours > 0; i++) {

        const subjectIndex = (i + day) % sortedSubjects.length;
        const subject = sortedSubjects[subjectIndex];
        

        const hours = Math.min(remainingHours, 2 + Math.floor(subject.importance / 4));
        
        if (hours > 0) {
          daySchedule.subjects.push({
            name: subject.name,
            hours,
            difficulty: subject.difficulty,
            importance: subject.importance
          });
          
          remainingHours -= hours;
          totalHours += hours;
        }
      }
    }
    
    schedule.push(daySchedule);
  }
  
  return {
    schedule,
    totalStudyHours: totalHours,
    feasible: true
  };
}
