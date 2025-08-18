import React, { useState } from 'react';
import { Plus, Filter, Clock, CheckSquare, AlertCircle, User, Calendar, Paperclip } from 'lucide-react';
import { Task } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the new HRM system including user guides and technical specifications.',
      assignedTo: '4',
      assignedBy: '3',
      assignedByName: 'Department Manager',
      assignedToName: 'John Doe',
      department: 'Development',
      priority: 'high',
      status: 'in_progress',
      progress: 75,
      dueDate: '2024-12-25',
      createdDate: '2024-12-10',
      comments: [
        {
          id: '1',
          taskId: '1',
          userId: '4',
          userName: 'John Doe',
          comment: 'Working on the user guide section, should be done by tomorrow.',
          createdDate: '2024-12-18'
        }
      ]
    },
    {
      id: '2',
      title: 'Review code changes',
      description: 'Review the latest pull requests for the authentication module.',
      assignedTo: '4',
      assignedBy: '2',
      assignedByName: 'Jane Smith',
      assignedToName: 'John Doe',
      department: 'Development',
      priority: 'medium',
      status: 'not_started',
      progress: 0,
      dueDate: '2024-12-22',
      createdDate: '2024-12-15',
      comments: []
    },
    {
      id: '3',
      title: 'Prepare marketing campaign',
      description: 'Create a comprehensive marketing campaign for Q1 2025 product launch.',
      assignedTo: '5',
      assignedBy: '6',
      assignedByName: 'Marketing Manager',
      assignedToName: 'Mike Johnson',
      department: 'Marketing',
      priority: 'high',
      status: 'completed',
      progress: 100,
      dueDate: '2024-12-20',
      createdDate: '2024-12-05',
      completedDate: '2024-12-19',
      comments: []
    },
    {
      id: '4',
      title: 'Team meeting preparation',
      description: 'Prepare agenda and materials for the monthly team meeting.',
      assignedTo: '4',
      assignedBy: '3',
      assignedByName: 'Department Manager',
      assignedToName: 'John Doe',
      department: 'Development',
      priority: 'low',
      status: 'overdue',
      progress: 25,
      dueDate: '2024-12-18',
      createdDate: '2024-12-12',
      comments: []
    }
  ];

  const getFilteredTasks = () => {
    let filtered = mockTasks;

    // Filter by user role
    if (user?.role === 'employee') {
      filtered = filtered.filter(task => task.assignedTo === user.id);
    } else if (user?.role === 'manager') {
      filtered = filtered.filter(task => 
        task.assignedBy === user.id || task.department === user.department
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Task created:', formData);
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const canCreateTask = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        {canCreateTask && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Task Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {mockTasks.filter(t => t.status === 'in_progress').length}
            </div>
            <div className="text-sm text-blue-800">In Progress</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {mockTasks.filter(t => t.status === 'not_started').length}
            </div>
            <div className="text-sm text-gray-800">Not Started</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {mockTasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-green-800">Completed</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {mockTasks.filter(t => t.status === 'overdue').length}
            </div>
            <div className="text-sm text-red-800">Overdue</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="grid gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(task.status)}
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'overdue' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Assigned to: {task.assignedToName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>By: {task.assignedByName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  {task.comments.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Paperclip className="h-4 w-4" />
                      <span>{task.comments.length} comments</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                {task.status === 'overdue' && (
                  <span className="text-xs text-red-600 font-medium">
                    {Math.floor((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                  </span>
                )}
              </div>
            </div>

            {/* Task Actions */}
            {user?.role === 'employee' && task.assignedTo === user.id && task.status !== 'completed' && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Update Progress:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue={task.progress}
                      className="w-32"
                      onChange={(e) => console.log('Progress updated:', e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    {task.status !== 'completed' && task.progress === 100 && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                        Mark Complete
                      </button>
                    )}
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Comments */}
            {task.comments.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Comments</h4>
                <div className="space-y-2">
                  {task.comments.slice(-2).map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No tasks found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the task..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select employee...</option>
                  <option value="4">John Doe</option>
                  <option value="5">Mike Johnson</option>
                  <option value="6">Sarah Wilson</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;