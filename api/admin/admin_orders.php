<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Accès non autorisé']);
    exit;
}

try {
    require_once __DIR__ . '/../../utils/db.php';
    $pdo = get_pdo();
    
    $stmt = $pdo->query("
        SELECT 
            o.id,
            o.customer_email,
            o.total,
            o.created_at,
            COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ");
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([ 'success' => true,  'orders' => $orders ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>