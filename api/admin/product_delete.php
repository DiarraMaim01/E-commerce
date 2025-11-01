<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__.'/../../utils/db.php';

session_start();
if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success'=>false, 'message'=>'Accès non autorisé']);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success'=>false, 'message'=>'Méthode non autorisée']);
  exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
$product_id = $input['product_id'] ?? null;

if (!$product_id) {
  http_response_code(400);
  echo json_encode(['success'=>false, 'message'=>'ID produit manquant']);
  exit;
}

try {
  $pdo = get_pdo();
  
  // Vérifier que le produit existe
  $stmt = $pdo->prepare("SELECT image FROM products WHERE id = ?");
  $stmt->execute([$product_id]);
  $product = $stmt->fetch();
  
  if (!$product) {
    http_response_code(404);
    echo json_encode(['success'=>false, 'message'=>'Produit non trouvé']);
    exit;
  }


  $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
  $stmt->execute([$product_id]);

  echo json_encode(['success'=>true, 'message'=>'Produit supprimé avec succès']);
  
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success'=>false, 'message'=>'Erreur DB: '.$e->getMessage()]);
}
?>