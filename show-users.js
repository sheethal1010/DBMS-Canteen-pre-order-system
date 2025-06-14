const { promisePool } = require('./db');

async function showUsers() {
  try {
    // Get all users
    const [users] = await promisePool.query(`
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, c.ROLE as CUSTOMER_ROLE, 
             e.ROLE as EMPLOYEE_ROLE, e.SALARY, e.SHIFT_TIMINGS,
             c.REGISTRATION_DATE, c.PASSWORD_HASH
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      ORDER BY c.USER_ID
    `);
    
    console.log(`Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log('\n--------------------------------------------------');
      console.log(`User ID: ${user.USER_ID}`);
      console.log(`Name: ${user.NAME}`);
      console.log(`Email: ${user.EMAIL || 'N/A'}`);
      console.log(`Phone: ${user.PHONE || 'N/A'}`);
      console.log(`Customer Role: ${user.CUSTOMER_ROLE}`);
      console.log(`Employee Role: ${user.EMPLOYEE_ROLE || 'N/A'}`);
      
      if (user.EMPLOYEE_ROLE) {
        console.log(`Salary: ${user.SALARY}`);
        console.log(`Shift Timings: ${user.SHIFT_TIMINGS || 'N/A'}`);
      }
      
      console.log(`Registration Date: ${user.REGISTRATION_DATE ? new Date(user.REGISTRATION_DATE).toLocaleString() : 'N/A'}`);
      
      // Show password hash type but not the actual hash for security
      if (user.PASSWORD_HASH) {
        const hashType = user.PASSWORD_HASH.startsWith('$2') ? 'bcrypt' : 'plain text';
        console.log(`Password Type: ${hashType}`);
      } else {
        console.log('Password: Not set');
      }
    });
    
    console.log('\n--------------------------------------------------');
    console.log(`Total users: ${users.length}`);
    
  } catch (error) {
    console.error('Error showing users:', error);
  } finally {
    process.exit();
  }
}

showUsers();