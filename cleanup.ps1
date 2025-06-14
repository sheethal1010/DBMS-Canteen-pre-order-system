# Cleanup script for dbms-canteen project
# This script removes unnecessary files that have been consolidated

# Files that have been consolidated into utils/db-utilities.js
$filesToDelete = @(
    "debug-registration.js",
    "add-user.js",
    "find-users-tables.js",
    "list-users.js",
    "remove-duplicates.js",
    "add-unique-constraints.js",
    "update-password.js",
    "show-users.js",
    "{"  # Empty/malformed file
)

# Current directory
$projectDir = "c:/Users/Admin/Desktop/dbms-canteen"

# Create a backup directory
$backupDir = Join-Path $projectDir "backup-utils"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Created backup directory: $backupDir"
}

# Move files to backup instead of deleting them
foreach ($file in $filesToDelete) {
    $filePath = Join-Path $projectDir $file
    if (Test-Path $filePath) {
        $backupPath = Join-Path $backupDir $file
        Move-Item -Path $filePath -Destination $backupPath
        Write-Host "Moved to backup: $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "`nCleanup completed. Files have been moved to: $backupDir"
Write-Host "If the application works correctly, you can delete the backup directory."
Write-Host "To restore files, run: Move-Item -Path '$backupDir\*' -Destination '$projectDir'"