<?php
/**
 * User Logout Handler
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Clear all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Set headers for JSON response
header('Content-Type: application/json');

// Return success response
echo json_encode(['success' => true, 'message' => 'Logout successful']);
?>