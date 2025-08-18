import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

const seedInitialData = async () => {
  try {
    console.log('Bắt đầu tạo dữ liệu mẫu...');

    // Tạo users mẫu
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const users = [
      {
        email: 'admin@company.com',
        password: hashedPassword,
        name: 'Quản trị viên',
        role: 'admin',
        department: 'Hành chính',
        position: 'Quản trị hệ thống',
        join_date: '2024-01-01'
      },
      {
        email: 'hr@company.com',
        password: hashedPassword,
        name: 'Trưởng phòng Nhân sự',
        role: 'hr',
        department: 'Nhân sự',
        position: 'Trưởng phòng HR',
        join_date: '2024-01-15'
      },
      {
        email: 'manager@company.com',
        password: hashedPassword,
        name: 'Trưởng phòng Phát triển',
        role: 'manager',
        department: 'Phát triển',
        position: 'Trưởng phòng',
        join_date: '2024-02-01'
      },
      {
        email: 'employee@company.com',
        password: hashedPassword,
        name: 'Nguyễn Văn An',
        role: 'employee',
        department: 'Phát triển',
        position: 'Lập trình viên',
        join_date: '2024-03-01'
      }
    ];

    // Xóa dữ liệu cũ
    await pool.execute('DELETE FROM users');
    await pool.execute('ALTER TABLE users AUTO_INCREMENT = 1');

    // Thêm users
    for (const user of users) {
      await pool.execute(
        'INSERT INTO users (email, password, name, role, department, position, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.email, user.password, user.name, user.role, user.department, user.position, user.join_date, 'active']
      );
    }

    // Tạo employees mẫu
    const employees = [
      {
        employee_id: 'EMP001',
        user_id: 1,
        name: 'Quản trị viên',
        email: 'admin@company.com',
        phone: '0901234567',
        department: 'Hành chính',
        position: 'Quản trị hệ thống',
        join_date: '2024-01-01',
        salary: 20000000,
        skills: ['Quản lý hệ thống', 'Bảo mật'],
        kpi: 95
      },
      {
        employee_id: 'EMP002',
        user_id: 2,
        name: 'Trưởng phòng Nhân sự',
        email: 'hr@company.com',
        phone: '0901234568',
        department: 'Nhân sự',
        position: 'Trưởng phòng HR',
        join_date: '2024-01-15',
        salary: 18000000,
        skills: ['Quản lý nhân sự', 'Tuyển dụng'],
        kpi: 92
      },
      {
        employee_id: 'EMP003',
        user_id: 3,
        name: 'Trưởng phòng Phát triển',
        email: 'manager@company.com',
        phone: '0901234569',
        department: 'Phát triển',
        position: 'Trưởng phòng',
        join_date: '2024-02-01',
        salary: 25000000,
        skills: ['Quản lý dự án', 'React', 'Node.js'],
        kpi: 96
      },
      {
        employee_id: 'EMP004',
        user_id: 4,
        name: 'Nguyễn Văn An',
        email: 'employee@company.com',
        phone: '0901234570',
        department: 'Phát triển',
        position: 'Lập trình viên',
        manager_id: 3,
        join_date: '2024-03-01',
        salary: 15000000,
        skills: ['React', 'JavaScript', 'MySQL'],
        kpi: 88
      }
    ];

    await pool.execute('DELETE FROM employees');
    await pool.execute('ALTER TABLE employees AUTO_INCREMENT = 1');

    for (const emp of employees) {
      await pool.execute(
        `INSERT INTO employees (employee_id, user_id, name, email, phone, department, position, manager_id, join_date, salary, skills, kpi, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [emp.employee_id, emp.user_id, emp.name, emp.email, emp.phone, emp.department, emp.position, 
         emp.manager_id || null, emp.join_date, emp.salary, JSON.stringify(emp.skills), emp.kpi, 'active']
      );
    }

    // Tạo dữ liệu chấm công mẫu
    const timeEntries = [
      { employee_id: 4, date: '2024-12-18', check_in: '09:00:00', check_out: '18:00:00', location: 'Văn phòng chính', type: 'office', status: 'on_time' },
      { employee_id: 4, date: '2024-12-17', check_in: '09:15:00', check_out: '18:30:00', location: 'Văn phòng chính', type: 'office', status: 'late', overtime: 0.5 },
      { employee_id: 4, date: '2024-12-16', check_in: '08:45:00', check_out: '17:45:00', location: 'Nhà riêng', type: 'wfh', status: 'on_time' }
    ];

    await pool.execute('DELETE FROM time_entries');
    for (const entry of timeEntries) {
      await pool.execute(
        'INSERT INTO time_entries (employee_id, date, check_in, check_out, location, type, status, overtime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [entry.employee_id, entry.date, entry.check_in, entry.check_out, entry.location, entry.type, entry.status, entry.overtime || 0]
      );
    }

    // Tạo đơn nghỉ phép mẫu
    const leaveRequests = [
      { employee_id: 4, type: 'annual', start_date: '2024-12-25', end_date: '2024-12-27', days: 3, reason: 'Nghỉ lễ Giáng sinh cùng gia đình', status: 'pending' },
      { employee_id: 4, type: 'sick', start_date: '2024-12-20', end_date: '2024-12-20', days: 1, reason: 'Khám bệnh định kỳ', status: 'approved', approved_by: 3 }
    ];

    await pool.execute('DELETE FROM leave_requests');
    for (const leave of leaveRequests) {
      await pool.execute(
        'INSERT INTO leave_requests (employee_id, type, start_date, end_date, days, reason, status, approved_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [leave.employee_id, leave.type, leave.start_date, leave.end_date, leave.days, leave.reason, leave.status, leave.approved_by || null]
      );
    }

    // Tạo tasks mẫu
    const tasks = [
      {
        title: 'Hoàn thiện tài liệu dự án',
        description: 'Viết tài liệu chi tiết cho hệ thống HRM bao gồm hướng dẫn sử dụng và tài liệu kỹ thuật.',
        assigned_to: 4,
        assigned_by: 3,
        department: 'Phát triển',
        priority: 'high',
        status: 'in_progress',
        progress: 75,
        due_date: '2024-12-25'
      },
      {
        title: 'Review code thay đổi',
        description: 'Kiểm tra các pull request mới nhất cho module xác thực.',
        assigned_to: 4,
        assigned_by: 3,
        department: 'Phát triển',
        priority: 'medium',
        status: 'not_started',
        progress: 0,
        due_date: '2024-12-22'
      }
    ];

    await pool.execute('DELETE FROM tasks');
    for (const task of tasks) {
      await pool.execute(
        'INSERT INTO tasks (title, description, assigned_to, assigned_by, department, priority, status, progress, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [task.title, task.description, task.assigned_to, task.assigned_by, task.department, task.priority, task.status, task.progress, task.due_date]
      );
    }

    // Tạo tài sản mẫu
    const assets = [
      {
        name: 'MacBook Pro 13"',
        type: 'laptop',
        model: 'MacBook Pro M1',
        serial_number: 'C02D12345678',
        assigned_to: 4,
        assigned_date: '2024-03-15',
        status: 'assigned',
        condition_status: 'good',
        purchase_date: '2024-03-01',
        warranty_date: '2027-03-01',
        value: 32000000
      },
      {
        name: 'Màn hình Dell 24"',
        type: 'monitor',
        model: 'Dell S2421DS',
        serial_number: 'DL24556789',
        assigned_to: 4,
        assigned_date: '2024-03-15',
        status: 'assigned',
        condition_status: 'new',
        purchase_date: '2024-03-10',
        warranty_date: '2027-03-10',
        value: 7500000
      }
    ];

    await pool.execute('DELETE FROM assets');
    for (const asset of assets) {
      await pool.execute(
        'INSERT INTO assets (name, type, model, serial_number, assigned_to, assigned_date, status, condition_status, purchase_date, warranty_date, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [asset.name, asset.type, asset.model, asset.serial_number, asset.assigned_to, asset.assigned_date, asset.status, asset.condition_status, asset.purchase_date, asset.warranty_date, asset.value]
      );
    }

    console.log('✅ Tạo dữ liệu mẫu thành công!');
    console.log('📧 Tài khoản đăng nhập:');
    console.log('   Admin: admin@company.com / 123456');
    console.log('   HR: hr@company.com / 123456');
    console.log('   Manager: manager@company.com / 123456');
    console.log('   Employee: employee@company.com / 123456');

  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu mẫu:', error);
  }
};

// Chạy seeder nếu file được gọi trực tiếp
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  seedInitialData().then(() => {
    process.exit(0);
  });
}

export { seedInitialData };