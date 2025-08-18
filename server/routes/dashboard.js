const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Dashboard tổng quan
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'admin' || req.user.role === 'hr') {
      // Thống kê cho Admin/HR
      const [employeeStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_employees,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_employees,
          SUM(CASE WHEN status = 'probation' THEN 1 ELSE 0 END) as probation_employees
        FROM employees
      `);

      const [leaveStats] = await pool.execute(`
        SELECT COUNT(*) as pending_leaves
        FROM leave_requests 
        WHERE status = 'pending'
      `);

      const [taskStats] = await pool.execute(`
        SELECT COUNT(*) as pending_tasks
        FROM tasks 
        WHERE status IN ('not_started', 'in_progress')
      `);

      const [assetStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_assets,
          SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_assets
        FROM assets
      `);

      const [attendanceStats] = await pool.execute(`
        SELECT COUNT(*) as today_attendance
        FROM time_entries 
        WHERE date = CURDATE()
      `);

      stats.totalEmployees = employeeStats[0].total_employees;
      stats.activeEmployees = employeeStats[0].active_employees;
      stats.probationEmployees = employeeStats[0].probation_employees;
      stats.pendingLeaves = leaveStats[0].pending_leaves;
      stats.pendingTasks = taskStats[0].pending_tasks;
      stats.totalAssets = assetStats[0].total_assets;
      stats.availableAssets = assetStats[0].available_assets;
      stats.todayAttendance = attendanceStats[0].today_attendance;

    } else if (req.user.role === 'manager') {
      // Thống kê cho Manager
      const [employees] = await pool.execute(
        'SELECT id, department FROM employees WHERE user_id = ?',
        [req.user.id]
      );

      if (employees.length > 0) {
        const managerId = employees[0].id;
        const department = employees[0].department;

        const [teamStats] = await pool.execute(`
          SELECT COUNT(*) as team_members
          FROM employees 
          WHERE department = ? AND status = 'active'
        `, [department]);

        const [leaveStats] = await pool.execute(`
          SELECT COUNT(*) as pending_approvals
          FROM leave_requests lr
          JOIN employees e ON lr.employee_id = e.id
          WHERE e.department = ? AND lr.status = 'pending'
        `, [department]);

        const [taskStats] = await pool.execute(`
          SELECT COUNT(*) as active_projects
          FROM tasks 
          WHERE assigned_by = ? AND status IN ('not_started', 'in_progress')
        `, [managerId]);

        stats.teamMembers = teamStats[0].team_members;
        stats.pendingApprovals = leaveStats[0].pending_approvals;
        stats.activeProjects = taskStats[0].active_projects;
      }

    } else {
      // Thống kê cho Employee
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );

      if (employees.length > 0) {
        const employeeId = employees[0].id;

        const [taskStats] = await pool.execute(`
          SELECT COUNT(*) as active_tasks
          FROM tasks 
          WHERE assigned_to = ? AND status IN ('not_started', 'in_progress')
        `, [employeeId]);

        const [leaveBalance] = await pool.execute(`
          SELECT 
            15 - COALESCE(SUM(CASE WHEN type = 'annual' AND status = 'approved' THEN days ELSE 0 END), 0) as remaining_leaves
          FROM leave_requests 
          WHERE employee_id = ? AND YEAR(start_date) = YEAR(CURDATE())
        `, [employeeId]);

        const [attendanceStats] = await pool.execute(`
          SELECT 
            SUM(CASE WHEN check_in IS NOT NULL AND check_out IS NOT NULL 
                THEN TIME_TO_SEC(TIMEDIFF(check_out, check_in))/3600 
                ELSE 0 END) as total_hours
          FROM time_entries 
          WHERE employee_id = ? AND WEEK(date) = WEEK(CURDATE())
        `, [employeeId]);

        stats.activeTasks = taskStats[0].active_tasks;
        stats.remainingLeaves = leaveBalance[0].remaining_leaves;
        stats.weeklyHours = Math.round(attendanceStats[0].total_hours * 10) / 10;
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
      const [recentLeaves] = await pool.execute(`
        SELECT 'leave_request' as type, lr.id, e.name as employee_name, lr.created_at, lr.type as leave_type
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.status = 'pending'
        ORDER BY lr.created_at DESC
        LIMIT 5
      `);

      const [recentReports] = await pool.execute(`
        SELECT 'work_report' as type, wr.id, e.name as employee_name, wr.created_at, wr.title
        FROM work_reports wr
        JOIN employees e ON wr.employee_id = e.id
        WHERE wr.status = 'submitted'
        ORDER BY wr.created_at DESC
        LIMIT 5
      `);

      activities.push(...recentLeaves, ...recentReports);
    }

    // Sắp xếp theo thời gian
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Lỗi lấy hoạt động gần đây:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;