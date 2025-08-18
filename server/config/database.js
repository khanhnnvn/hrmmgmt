import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrm_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Tạo database và tables nếu chưa tồn tại
const initDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Tạo database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.execute(`USE ${dbConfig.database}`);

    // Tạo bảng users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'hr', 'manager', 'employee') NOT NULL,
        department VARCHAR(255),
        position VARCHAR(255),
        avatar VARCHAR(255),
        phone VARCHAR(20),
        join_date DATE,
        status ENUM('active', 'inactive', 'probation') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tạo bảng employees
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(255),
        position VARCHAR(255),
        manager_id INT,
        join_date DATE,
        salary DECIMAL(15,2),
        status ENUM('active', 'inactive', 'probation', 'terminated') DEFAULT 'active',
        avatar VARCHAR(255),
        skills JSON,
        kpi DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // Tạo bảng time_entries
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        location VARCHAR(255),
        type ENUM('office', 'wfh', 'business_trip') DEFAULT 'office',
        overtime DECIMAL(4,2) DEFAULT 0,
        status ENUM('on_time', 'late', 'early_leave') DEFAULT 'on_time',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Tạo bảng leave_requests
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        type ENUM('annual', 'sick', 'unpaid', 'maternity', 'emergency') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days INT NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        applied_date DATE DEFAULT (CURRENT_DATE),
        documents JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // Tạo bảng tasks
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INT NOT NULL,
        assigned_by INT NOT NULL,
        department VARCHAR(255),
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('not_started', 'in_progress', 'completed', 'overdue') DEFAULT 'not_started',
        progress INT DEFAULT 0,
        due_date DATE,
        completed_date DATE,
        attachments JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Tạo bảng task_comments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tạo bảng assets
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('laptop', 'monitor', 'phone', 'equipment', 'furniture') NOT NULL,
        model VARCHAR(255),
        serial_number VARCHAR(255) UNIQUE,
        assigned_to INT,
        assigned_date DATE,
        status ENUM('available', 'assigned', 'maintenance', 'retired') DEFAULT 'available',
        condition_status ENUM('new', 'good', 'fair', 'poor') DEFAULT 'new',
        purchase_date DATE,
        warranty_date DATE,
        value DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // Tạo bảng work_reports
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        task_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('assigned', 'unplanned') DEFAULT 'assigned',
        date DATE NOT NULL,
        hours_spent DECIMAL(4,2) NOT NULL,
        status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
        approved_by INT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    console.log('Database và tables đã được tạo thành công!');
    await connection.end();
  } catch (error) {
    console.error('Lỗi khởi tạo database:', error);
  }
};

export { pool, initDatabase };