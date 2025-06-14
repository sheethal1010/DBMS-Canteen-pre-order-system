const { promisePool } = require('./db');

async function listUsers() {
  try {
    console.log('Listing all users in the database...');
    
    // Query to get all users with their roles
    const [customers] = await promisePool.execute(`
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, 
             COALESCE(e.ROLE, 'Customer') as ROLE,
             c.REGISTRATION_DATE
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      ORDER BY c.USER_ID
    `);
    
    console.log(`Found ${customers.length} users:`);
    console.log('------------------------------------------------------');
    console.log('ID | Name | Email | Phone | Role | Registration Date');
    console.log('------------------------------------------------------');
    
    customers.forEach(user => {
      console.log(`${user.USER_ID} | ${user.NAME} | ${user.EMAIL || 'N/A'} | ${user.PHONE || 'N/A'} | ${user.ROLE} | ${user.REGISTRATION_DATE ? new Date(user.REGISTRATION_DATE).toLocaleDateString() : 'N/A'}`);
    });
    
    console.log('------------------------------------------------------');
    
    // If there are employees, list them separately
    const [employees] = await promisePool.execute(`
      SELECT e.EMPLOYEE_ID, e.USER_ID, e.ROLE, e.SALARY, e.SHIFT_TIMINGS, c.NAME
      FROM Employees e
      JOIN Customers c ON e.USER_ID = c.USER_ID
      ORDER BY e.EMPLOYEE_ID
    `);
    
    if (employees.length > 0) {
      console.log('\nEmployee details:');
      console.log('------------------------------------------------------');
      console.log('Emp ID | User ID | Name | Role | Salary | Shift Timings');
      console.log('------------------------------------------------------');
      
      employees.forEach(emp => {
        console.log(`${emp.EMPLOYEE_ID} | ${emp.USER_ID} | ${emp.NAME} | ${emp.ROLE} | ${emp.SALARY} | ${emp.SHIFT_TIMINGS || 'N/A'}`);
      });
      
      console.log('------------------------------------------------------');
    }
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    process.exit();
  }
}

listUsers();