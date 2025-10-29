<?php
header('Content-Type: application/json; charset=utf-8');

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
  exit;
}

$raw    = file_get_contents('php://input');
$input  = json_decode($raw, true);
if (!is_array($input)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Corps JSON invalide']);
  exit;
}


$email    = strtolower(trim($input['email'] ?? ''));
$password = trim($input['password'] ?? '');

// validations

if ($email === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Tous les champs sont requis']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Email invalide']);
  exit;
}

try {
  require_once __DIR__ . '/../../utils/db.php';
  $pdo = get_pdo();


  $stmt = $pdo->prepare("SELECT id, email, password FROM admins WHERE LOWER(email) = ?");
  $stmt->execute([$email]);
  $admin = $stmt->fetch();


  if (!$admin || !password_verify($password, $admin['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
    exit;
  }

 
  session_regenerate_id(true);
  $_SESSION['admin_id'] = (int)$admin['id'];

  echo json_encode(['success' => true, 'message' => 'Connexion réussie']);
  exit;

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
  exit;
}
