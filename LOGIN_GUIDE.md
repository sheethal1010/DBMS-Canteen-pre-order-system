# Login System Complete Guide

This comprehensive guide will help you set up, test, and troubleshoot the login/registration system.

## Initial Setup (IMPORTANT)

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start Apache and MySQL services
3. Make sure both services show a green status
4. If services fail to start, check if other programs are using ports 80 or 3306

### Step 2: Fix Database Permissions (CRITICAL)
1. **FIRST STEP**: Navigate to http://localhost/dbms-canteen/fix_permissions.php
2. This script will:
   - Connect to MySQL as the root user
   - Create the CollegeCanteen database if it doesn't exist
   - Grant all necessary privileges
   - Create the users table with the correct structure
3. You should see a success message for each step
4. If you see any errors, follow the troubleshooting instructions on the page

### Step 3: Test Database Connection
1. Navigate to http://localhost/dbms-canteen/direct_db_test.php
2. This will test direct connection to the database
3. It will create and retrieve a test user
4. Make sure all steps show a green checkmark

### Step 4: Set Up the Database
1. Navigate to http://localhost/dbms-canteen/setup_db.php
2. This will create the necessary database and tables
3. You should see a success message confirming the database was created
4. If you see any errors, follow the troubleshooting instructions on the page

### Step 5: Verify Database Structure
1. Navigate to http://localhost/dbms-canteen/check_table.php
2. This will show you the structure of the users table
3. Make sure the table exists and has the correct columns

## Using the Login System

### Step 1: Access the Login Page
1. Open your web browser
2. Navigate to: http://localhost/dbms-canteen/hdbms/h.html
3. You should see the login/registration form with tabs for Login and Register

### Step 2: Register a New User
1. Click on the "Register" tab
2. Fill in the required information:
   - Full Name (e.g., "John Doe")
   - Email (e.g., "john@example.com") OR Phone Number (e.g., "1234567890") - at least one is required
   - Password (minimum 6 characters)
   - Confirm Password (same as password)
   - Account Type: Select "Customer" or "Staff"
   - If "Staff" is selected, enter Staff Code: "1234"
3. Click "Register" button
4. If registration is successful, you'll see a success message and be redirected to the main page
5. If registration fails, check the error message and the troubleshooting section below

### Step 3: Log Out
1. To test the login functionality, you need to log out first
2. Navigate to: http://localhost/dbms-canteen/hdbms/logout.php
3. You'll be logged out and can return to the login page

### Step 4: Log In
1. Go back to the login page: http://localhost/dbms-canteen/hdbms/h.html
2. Enter the email or phone number you used during registration
3. Enter your password
4. Click "Login" button
5. If login is successful, you'll be redirected to the main page
6. If login fails, check the error message and the troubleshooting section below

## Testing Different Scenarios

### Test Case 1: Invalid Login
1. Try logging in with an incorrect email/phone or password
2. You should see an error message

### Test Case 2: Staff vs Customer Login
1. Register two different accounts: one as a staff member and one as a customer
2. Log in with each account to see if the system recognizes the different account types

### Test Case 3: Form Validation
1. Try submitting the registration form with:
   - Missing required fields
   - Invalid email format
   - Mismatched passwords
   - Short password (less than 6 characters)
2. The system should show appropriate error messages

## Detailed Troubleshooting

### If Database Setup Fails
1. Make sure MySQL is running in XAMPP
2. Check if the database already exists in phpMyAdmin
3. **Fix permission issues**:
   - If you see an error like `Access denied for user 'pma'@'localhost' to database 'collegecanteen'`
   - Run the permission fix script: http://localhost/dbms-canteen/fix_permissions.php
   - This will grant the necessary permissions to access the database

4. Verify that the database credentials in `db_connection.php` are correct:
   ```php
   $servername = "localhost";
   $username = "root"; // Default XAMPP username
   $password = ""; // Default XAMPP password is empty
   $dbname = "CollegeCanteen"; // Case sensitive!
   ```
5. If you've changed your MySQL password, update it in this file
6. Try the direct database test: http://localhost/dbms-canteen/direct_db_test.php

### If Registration Fails
1. **Fix database permissions first**:
   - Run http://localhost/dbms-canteen/fix_permissions.php
   - This is critical if you see any "Access denied" errors
   - Make sure all steps complete successfully

2. **Use the simplified test form**:
   - Navigate to http://localhost/dbms-canteen/test_form.html
   - This form provides more detailed error messages
   - It shows the raw server response for debugging

3. **Check browser console for errors**:
   - Right-click on the page and select "Inspect" or press F12
   - Go to the "Console" tab to see any JavaScript errors
   - Go to the "Network" tab, try to register, and check the response from the server

4. **Check if the database and table exist**:
   - Go to http://localhost/phpmyadmin
   - Look for a database called "CollegeCanteen" (case sensitive!)
   - Check if there's a table called "users"
   - If not, run http://localhost/dbms-canteen/setup_db.php again

5. **Try the simplified registration**:
   - We've created a simplified registration script for testing
   - The JavaScript is already configured to use this script
   - If this works but the regular registration doesn't, there might be an issue with the main script

6. **Check for duplicate entries**:
   - Email and phone numbers must be unique
   - If you're trying to register with an email or phone that's already in the database, it will fail

7. **Test direct insertion**:
   - Navigate to http://localhost/dbms-canteen/direct_db_test.php
   - This will attempt to insert a test user directly
   - If this works but registration doesn't, there might be an issue with the form submission

### If Login Fails
1. Make sure you're using the correct credentials
2. Check if the user exists in the database:
   - Go to http://localhost/phpmyadmin
   - Select the "CollegeCanteen" database
   - Open the "users" table
   - Look for your email or phone number
3. Check if cookies and JavaScript are enabled in your browser
4. Try clearing your browser cache and cookies

### If Redirects Don't Work
1. Check if your browser is blocking redirects
2. Ensure JavaScript is enabled
3. Check the browser console for any errors

## Database Access and Management

### Accessing the Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select the "CollegeCanteen" database
3. Navigate to the "users" table
4. Here you can view, edit, or delete user records

### Manually Adding a User
If registration is not working, you can add a user directly through phpMyAdmin:

1. Go to the "users" table and click "Insert"
2. Fill in the following fields:
   - full_name: Your name
   - email: Your email (or NULL if using phone)
   - phone: Your phone (or NULL if using email)
   - password: Use this for a test password: `$2y$10$6Y5.Ht9VZag1EcSZjSwIWOQoOKQbNzRI0TP7JzALCGi4DXVCQglAy` (this is "password123" hashed)
   - account_type: Either "customer" or "staff"
3. Leave "id" and "created_at" empty (they'll be filled automatically)
4. Click "Go" to insert the record

### Resetting the Database
If you want to start fresh:

1. Go to phpMyAdmin
2. Select the "CollegeCanteen" database
3. Click on the "Operations" tab
4. Scroll down to "Delete database" and click "OK"
5. Then run http://localhost/dbms-canteen/setup_db.php again to recreate it

## Additional Resources

### Debug and Fix Files
We've created several debug and fix files to help troubleshoot issues:

- `fix_permissions.php` - **IMPORTANT**: Fixes database permission issues
- `direct_db_test.php` - Tests direct database connection and insertion
- `test_form.html` - Simple form for testing registration with detailed error messages
- `test_db.php` - Tests database connection
- `check_table.php` - Checks the structure of the users table
- `test_insert.php` - Tests direct insertion into the database
- `hdbms/debug.log` - Contains detailed logs of the registration process

### Common Database Errors and Solutions

#### Access Denied Error
If you see an error like: `#1044 - Access denied for user 'pma'@'localhost' to database 'collegecanteen'`

**Solution**:
1. Run the permission fix script: http://localhost/dbms-canteen/fix_permissions.php
2. This will grant the necessary permissions to the root user
3. Make sure you're using the root user in all database connections

#### Table Doesn't Exist Error
If you see an error like: `Table 'collegecanteen.users' doesn't exist`

**Solution**:
1. Run the setup script: http://localhost/dbms-canteen/setup_db.php
2. Verify the table was created: http://localhost/dbms-canteen/check_table.php

#### Case Sensitivity Issues
MySQL database names can be case-sensitive on some systems.

**Solution**:
1. Always use the exact case: "CollegeCanteen" (not "collegecanteen")
2. Run the fix_permissions.php script which handles this correctly

### PHP Error Logs
If you're still having issues, check the PHP error logs:

1. Open XAMPP Control Panel
2. Click on the "Logs" button for Apache
3. Look for any errors related to your registration or login attempts

---

For more detailed information, refer to the main README.md file.