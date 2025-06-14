# Campus Cravings - Complete Setup Guide

This comprehensive setup guide will walk you through the entire process of setting up the Campus Cravings canteen management system from scratch. Whether you're setting up for development, testing, or production, this guide has you covered.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Development Setup](#development-setup)
4. [Production Setup](#production-setup)
5. [Database Setup](#database-setup)
6. [Configuration](#configuration)
7. [Testing the Installation](#testing-the-installation)
8. [Common Setup Issues](#common-setup-issues)
9. [Post-Installation Steps](#post-installation-steps)
10. [Deployment Options](#deployment-options)

---

## Quick Start

For those who want to get up and running quickly:

```bash
# 1. Clone the repository
git clone https://github.com/sheethal1010/dbms-canteen.git
cd dbms-canteen

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Set up database
mysql -u root -p -e "CREATE DATABASE CollegeCanteen;"
mysql -u root -p CollegeCanteen < college_canteen_schema.sql

# 5. Start the application
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## Prerequisites

### System Requirements

#### Minimum Requirements
- **Operating System**: Windows 10, macOS 10.14, Ubuntu 18.04, or equivalent
- **RAM**: 4 GB
- **Storage**: 10 GB free space
- **Network**: Internet connection for downloading dependencies

#### Recommended Requirements
- **Operating System**: Windows 11, macOS 12+, Ubuntu 20.04 LTS
- **RAM**: 8 GB or more
- **Storage**: 20 GB free space (SSD preferred)
- **Network**: Stable broadband connection

### Software Prerequisites

#### Required Software

1. **Node.js (v14.0.0 or higher)**
   
   **Windows:**
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow the setup wizard
   - Verify installation: `node --version`

   **macOS:**
   ```bash
   # Using Homebrew (recommended)
   brew install node
   
   # Or download from nodejs.org
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   # Using NodeSource repository (recommended)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

2. **MySQL (v8.0 or higher)**

   **Windows:**
   - Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
   - Choose "Developer Default" setup type
   - Follow the installation wizard
   - Set root password during installation

   **macOS:**
   ```bash
   # Using Homebrew
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   
   # Secure installation
   mysql_secure_installation
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   # Update package index
   sudo apt update
   
   # Install MySQL Server
   sudo apt install mysql-server
   
   # Secure installation
   sudo mysql_secure_installation
   
   # Start and enable MySQL service
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

3. **Git**

   **Windows:**
   - Download from [git-scm.com](https://git-scm.com/)
   - Install with default settings

   **macOS:**
   ```bash
   # Using Homebrew
   brew install git
   
   # Or use Xcode Command Line Tools
   xcode-select --install
   ```

   **Linux:**
   ```bash
   # Ubuntu/Debian
   sudo apt install git
   
   # CentOS/RHEL
   sudo yum install git
   ```

#### Optional Software

1. **Visual Studio Code** (Recommended IDE)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

2. **MySQL Workbench** (Database management GUI)
   - Download from [mysql.com](https://dev.mysql.com/downloads/workbench/)

3. **Postman** (API testing)
   - Download from [postman.com](https://www.postman.com/)

---

## Development Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/sheethal1010/dbms-canteen.git

# Navigate to project directory
cd dbms-canteen

# Check project structure
ls -la
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# For production-only dependencies
npm install --production

# Verify installation
npm list --depth=0
```

### Step 3: Environment Configuration

Create your environment configuration file:

```bash
# Copy example environment file
cp .env.example .env

# Edit the environment file
nano .env  # Linux/macOS
notepad .env  # Windows
```

**Development Environment Variables (`.env`):**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=CollegeCanteen
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Server Configuration
PORT=3000
NODE_ENV=development
HOST=localhost

# Session Configuration
SESSION_SECRET=your-development-session-secret-key-here

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads

# Development Settings
DEBUG=true
LOG_LEVEL=debug
```

### Step 4: Database Setup for Development

#### Create Database and User

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE CollegeCanteen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create development user (optional but recommended)
CREATE USER 'canteen_dev'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON CollegeCanteen.* TO 'canteen_dev'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

#### Import Database Schema

```bash
# Import the schema
mysql -u root -p CollegeCanteen < college_canteen_schema.sql

# Verify tables were created
mysql -u root -p -e "USE CollegeCanteen; SHOW TABLES;"
```

### Step 5: Start Development Server

```bash
# Start with auto-restart (recommended for development)
npm run dev

# Or start normally
npm start

# Or start database server only
npm run start:db
```

The application will be available at `http://localhost:3000`.

---

## Production Setup

### Step 1: Server Preparation

#### Create Application User
```bash
# Create dedicated user for the application
sudo adduser canteen
sudo usermod -aG sudo canteen

# Switch to application user
su - canteen
```

#### Create Directory Structure
```bash
# Create necessary directories
mkdir -p ~/app
mkdir -p ~/logs
mkdir -p ~/backups
mkdir -p ~/uploads
mkdir -p ~/ssl

# Set proper permissions
chmod 755 ~/app
chmod 755 ~/uploads
chmod 700 ~/ssl
chmod 755 ~/logs
chmod 700 ~/backups
```

### Step 2: Install Production Dependencies

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally for process management
sudo npm install -g pm2

# Install other system dependencies
sudo apt update
sudo apt install -y nginx mysql-server git
```

### Step 3: Clone and Setup Application

```bash
# Clone repository to application directory
cd ~/app
git clone https://github.com/sheethal1010/dbms-canteen.git .

# Install production dependencies
npm install --production

# Create production environment file
cp .env.example .env
```

### Step 4: Production Environment Configuration

**Production Environment Variables (`.env`):**
```env
# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_USER=canteen_prod
DB_PASSWORD=secure_production_password_here
DB_NAME=CollegeCanteen
DB_CONNECTION_LIMIT=20
DB_QUEUE_LIMIT=0

# Security Configuration
SESSION_SECRET=generate_secure_64_character_random_string_for_production
BCRYPT_ROUNDS=12

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/canteen/uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/home/canteen/logs/app.log
ERROR_LOG_FILE=/home/canteen/logs/error.log

# Production Settings
ENABLE_COMPRESSION=true
TRUST_PROXY=true
```

### Step 5: Production Database Setup

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create production database
CREATE DATABASE CollegeCanteen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create production user with limited privileges
CREATE USER 'canteen_prod'@'localhost' IDENTIFIED BY 'secure_production_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON CollegeCanteen.* TO 'canteen_prod'@'localhost';

-- Create backup user
CREATE USER 'canteen_backup'@'localhost' IDENTIFIED BY 'backup_password_here';
GRANT SELECT, LOCK TABLES ON CollegeCanteen.* TO 'canteen_backup'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

```bash
# Import schema
mysql -u canteen_prod -p CollegeCanteen < college_canteen_schema.sql
```

### Step 6: Web Server Configuration (Nginx)

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/canteen
```

**Basic Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # File size limit
    client_max_body_size 10M;
    
    # Static files
    location /uploads/ {
        alias /home/canteen/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /home/canteen/app/images/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/canteen /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 7: Process Management with PM2

Create PM2 configuration:

```bash
nano ~/app/ecosystem.config.js
```

**PM2 Configuration:**
```javascript
module.exports = {
    apps: [{
        name: 'canteen-app',
        script: './server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        log_file: '/home/canteen/logs/pm2-combined.log',
        out_file: '/home/canteen/logs/pm2-out.log',
        error_file: '/home/canteen/logs/pm2-error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        max_memory_restart: '1G'
    }]
};
```

Start the application:
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

---

## Database Setup

### Detailed Database Configuration

#### 1. MySQL Installation Verification

```bash
# Check MySQL version
mysql --version

# Check if MySQL service is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql
```

#### 2. Database Security Configuration

```bash
# Run MySQL secure installation
sudo mysql_secure_installation
```

Follow the prompts:
- Set root password (if not set)
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

#### 3. Database Schema Import

The `college_canteen_schema.sql` file contains all necessary tables and initial data. Here's what it includes:

**Tables Created:**
- `Customers` - User accounts and authentication
- `Employees` - Staff management (if applicable)
- `Canteens` - Canteen locations and information
- `MenuItems` - Food items and pricing
- `Orders` - Customer orders
- `OrderItems` - Individual items in orders
- `Images` - File upload tracking
- `UserContacts` - Contact information

**Import Process:**
```bash
# Method 1: Command line import
mysql -u root -p CollegeCanteen < college_canteen_schema.sql

# Method 2: Import from MySQL command line
mysql -u root -p
USE CollegeCanteen;
SOURCE /path/to/college_canteen_schema.sql;

# Method 3: Using MySQL Workbench
# Open MySQL Workbench → Server → Data Import → Import from Self-Contained File
```

#### 4. Verify Database Setup

```sql
-- Connect to database
mysql -u root -p CollegeCanteen

-- Check all tables
SHOW TABLES;

-- Check table structures
DESCRIBE Customers;
DESCRIBE Canteens;
DESCRIBE MenuItems;
DESCRIBE Orders;

-- Check for any data
SELECT COUNT(*) FROM Customers;
SELECT COUNT(*) FROM Canteens;
SELECT COUNT(*) FROM MenuItems;

-- Exit
EXIT;
```

#### 5. Create Initial Admin User

Create a script to add the first admin user:

```bash
nano create_admin.js
```

```javascript
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const adminData = {
            name: 'System Administrator',
            email: 'admin@yourdomain.com',
            password: 'AdminPass123!', // Change this!
            accountType: 'admin'
        };

        // Hash password
        const passwordHash = await bcrypt.hash(adminData.password, 12);

        // Insert admin user
        const query = `
            INSERT INTO Customers (Name, Email, PasswordHash, AccountType, IsActive)
            VALUES (?, ?, ?, ?, 1)
        `;

        const [result] = await connection.execute(query, [
            adminData.name,
            adminData.email,
            passwordHash,
            adminData.accountType
        ]);

        console.log('Admin user created successfully!');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('Please change the password after first login!');
        console.log('User ID:', result.insertId);

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('Admin user already exists!');
        } else {
            console.error('Error creating admin user:', error.message);
        }
    } finally {
        await connection.end();
    }
}

createAdmin();
```

Run the script:
```bash
node create_admin.js
```

---

## Configuration

### Environment Variables Explained

#### Database Configuration
```env
# Database host (usually localhost for local setup)
DB_HOST=localhost

# Database username
DB_USER=root

# Database password
DB_PASSWORD=your_mysql_password

# Database name
DB_NAME=CollegeCanteen

# Connection pool settings
DB_CONNECTION_LIMIT=10    # Maximum number of connections
DB_QUEUE_LIMIT=0         # Maximum number of queued connection requests
```

#### Server Configuration
```env
# Port the application will run on
PORT=3000

# Environment (development, production, test)
NODE_ENV=development

# Host to bind to (0.0.0.0 for all interfaces, localhost for local only)
HOST=localhost
```

#### Security Configuration
```env
# Session secret key (must be random and secure in production)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# bcrypt rounds for password hashing (higher = more secure but slower)
BCRYPT_ROUNDS=12
```

#### File Upload Configuration
```env
# Maximum file size in bytes (5MB = 5242880)
MAX_FILE_SIZE=5242880

# Upload directory path
UPLOAD_PATH=./public/uploads

# Allowed file types (comma-separated)
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif
```

### Configuration Validation

Create a configuration validation script:

```bash
nano validate_config.js
```

```javascript
require('dotenv').config();

const requiredVars = [
    'DB_HOST',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME',
    'PORT',
    'NODE_ENV',
    'SESSION_SECRET'
];

const optionalVars = [
    'DB_CONNECTION_LIMIT',
    'DB_QUEUE_LIMIT',
    'MAX_FILE_SIZE',
    'UPLOAD_PATH',
    'LOG_LEVEL'
];

console.log('Validating Configuration...\n');

// Check required variables
let missingRequired = [];
requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        missingRequired.push(varName);
    } else {
        console.log(`${varName}: ${varName.includes('PASSWORD') || varName.includes('SECRET') ? '***' : process.env[varName]}`);
    }
});

// Check optional variables
console.log('\nOptional Configuration:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`${varName}: ${value}`);
    } else {
        console.log(`${varName}: Not set (using default)`);
    }
});

// Report missing required variables
if (missingRequired.length > 0) {
    console.log('\nMissing Required Variables:');
    missingRequired.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\nPlease set these variables in your .env file');
    process.exit(1);
} else {
    console.log('\nAll required configuration variables are set!');
}

// Validate specific configurations
console.log('\nConfiguration Validation:');

// Port validation
const port = parseInt(process.env.PORT);
if (isNaN(port) || port < 1 || port > 65535) {
    console.log('PORT must be a valid number between 1 and 65535');
} else {
    console.log(`PORT: ${port} is valid`);
}

// Session secret validation
if (process.env.SESSION_SECRET.length < 32) {
    console.log('SESSION_SECRET should be at least 32 characters long for security');
} else {
    console.log('SESSION_SECRET length is adequate');
}

// File size validation
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');
if (maxFileSize > 50 * 1024 * 1024) { // 50MB
    console.log('MAX_FILE_SIZE is very large, consider reducing for security');
} else {
    console.log(`MAX_FILE_SIZE: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB is reasonable`);
}

console.log('\nConfiguration validation completed!');
```

Run validation:
```bash
node validate_config.js
```

---

## Testing the Installation

### 1. Database Connection Test

Create a database connection test:

```bash
nano test_db.js
```

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabase() {
    console.log('Testing database connection...\n');
    
    try {
        // Test connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Database connection successful!');

        // Test basic query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('Basic query test passed');

        // Check tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`Found ${tables.length} tables in database`);
        
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });

        // Test sample data query
        const [customers] = await connection.execute('SELECT COUNT(*) as count FROM Customers');
        console.log(`Customers table has ${customers[0].count} records`);

        const [canteens] = await connection.execute('SELECT COUNT(*) as count FROM Canteens');
        console.log(`Canteens table has ${canteens[0].count} records`);

        await connection.end();
        console.log('\nDatabase test completed successfully!');

    } catch (error) {
        console.error('Database test failed:', error.message);
        
        // Provide helpful error messages
        if (error.code === 'ECONNREFUSED') {
            console.log('Solution: Make sure MySQL server is running');
            console.log('   sudo systemctl start mysql');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Solution: Check your database credentials in .env file');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('Solution: Make sure the database exists');
            console.log('   mysql -u root -p -e "CREATE DATABASE CollegeCanteen;"');
        }
        
        process.exit(1);
    }
}

testDatabase();
```

Run the test:
```bash
node test_db.js
```

### 2. Application Startup Test

```bash
# Start the application
npm run dev

# In another terminal, test the endpoints
curl http://localhost:3000
curl http://localhost:3000/health
```

### 3. API Endpoints Test

Create an API test script:

```bash
nano test_api.js
```

```javascript
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('Testing API endpoints...\n');

    const tests = [
        {
            name: 'Health Check',
            url: '/health',
            method: 'GET',
            expectedStatus: 200
        },
        {
            name: 'Get Canteens',
            url: '/api/canteens',
            method: 'GET',
            expectedStatus: 200
        },
        {
            name: 'Get Menu Items',
            url: '/api/menu',
            method: 'GET',
            expectedStatus: 200
        }
    ];

    for (const test of tests) {
        try {
            const response = await fetch(`${BASE_URL}${test.url}`, {
                method: test.method
            });

            if (response.status === test.expectedStatus) {
                console.log(`${test.name}: PASSED (${response.status})`);
            } else {
                console.log(`${test.name}: FAILED (Expected ${test.expectedStatus}, got ${response.status})`);
            }
        } catch (error) {
            console.log(`${test.name}: ERROR - ${error.message}`);
        }
    }

    console.log('\nAPI testing completed!');
}

// Make sure the server is running before testing
setTimeout(testAPI, 2000);
```

### 4. File Upload Test

Test file upload functionality:

```bash
# Create test upload directory
mkdir -p public/uploads/test

# Test file permissions
touch public/uploads/test/test.txt
echo "Test file" > public/uploads/test/test.txt

# Check if file was created
ls -la public/uploads/test/
```

### 5. Complete System Test

Create a comprehensive test script:

```bash
nano system_test.js
```

```javascript
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class SystemTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = [];
    }

    async runTest(name, testFunction) {
        console.log(`🔍 Running: ${name}`);
        try {
            await testFunction();
            console.log(`✅ ${name}: PASSED`);
            this.testResults.push({ name, status: 'PASSED' });
        } catch (error) {
            console.log(`❌ ${name}: FAILED - ${error.message}`);
            this.testResults.push({ name, status: 'FAILED', error: error.message });
        }
    }

    async testEnvironmentVariables() {
        const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT'];
        for (const varName of required) {
            if (!process.env[varName]) {
                throw new Error(`Missing environment variable: ${varName}`);
            }
        }
    }

    async testDirectoryStructure() {
        const requiredDirs = [
            'public',
            'public/uploads',
            'api',
            'config',
            'images'
        ];

        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                throw new Error(`Missing directory: ${dir}`);
            }
        }
    }

    async testDatabaseConnection() {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        await connection.execute('SELECT 1');
        await connection.end();
    }

    async testApplicationStartup() {
        // This assumes the application is already running
        const response = await fetch(`${this.baseUrl}/health`);
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }
    }

    async testAPIEndpoints() {
        const endpoints = [
            { path: '/api/canteens', method: 'GET' },
            { path: '/api/menu', method: 'GET' }
        ];

        for (const endpoint of endpoints) {
            const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
                method: endpoint.method
            });

            if (!response.ok) {
                throw new Error(`${endpoint.method} ${endpoint.path} failed: ${response.status}`);
            }
        }
    }

    async testFilePermissions() {
        const uploadDir = 'public/uploads';
        const testFile = path.join(uploadDir, 'test.txt');

        // Test write permission
        fs.writeFileSync(testFile, 'test');
        
        // Test read permission
        const content = fs.readFileSync(testFile, 'utf8');
        if (content !== 'test') {
            throw new Error('File read/write test failed');
        }

        // Cleanup
        fs.unlinkSync(testFile);
    }

    async runAllTests() {
        console.log('🚀 Starting System Tests...\n');

        await this.runTest('Environment Variables', () => this.testEnvironmentVariables());
        await this.runTest('Directory Structure', () => this.testDirectoryStructure());
        await this.runTest('Database Connection', () => this.testDatabaseConnection());
        await this.runTest('Application Startup', () => this.testApplicationStartup());
        await this.runTest('API Endpoints', () => this.testAPIEndpoints());
        await this.runTest('File Permissions', () => this.testFilePermissions());

        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAILED')
                .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
        }

        console.log(`\n${failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed. Please check the errors above.'}`);
    }
}

// Load environment variables
require('dotenv').config();

// Run tests
const tester = new SystemTester();
tester.runAllTests().catch(console.error);
```

Run the complete system test:
```bash
node system_test.js
```

---

## Common Setup Issues

### Issue 1: MySQL Connection Refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Enable MySQL to start on boot
sudo systemctl enable mysql

# Check MySQL port
sudo netstat -tlnp | grep :3306
```

### Issue 2: Access Denied for User

**Symptoms:**
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```

**Solutions:**
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Or create a new user
mysql -u root -p
CREATE USER 'canteen_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON CollegeCanteen.* TO 'canteen_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 3: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or use a different port
# Change PORT=3001 in .env file
```

### Issue 4: Permission Denied for Uploads

**Symptoms:**
```
Error: EACCES: permission denied, open './public/uploads/...'
```

**Solutions:**
```bash
# Fix upload directory permissions
chmod -R 755 public/uploads/
chown -R $USER:$USER public/uploads/

# Create upload directory if it doesn't exist
mkdir -p public/uploads
```

### Issue 5: Module Not Found

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or install specific missing module
npm install express
```

### Issue 6: Database Schema Import Fails

**Symptoms:**
```
ERROR 1064 (42000): You have an error in your SQL syntax
```

**Solutions:**
```bash
# Check MySQL version compatibility
mysql --version

# Import with specific options
mysql -u root -p --default-character-set=utf8mb4 CollegeCanteen < college_canteen_schema.sql

# Check for BOM or encoding issues
file college_canteen_schema.sql
```

---

## Post-Installation Steps

### 1. Create Initial Data

#### Add Sample Canteens
```sql
-- Connect to database
mysql -u root -p CollegeCanteen

-- Insert sample canteens
INSERT INTO Canteens (Name, Description, Location, Phone, Email, OperatingHours) VALUES
('Main Cafeteria', 'Primary dining facility with diverse menu options', 'Building A, Ground Floor', '123-456-7890', 'main@canteen.edu', '07:00-22:00'),
('Coffee Corner', 'Quick coffee and snacks', 'Library Building, First Floor', '123-456-7891', 'coffee@canteen.edu', '06:30-20:00'),
('Food Court', 'Multiple food vendors in one location', 'Student Center, Second Floor', '123-456-7892', 'foodcourt@canteen.edu', '10:00-21:00');
```

#### Add Sample Menu Items
```sql
-- Insert sample menu items
INSERT INTO MenuItems (CanteenID, Name, Description, Price, Category, IsAvailable) VALUES
(1, 'Chicken Burger', 'Grilled chicken breast with fresh vegetables', 8.99, 'Main Course', 1),
(1, 'Vegetable Pasta', 'Fresh pasta with seasonal vegetables', 7.50, 'Main Course', 1),
(1, 'Caesar Salad', 'Crisp romaine lettuce with Caesar dressing', 6.25, 'Salad', 1),
(2, 'Cappuccino', 'Rich espresso with steamed milk', 3.50, 'Beverages', 1),
(2, 'Blueberry Muffin', 'Fresh baked muffin with blueberries', 2.75, 'Snacks', 1),
(3, 'Pizza Slice', 'Fresh pizza slice with choice of toppings', 4.50, 'Main Course', 1);
```

### 2. Configure File Upload Directories

```bash
# Create organized upload structure
mkdir -p public/uploads/{menu,canteens,carousel,profiles}

# Set proper permissions
chmod -R 755 public/uploads/
```

### 3. Setup Log Rotation

Create log rotation configuration:

```bash
sudo nano /etc/logrotate.d/canteen
```

```
/home/canteen/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 canteen canteen
}
```

### 4. Configure Firewall (Production)

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### 5. Setup SSL Certificate (Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 6. Create Backup Script

```bash
nano ~/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/canteen/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u canteen_backup -p CollegeCanteen > $BACKUP_DIR/db_backup_$DATE.sql
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /home/canteen app

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:
```bash
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/canteen/backup.sh
```

---

## Deployment Options

### Option 1: Traditional Server Deployment

**Pros:**
- Full control over server
- Cost-effective for long-term use
- Easy to customize

**Cons:**
- Requires server management
- Manual scaling
- Maintenance overhead

**Setup Steps:**
1. Follow the production setup guide above
2. Configure domain and DNS
3. Setup SSL certificates
4. Configure monitoring

### Option 2: Docker Deployment

Create Docker configuration:

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    volumes:
      - ./uploads:/usr/src/app/public/uploads

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=CollegeCanteen
      - MYSQL_USER=canteen_user
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./college_canteen_schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  mysql_data:
```

**Deploy with Docker:**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Platform Deployment

#### Heroku Deployment

1. **Prepare for Heroku:**
```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Create .env for Heroku
# Set environment variables in Heroku dashboard
```

2. **Deploy:**
```bash
heroku create your-app-name
heroku addons:create cleardb:ignite
heroku config:set NODE_ENV=production
git push heroku main
```

#### AWS EC2 Deployment

1. **Launch EC2 Instance**
2. **Follow traditional server setup**
3. **Configure security groups**
4. **Setup load balancer (optional)**

#### DigitalOcean Droplet

1. **Create Droplet**
2. **Follow Ubuntu setup guide**
3. **Configure firewall**
4. **Setup monitoring**

---

## Conclusion

This setup guide provides comprehensive instructions for installing and configuring the Campus Cravings application in various environments. Whether you're setting up for development, testing, or production, following these steps will ensure a successful installation.

### Quick Reference

**Development:**
```bash
git clone https://github.com/sheethal1010/dbms-canteen.git
cd dbms-canteen
npm install
cp .env.example .env
# Edit .env with your settings
mysql -u root -p -e "CREATE DATABASE CollegeCanteen;"
mysql -u root -p CollegeCanteen < college_canteen_schema.sql
npm run dev
```

**Production:**
```bash
# Follow production setup section
# Configure Nginx
# Setup PM2
# Configure SSL
# Setup monitoring and backups
```

### Support

If you encounter issues during setup:

1. Check the [Common Setup Issues](#common-setup-issues) section
2. Run the system test script to identify problems
3. Check application logs for error messages
4. Refer to the troubleshooting section in the System Guide
5. Create an issue on GitHub with detailed error information

### Next Steps

After successful installation:

1. Create admin user account
2. Add initial canteen and menu data
3. Test all functionality
4. Setup monitoring and backups
5. Configure security measures
6. Train users on the system

**Setup Complete! 🎉**

Your Campus Cravings installation is now ready for use. Visit the application in your browser and start managing your campus dining experience!
