<?php
require_once __DIR__ . '/../../utils/db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

// Protège l'endpoint admin
if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Accès non autorisé']);
    exit;
}

try {
    $pdo    = get_pdo();
    $search = trim($_GET['search'] ?? '');

    if ($search !== '') {
        $stmt = $pdo->prepare("SELECT id, titre, description, prix, image, created_at
                               FROM products
                               WHERE titre LIKE ?
                               ORDER BY created_at DESC");
        $stmt->execute(["%{$search}%"]);
    } else {
        $stmt = $pdo->query("SELECT id, titre, description, prix, image, created_at
                             FROM products
                             ORDER BY created_at DESC");
    }

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products], JSON_UNESCAPED_UNICODE);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: '.$e->getMessage()]);
    exit;
}
