const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user tồn tại
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = users[0];

    // Kiểm tra mật khẩu
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'hrm_secret_key',
      { expiresIn: '24h' }
    );

    // Trả về thông tin user (không bao gồm password)
    const { password: _, ...userInfo } = user;
    
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin user hiện tại
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, role, department, position, avatar, phone, join_date, status FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng xuất
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Đăng xuất thành công' });
});

module.exports = router;