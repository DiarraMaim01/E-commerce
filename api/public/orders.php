<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../utils/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'JSON invalide']);
        exit;
    }

    $email = strtolower(trim($input['email'] ?? ''));
    $items = $input['items'] ?? [];

    // Validation
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
        http_response_code(400);
        echo json_encode(['success'=> false, 'message'=>'Email invalide']);
        exit;
    }

    if(!is_array($items) || count($items) === 0){
        http_response_code(400);
        echo json_encode(['success'=> false, 'message'=>'Panier vide']);
        exit;
    }

    $ids = [];
    foreach ($items as $it) {
        $pid = (int)($it['product_id'] ?? 0);
        $qty = (int)($it['qty'] ?? 0);
        if ($pid <= 0 || $qty <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Article invalide']);
            exit;
        }
        $ids[] = $pid;
    }

    // Récupération des prix depuis le serveur / sécurité
    $pdo = get_pdo();
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT id, prix FROM products WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($rows) !== count(array_unique($ids))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Produit introuvable']);
        exit;
    }

    // Map id -> prix
    $priceById = [];
    foreach ($rows as $r) {
        $priceById[(int)$r['id']] = (float)$r['prix'];
    }

    // Calcul du total
    $total = 0.0;
    foreach ($items as $it) {
        $pid = (int)$it['product_id'];
        $qty = (int)$it['qty'];
        $unit = $priceById[$pid];
        $total += $unit * $qty;
    }

    $total = number_format($total, 2, '.', '');

    // Insertion en base
    $pdo->beginTransaction();

   
    $stmt = $pdo->prepare('INSERT INTO orders (customer_email, total) VALUES (?, ?)');
    $stmt->execute([$email, $total]);
    $orderId = (int)$pdo->lastInsertId(); 

    // Order_items
    $stmt = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, qty, unit_price)
        VALUES (?, ?, ?, ?)
    ");
    
    foreach ($items as $it) {
        $pid = (int)$it['product_id'];
        $qty = (int)$it['qty'];
        $unit = $priceById[$pid];
        $stmt->execute([$orderId, $pid, $qty, $unit]);
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'order_id' => $orderId, 'total' => (float)$total]);
    
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) { 
        $pdo->rollBack(); 
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: '.$e->getMessage()]);
}
?>