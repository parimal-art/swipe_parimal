// src/App.jsx

// 1. Import routing components from react-router-dom
import { Routes, Route } from 'react-router-dom';

// 2. Import all page components
import HomePage from './components/HomePage';
import CreateQuestions from './components/CreateQuestions';
import CandidateFlow from './components/CandidateFlow';
import InterviewerDashboard from './components/InterviewerDashboard';

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create-questions" element={<CreateQuestions />} />
      <Route path="/interview/:interviewCode" element={<CandidateFlow />} />
      <Route path="/dashboard/:dashboardCode" element={<InterviewerDashboard />} />
    </Routes>
  );
}

export default App;