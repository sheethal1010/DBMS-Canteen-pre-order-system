const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  
  try {
    console.log('Trying to connect to database...');
    
    // Create a connection using the same settings as in db.js
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'system',
      database: 'CollegeCanteen',
      waitForConnections: true
    });
    
    console.log('Connection successful!');
    
    // Check Canteens table
    console.log('\nChecking Canteens table...');
    const [canteens] = await connection.execute('SELECT * FROM Canteens');
    console.log(`Found ${canteens.length} canteens`);
    if (canteens.length > 0) {
      console.log('Sample canteen:', canteens[0]);
    }
    
    // Check Orders table
    console.log('\nChecking Orders table...');
    const [orders] = await connection.execute('SELECT * FROM Orders LIMIT 5');
    console.log(`Found ${orders.length} orders`);
    if (orders.length > 0) {
      console.log('Sample order:', orders[0]);
    }
    
    // Check Customers table
    console.log('\nChecking Customers table...');
    const [customers] = await connection.execute('SELECT * FROM Customers LIMIT 5');
    console.log(`Found ${customers.length} customers`);
    if (customers.length > 0) {
      console.log('Sample customer:', customers[0]);
    }
    
    // Check OrderItems table
    console.log('\nChecking OrderItems table...');
    const [orderItems] = await connection.execute('SELECT * FROM OrderItems LIMIT 5');
    console.log(`Found ${orderItems.length} order items`);
    if (orderItems.length > 0) {
      console.log('Sample order item:', orderItems[0]);
    }
    
    // Check for specific canteen ID
    console.log('\nChecking orders for canteen ID 1...');
    const [canteen1Orders] = await connection.execute('SELECT * FROM Orders WHERE Canteen_ID = 1 LIMIT 5');
    console.log(`Found ${canteen1Orders.length} orders for canteen ID 1`);
    
    // Try the specific query that's failing
    console.log('\nTrying the specific query that might be failing...');
    const [specificOrders] = await connection.execute(`
      SELECT o.ORDER_ID, o.USER_ID, o.SCHEDULED_TIME, o.PICKUP_COUNTER, 
             o.TOTAL_AMOUNT, o.STATUS, cu.NAME as CUSTOMER_NAME
      FROM Orders o
      LEFT JOIN Customers cu ON o.USER_ID = cu.USER_ID
      WHERE o.Canteen_ID = ?
      ORDER BY o.SCHEDULED_TIME DESC
      LIMIT 5
    `, [1]);
    
    console.log(`Found ${specificOrders.length} orders with the specific query`);
    if (specificOrders.length > 0) {
      console.log('Sample result:', specificOrders[0]);
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    if (connection) {
      console.log('Closing connection...');
      await connection.end();
    }
  }
}

// Run the check
checkDatabase();