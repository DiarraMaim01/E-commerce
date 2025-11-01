<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Accès non autorisé']);
    exit;
}

$order_id = $_GET['order_id'] ?? null;

if (!$order_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de commande manquant']);
    exit;
}

try {
    require_once __DIR__ . '/../../utils/db.php';
    $pdo = get_pdo();
    
    $stmt = $pdo->prepare("
        SELECT 
            o.id,
            o.customer_email,
            o.total,
            o.created_at
        FROM orders o
        WHERE o.id = ?
    ");
    $stmt->execute([$order_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Commande non trouvée']);
        exit;
    }
    
    $stmt = $pdo->prepare("
        SELECT 
            oi.product_id,
            oi.qty,
            oi.unit_price,
            p.titre,
            p.image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    $stmt->execute([$order_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([ 'success' => true,  'order' => $order, 'items' => $items ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>