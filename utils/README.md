# Utility Scripts for College Canteen

This directory contains utility scripts for the College Canteen application.

## Database Utilities

The `db-utilities.js` file consolidates several standalone database utility scripts that were previously in the project root. This consolidation helps keep the project structure cleaner while preserving all functionality.

### Included Functionality

The following standalone scripts have been consolidated into `db-utilities.js`:

1. `show-users.js` - Display recently registered users and employee details
2. `list-users.js` - List all users with detailed information
3. `add-user.js` - Add a new user to the database
4. `update-password.js` - Update a user's password
5. `find-users-tables.js` - Find tables related to users in the database
6. `remove-duplicates.js` - Remove duplicate users from the database
7. `add-unique-constraints.js` - Add unique constraints to the Customers table
8. `debug-registration.js` - Debug the registration process

### Usage

You can use the utilities in two ways:

1. **As a module in your code:**

```javascript
const dbUtils = require('./utils/db-utilities');

// Example: List all users
dbUtils.listUsers().then(() => {
  console.log('Users listed successfully');
});
```

2. **From the command line:**

```bash
# Show recently registered users
node utils/db-utilities.js show-users

# List all users with details
node utils/db-utilities.js list-users

# Add a new user (with default test data)
node utils/db-utilities.js add-user

# Add a user with custom data
node utils/db-utilities.js add-user '{"name":"John Doe","email":"john@example.com","phone":"9876543210","password":"secret123","role":"Customer"}'

# Update a user's password
node utils/db-utilities.js update-password john@example.com newpassword123

# Find tables related to users
node utils/db-utilities.js find-users-tables

# Remove duplicate users
node utils/db-utilities.js remove-duplicates

# Add unique constraints to Customers table
node utils/db-utilities.js add-unique-constraints

# Debug the registration process
node utils/db-utilities.js debug-registration
```

Run without arguments to see the list of available commands:

```bash
node utils/db-utilities.js
```

## Cleanup

A cleanup script (`cleanup.ps1`) has been created in the project root to safely move the original standalone scripts to a backup directory. This helps maintain a cleaner project structure while preserving the original files in case they're needed.

To run the cleanup:

```powershell
./cleanup.ps1
```

The script will move the files to a `backup-utils` directory instead of deleting them outright. If the application continues to work correctly after testing, you can safely delete the backup directory.