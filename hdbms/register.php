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
    // Get registration data from POST
    $name = isset($_POST["name"]) ? trim($_POST["name"]) : "";
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
    $phone = isset($_POST["phone"]) ? trim($_POST["phone"]) : "";
    $password = isset($_POST["password"]) ? $_POST["password"] : "";
    $confirm_password = isset($_POST["confirm_password"]) ? $_POST["confirm_password"] : "";
    $account_type = isset($_POST["accountType"]) ? strtolower($_POST["accountType"]) : "customer";
    $staff_code = isset($_POST["staffCode"]) ? trim($_POST["staffCode"]) : "";
    
    debug_log("Registration attempt - Name: " . $name . ", Email: " . $email . ", Phone: " . $phone);
    
    // Validate input
    if (empty($name)) {
        $response["message"] = "Full name is required";
        debug_log("Empty name field");
    } elseif (empty($email) && empty($phone)) {
        $response["message"] = "Either email or phone number is required";
        debug_log("Both email and phone are empty");
    } elseif (empty($password) || empty($confirm_password)) {
        $response["message"] = "Password is required";
        debug_log("Empty password field");
    } elseif ($password !== $confirm_password) {
        $response["message"] = "Passwords do not match";
        debug_log("Passwords do not match");
    } elseif (strlen($password) < 6) {
        $response["message"] = "Password must be at least 6 characters long";
        debug_log("Password too short");
    } elseif ($account_type === "staff" && empty($staff_code)) {
        $response["message"] = "Staff code is required for staff accounts";
        debug_log("Staff code missing for staff account");
    } elseif ($account_type === "staff" && $staff_code !== "1234") {
        $response["message"] = "Invalid staff code";
        debug_log("Invalid staff code provided: " . $staff_code);
    } else {
        // Check if email already exists (if provided)
        if (!empty($email)) {
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $response["message"] = "Email already registered";
                debug_log("Email already exists: " . $email);
                $stmt->close();
                header("Content-Type: application/json");
                echo json_encode($response);
                exit;
            }
            $stmt->close();
        }
        
        // Check if phone already exists (if provided)
        if (!empty($phone)) {
            $stmt = $conn->prepare("SELECT id FROM users WHERE phone = ?");
            $stmt->bind_param("s", $phone);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $response["message"] = "Phone number already registered";
                debug_log("Phone already exists: " . $phone);
                $stmt->close();
                header("Content-Type: application/json");
                echo json_encode($response);
                exit;
            }
            $stmt->close();
        }
        
        // Hash password
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password, account_type) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $email, $phone, $password_hash, $account_type);
        
        if ($stmt->execute()) {
            $user_id = $stmt->insert_id;
            
            // Set session variables
            $_SESSION["user_id"] = $user_id;
            $_SESSION["name"] = $name;
            $_SESSION["email"] = $email;
            $_SESSION["phone"] = $phone;
            $_SESSION["account_type"] = $account_type;
            $_SESSION["logged_in"] = true;
            
            $response["success"] = true;
            $response["message"] = "Registration successful";
            $response["redirect"] = "hindex.html";
            $response["user"] = [
                "id" => $user_id,
                "name" => $name,
                "fullName" => $name,
                "email" => $email,
                "phone" => $phone,
                "account_type" => $account_type,
                "accountType" => $account_type
            ];
            
            debug_log("Registration successful for user: " . $name . " (ID: " . $user_id . ")");
        } else {
            $response["message"] = "Registration failed: " . $stmt->error;
            debug_log("Registration failed: " . $stmt->error);
        }
        
        $stmt->close();
    }
} else {
    $response["message"] = "Invalid request method";
    debug_log("Invalid request method: " . $_SERVER["REQUEST_METHOD"]);
}

// Return JSON response
header("Content-Type: application/json");
echo json_encode($response);
?>