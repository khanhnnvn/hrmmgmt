import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Tạo đơn xin nghỉ phép
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, start_date, end_date, reason } = req.body;

    // Lấy employee_id từ user
    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employeeId = employees[0].id;

    // Tính số ngày nghỉ
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const [result] = await pool.execute(
      'INSERT INTO leave_requests (employee_id, type, start_date, end_date, days, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [employeeId, type, start_date, end_date, days, reason]
    );

    res.status(201).json({
      message: 'Gửi đơn xin nghỉ phép thành công',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi tạo đơn nghỉ phép:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách đơn nghỉ phép
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, employeeId } = req.query;
    
    let query = `
      SELECT lr.*, e.name as employee_name, a.name as approved_by_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees a ON lr.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];

    // Nếu là nhân viên thì chỉ xem đơn của mình
    if (req.user.role === 'employee') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        query += ' AND lr.employee_id = ?';
        params.push(employees[0].id);
      }
    } else if (employeeId) {
      query += ' AND lr.employee_id = ?';
      params.push(employeeId);
    }

    if (status && status !== 'all') {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    if (type && type !== 'all') {
      query += ' AND lr.type = ?';
      params.push(type);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [requests] = await pool.execute(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn nghỉ phép:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Duyệt/từ chối đơn nghỉ phép
router.put('/:id/approve', authenticateToken, authorizeRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' hoặc 'rejected'
    
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
      'UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?',
      [status, approverId, req.params.id]
    );

    res.json({ 
      message: status === 'approved' ? 'Đã duyệt đơn nghỉ phép' : 'Đã từ chối đơn nghỉ phép' 
    });
  } catch (error) {
    console.error('Lỗi duyệt đơn nghỉ phép:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy số ngày phép còn lại
router.get('/balance/:employeeId?', authenticateToken, async (req, res) => {
  try {
    let employeeId = req.params.employeeId;
    
    // Nếu không có employeeId thì lấy của user hiện tại
    if (!employeeId) {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
      }
      employeeId = employees[0].id;
    }

    const currentYear = new Date().getFullYear();

    // Tính tổng ngày đã nghỉ trong năm
    const [usedDays] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN type = 'annual' AND status = 'approved' THEN days ELSE 0 END) as annual_used,
        SUM(CASE WHEN type = 'sick' AND status = 'approved' THEN days ELSE 0 END) as sick_used
      FROM leave_requests 
      WHERE employee_id = ? AND YEAR(start_date) = ?
    `, [employeeId, currentYear]);

    // Quy định phép năm (có thể lấy từ config hoặc employee profile)
    const annualLeaveEntitlement = 15; // 15 ngày phép năm
    const sickLeaveEntitlement = 10;   // 10 ngày phép ốm

    const balance = {
      annual: {
        total: annualLeaveEntitlement,
        used: usedDays[0].annual_used || 0,
        remaining: annualLeaveEntitlement - (usedDays[0].annual_used || 0)
      },
      sick: {
        total: sickLeaveEntitlement,
        used: usedDays[0].sick_used || 0,
        remaining: sickLeaveEntitlement - (usedDays[0].sick_used || 0)
      }
    };

    res.json(balance);
  } catch (error) {
    console.error('Lỗi lấy số ngày phép:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;