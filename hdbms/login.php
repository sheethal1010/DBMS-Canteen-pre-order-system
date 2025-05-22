<?php
// Start session
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set("display_errors", 1);

// Include database connection
include_once "../db_connection.php";

// Function to log debug information
function debug_log($message) {
    file_put_contents("debug_log.txt", date("[Y-m-d H:i:s] ") . $message . PHP_EOL, FILE_APPEND);
}

// Initialize response array
$response = ["success" => false, "message" => ""];

// Check if the request is a POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get login credentials from POST data
    $identifier = isset($_POST["identifier"]) ? trim($_POST["identifier"]) : "";
    $password = isset($_POST["password"]) ? $_POST["password"] : "";
    
    debug_log("Login attempt with identifier: " . $identifier);
    
    // Validate input
    if (empty($identifier) || empty($password)) {
        $response["message"] = "Email/Phone and password are required";
        debug_log("Empty identifier or password");
    } else {
        // Determine if the identifier is an email or phone number
        $is_email = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        
        // Prepare SQL statement to prevent SQL injection
        if ($is_email) {
            $stmt = $conn->prepare("SELECT id, full_name, email, phone, password, account_type FROM users WHERE email = ?");
            debug_log("Attempting login with email: " . $identifier);
        } else {
            $stmt = $conn->prepare("SELECT id, full_name, email, phone, password, account_type FROM users WHERE phone = ?");
            debug_log("Attempting login with phone: " . $identifier);
        }
        
        if ($stmt === false) {
            $response["message"] = "Database error: " . $conn->error;
            debug_log("Prepare failed: " . $conn->error);
        } else {
            $stmt->bind_param("s", $identifier);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 1) {
                $user = $result->fetch_assoc();
                
                // Verify password
                if (password_verify($password, $user["password"])) {
                    // Password is correct, set session variables
                    $_SESSION["user_id"] = $user["id"];
                    $_SESSION["name"] = $user["full_name"];
                    $_SESSION["email"] = $user["email"];
                    $_SESSION["phone"] = $user["phone"];
                    $_SESSION["account_type"] = $user["account_type"];
                    $_SESSION["logged_in"] = true;
                    
                    $response["success"] = true;
                    $response["message"] = "Login successful";
                    $response["redirect"] = "hindex.html";
                    $response["user"] = [
                        "id" => $user["id"],
                        "name" => $user["full_name"],
                        "fullName" => $user["full_name"],
                        "email" => $user["email"],
                        "phone" => $user["phone"],
                        "account_type" => $user["account_type"],
                        "accountType" => $user["account_type"]
                    ];
                    
                    debug_log("Login successful for user: " . $user["full_name"]);
                    
                    // Set redirect based on account type
                    if ($user["account_type"] === "admin") {
                        $response["redirect"] = "../admin.html";
                    } else {
                        $response["redirect"] = "../Main.html";
                    }
                } else {
                    $response["message"] = "Invalid password";
                    debug_log("Invalid password for identifier: " . $identifier);
                }
            } else {
                $response["message"] = "User not found";
                debug_log("User not found for identifier: " . $identifier);
            }
            
            $stmt->close();
        }
    }
} else {
    $response["message"] = "Invalid request method";
    debug_log("Invalid request method: " . $_SERVER["REQUEST_METHOD"]);
}

// Return JSON response
header("Content-Type: application/json");
echo json_encode($response);
?>