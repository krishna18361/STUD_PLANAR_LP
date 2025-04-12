# Smart Study Planner

A React-based web application that generates optimized study schedules for students using linear programming techniques.

## Features

- Create personalized study schedules based on subject difficulty and importance
- Optimize study time allocation to maximize efficiency
- Prevent burnout with balanced daily workloads
- Responsive and intuitive interface

## Linear Programming Implementation

This application uses linear programming (LP) to solve the complex problem of time allocation across multiple subjects while satisfying various constraints. The LP model:

1. **Decision Variables**: Hours spent on each subject per day
2. **Multi-Objective Optimization**:
   - Maximize time spent on difficult subjects (weighted by difficulty)
   - Ensure each subject gets enough study time (weighted by importance)
   - Distribute hours across days to prevent burnout

3. **Constraints**:
   - Maximum study hours per day
   - Minimum total study hours
   - Minimum time allocation for each subject based on importance

## Technologies Used

- React
- Chakra UI (for responsive interface)
- javascript-lp-solver (for linear programming optimization)

## How to Use

1. Add your subjects with names, difficulty ratings, and importance ratings
2. Set your constraints (max hours per day, days until exam, etc.)
3. Click "Generate Optimized Study Plan" to see your personalized schedule
4. View the day-by-day breakdown of what to study and for how long

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Why Linear Programming?

Linear programming is particularly well-suited for study planning because:

1. It can handle multiple competing objectives simultaneously
2. It respects hard constraints that cannot be violated
3. It produces globally optimal solutions based on the specified parameters
4. It naturally balances resource allocation (time) across multiple needs (subjects)

This approach ensures that the most challenging subjects receive appropriate attention while maintaining a balanced and feasible study schedule.
