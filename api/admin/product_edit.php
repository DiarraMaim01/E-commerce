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

$product_id = $_POST['product_id'] ?? null;
$titre       = trim($_POST['titre'] ?? '');
$description = trim($_POST['description'] ?? '');
$prix        = trim($_POST['prix'] ?? '');

if (!$product_id) {
  http_response_code(400);
  echo json_encode(['success'=>false, 'message'=>'ID produit manquant']);
  exit;
}

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

try {
  $pdo = get_pdo();
  
  // Vérification  produit  
  $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
  $stmt->execute([$product_id]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['success'=>false, 'message'=>'Produit non trouvé']);
    exit;
  }

  $imagePath = null;
  
  // Gestion de l'image
  if (!empty($_FILES['image']['name'])) {
    $f = $_FILES['image'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
      http_response_code(400);
      echo json_encode(['success'=>false, 'message'=>"Upload échoué"]);
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

  // Mise à jour en base
  if ($imagePath) {
    $stmt = $pdo->prepare('UPDATE products SET titre = ?, description = ?, prix = ?, image = ? WHERE id = ?');
    $stmt->execute([$titre, $description, number_format($prix, 2, '.', ''), $imagePath, $product_id]);
  } else {
    $stmt = $pdo->prepare('UPDATE products SET titre = ?, description = ?, prix = ? WHERE id = ?');
    $stmt->execute([$titre, $description, number_format($prix, 2, '.', ''), $product_id]);
  }

  echo json_encode(['success'=>true, 'message'=>'Produit modifié avec succès']);
  
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success'=>false, 'message'=>'Erreur DB: '.$e->getMessage()]);
}
?>