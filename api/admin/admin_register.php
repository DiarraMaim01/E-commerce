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

if(strlen($password) < 8) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 8 caractères']);
  exit;
}   

try {
  require_once __DIR__ . '/../../utils/db.php';
  $pdo = get_pdo();
  $stmt = $pdo->prepare("INSERT INTO admins (email , password) VALUES (?, ?)");
  $password_hash = password_hash($password, PASSWORD_DEFAULT);
  $stmt->execute([$email, $password_hash]);

  echo json_encode(['success' => true, 'message' => 'Inscription réussie']);
  exit;

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
  exit;
}

?>