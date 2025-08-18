import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Eye, Trash2, Mail, Phone } from 'lucide-react';
import { Employee } from '../../types';

const EmployeeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const mockEmployees: Employee[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 234 567 8901',
      department: 'Development',
      position: 'Senior Developer',
      manager: 'Jane Smith',
      joinDate: '2023-03-15',
      salary: 85000,
      status: 'active',
      skills: ['React', 'Node.js', 'TypeScript'],
      kpi: 92
    },
    {
      id: '2',
      employeeId: 'EMP002',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 234 567 8902',
      department: 'Development',
      position: 'Team Lead',
      joinDate: '2022-08-20',
      salary: 95000,
      status: 'active',
      skills: ['Leadership', 'React', 'Python'],
      kpi: 96
    },
    {
      id: '3',
      employeeId: 'EMP003',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1 234 567 8903',
      department: 'Marketing',
      position: 'Marketing Specialist',
      manager: 'Sarah Wilson',
      joinDate: '2023-06-10',
      salary: 65000,
      status: 'active',
      skills: ['Digital Marketing', 'SEO', 'Analytics'],
      kpi: 88
    },
    {
      id: '4',
      employeeId: 'EMP004',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+1 234 567 8904',
      department: 'Marketing',
      position: 'Marketing Manager',
      joinDate: '2022-11-05',
      salary: 75000,
      status: 'active',
      skills: ['Strategy', 'Leadership', 'Brand Management'],
      kpi: 94
    },
    {
      id: '5',
      employeeId: 'EMP005',
      name: 'Bob Brown',
      email: 'bob.brown@company.com',
      phone: '+1 234 567 8905',
      department: 'Development',
      position: 'Junior Developer',
      manager: 'Jane Smith',
      joinDate: '2023-09-01',
      salary: 55000,
      status: 'probation',
      skills: ['JavaScript', 'HTML', 'CSS'],
      kpi: 78
    }
  ];

  const departments = ['all', 'Development', 'Marketing', 'Sales', 'HR', 'Finance'];

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'probation':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KPI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span>{employee.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 mr-2">{employee.kpi}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            employee.kpi >= 90 ? 'bg-green-500' : 
                            employee.kpi >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${employee.kpi}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No employees found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;