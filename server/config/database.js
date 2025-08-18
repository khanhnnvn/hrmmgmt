import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create SQLite database
const db = new sqlite3.Database(':memory:'); // In-memory database

// Promisify database methods
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role TEXT DEFAULT 'employee',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Employees table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(100),
        position VARCHAR(100),
        hire_date DATE,
        salary DECIMAL(10,2),
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Attendance table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        break_start TIME,
        break_end TIME,
        total_hours DECIMAL(4,2),
        status TEXT DEFAULT 'present',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Leaves table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        leave_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_requested INTEGER NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (approved_by) REFERENCES employees(id)
      )
    `);

    // Tasks table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INTEGER NOT NULL,
        assigned_by INTEGER NOT NULL,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        due_date DATE,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(id),
        FOREIGN KEY (assigned_by) REFERENCES employees(id)
      )
    `);

    // Assets table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_tag VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        assigned_to INTEGER,
        status TEXT DEFAULT 'available',
        purchase_date DATE,
        purchase_cost DECIMAL(10,2),
        warranty_expiry DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(id)
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

export { db, dbRun, dbGet, dbAll, initDatabase };