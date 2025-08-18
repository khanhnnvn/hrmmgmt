import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import TimeTracking from './components/TimeTracking/TimeTracking';
import LeaveManagement from './components/LeaveManagement/LeaveManagement';
import TaskManagement from './components/TaskManagement/TaskManagement';
import AssetManagement from './components/AssetManagement/AssetManagement';
import WorkReports from './components/WorkReports/WorkReports';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeList />;
      case 'attendance':
        return <TimeTracking />;
      case 'leaves':
        return <LeaveManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'assets':
        return <AssetManagement />;
      case 'reports':
        return <WorkReports />;
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-500">Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-500">System settings coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;