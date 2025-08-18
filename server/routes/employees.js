import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Lấy danh sách nhân viên
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, status, search } = req.query;
    
    let query = `
      SELECT e.*, u.email as user_email, m.name as manager_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'all') {
      query += ' AND e.department = ?';
      params.push(department);
    }

    if (status && status !== 'all') {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (e.name LIKE ? OR e.employee_id LIKE ? OR e.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.created_at DESC';

    const [employees] = await pool.execute(query, params);
    
    res.json(employees);
  } catch (error) {
    console.error('Lỗi lấy danh sách nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin chi tiết nhân viên
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [employees] = await pool.execute(
      `SELECT e.*, u.email as user_email, m.name as manager_name
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Lỗi lấy thông tin nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo nhân viên mới
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const {
      employee_id, name, email, phone, department, position,
      manager_id, join_date, salary, skills
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO employees (employee_id, name, email, phone, department, position, manager_id, join_date, salary, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, name, email, phone, department, position, manager_id || null, join_date, salary, JSON.stringify(skills || [])]
    );

    res.status(201).json({
      message: 'Tạo nhân viên thành công',
      employeeId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi tạo nhân viên:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Mã nhân viên hoặc email đã tồn tại' });
    } else {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
});

// Cập nhật thông tin nhân viên
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const {
      name, email, phone, department, position,
      manager_id, salary, status, skills, kpi
    } = req.body;

    await pool.execute(
      `UPDATE employees SET 
       name = ?, email = ?, phone = ?, department = ?, position = ?,
       manager_id = ?, salary = ?, status = ?, skills = ?, kpi = ?
       WHERE id = ?`,
      [name, email, phone, department, position, manager_id || null, salary, status, JSON.stringify(skills || []), kpi, req.params.id]
    );

    res.json({ message: 'Cập nhật thông tin nhân viên thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa nhân viên
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    console.error('Lỗi xóa nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;