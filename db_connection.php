<?php
/**
 * Database Connection File
 */

// Database connection parameters
$servername = "localhost";
$username = "root"; // Default XAMPP username
$password = "system"; // Default XAMPP password is empty
$dbname = "CollegeCanteen"; // Database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set character set
$conn->set_charset("utf8mb4");

// Function to safely execute queries
function executeQuery($conn, $sql, $params = [], $types = "") {
    // For debugging
    $debug = true;
    
    if ($debug) {
        error_log("SQL: " . $sql);
        error_log("Params: " . print_r($params, true));
        error_log("Types: " . $types);
    }
    
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        $error = "Query preparation failed: " . $conn->error;
        error_log($error);
        return ["error" => $error];
    }
    
    if (!empty($params)) {
        try {
            $stmt->bind_param($types, ...$params);
        } catch (Exception $e) {
            $error = "Parameter binding failed: " . $e->getMessage();
            error_log($error);
            return ["error" => $error];
        }
    }
    
    try {
        $executed = $stmt->execute();
        if ($executed === false) {
            $error = "Query execution failed: " . $stmt->error;
            error_log($error);
            return ["error" => $error];
        }
    } catch (Exception $e) {
        $error = "Execute exception: " . $e->getMessage();
        error_log($error);
        return ["error" => $error];
    }
    
    // For INSERT, UPDATE, DELETE queries
    if ($stmt->affected_rows >= 0) {
        $affected = $stmt->affected_rows;
        $insertId = $stmt->insert_id;
        $stmt->close();
        return ["affected_rows" => $affected, "insert_id" => $insertId];
    }
    
    // For SELECT queries
    $result = $stmt->get_result();
    
    if ($result === false) {
        $error = "No result set and no rows affected";
        error_log($error);
        $stmt->close();
        return ["error" => $error];
    }
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    $stmt->close();
    return $data;
}
?>