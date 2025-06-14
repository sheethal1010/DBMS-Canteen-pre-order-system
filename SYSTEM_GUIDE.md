# Campus Cravings - System Administration Guide

This guide provides comprehensive information for system administrators managing the Campus Cravings canteen management system.

## Table of Contents

1. [System Overview](#system-overview)
2. [System Requirements](#system-requirements)
3. [Installation and Configuration](#installation-and-configuration)
4. [Database Administration](#database-administration)
5. [User Management](#user-management)
6. [Security Management](#security-management)
7. [Backup and Recovery](#backup-and-recovery)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Performance Tuning](#performance-tuning)
10. [Maintenance Procedures](#maintenance-procedures)
11. [Troubleshooting](#troubleshooting)
12. [System Updates](#system-updates)

---

## System Overview

### Architecture Components

Campus Cravings consists of the following key components:

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                   (Nginx/Apache)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                Application Servers                      │
│              (Node.js + Express.js)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Instance 1 │ │  Instance 2 │ │    Instance N       ││
│  │   Port 3000 │ │   Port 3001 │ │   Port 300N         ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                  Database Server                        │
│                    (MySQL 8.0+)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │   Primary   │ │   Replica   │ │    Backup           ││
│  │  Database   │ │  Database   │ │   Database          ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### System Services

1. **Web Server**: Nginx (recommended) or Apache
2. **Application Server**: Node.js with Express.js
3. **Database Server**: MySQL 8.0+
4. **Process Manager**: PM2 (recommended)
5. **File Storage**: Local filesystem or cloud storage
6. **Session Store**: MySQL or Redis
7. **Logging**: Winston + File rotation
8. **Monitoring**: Custom monitoring + external tools

---

## System Requirements

### Minimum Requirements

#### Production Environment
- **CPU**: 4 cores, 2.4 GHz
- **RAM**: 8 GB
- **Storage**: 100 GB SSD
- **Network**: 100 Mbps
- **OS**: Ubuntu 20.04 LTS, CentOS 8, or Windows Server 2019

#### Development Environment
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 50 GB
- **Network**: 10 Mbps
- **OS**: Any modern OS supporting Node.js

### Recommended Requirements

#### Production Environment
- **CPU**: 8 cores, 3.0 GHz
- **RAM**: 16 GB
- **Storage**: 500 GB SSD (with separate data partition)
- **Network**: 1 Gbps
- **OS**: Ubuntu 22.04 LTS

#### High-Availability Setup
- **Load Balancer**: 2 instances
- **Application Servers**: 3+ instances
- **Database**: Primary + 2 replicas
- **Storage**: RAID 10 configuration
- **Network**: Redundant connections

### Software Dependencies

#### Required Software
```bash
# Node.js (v18+ recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL Server 8.0+
sudo apt-get install mysql-server-8.0

# Nginx
sudo apt-get install nginx

# PM2 Process Manager
sudo npm install -g pm2

# Git
sudo apt-get install git
```

#### Optional Software
```bash
# Redis (for session storage)
sudo apt-get install redis-server

# Fail2ban (security)
sudo apt-get install fail2ban

# UFW Firewall
sudo ufw enable

# Certbot (SSL certificates)
sudo apt-get install certbot python3-certbot-nginx
```

---

## Installation and Configuration

### Initial System Setup

#### 1. System User Creation
```bash
# Create dedicated user for the application
sudo adduser canteen
sudo usermod -aG sudo canteen

# Switch to application user
su - canteen
```

#### 2. Directory Structure Setup
```bash
# Create application directories
mkdir -p /home/canteen/app
mkdir -p /home/canteen/logs
mkdir -p /home/canteen/backups
mkdir -p /home/canteen/uploads
mkdir -p /home/canteen/ssl

# Set proper permissions
chmod 755 /home/canteen/app
chmod 755 /home/canteen/uploads
chmod 700 /home/canteen/ssl
chmod 755 /home/canteen/logs
```

#### 3. Application Deployment
```bash
# Clone repository
cd /home/canteen/app
git clone https://github.com/sheethal1010/dbms-canteen.git .

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env
nano .env
```

### Environment Configuration

#### Production Environment Variables
```env
# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_USER=canteen_user
DB_PASSWORD=secure_database_password_here
DB_NAME=CollegeCanteen
DB_CONNECTION_LIMIT=20
DB_QUEUE_LIMIT=0

# Security Configuration
SESSION_SECRET=generate_64_character_random_string_here
BCRYPT_ROUNDS=12

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/canteen/uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/home/canteen/logs/app.log
ERROR_LOG_FILE=/home/canteen/logs/error.log

# Email Configuration (if applicable)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring Configuration
ENABLE_MONITORING=true
MONITORING_PORT=3001
```

### Web Server Configuration

#### Nginx Configuration (`/etc/nginx/sites-available/canteen`)
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream servers
upstream canteen_app {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s backup;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /home/canteen/ssl/certificate.crt;
    ssl_certificate_key /home/canteen/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/canteen_access.log;
    error_log /var/log/nginx/canteen_error.log;
    
    # File size limits
    client_max_body_size 10M;
    
    # Static files
    location /uploads/ {
        alias /home/canteen/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security for uploads
        location ~* \.(php|jsp|pl|py|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    location /images/ {
        alias /home/canteen/app/images/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://canteen_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Login endpoint with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://canteen_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Main application
    location / {
        proxy_pass http://canteen_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://canteen_app;
        proxy_set_header Host $host;
    }
}
```

#### Enable Nginx Configuration
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/canteen /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Database Administration

### MySQL Installation and Configuration

#### 1. MySQL Installation
```bash
# Install MySQL 8.0
sudo apt update
sudo apt install mysql-server-8.0

# Secure installation
sudo mysql_secure_installation
```

#### 2. Database Setup
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE CollegeCanteen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'canteen_user'@'localhost' IDENTIFIED BY 'secure_password_here';
CREATE USER 'canteen_user'@'%' IDENTIFIED BY 'secure_password_here';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON CollegeCanteen.* TO 'canteen_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON CollegeCanteen.* TO 'canteen_user'@'%';

-- Create backup user
CREATE USER 'canteen_backup'@'localhost' IDENTIFIED BY 'backup_password_here';
GRANT SELECT, LOCK TABLES ON CollegeCanteen.* TO 'canteen_backup'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;
```

#### 3. MySQL Configuration (`/etc/mysql/mysql.conf.d/mysqld.cnf`)
```ini
[mysqld]
# Basic Settings
user = mysql
pid-file = /var/run/mysqld/mysqld.pid
socket = /var/run/mysqld/mysqld.sock
port = 3306
basedir = /usr
datadir = /var/lib/mysql
tmpdir = /tmp
lc-messages-dir = /usr/share/mysql

# Network Settings
bind-address = 127.0.0.1
max_connections = 200
max_connect_errors = 1000000

# Buffer Settings
innodb_buffer_pool_size = 4G
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
innodb_flush_log_at_trx_commit = 2

# Query Cache (disabled in MySQL 8.0)
# query_cache_type = 1
# query_cache_size = 256M

# Logging
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Binary Logging (for replication)
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7
max_binlog_size = 100M

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Security
local_infile = 0
```

#### 4. Import Database Schema
```bash
# Import schema
mysql -u canteen_user -p CollegeCanteen < /home/canteen/app/college_canteen_schema.sql

# Verify tables
mysql -u canteen_user -p -e "USE CollegeCanteen; SHOW TABLES;"
```

### Database Maintenance

#### Daily Maintenance Script (`/home/canteen/scripts/daily_maintenance.sh`)
```bash
#!/bin/bash

# Configuration
DB_NAME="CollegeCanteen"
DB_USER="canteen_backup"
DB_PASS="backup_password_here"
BACKUP_DIR="/home/canteen/backups"
LOG_FILE="/home/canteen/logs/maintenance.log"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

log_message "Starting daily maintenance"

# 1. Database backup
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    log_message "Database backup completed: $BACKUP_FILE"
    gzip $BACKUP_FILE
else
    log_message "Database backup failed"
fi

# 2. Clean old backups (keep 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
log_message "Old backups cleaned"

# 3. Optimize database tables
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
    OPTIMIZE TABLE Customers;
    OPTIMIZE TABLE Canteens;
    OPTIMIZE TABLE MenuItems;
    OPTIMIZE TABLE Orders;
    OPTIMIZE TABLE OrderItems;
"
log_message "Database tables optimized"

# 4. Clean old log files
find /home/canteen/logs -name "*.log" -mtime +30 -delete
log_message "Old log files cleaned"

# 5. Clean old uploaded files (optional)
# find /home/canteen/uploads -name "*" -mtime +365 -delete

log_message "Daily maintenance completed"
```

#### Make script executable and schedule
```bash
# Make executable
chmod +x /home/canteen/scripts/daily_maintenance.sh

# Add to crontab
crontab -e

# Add this line to run daily at 2 AM
0 2 * * * /home/canteen/scripts/daily_maintenance.sh
```

---

## User Management

### Administrative User Creation

#### 1. Create System Administrator
```sql
-- Connect to database
mysql -u root -p CollegeCanteen

-- Insert admin user
INSERT INTO Customers (Name, Email, PasswordHash, AccountType, IsActive) 
VALUES (
    'System Administrator',
    'admin@yourdomain.com',
    '$2b$12$hash_generated_by_bcrypt',
    'admin',
    1
);
```

#### 2. Password Hash Generation Script (`create_admin.js`)
```javascript
const bcrypt = require('bcrypt');
const { promisePool } = require('./db');

async function createAdmin() {
    const name = 'System Administrator';
    const email = 'admin@yourdomain.com';
    const password = 'ChangeThisPassword123!'; // Change this!
    
    try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Insert admin user
        const query = `
            INSERT INTO Customers (Name, Email, PasswordHash, AccountType, IsActive)
            VALUES (?, ?, ?, 'admin', 1)
        `;
        
        const [result] = await promisePool.execute(query, [name, email, passwordHash]);
        
        console.log('Admin user created successfully');
        console.log('User ID:', result.insertId);
        console.log('Email:', email);
        console.log('Please change the password after first login');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        process.exit();
    }
}

createAdmin();
```

### User Account Management

#### 1. User Management Script (`manage_users.js`)
```javascript
const { promisePool } = require('./db');

class UserManager {
    // List all users
    static async listUsers() {
        const query = `
            SELECT CustomerID, Name, Email, AccountType, IsActive, CreatedAt
            FROM Customers
            ORDER BY CreatedAt DESC
        `;
        const [rows] = await promisePool.execute(query);
        return rows;
    }
    
    // Deactivate user
    static async deactivateUser(userId) {
        const query = 'UPDATE Customers SET IsActive = 0 WHERE CustomerID = ?';
        const [result] = await promisePool.execute(query, [userId]);
        return result.affectedRows > 0;
    }
    
    // Activate user
    static async activateUser(userId) {
        const query = 'UPDATE Customers SET IsActive = 1 WHERE CustomerID = ?';
        const [result] = await promisePool.execute(query, [userId]);
        return result.affectedRows > 0;
    }
    
    // Change user role
    static async changeUserRole(userId, newRole) {
        const validRoles = ['customer', 'staff', 'admin'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role');
        }
        
        const query = 'UPDATE Customers SET AccountType = ? WHERE CustomerID = ?';
        const [result] = await promisePool.execute(query, [newRole, userId]);
        return result.affectedRows > 0;
    }
    
    // Delete user (soft delete - deactivate instead)
    static async deleteUser(userId) {
        // Check if user has orders
        const orderQuery = 'SELECT COUNT(*) as orderCount FROM Orders WHERE CustomerID = ?';
        const [orderResult] = await promisePool.execute(orderQuery, [userId]);
        
        if (orderResult[0].orderCount > 0) {
            // User has orders, deactivate instead of delete
            return await this.deactivateUser(userId);
        } else {
            // No orders, safe to delete
            const query = 'DELETE FROM Customers WHERE CustomerID = ?';
            const [result] = await promisePool.execute(query, [userId]);
            return result.affectedRows > 0;
        }
    }
}

// Command line interface
const command = process.argv[2];
const userId = process.argv[3];
const role = process.argv[4];

async function main() {
    try {
        switch (command) {
            case 'list':
                const users = await UserManager.listUsers();
                console.table(users);
                break;
                
            case 'deactivate':
                if (!userId) throw new Error('User ID required');
                const deactivated = await UserManager.deactivateUser(userId);
                console.log(deactivated ? 'User deactivated' : 'User not found');
                break;
                
            case 'activate':
                if (!userId) throw new Error('User ID required');
                const activated = await UserManager.activateUser(userId);
                console.log(activated ? 'User activated' : 'User not found');
                break;
                
            case 'role':
                if (!userId || !role) throw new Error('User ID and role required');
                const roleChanged = await UserManager.changeUserRole(userId, role);
                console.log(roleChanged ? 'Role changed' : 'User not found');
                break;
                
            case 'delete':
                if (!userId) throw new Error('User ID required');
                const deleted = await UserManager.deleteUser(userId);
                console.log(deleted ? 'User deleted/deactivated' : 'User not found');
                break;
                
            default:
                console.log('Usage:');
                console.log('  node manage_users.js list');
                console.log('  node manage_users.js deactivate <userId>');
                console.log('  node manage_users.js activate <userId>');
                console.log('  node manage_users.js role <userId> <role>');
                console.log('  node manage_users.js delete <userId>');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

main();
```

---

## Security Management

### Firewall Configuration

#### UFW (Ubuntu Firewall) Setup
```bash
# Enable UFW
sudo ufw enable

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if needed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MySQL (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 3306

# Check status
sudo ufw status verbose
```

### Fail2Ban Configuration

#### Install and Configure Fail2Ban
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Create custom configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

#### Fail2Ban Configuration (`/etc/fail2ban/jail.local`)
```ini
[DEFAULT]
# Ban time (10 minutes)
bantime = 600

# Find time window (10 minutes)
findtime = 600

# Max retry attempts
maxretry = 5

# Ignore local IPs
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
```

### SSL Certificate Management

#### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Security Monitoring Script

#### Security Check Script (`/home/canteen/scripts/security_check.sh`)
```bash
#!/bin/bash

LOG_FILE="/home/canteen/logs/security.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check for failed login attempts
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | wc -l)
if [ $FAILED_LOGINS -gt 10 ]; then
    log_message "WARNING: $FAILED_LOGINS failed login attempts detected"
fi

# Check for unusual database connections
DB_CONNECTIONS=$(mysql -u canteen_user -p$DB_PASS -e "SHOW PROCESSLIST;" | wc -l)
if [ $DB_CONNECTIONS -gt 50 ]; then
    log_message "WARNING: High number of database connections: $DB_CONNECTIONS"
fi

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log_message "WARNING: Disk usage is at $DISK_USAGE%"
fi

# Check for large files in upload directory
LARGE_FILES=$(find /home/canteen/uploads -size +50M | wc -l)
if [ $LARGE_FILES -gt 0 ]; then
    log_message "WARNING: $LARGE_FILES large files found in uploads directory"
fi

log_message "Security check completed"
```

---

## Backup and Recovery

### Automated Backup System

#### Comprehensive Backup Script (`/home/canteen/scripts/backup.sh`)
```bash
#!/bin/bash

# Configuration
DB_NAME="CollegeCanteen"
DB_USER="canteen_backup"
DB_PASS="backup_password_here"
BACKUP_DIR="/home/canteen/backups"
APP_DIR="/home/canteen/app"
UPLOAD_DIR="/home/canteen/uploads"
LOG_FILE="/home/canteen/logs/backup.log"

# Remote backup configuration (optional)
REMOTE_HOST="backup-server.example.com"
REMOTE_USER="backup"
REMOTE_DIR="/backups/canteen"

# Create backup directory
mkdir -p $BACKUP_DIR

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Database backup
backup_database() {
    local backup_file="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mysqldump -u $DB_USER -p$DB_PASS \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        $DB_NAME > $backup_file
    
    if [ $? -eq 0 ]; then
        gzip $backup_file
        log_message "Database backup completed: $backup_file.gz"
        echo "$backup_file.gz"
    else
        log_message "Database backup failed"
        return 1
    fi
}

# Application files backup
backup_application() {
    local backup_file="$BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    tar -czf $backup_file \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='logs' \
        --exclude='backups' \
        -C /home/canteen app
    
    if [ $? -eq 0 ]; then
        log_message "Application backup completed: $backup_file"
        echo "$backup_file"
    else
        log_message "Application backup failed"
        return 1
    fi
}

# Upload files backup
backup_uploads() {
    local backup_file="$BACKUP_DIR/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    tar -czf $backup_file -C /home/canteen uploads
    
    if [ $? -eq 0 ]; then
        log_message "Uploads backup completed: $backup_file"
        echo "$backup_file"
    else
        log_message "Uploads backup failed"
        return 1
    fi
}

# Remote backup sync
sync_to_remote() {
    if [ -n "$REMOTE_HOST" ]; then
        rsync -avz --delete $BACKUP_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/
        
        if [ $? -eq 0 ]; then
            log_message "Remote sync completed"
        else
            log_message "Remote sync failed"
        fi
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    # Keep 7 days of backups locally
    find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    
    log_message "Old backups cleaned up"
}

# Main backup process
main() {
    log_message "Starting backup process"
    
    # Perform backups
    DB_BACKUP=$(backup_database)
    APP_BACKUP=$(backup_application)
    UPLOAD_BACKUP=$(backup_uploads)
    
    # Sync to remote if configured
    sync_to_remote
    
    # Cleanup old backups
    cleanup_old_backups
    
    log_message "Backup process completed"
    
    # Send notification (optional)
    # echo "Backup completed successfully" | mail -s "Canteen Backup Report" admin@yourdomain.com
}

main
```

### Recovery Procedures

#### Database Recovery Script (`/home/canteen/scripts/restore_db.sh`)
```bash
#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="CollegeCanteen"
DB_USER="canteen_user"
DB_PASS="secure_password_here"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will replace the current database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Recovery cancelled"
    exit 0
fi

# Stop application
sudo systemctl stop canteen

# Create backup of current database
echo "Creating backup of current database..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > "/tmp/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql"

# Drop and recreate database
echo "Dropping current database..."
mysql -u root -p -e "DROP DATABASE IF EXISTS $DB_NAME;"
mysql -u root -p -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Restore from backup
echo "Restoring from backup..."
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | mysql -u $DB_USER -p$DB_PASS $DB_NAME
else
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo "Database restored successfully"
    
    # Start application
    sudo systemctl start canteen
    echo "Application restarted"
else
    echo "Database restore failed"
    exit 1
fi
```

---

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint (`/health`)
Add to your Express application:

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'Unknown'
    };
    
    try {
        // Test database connection
        await promisePool.execute('SELECT 1');
        health.database = 'Connected';
    } catch (error) {
        health.status = 'ERROR';
        health.database = 'Disconnected';
        health.error = error.message;
    }
    
    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
});
```

#### System Monitoring Script (`/home/canteen/scripts/monitor.sh`)
```bash
#!/bin/bash

LOG_FILE="/home/canteen/logs/monitor.log"
ALERT_EMAIL="admin@yourdomain.com"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

send_alert() {
    echo "$1" | mail -s "Canteen System Alert" $ALERT_EMAIL
    log_message "ALERT: $1"
}

# Check application health
check_application() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
    
    if [ "$response" != "200" ]; then
        send_alert "Application health check failed. HTTP status: $response"
        return 1
    fi
    
    return 0
}

# Check database connectivity
check_database() {
    local result=$(mysql -u canteen_user -p$DB_PASS -e "SELECT 1;" 2>&1)
    
    if [[ $result == *"ERROR"* ]]; then
        send_alert "Database connectivity check failed: $result"
        return 1
    fi
    
    return 0
}

# Check disk space
check_disk_space() {
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $usage -gt 90 ]; then
        send_alert "Disk usage critical: $usage%"
        return 1
    elif [ $usage -gt 80 ]; then
        log_message "WARNING: Disk usage high: $usage%"
    fi
    
    return 0
}

# Check memory usage
check_memory() {
    local mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ $mem_usage -gt 90 ]; then
        send_alert "Memory usage critical: $mem_usage%"
        return 1
    elif [ $mem_usage -gt 80 ]; then
        log_message "WARNING: Memory usage high: $mem_usage%"
    fi
    
    return 0
}

# Check CPU load
check_cpu_load() {
    local load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    local load_percentage=$(echo "$load * 100 / $cpu_cores" | bc -l | cut -d. -f1)
    
    if [ $load_percentage -gt 90 ]; then
        send_alert "CPU load critical: $load (${load_percentage}%)"
        return 1
    elif [ $load_percentage -gt 80 ]; then
        log_message "WARNING: CPU load high: $load (${load_percentage}%)"
    fi
    
    return 0
}

# Main monitoring function
main() {
    log_message "Starting system monitoring"
    
    check_application
    check_database
    check_disk_space
    check_memory
    check_cpu_load
    
    log_message "System monitoring completed"
}

main
```

#### Schedule monitoring with cron
```bash
# Add to crontab (run every 5 minutes)
*/5 * * * * /home/canteen/scripts/monitor.sh
```

### Log Management

#### Log Rotation Configuration (`/etc/logrotate.d/canteen`)
```
/home/canteen/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 canteen canteen
    postrotate
        # Restart application to reopen log files
        systemctl reload canteen
    endscript
}
```

#### Application Logging Setup
Add to your Node.js application:

```javascript
const winston = require('winston');
const path = require('path');

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'canteen-app' },
    transports: [
        // Error log
        new winston.transports.File({
            filename: path.join(process.env.LOG_DIR || './logs', 'error.log'),
            level: 'error'
        }),
        // Combined log
        new winston.transports.File({
            filename: path.join(process.env.LOG_DIR || './logs', 'combined.log')
        })
    ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
```

---

## Performance Tuning

### Database Performance Optimization

#### MySQL Performance Configuration
```sql
-- Check current configuration
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_connections';

-- Performance tuning queries
-- Find slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- Check table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'CollegeCanteen'
ORDER BY (data_length + index_length) DESC;

-- Check index usage
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    SUB_PART,
    PACKED,
    NULLABLE,
    INDEX_TYPE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'CollegeCanteen';
```

#### Database Optimization Script (`optimize_db.sql`)
```sql
-- Add performance indexes
CREATE INDEX idx_orders_customer_date ON Orders(CustomerID, OrderDate);
CREATE INDEX idx_orders_canteen_status ON Orders(CanteenID, Status);
CREATE INDEX idx_menu_items_canteen_available ON MenuItems(CanteenID, IsAvailable);
CREATE INDEX idx_order_items_order_menu ON OrderItems(OrderID, MenuItemID);

-- Full-text search indexes
ALTER TABLE MenuItems ADD FULLTEXT(Name, Description);
ALTER TABLE Canteens ADD FULLTEXT(Name, Description);

-- Optimize tables
OPTIMIZE TABLE Customers;
OPTIMIZE TABLE Canteens;
OPTIMIZE TABLE MenuItems;
OPTIMIZE TABLE Orders;
OPTIMIZE TABLE OrderItems;

-- Update table statistics
ANALYZE TABLE Customers;
ANALYZE TABLE Canteens;
ANALYZE TABLE MenuItems;
ANALYZE TABLE Orders;
ANALYZE TABLE OrderItems;
```

### Application Performance Optimization

#### PM2 Configuration for Production (`ecosystem.config.js`)
```javascript
module.exports = {
    apps: [{
        name: 'canteen-app',
        script: './server.js',
        instances: 'max', // Use all CPU cores
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        
        // Performance settings
        max_memory_restart: '1G',
        node_args: '--max-old-space-size=1024',
        
        // Logging
        log_file: '/home/canteen/logs/pm2-combined.log',
        out_file: '/home/canteen/logs/pm2-out.log',
        error_file: '/home/canteen/logs/pm2-error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        
        // Auto-restart settings
        watch: false,
        ignore_watch: ['node_modules', 'logs', 'uploads'],
        max_restarts: 10,
        min_uptime: '10s',
        
        // Health monitoring
        health_check_grace_period: 3000,
        health_check_fatal_exceptions: true
    }]
};
```

### System Performance Monitoring

#### Performance Monitoring Script (`/home/canteen/scripts/performance.sh`)
```bash
#!/bin/bash

LOG_FILE="/home/canteen/logs/performance.log"

log_performance() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# System metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
LOAD_AVERAGE=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')

# Database metrics
DB_CONNECTIONS=$(mysql -u canteen_user -p$DB_PASS -e "SHOW STATUS LIKE 'Threads_connected';" | awk 'NR==2 {print $2}')
DB_QUERIES=$(mysql -u canteen_user -p$DB_PASS -e "SHOW STATUS LIKE 'Queries';" | awk 'NR==2 {print $2}')

# Application metrics
APP_MEMORY=$(ps aux | grep 'node.*server.js' | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
APP_PROCESSES=$(ps aux | grep 'node.*server.js' | grep -v grep | wc -l)

# Log metrics
log_performance "CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%, Load: ${LOAD_AVERAGE}"
log_performance "DB Connections: ${DB_CONNECTIONS}, DB Queries: ${DB_QUERIES}"
log_performance "App Memory: ${APP_MEMORY}MB, App Processes: ${APP_PROCESSES}"

# Check for performance issues
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    log_performance "WARNING: High CPU usage detected"
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    log_performance "WARNING: High memory usage detected"
fi

if [ $DB_CONNECTIONS -gt 50 ]; then
    log_performance "WARNING: High number of database connections"
fi
```

---

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Maintenance Checklist
1. **System Updates**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Database Maintenance**
   ```bash
   mysql -u root -p -e "
   USE CollegeCanteen;
   OPTIMIZE TABLE Customers, Canteens, MenuItems, Orders, OrderItems;
   ANALYZE TABLE Customers, Canteens, MenuItems, Orders, OrderItems;
   "
   ```

3. **Log Rotation and Cleanup**
   ```bash
   sudo logrotate -f /etc/logrotate.d/canteen
   find /home/canteen/logs -name "*.log.*" -mtime +30 -delete
   ```

4. **Security Updates**
   ```bash
   sudo fail2ban-client status
   sudo ufw status
   ```

5. **SSL Certificate Check**
   ```bash
   sudo certbot certificates
   ```

#### Monthly Maintenance Tasks

1. **Performance Review**
   - Analyze slow query logs
   - Review application performance metrics
   - Check resource utilization trends

2. **Security Audit**
   - Review user accounts and permissions
   - Check for security updates
   - Analyze access logs for suspicious activity

3. **Backup Verification**
   - Test backup restoration process
   - Verify backup integrity
   - Update backup retention policies

4. **Capacity Planning**
   - Review storage usage trends
   - Plan for scaling requirements
   - Update resource allocations

### System Update Procedures

#### Application Update Process
```bash
#!/bin/bash
# update_application.sh

APP_DIR="/home/canteen/app"
BACKUP_DIR="/home/canteen/backups"
LOG_FILE="/home/canteen/logs/update.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# 1. Create backup
log_message "Starting application update"
BACKUP_FILE="$BACKUP_DIR/pre_update_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf $BACKUP_FILE -C /home/canteen app

# 2. Stop application
sudo systemctl stop canteen
log_message "Application stopped"

# 3. Update code
cd $APP_DIR
git fetch origin
git checkout main
git pull origin main

# 4. Update dependencies
npm install --production

# 5. Run database migrations (if any)
# node migrate.js

# 6. Start application
sudo systemctl start canteen
log_message "Application started"

# 7. Verify application is running
sleep 10
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log_message "Application update completed successfully"
else
    log_message "Application update failed - rolling back"
    
    # Rollback
    sudo systemctl stop canteen
    tar -xzf $BACKUP_FILE -C /home/canteen
    sudo systemctl start canteen
    
    log_message "Rollback completed"
    exit 1
fi
```

---

## Troubleshooting

### Common Issues and Solutions

#### Application Won't Start

**Symptoms:**
- Application fails to start
- Port already in use errors
- Database connection errors

**Diagnosis:**
```bash
# Check if port is in use
sudo netstat -tlnp | grep :3000

# Check application logs
tail -f /home/canteen/logs/error.log

# Check PM2 status
pm2 status
pm2 logs canteen-app

# Test database connection
mysql -u canteen_user -p CollegeCanteen -e "SELECT 1;"
```

**Solutions:**
```bash
# Kill process using port
sudo kill -9 $(sudo lsof -t -i:3000)

# Restart database
sudo systemctl restart mysql

# Clear PM2 processes
pm2 delete all
pm2 start ecosystem.config.js --env production

# Check environment variables
cat /home/canteen/app/.env
```

#### Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- "Access denied" errors
- Slow database queries

**Diagnosis:**
```bash
# Check MySQL status
sudo systemctl status mysql

# Check MySQL error log
sudo tail -f /var/log/mysql/error.log

# Test connection
mysql -u canteen_user -p -h localhost CollegeCanteen

# Check active connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

**Solutions:**
```bash
# Restart MySQL
sudo systemctl restart mysql

# Reset user password
mysql -u root -p -e "
ALTER USER 'canteen_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
"

# Optimize database
mysql -u root -p CollegeCanteen -e "
OPTIMIZE TABLE Customers, Canteens, MenuItems, Orders, OrderItems;
"
```

#### High Memory Usage

**Symptoms:**
- Application becomes slow
- Out of memory errors
- System becomes unresponsive

**Diagnosis:**
```bash
# Check memory usage
free -h
top -p $(pgrep -f "node.*server.js")

# Check for memory leaks
ps aux --sort=-%mem | head -10

# Monitor memory over time
watch -n 5 'free -h && echo "---" && ps aux --sort=-%mem | head -5'
```

**Solutions:**
```bash
# Restart application
pm2 restart canteen-app

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Optimize Node.js memory
pm2 delete canteen-app
pm2 start ecosystem.config.js --node-args="--max-old-space-size=1024"
```

#### File Upload Issues

**Symptoms:**
- File uploads fail
- "File too large" errors
- Permission denied errors

**Diagnosis:**
```bash
# Check upload directory permissions
ls -la /home/canteen/uploads/

# Check disk space
df -h /home/canteen/uploads/

# Check Nginx configuration
sudo nginx -t
grep client_max_body_size /etc/nginx/sites-enabled/canteen
```

**Solutions:**
```bash
# Fix permissions
sudo chown -R canteen:canteen /home/canteen/uploads/
sudo chmod -R 755 /home/canteen/uploads/

# Increase upload limits in Nginx
sudo nano /etc/nginx/sites-enabled/canteen
# Add: client_max_body_size 10M;
sudo systemctl reload nginx

# Clean up old uploads
find /home/canteen/uploads -type f -mtime +365 -delete
```

### Emergency Procedures

#### System Recovery Checklist

1. **Assess the Situation**
   - Identify the scope of the problem
   - Check system logs for error messages
   - Determine if it's a hardware or software issue

2. **Immediate Actions**
   ```bash
   # Stop the application to prevent further damage
   pm2 stop all
   
   # Check system resources
   df -h
   free -h
   top
   
   # Check critical services
   sudo systemctl status mysql
   sudo systemctl status nginx
   ```

3. **Data Protection**
   ```bash
   # Create emergency backup
   mysqldump -u canteen_backup -p CollegeCanteen > /tmp/emergency_backup.sql
   
   # Backup current application state
   tar -czf /tmp/emergency_app_backup.tar.gz -C /home/canteen app
   ```

4. **Recovery Actions**
   ```bash
   # Restore from latest backup if needed
   /home/canteen/scripts/restore_db.sh /home/canteen/backups/latest_backup.sql.gz
   
   # Restart services in order
   sudo systemctl restart mysql
   sudo systemctl restart nginx
   pm2 start ecosystem.config.js --env production
   ```

5. **Verification**
   ```bash
   # Test application functionality
   curl -f http://localhost:3000/health
   
   # Check database connectivity
   mysql -u canteen_user -p CollegeCanteen -e "SELECT COUNT(*) FROM Customers;"
   
   # Monitor logs for errors
   tail -f /home/canteen/logs/error.log
   ```

---

## System Updates

### Update Management Strategy

#### Staging Environment
Always test updates in a staging environment before applying to production:

```bash
# Create staging environment
cp -r /home/canteen/app /home/canteen/staging
cd /home/canteen/staging

# Use staging database
mysql -u root -p -e "CREATE DATABASE CollegeCanteen_Staging;"
# Import production data to staging

# Test updates in staging
git pull origin main
npm install
npm test

# If tests pass, apply to production
```

#### Production Update Process

1. **Pre-Update Checklist**
   - [ ] Staging tests completed successfully
   - [ ] Backup created and verified
   - [ ] Maintenance window scheduled
   - [ ] Rollback plan prepared
   - [ ] Team notified

2. **Update Execution**
   ```bash
   # Execute update script
   /home/canteen/scripts/update_application.sh
   
   # Monitor for issues
   tail -f /home/canteen/logs/error.log
   
   # Verify functionality
   curl -f http://localhost:3000/health
   ```

3. **Post-Update Verification**
   - [ ] Application starts successfully
   - [ ] Database connections working
   - [ ] Key functionality tested
   - [ ] Performance metrics normal
   - [ ] No error logs

#### Security Update Process

```bash
# Check for security updates
sudo apt list --upgradable | grep -i security

# Apply security updates
sudo apt update
sudo apt upgrade

# Update Node.js dependencies
cd /home/canteen/app
npm audit
npm audit fix

# Restart services
sudo systemctl restart mysql
sudo systemctl restart nginx
pm2 restart canteen-app
```

---

## Conclusion

This System Administration Guide provides comprehensive procedures for managing the Campus Cravings application in a production environment. Regular maintenance, monitoring, and following these procedures will ensure optimal system performance and reliability.

### Key Takeaways

1. **Automation is Key**: Use scripts for routine tasks
2. **Monitor Continuously**: Set up proper monitoring and alerting
3. **Backup Regularly**: Maintain multiple backup strategies
4. **Security First**: Keep systems updated and secure
5. **Document Everything**: Maintain detailed logs and documentation
6. **Test Thoroughly**: Always test in staging before production
7. **Plan for Disasters**: Have recovery procedures ready

### Support Resources

- **System Logs**: `/home/canteen/logs/`
- **Backup Location**: `/home/canteen/backups/`
- **Scripts Directory**: `/home/canteen/scripts/`
- **Configuration Files**: `/home/canteen/app/.env`

For additional support or questions, refer to the Developer Guide and contact the development team.

---

**System Administration Guide v1.0**  
*Last Updated: $(date '+%Y-%m-%d')*
