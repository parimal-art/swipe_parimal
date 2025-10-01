import { useState } from 'react';
import HomePage from './components/HomePage';
import CreateQuestions from './components/CreateQuestions';
import CandidateFlow from './components/CandidateFlow';
import InterviewerDashboard from './components/InterviewerDashboard';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});

  const navigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
  };

  switch (currentView) {
    case 'home':
      return <HomePage onNavigate={navigate} />;
    case 'create-questions':
      return <CreateQuestions onNavigate={navigate} />;
    case 'candidate':
      return (
        <CandidateFlow
          interviewCode={viewParams.interviewCode}
          onNavigate={navigate}
        />
      );
    case 'dashboard':
      return (
        <InterviewerDashboard
          dashboardCode={viewParams.dashboardCode}
          onNavigate={navigate}
        />
      );
    default:
      return <HomePage onNavigate={navigate} />;
  }
}

export default App;
