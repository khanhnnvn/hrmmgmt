import express from 'express';
import { dbRun, dbGet, dbAll } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Dashboard tổng quan
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'admin' || req.user.role === 'hr') {
      // Thống kê cho Admin/HR
      const employeeStats = await dbGet(`
        SELECT 
          COUNT(*) as total_employees,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_employees,
          SUM(CASE WHEN status = 'probation' THEN 1 ELSE 0 END) as probation_employees
        FROM employees
      `);

      const leaveStats = await dbGet(`
        SELECT COUNT(*) as pending_leaves
        FROM leave_requests 
        WHERE status = 'pending'
      `);

      const taskStats = await dbGet(`
        SELECT COUNT(*) as pending_tasks
        FROM tasks 
        WHERE status IN ('not_started', 'in_progress')
      `);

      const assetStats = await dbGet(`
        SELECT 
          COUNT(*) as total_assets,
          SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_assets
        FROM assets
      `);

      const attendanceStats = await dbGet(`
        SELECT COUNT(*) as today_attendance
        FROM time_entries 
        WHERE date = DATE('now')
      `);

      stats.totalEmployees = employeeStats?.total_employees || 0;
      stats.activeEmployees = employeeStats?.active_employees || 0;
      stats.probationEmployees = employeeStats?.probation_employees || 0;
      stats.pendingLeaves = leaveStats?.pending_leaves || 0;
      stats.pendingTasks = taskStats?.pending_tasks || 0;
      stats.totalAssets = assetStats?.total_assets || 0;
      stats.availableAssets = assetStats?.available_assets || 0;
      stats.todayAttendance = attendanceStats?.today_attendance || 0;

    } else if (req.user.role === 'manager') {
      // Thống kê cho Manager
      const employee = await dbGet(
        'SELECT id, department FROM employees WHERE user_id = ?',
        [req.user.id]
      );

      if (employee) {
        const managerId = employee.id;
        const department = employee.department;

        const teamStats = await dbGet(`
          SELECT COUNT(*) as team_members
          FROM employees 
          WHERE department = ? AND status = 'active'
        `, [department]);

        const leaveStats = await dbGet(`
          SELECT COUNT(*) as pending_approvals
          FROM leave_requests lr
          JOIN employees e ON lr.employee_id = e.id
          WHERE e.department = ? AND lr.status = 'pending'
        `, [department]);

        const taskStats = await dbGet(`
          SELECT COUNT(*) as active_projects
          FROM tasks 
          WHERE assigned_by = ? AND status IN ('not_started', 'in_progress')
        `, [managerId]);

        stats.teamMembers = teamStats?.team_members || 0;
        stats.pendingApprovals = leaveStats?.pending_approvals || 0;
        stats.activeProjects = taskStats?.active_projects || 0;
      }

    } else {
      // Thống kê cho Employee
      const employee = await dbGet(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );

      if (employee) {
        const employeeId = employee.id;

        const taskStats = await dbGet(`
          SELECT COUNT(*) as active_tasks
          FROM tasks 
          WHERE assigned_to = ? AND status IN ('not_started', 'in_progress')
        `, [employeeId]);

        const leaveBalance = await dbGet(`
          SELECT 
            15 - IFNULL(SUM(CASE WHEN type = 'annual' AND status = 'approved' THEN days ELSE 0 END), 0) as remaining_leaves
          FROM leave_requests 
          WHERE employee_id = ? AND STRFTIME('%Y', start_date) = STRFTIME('%Y', 'now')
        `, [employeeId]);

        const attendanceStats = await dbGet(`
          SELECT 
            SUM(CASE WHEN check_in IS NOT NULL AND check_out IS NOT NULL 
                THEN (JULIANDAY(check_out) - JULIANDAY(check_in)) * 24
                ELSE 0 END) as total_hours
          FROM time_entries 
          WHERE employee_id = ? AND STRFTIME('%W', date) = STRFTIME('%W', 'now')
        `, [employeeId]);

        stats.activeTasks = taskStats?.active_tasks || 0;
        stats.remainingLeaves = leaveBalance?.remaining_leaves || 0;
        stats.weeklyHours = Math.round((attendanceStats?.total_hours || 0) * 10) / 10;
      }
    }

    res.json(stats);
  } catch (error) {
    console.error('Lỗi lấy thống kê dashboard:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Hoạt động gần đây
router.get('/recent-activities', authenticateToken, async (req, res) => {
  try {
    const activities = [];

    if (req.user.role === 'admin' || req.user.role === 'hr') {
      // Lấy hoạt động gần đây cho Admin/HR
      const recentLeaves = await dbAll(`
        SELECT 'leave_request' as type, lr.id, e.name as employee_name, lr.created_at, lr.type as leave_type
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.status = 'pending'
        ORDER BY lr.created_at DESC
        LIMIT 5
      `);

      const recentReports = await dbAll(`
        SELECT 'work_report' as type, wr.id, e.name as employee_name, wr.created_at, wr.title
        FROM work_reports wr
        JOIN employees e ON wr.employee_id = e.id
        WHERE wr.status = 'submitted'
        ORDER BY wr.created_at DESC
        LIMIT 5
      `);

      activities.push(...(recentLeaves || []), ...(recentReports || []));
    }

    // Sắp xếp theo thời gian
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Lỗi lấy hoạt động gần đây:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;