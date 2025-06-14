const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'system',
  database: 'CollegeCanteen',  // This matches the database name in your schema
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get a Promise wrapper for the pool
const promisePool = pool.promise();

module.exports = {
  pool: pool,
  promisePool: promisePool
};