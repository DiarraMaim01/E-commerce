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

$titre       = trim($_POST['titre'] ?? '');
$description = trim($_POST['description'] ?? '');
$prix        = trim($_POST['prix'] ?? '');

// Validations simples
if ($titre === '' || $description === '' || $prix === '') {
  http_response_code(400);
  echo json_encode(['success'=>false, 'message'=>'Tous les champs sont obligatoires']);
  exit;
}
if (!is_numeric($prix) || $prix <= 0) {
  http_response_code(400);
  echo json_encode(['success'=>false, 'message'=>'Le prix doit être un nombre positif']);
  exit;
}

$imagePath = null;
if (!empty($_FILES['image']['name'])) {
  $f = $_FILES['image'];
  if ($f['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success'=>false, 'message'=>"Upload échoué ({$f['error']})"]);
    exit;
  }

  $allowed = ['image/png'=>'png','image/jpeg'=>'jpg'];
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime  = finfo_file($finfo, $f['tmp_name']);
  finfo_close($finfo);
  if (!isset($allowed[$mime])) {
    http_response_code(400);
    echo json_encode(['success'=>false, 'message'=>'Format image interdit (JPEG/PNG seulement)']);
    exit;
  }

  if ($f['size'] > 2*1024*1024) {
    http_response_code(400);
    echo json_encode(['success'=>false, 'message'=>'Image > 2 Mo']);
    exit;
  }

  $ext  = $allowed[$mime];
  $name = uniqid('prod_').'.'.$ext;
  $dir  = __DIR__.'/../../public/uploads/products';
  if (!is_dir($dir)) mkdir($dir, 0755, true);

  $dest = $dir.'/'.$name;
  if (!move_uploaded_file($f['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['success'=>false, 'message'=>'Déplacement upload impossible']);
    exit;
  }
 
  $imagePath = 'public/uploads/products/'.$name;
}

// Insertion DB
try {
  $pdo = get_pdo();
  $stmt = $pdo->prepare('INSERT INTO products (titre, description, prix, image) VALUES (?, ?, ?, ?)');
  $stmt->execute([$titre, $description, number_format($prix, 2, '.', ''), $imagePath]);

  http_response_code(201);
  echo json_encode(['success'=>true, 'message'=>'Produit ajouté']);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success'=>false, 'message'=>'Erreur DB: '.$e->getMessage()]);
}
