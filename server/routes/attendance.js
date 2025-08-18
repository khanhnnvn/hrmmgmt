import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Check-in
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const { location, type = 'office' } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    // Lấy employee_id từ user
    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employeeId = employees[0].id;

    // Kiểm tra đã check-in hôm nay chưa
    const [existing] = await pool.execute(
      'SELECT id FROM time_entries WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Đã check-in hôm nay rồi' });
    }

    // Xác định trạng thái (đúng giờ, muộn)
    const checkInTime = new Date(`2000-01-01 ${currentTime}`);
    const standardTime = new Date('2000-01-01 09:00:00');
    const status = checkInTime > standardTime ? 'late' : 'on_time';

    // Tạo bản ghi check-in
    await pool.execute(
      'INSERT INTO time_entries (employee_id, date, check_in, location, type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [employeeId, today, currentTime, location, type, status]
    );

    res.json({
      message: 'Check-in thành công',
      checkInTime: currentTime,
      status
    });
  } catch (error) {
    console.error('Lỗi check-in:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Check-out
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    // Lấy employee_id từ user
    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employeeId = employees[0].id;

    // Kiểm tra đã check-in chưa
    const [existing] = await pool.execute(
      'SELECT id, check_in FROM time_entries WHERE employee_id = ? AND date = ? AND check_out IS NULL',
      [employeeId, today]
    );

    if (existing.length === 0) {
      return res.status(400).json({ message: 'Chưa check-in hoặc đã check-out rồi' });
    }

    // Tính overtime
    const checkInTime = new Date(`2000-01-01 ${existing[0].check_in}`);
    const checkOutTime = new Date(`2000-01-01 ${currentTime}`);
    const standardEndTime = new Date('2000-01-01 18:00:00');
    
    let overtime = 0;
    if (checkOutTime > standardEndTime) {
      overtime = (checkOutTime - standardEndTime) / (1000 * 60 * 60); // giờ
    }

    // Cập nhật check-out
    await pool.execute(
      'UPDATE time_entries SET check_out = ?, overtime = ? WHERE id = ?',
      [currentTime, overtime, existing[0].id]
    );

    res.json({
      message: 'Check-out thành công',
      checkOutTime: currentTime,
      overtime: overtime.toFixed(2)
    });
  } catch (error) {
    console.error('Lỗi check-out:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy lịch sử chấm công
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    let query = `
      SELECT te.*, e.name as employee_name
      FROM time_entries te
      JOIN employees e ON te.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    // Nếu không phải admin/hr thì chỉ xem của mình
    if (req.user.role === 'employee') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        query += ' AND te.employee_id = ?';
        params.push(employees[0].id);
      }
    } else if (employeeId) {
      query += ' AND te.employee_id = ?';
      params.push(employeeId);
    }

    if (startDate) {
      query += ' AND te.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND te.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY te.date DESC, te.check_in DESC';

    const [entries] = await pool.execute(query, params);
    res.json(entries);
  } catch (error) {
    console.error('Lỗi lấy lịch sử chấm công:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thống kê chấm công
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    let employeeFilter = '';
    const params = [currentYear, currentMonth];

    if (req.user.role === 'employee') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employees.length > 0) {
        employeeFilter = 'AND te.employee_id = ?';
        params.push(employees[0].id);
      }
    } else if (employeeId) {
      employeeFilter = 'AND te.employee_id = ?';
      params.push(employeeId);
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) as on_time_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(overtime) as total_overtime,
        AVG(CASE WHEN check_in IS NOT NULL AND check_out IS NOT NULL 
            THEN TIME_TO_SEC(TIMEDIFF(check_out, check_in))/3600 
            ELSE NULL END) as avg_hours_per_day
      FROM time_entries te
      WHERE YEAR(te.date) = ? AND MONTH(te.date) = ? ${employeeFilter}
    `, params);

    res.json(stats[0]);
  } catch (error) {
    console.error('Lỗi thống kê chấm công:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;