import express from 'express';
import { dbRun, dbGet, dbAll } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Lấy danh sách tài sản
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, search } = req.query;
    
    let query = `
      SELECT a.*, e.name as assigned_to_name
      FROM assets a
      LEFT JOIN employees e ON a.assigned_to = e.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (type && type !== 'all') {
      query += ' AND a.type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (a.name LIKE ? OR a.serial_number LIKE ? OR a.model LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.created_at DESC';

    const assets = await dbAll(query, params);
    res.json(assets);
  } catch (error) {
    console.error('Lỗi lấy danh sách tài sản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo tài sản mới
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const {
      name, type, model, serial_number, purchase_date,
      warranty_date, value, condition_status
    } = req.body;

    const result = await dbRun(
      `INSERT INTO assets (name, type, model, serial_number, purchase_date, warranty_date, value, condition_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, model, serial_number, purchase_date, warranty_date || null, value, condition_status]
    );

    res.status(201).json({
      message: 'Tạo tài sản thành công',
      assetId: result.lastID
    });
  } catch (error) {
    console.error('Lỗi tạo tài sản:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ message: 'Số serial đã tồn tại' });
    } else {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
});

// Gán tài sản cho nhân viên
router.put('/:id/assign', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { employee_id } = req.body;
    const assignedDate = new Date().toISOString().split('T')[0];

    await dbRun(
      'UPDATE assets SET assigned_to = ?, assigned_date = ?, status = ? WHERE id = ?',
      [employee_id, assignedDate, 'assigned', req.params.id]
    );

    res.json({ message: 'Gán tài sản thành công' });
  } catch (error) {
    console.error('Lỗi gán tài sản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thu hồi tài sản
router.put('/:id/return', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    await dbRun(
      'UPDATE assets SET assigned_to = NULL, assigned_date = NULL, status = ? WHERE id = ?',
      ['available', req.params.id]
    );

    res.json({ message: 'Thu hồi tài sản thành công' });
  } catch (error) {
    console.error('Lỗi thu hồi tài sản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật tình trạng tài sản
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const {
      name, model, condition_status, status, value, warranty_date
    } = req.body;

    await dbRun(
      'UPDATE assets SET name = ?, model = ?, condition_status = ?, status = ?, value = ?, warranty_date = ? WHERE id = ?',
      [name, model, condition_status, status, value, warranty_date || null, req.params.id]
    );

    res.json({ message: 'Cập nhật tài sản thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật tài sản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thống kê tài sản
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await dbGet(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) as retired,
        SUM(value) as total_value
      FROM assets
    `);

    res.json(stats || {});
  } catch (error) {
    console.error('Lỗi thống kê tài sản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;