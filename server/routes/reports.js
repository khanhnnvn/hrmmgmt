import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Tạo báo cáo công việc
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { task_id, title, description, type, date, hours_spent } = req.body;

    // Lấy employee_id từ user
    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employeeId = employees[0].id;

    const [result] = await pool.execute(
      'INSERT INTO work_reports (employee_id, task_id, title, description, type, date, hours_spent, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeId, task_id || null, title, description, type, date, hours_spent, 'submitted']
    );

    res.status(201).json({
      message: 'Tạo báo cáo thành công',
      reportId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi tạo báo cáo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lưu báo cáo dạng draft
router.post('/draft', authenticateToken, async (req, res) => {
  try {
    const { task_id, title, description, type, date, hours_spent } = req.body;

    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employeeId = employees[0].id;

    const [result] = await pool.execute(
      'INSERT INTO work_reports (employee_id, task_id, title, description, type, date, hours_spent, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeId, task_id || null, title, description, type, date, hours_spent, 'draft']
    );

    res.status(201).json({
      message: 'Lưu bản nháp thành công',
      reportId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi lưu bản nháp:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách báo cáo
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, employeeId, startDate, endDate } = req.query;
    
    let query = `
      SELECT wr.*, e.name as employee_name, t.title as task_title, a.name as approved_by_name
      FROM work_reports wr
      JOIN employees e ON wr.employee_id = e.id
      LEFT JOIN tasks t ON wr.task_id = t.id
      LEFT JOIN employees a ON wr.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];

    // Nếu là nhân viên thì chỉ xem báo cáo của mình
    if (req.user.role === 'employee') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        query += ' AND wr.employee_id = ?';
        params.push(employees[0].id);
      }
    } else if (employeeId) {
      query += ' AND wr.employee_id = ?';
      params.push(employeeId);
    }

    if (status && status !== 'all') {
      query += ' AND wr.status = ?';
      params.push(status);
    }

    if (type && type !== 'all') {
      query += ' AND wr.type = ?';
      params.push(type);
    }

    if (startDate) {
      query += ' AND wr.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND wr.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY wr.created_at DESC';

    const [reports] = await pool.execute(query, params);
    res.json(reports);
  } catch (error) {
    console.error('Lỗi lấy danh sách báo cáo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Duyệt/từ chối báo cáo
router.put('/:id/approve', authenticateToken, authorizeRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { status, feedback } = req.body; // 'approved' hoặc 'rejected'
    
    // Lấy employee_id của người duyệt
    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const approverId = employees[0].id;

    await pool.execute(
      'UPDATE work_reports SET status = ?, approved_by = ?, feedback = ? WHERE id = ?',
      [status, approverId, feedback || null, req.params.id]
    );

    res.json({ 
      message: status === 'approved' ? 'Đã duyệt báo cáo' : 'Đã từ chối báo cáo' 
    });
  } catch (error) {
    console.error('Lỗi duyệt báo cáo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thống kê báo cáo
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let whereClause = '';
    const params = [];

    if (req.user.role === 'employee') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        whereClause = 'WHERE employee_id = ?';
        params.push(employees[0].id);
      }
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(hours_spent) as total_hours
      FROM work_reports ${whereClause}
    `, params);

    res.json(stats[0]);
  } catch (error) {
    console.error('Lỗi thống kê báo cáo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;