import express from 'express';
import { dbRun, dbGet, dbAll } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Check-in
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const { location, type = 'office' } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    // Lấy employee_id từ user
    const employee = await dbGet(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employeeId = employee.id;

    // Kiểm tra đã check-in hôm nay chưa
    const existing = await dbGet(
      'SELECT id FROM time_entries WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing) {
      return res.status(400).json({ message: 'Đã check-in hôm nay rồi' });
    }

    // Xác định trạng thái (đúng giờ, muộn)
    const checkInTime = new Date(`2000-01-01 ${currentTime}`);
    const standardTime = new Date('2000-01-01 09:00:00');
    const status = checkInTime > standardTime ? 'late' : 'on_time';

    // Tạo bản ghi check-in
    await dbRun(
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
    const employee = await dbGet(
      'SELECT id FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employeeId = employee.id;

    // Kiểm tra đã check-in chưa
    const existing = await dbGet(
      'SELECT id, check_in FROM time_entries WHERE employee_id = ? AND date = ? AND check_out IS NULL',
      [employeeId, today]
    );

    if (!existing) {
      return res.status(400).json({ message: 'Chưa check-in hoặc đã check-out rồi' });
    }

    // Tính overtime
    const checkInTime = new Date(`2000-01-01 ${existing.check_in}`);
    const checkOutTime = new Date(`2000-01-01 ${currentTime}`);
    const standardEndTime = new Date('2000-01-01 18:00:00');
    
    let overtime = 0;
    if (checkOutTime > standardEndTime) {
      overtime = (checkOutTime - standardEndTime) / (1000 * 60 * 60); // giờ
    }

    // Cập nhật check-out
    await dbRun(
      'UPDATE time_entries SET check_out = ?, overtime = ? WHERE id = ?',
      [currentTime, overtime, existing.id]
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
      const employee = await dbGet(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employee) {
        query += ' AND te.employee_id = ?';
        params.push(employee.id);
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

    const entries = await dbAll(query, params);
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
      const employee = await dbGet(
        'SELECT id FROM employees WHERE user_id = ?',
        [req.user.id]
      );
      if (employee) {
        employeeFilter = 'AND te.employee_id = ?';
        params.push(employee.id);
      }
    } else if (employeeId) {
      employeeFilter = 'AND te.employee_id = ?';
      params.push(employeeId);
    }

    const stats = await dbGet(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) as on_time_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(overtime) as total_overtime,
        AVG(CASE WHEN check_in IS NOT NULL AND check_out IS NOT NULL 
            THEN (JULIANDAY(check_out) - JULIANDAY(check_in)) * 24
            ELSE NULL END) as avg_hours_per_day
      FROM time_entries te
      WHERE STRFTIME('%Y', te.date) = ? AND STRFTIME('%m', te.date) = ? ${employeeFilter}
    `, params);

    res.json(stats || {});
  } catch (error) {
    console.error('Lỗi thống kê chấm công:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;