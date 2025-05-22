<?php
/**
 * Session Check Handler
 * This file checks if a user is logged in by verifying the session data
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set headers for JSON response
header('Content-Type: application/json');

// Check if user is logged in
if (isset($_SESSION['user_id'])) {
    // User is logged in
    echo json_encode([
        'loggedIn' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'fullName' => $_SESSION['full_name'],
            'email' => $_SESSION['email'] ?? '',
            'phone' => $_SESSION['phone'] ?? '',
            'accountType' => $_SESSION['account_type']
        ]
    ]);
} else {
    // User is not logged in
    echo json_encode(['loggedIn' => false]);
}
?>