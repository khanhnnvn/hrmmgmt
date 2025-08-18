export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  department: string;
  position: string;
  avatar?: string;
  phone?: string;
  join_date: string;
  status: 'active' | 'inactive' | 'probation';
}

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  manager_id?: string;
  manager_name?: string;
  join_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'probation' | 'terminated';
  avatar?: string;
  skills: string[];
  kpi: number;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  check_in: string;
  check_out?: string;
  location: string;
  type: 'office' | 'wfh' | 'business_trip';
  overtime?: number;
  status: 'on_time' | 'late' | 'early_leave';
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'emergency';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_by_name?: string;
  applied_date: string;
  documents?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  assigned_by_name: string;
  assigned_to_name: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  due_date: string;
  created_at: string;
  completed_date?: string;
  attachments?: string[];
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'laptop' | 'monitor' | 'phone' | 'equipment' | 'furniture';
  model: string;
  serial_number: string;
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_date?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  condition_status: 'new' | 'good' | 'fair' | 'poor';
  purchase_date: string;
  warranty_date?: string;
  value: number;
}

export interface WorkReport {
  id: string;
  employee_id: string;
  employee_name: string;
  task_id?: string;
  task_title?: string;
  title: string;
  description: string;
  type: 'assigned' | 'unplanned';
  date: string;
  hours_spent: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approved_by?: string;
  approved_by_name?: string;
  feedback?: string;
}

export interface DashboardStats {
  totalEmployees?: number;
  activeEmployees?: number;
  pendingLeaves?: number;
  pendingTasks?: number;
  totalAssets?: number;
  availableAssets?: number;
  todayAttendance?: number;
  teamMembers?: number;
  pendingApprovals?: number;
  activeProjects?: number;
  activeTasks?: number;
  remainingLeaves?: number;
  weeklyHours?: number;
}