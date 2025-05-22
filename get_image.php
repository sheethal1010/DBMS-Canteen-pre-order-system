<?php
// Database connection parameters
$servername = "localhost";
$username = "root"; // Change to your database username
$password = "system"; // Change to your database password
$dbname = "CollegeCanteen"; // Change to your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Function to get image by category and item_id
function getImage($conn, $category, $item_id) {
    $stmt = $conn->prepare("SELECT image_path, alt_text FROM images WHERE category = ? AND item_id = ?");
    $stmt->bind_param("ss", $category, $item_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    } else {
        return null;
    }
}

// Function to get all images by category
function getImagesByCategory($conn, $category) {
    $stmt = $conn->prepare("SELECT item_id, image_path, alt_text FROM images WHERE category = ?");
    $stmt->bind_param("s", $category);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $images = [];
    while ($row = $result->fetch_assoc()) {
        $images[] = $row;
    }
    
    return $images;
}

// Handle the request
header('Content-Type: application/json');

// Log the request for debugging
$request_log = [
    'time' => date('Y-m-d H:i:s'),
    'get_params' => $_GET,
    'server' => $_SERVER['REQUEST_URI']
];
error_log('Image request: ' . json_encode($request_log));

if (isset($_GET['category']) && isset($_GET['item_id'])) {
    // Get specific image
    $category = $_GET['category'];
    $item_id = $_GET['item_id'];
    
    error_log("Looking for image: category=$category, item_id=$item_id");
    
    $image = getImage($conn, $category, $item_id);
    
    if ($image) {
        error_log("Image found: " . json_encode($image));
        echo json_encode($image);
    } else {
        error_log("Image not found: category=$category, item_id=$item_id");
        echo json_encode(['error' => 'Image not found']);
    }
} elseif (isset($_GET['category'])) {
    // Get all images in a category
    $category = $_GET['category'];
    
    error_log("Looking for all images in category: $category");
    
    $images = getImagesByCategory($conn, $category);
    
    if (count($images) > 0) {
        error_log("Found " . count($images) . " images in category: $category");
        echo json_encode($images);
    } else {
        error_log("No images found for category: $category");
        echo json_encode(['error' => 'No images found for this category']);
    }
} else {
    error_log("Missing parameters in request");
    echo json_encode(['error' => 'Missing parameters']);
}

$conn->close();
?>