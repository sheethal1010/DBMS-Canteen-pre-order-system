# Campus Canteen Pre-Order System: Developer Guide

This technical guide provides in-depth information about the code structure, implementation details, and development practices used in the Campus Canteen Pre-Order System.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Database Schema](#database-schema)
3. [Authentication Implementation](#authentication-implementation)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Security Considerations](#security-considerations)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)

## Project Structure

The project follows a simple structure with separate directories for different components:

```
dbms-canteen/
├── hdbms/                  # Authentication and user management
│   ├── h.html              # Login/registration page
│   ├── h.css               # Styles for auth pages
│   ├── h.js                # JavaScript for auth pages
│   ├── login.php           # Login endpoint
│   ├── register.php        # Registration endpoint
│   ├── simple_register.php # Simplified registration endpoint
│   ├── logout.php          # Logout endpoint
│   └── ...
├── images/                 # Image storage
│   ├── canteens/           # Canteen images
│   ├── food/               # Food item images
│   └── hero/               # Hero banner images
├── js/                     # JavaScript files
│   ├── image-loader.js     # Image loading utility
│   └── ...
├── Main.html               # Main application page
├── db_connection.php       # Database connection
├── setup_db.php            # Database setup script
├── fix_permissions.php     # Database permissions script
└── ...
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    account_type ENUM('customer', 'staff') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_phone (phone)
)
```

Key design decisions:
- Email and phone are optional but at least one must be provided
- Passwords are hashed using PHP's `password_hash()` with the default algorithm
- Account type is an ENUM to restrict values to 'customer' or 'staff'
- Timestamps are automatically set on creation

## Authentication Implementation

### Registration Process (register.php)

```php
// Key steps in the registration process
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Get and validate input
    $name = isset($_POST["name"]) ? trim($_POST["name"]) : "";
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
    $phone = isset($_POST["phone"]) ? trim($_POST["phone"]) : "";
    $password = isset($_POST["password"]) ? $_POST["password"] : "";
    
    // 2. Validate required fields
    if (empty($name)) {
        $response["message"] = "Full name is required";
    } elseif (empty($email) && empty($phone)) {
        $response["message"] = "Either email or phone number is required";
    }
    
    // 3. Check for existing users
    if (!empty($email)) {
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        // Check if email exists...
    }
    
    // 4. Hash password and insert user
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password, account_type) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $email, $phone, $password_hash, $account_type);
    
    // 5. Create session and return response
    if ($stmt->execute()) {
        $_SESSION["user_id"] = $stmt->insert_id;
        $_SESSION["name"] = $name;
        // Set other session variables...
        
        $response["success"] = true;
        $response["message"] = "Registration successful";
    }
}
```

### Login Process (login.php)

```php
// Key steps in the login process
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Get input
    $identifier = isset($_POST["identifier"]) ? trim($_POST["identifier"]) : "";
    $password = isset($_POST["password"]) ? $_POST["password"] : "";
    
    // 2. Determine if identifier is email or phone
    $is_email = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    
    // 3. Prepare appropriate query
    if ($is_email) {
        $stmt = $conn->prepare("SELECT id, full_name, email, phone, password, account_type FROM users WHERE email = ?");
    } else {
        $stmt = $conn->prepare("SELECT id, full_name, email, phone, password, account_type FROM users WHERE phone = ?");
    }
    
    // 4. Execute query and verify password
    $stmt->bind_param("s", $identifier);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user["password"])) {
            // 5. Set session variables
            $_SESSION["user_id"] = $user["id"];
            $_SESSION["name"] = $user["full_name"];
            // Set other session variables...
            
            $response["success"] = true;
            $response["message"] = "Login successful";
        }
    }
}
```

### Session Management

The system uses PHP sessions for server-side state management and localStorage for client-side persistence:

```php
// Server-side session creation
$_SESSION["user_id"] = $user["id"];
$_SESSION["name"] = $user["full_name"];
$_SESSION["email"] = $user["email"];
$_SESSION["phone"] = $user["phone"];
$_SESSION["account_type"] = $user["account_type"];
$_SESSION["logged_in"] = true;
```

```javascript
// Client-side session storage
const userData = {
    ...data.user,
    isLoggedIn: true
};
localStorage.setItem('canteenUserData', JSON.stringify(userData));
```

## Frontend Architecture

### Login/Registration Page (h.html, h.js)

The login/registration page uses vanilla JavaScript with the following key components:

1. **Tab System**: Toggles between login and registration forms
   ```javascript
   loginTab.addEventListener('click', () => {
       loginTab.classList.add('active');
       registerTab.classList.remove('active');
       loginForm.classList.add('active');
       registerForm.classList.remove('active');
   });
   ```

2. **Form Validation**: Client-side validation before submission
   ```javascript
   function validateEmail(email) {
       const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
       return re.test(String(email).toLowerCase());
   }
   ```

3. **AJAX Form Submission**: Asynchronous communication with the backend
   ```javascript
   fetch('login.php', {
       method: 'POST',
       body: formData
   })
   .then(response => response.json())
   .then(data => {
       if (data.success) {
           // Handle successful login
       } else {
           // Handle login failure
       }
   });
   ```

4. **Dynamic UI Updates**: Show/hide elements based on user interactions
   ```javascript
   function showStaffCodeGroup() {
       staffCodeGroup.style.display = 'block';
       staffCodeGroup.classList.add('visible');
   }
   ```

### Main Application Page (Main.html)

The main application page checks for authentication and loads the appropriate content:

```javascript
// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const userData = localStorage.getItem('canteenUserData');
    if (!userData || !JSON.parse(userData).isLoggedIn) {
        // User is not logged in, redirect to login page
        window.location.href = 'hdbms/h.html';
    } else {
        // User is logged in, display user info
        const user = JSON.parse(userData);
        // Update UI with user information
    }
});
```

## Backend Architecture

### Database Connection (db_connection.php)

The database connection is established once and reused across the application:

```php
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set character set
$conn->set_charset("utf8mb4");
```

### Helper Functions

The system includes several helper functions for common operations:

```php
// Execute a query with parameter binding
function executeQuery($conn, $sql, $params = [], $types = "") {
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        return ["error" => "Query preparation failed: " . $conn->error];
    }
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $executed = $stmt->execute();
    // Process results...
    
    return $data;
}

// Log debug information
function debug_log($message) {
    file_put_contents("debug_log.txt", date("[Y-m-d H:i:s] ") . $message . PHP_EOL, FILE_APPEND);
}
```

## Security Considerations

### Password Hashing

Passwords are securely hashed using PHP's `password_hash()` function:

```php
$password_hash = password_hash($password, PASSWORD_DEFAULT);
```

And verified using `password_verify()`:

```php
if (password_verify($password, $user["password"])) {
    // Password is correct
}
```

### SQL Injection Prevention

All database queries use prepared statements with parameter binding:

```php
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
```

### XSS Prevention

Output is properly escaped when displayed in HTML:

```php
echo htmlspecialchars($value);
```

### CSRF Protection

Forms include CSRF protection through session tokens (not shown in the code snippets).

## Development Workflow

### Setting Up the Development Environment

1. Install XAMPP with PHP and MySQL
2. Clone the repository to the `htdocs` directory
3. Run the setup scripts:
   - `fix_permissions.php` to set up database permissions
   - `setup_db.php` to create the database and tables

### Making Changes

1. Modify the code as needed
2. Test changes using the test scripts:
   - `direct_db_test.php` for database operations
   - `test_form.html` for registration functionality

### Debugging

The system includes several debugging tools:

- `debug_log()` function writes to `debug_log.txt`
- PHP error reporting is enabled in development
- JavaScript console logging for frontend issues

## Testing

### Manual Testing

The system includes several test pages:

- `test_form.html`: Tests the registration process
- `direct_db_test.php`: Tests database operations
- `check_table.php`: Verifies database structure

### Testing Authentication

To test the authentication system:

1. Register a new user with `test_form.html`
2. Attempt to log in with the created credentials
3. Verify that the user is redirected to the main page
4. Test logout functionality

### Testing with Different User Types

1. Register a customer account
2. Register a staff account with the staff code (1234)
3. Verify that each account type has the appropriate access and features

## Conclusion

This developer guide provides a comprehensive overview of the Campus Canteen Pre-Order System's implementation. By understanding the code structure and design decisions, developers can effectively maintain and extend the system.