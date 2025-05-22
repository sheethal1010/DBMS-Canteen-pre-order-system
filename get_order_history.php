<?php
/**
 * Order History API
 * This file fetches order history for a logged-in user
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include database connection
include_once "db_connection.php";

// Set headers for JSON response
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get order history with payment method and food images
$sql = "
    SELECT 
        o.ORDER_ID,
        o.ORDER_DATE,
        o.SCHEDULED_TIME,
        o.TOTAL_AMOUNT,
        o.STATUS,
        o.PICKUP_COUNTER,
        c.NAME as CANTEEN_NAME,
        p.PAYMENT_METHOD,
        p.PAYMENT_STATUS
    FROM 
        Orders o
    JOIN 
        Canteens c ON o.Canteen_ID = c.Canteen_ID
    LEFT JOIN 
        Payments p ON o.ORDER_ID = p.ORDER_ID
    WHERE 
        o.USER_ID = ?
    ORDER BY 
        o.ORDER_DATE DESC
";

// Execute the query
$params = [$user_id];
$types = "i";
$orders = executeQuery($conn, $sql, $params, $types);

// Check if there was an error
if (isset($orders['error'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching orders: ' . $orders['error']
    ]);
    exit;
}

// If no orders found
if (empty($orders)) {
    echo json_encode([
        'success' => true,
        'message' => 'No order history found',
        'orders' => []
    ]);
    exit;
}

// Get order items with food images for each order
foreach ($orders as &$order) {
    $sql = "
        SELECT 
            oi.ORDER_ITEM_ID,
            oi.QUANTITY,
            oi.SUBTOTAL,
            m.ITEM_NAME,
            m.PRICE,
            m.CATEGORY,
            i.image_path
        FROM 
            OrderItems oi
        JOIN 
            Menu m ON oi.ITEM_ID = m.ITEM_ID
        LEFT JOIN 
            images i ON i.category = 'food' AND i.item_id = LOWER(REPLACE(m.ITEM_NAME, ' ', '_'))
        WHERE 
            oi.ORDER_ID = ?
    ";
    
    $params = [$order['ORDER_ID']];
    $types = "i";
    $orderItems = executeQuery($conn, $sql, $params, $types);
    
    // If there was an error fetching order items
    if (isset($orderItems['error'])) {
        $order['items'] = [];
        $order['error_items'] = $orderItems['error'];
    } else {
        $order['items'] = $orderItems;
    }
}

// Return the order history
echo json_encode([
    'success' => true,
    'message' => 'Order history retrieved successfully',
    'orders' => $orders
]);
?>