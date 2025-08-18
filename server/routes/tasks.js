const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Tạo task mới
router.post('/', authenticateToken, authorizeRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { title, description, assigned_to, department, priority, due_date } = req.body;

    // Lấy employee_id của người tạo task
    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const assignedBy = employees[0].id;

    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description, assigned_to, assigned_by, department, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, assigned_to, assignedBy, department, priority, due_date]
    );

    res.status(201).json({
      message: 'Tạo công việc thành công',
      taskId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi tạo task:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    
    let query = `
      SELECT t.*, 
             e1.name as assigned_to_name,
             e2.name as assigned_by_name
      FROM tasks t
      JOIN employees e1 ON t.assigned_to = e1.id
      JOIN employees e2 ON t.assigned_by = e2.id
      WHERE 1=1
    `;
    const params = [];

    // Nếu là nhân viên thì chỉ xem task được giao
    if (req.user.role === 'employee') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        query += ' AND t.assigned_to = ?';
        params.push(employees[0].id);
      }
    } else if (req.user.role === 'manager') {
      // Manager xem task của department hoặc do mình giao
      const [employees] = await pool.execute(
        'SELECT id, department FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        query += ' AND (t.assigned_by = ? OR t.department = ?)';
        params.push(employees[0].id, employees[0].department);
      }
    }

    if (assignedTo) {
      query += ' AND t.assigned_to = ?';
      params.push(assignedTo);
    }

    if (status && status !== 'all') {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.execute(query, params);

    // Lấy comments cho mỗi task
    for (let task of tasks) {
      const [comments] = await pool.execute(`
        SELECT tc.*, u.name as user_name
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = ?
        ORDER BY tc.created_at DESC
      `, [task.id]);
      task.comments = comments;
    }

    res.json(tasks);
  } catch (error) {
    console.error('Lỗi lấy danh sách tasks:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật tiến độ task
router.put('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    
    let status = 'in_progress';
    let completedDate = null;
    
    if (progress === 0) {
      status = 'not_started';
    } else if (progress === 100) {
      status = 'completed';
      completedDate = new Date().toISOString().split('T')[0];
    }

    await pool.execute(
      'UPDATE tasks SET progress = ?, status = ?, completed_date = ? WHERE id = ?',
      [progress, status, completedDate, req.params.id]
    );

    res.json({ message: 'Cập nhật tiến độ thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật tiến độ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm comment vào task
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { comment } = req.body;

    await pool.execute(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, comment]
    );

    res.status(201).json({ message: 'Thêm bình luận thành công' });
  } catch (error) {
    console.error('Lỗi thêm comment:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật trạng thái task
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    let completedDate = null;
    if (status === 'completed') {
      completedDate = new Date().toISOString().split('T')[0];
    }

    await pool.execute(
      'UPDATE tasks SET status = ?, completed_date = ? WHERE id = ?',
      [status, completedDate, req.params.id]
    );

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thống kê tasks
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
        whereClause = 'WHERE assigned_to = ?';
        params.push(employees[0].id);
      }
    } else if (req.user.role === 'manager') {
      const [employees] = await pool.execute(
        'SELECT id, department FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        whereClause = 'WHERE (assigned_by = ? OR department = ?)';
        params.push(employees[0].id, employees[0].department);
      }
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'not_started' THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue
      FROM tasks ${whereClause}
    `, params);

    res.json(stats[0]);
  } catch (error) {
    console.error('Lỗi thống kê tasks:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;