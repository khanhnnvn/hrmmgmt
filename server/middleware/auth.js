import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token không được cung cấp' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hrm_secret_key');
    
    // Lấy thông tin user từ database
    const [users] = await pool.execute(
      'SELECT id, email, name, role, department, position FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User không tồn tại' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  };
};

export { authenticateToken, authorizeRoles };