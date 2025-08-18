import React from 'react';
import { Users, Clock, Calendar, CheckSquare, Package, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCard from './DashboardCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getEmployeeDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.name}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Today's Hours"
          value="8.5h"
          icon={Clock}
          color="blue"
        />
        <DashboardCard
          title="Remaining Leaves"
          value="12"
          icon={Calendar}
          color="green"
        />
        <DashboardCard
          title="Active Tasks"
          value="5"
          icon={CheckSquare}
          color="yellow"
        />
        <DashboardCard
          title="Performance Score"
          value="85%"
          icon={Award}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {[
              { name: 'Complete project documentation', status: 'In Progress', priority: 'high' },
              { name: 'Review code changes', status: 'Pending', priority: 'medium' },
              { name: 'Team meeting preparation', status: 'Completed', priority: 'low' },
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.name}</p>
                  <p className={`text-sm ${
                    task.priority === 'high' ? 'text-red-600' : 
                    task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {task.priority} priority
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance This Week</h3>
          <div className="space-y-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-gray-600">{day}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">9:00 AM - 6:00 PM</span>
                  <div className={`w-3 h-3 rounded-full ${
                    index < 3 ? 'bg-green-500' : index === 3 ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getManagerDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Team Members"
          value="12"
          icon={Users}
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Pending Approvals"
          value="4"
          icon={AlertTriangle}
          color="yellow"
        />
        <DashboardCard
          title="Active Projects"
          value="7"
          icon={CheckSquare}
          color="green"
        />
        <DashboardCard
          title="Team Performance"
          value="92%"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Leave Requests</h3>
          <div className="space-y-3">
            {[
              { name: 'John Doe', type: 'Annual Leave', days: '3 days', date: '2024-12-25' },
              { name: 'Jane Smith', type: 'Sick Leave', days: '1 day', date: '2024-12-20' },
            ].map((request, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{request.name}</p>
                  <p className="text-sm text-gray-500">{request.type} • {request.days}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Attendance Today</h3>
          <div className="space-y-3">
            {[
              { name: 'John Doe', status: 'Present', time: '9:00 AM' },
              { name: 'Jane Smith', status: 'Late', time: '9:15 AM' },
              { name: 'Bob Johnson', status: 'Present', time: '8:55 AM' },
              { name: 'Alice Wilson', status: 'Absent', time: '-' },
            ].map((member, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-900">{member.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{member.time}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'Present' ? 'bg-green-100 text-green-800' :
                    member.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getHRDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">HR Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Employees"
          value="156"
          icon={Users}
          color="blue"
          trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard
          title="New Hires This Month"
          value="8"
          icon={Users}
          color="green"
        />
        <DashboardCard
          title="Pending Leave Requests"
          value="23"
          icon={Calendar}
          color="yellow"
        />
        <DashboardCard
          title="Assets Assigned"
          value="145"
          icon={Package}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
          <div className="space-y-4">
            {[
              { dept: 'Development', count: 45, percentage: 85 },
              { dept: 'Marketing', count: 23, percentage: 92 },
              { dept: 'Sales', count: 34, percentage: 78 },
              { dept: 'HR', count: 8, percentage: 100 },
            ].map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">{dept.dept}</span>
                  <span className="text-gray-500">{dept.count} employees</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: `${dept.percentage}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {[
              { action: 'New employee onboarded', user: 'John Smith', time: '2 hours ago' },
              { action: 'Leave request approved', user: 'Sarah Connor', time: '4 hours ago' },
              { action: 'Asset assigned', user: 'Mike Johnson', time: '6 hours ago' },
              { action: 'Performance review completed', user: 'Lisa Anderson', time: '1 day ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'employee':
        return getEmployeeDashboard();
      case 'manager':
        return getManagerDashboard();
      case 'hr':
      case 'admin':
        return getHRDashboard();
      default:
        return getEmployeeDashboard();
    }
  };

  return (
    <div className="p-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;