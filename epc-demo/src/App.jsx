import { useState } from 'react';
import Layout from './components/Layout';
import EmailAnalysis from './pages/EmailAnalysis';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import MyTodos from './pages/MyTodos';

function App() {
  const [currentPage, setCurrentPage] = useState('email');

  const renderPage = () => {
    switch (currentPage) {
      case 'email':
        return <EmailAnalysis />;
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'mytodo':
        return <MyTodos />;
      default:
        return <EmailAnalysis />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
