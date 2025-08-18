import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initDatabase } from '../config/database.js';

const seedInitialData = async () => {
  try {
    console.log('🌱 Initializing database...');
    await initDatabase();

    console.log('🌱 Seeding initial data...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create users
    const users = [
      { email: 'admin@company.com', password: hashedPassword, role: 'admin' },
      { email: 'hr@company.com', password: hashedPassword, role: 'hr' },
      { email: 'manager@company.com', password: hashedPassword, role: 'manager' },
      { email: 'employee@company.com', password: hashedPassword, role: 'employee' }
    ];

    const userIds = [];
    for (const user of users) {
      const result = await dbRun(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [user.email, user.password, user.role]
      );
      userIds.push(result.insertId);
    }

    // Create employees
    const employees = [
      {
        user_id: userIds[0],
        employee_id: 'EMP001',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@company.com',
        phone: '0123456789',
        department: 'Administration',
        position: 'System Administrator',
        hire_date: '2023-01-01',
        salary: 50000
      },
      {
        user_id: userIds[1],
        employee_id: 'EMP002',
        first_name: 'HR',
        last_name: 'Manager',
        email: 'hr@company.com',
        phone: '0123456790',
        department: 'Human Resources',
        position: 'HR Manager',
        hire_date: '2023-01-15',
        salary: 45000
      },
      {
        user_id: userIds[2],
        employee_id: 'EMP003',
        first_name: 'Development',
        last_name: 'Manager',
        email: 'manager@company.com',
        phone: '0123456791',
        department: 'Development',
        position: 'Development Manager',
        hire_date: '2023-02-01',
        salary: 55000
      },
      {
        user_id: userIds[3],
        employee_id: 'EMP004',
        first_name: 'John',
        last_name: 'Doe',
        email: 'employee@company.com',
        phone: '0123456792',
        department: 'Development',
        position: 'Software Developer',
        hire_date: '2023-03-01',
        salary: 40000
      }
    ];

    const employeeIds = [];
    for (const employee of employees) {
      const result = await dbRun(`
        INSERT INTO employees (
          user_id, employee_id, first_name, last_name, email, phone,
          department, position, hire_date, salary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        employee.user_id, employee.employee_id, employee.first_name,
        employee.last_name, employee.email, employee.phone,
        employee.department, employee.position, employee.hire_date,
        employee.salary
      ]);
      employeeIds.push(result.insertId);
    }

    // Create sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const empId of employeeIds) {
      await dbRun(`
        INSERT INTO attendance (employee_id, date, check_in, check_out, total_hours, status)
        VALUES (?, ?, '09:00:00', '17:00:00', 8.0, 'present')
      `, [empId, yesterday.toISOString().split('T')[0]]);
    }

    // Create sample tasks
    await dbRun(`
      INSERT INTO tasks (title, description, assigned_to, assigned_by, priority, status, due_date)
      VALUES ('Setup Development Environment', 'Configure development tools and environment', ?, ?, 'high', 'in_progress', ?)
    `, [employeeIds[3], employeeIds[2], '2024-01-31']);

    // Create sample assets
    await dbRun(`
      INSERT INTO assets (asset_tag, name, category, description, assigned_to, status, purchase_date, purchase_cost)
      VALUES ('LAPTOP001', 'Dell Laptop', 'Computer', 'Development laptop for employee', ?, 'assigned', '2023-01-01', 1200.00)
    `, [employeeIds[3]]);

    console.log('✅ Initial data seeded successfully');
    console.log('📋 Sample accounts created:');
    console.log('   Admin: admin@company.com / 123456');
    console.log('   HR: hr@company.com / 123456');
    console.log('   Manager: manager@company.com / 123456');
    console.log('   Employee: employee@company.com / 123456');

  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedInitialData()
    .then(() => {
      console.log('🎉 Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

export default seedInitialData;