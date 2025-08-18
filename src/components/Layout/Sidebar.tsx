import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Package, 
  FileText, 
  BarChart3,
  UserPlus,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'attendance', label: 'Time Tracking', icon: Clock },
      { id: 'leaves', label: 'Leave Requests', icon: Calendar },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      { id: 'reports', label: 'Work Reports', icon: FileText },
    ];

    if (user?.role === 'admin' || user?.role === 'hr') {
      baseItems.splice(1, 0, { id: 'employees', label: 'Employees', icon: Users });
      baseItems.push({ id: 'assets', label: 'Assets', icon: Package });
      baseItems.push({ id: 'analytics', label: 'Analytics', icon: BarChart3 });
    }

    if (user?.role === 'admin') {
      baseItems.push({ id: 'settings', label: 'Settings', icon: Settings });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white w-64 min-h-screen shadow-sm border-r border-gray-200">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;