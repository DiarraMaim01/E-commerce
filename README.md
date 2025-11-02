Excellent réflexe 👏 !
Un bon **README** sur GitHub, c’est la vitrine du projet — aussi important que le code lui-même.
Voici une version complète, claire et professionnelle du README pour ton **projet Mini E-commerce**, adaptée à ta structure et ton style.

---

# 🛍️ Mini-Ecommerce — Application web PHP / JavaScript

Application e-commerce minimaliste développée en **PHP**, **MySQL** et **JavaScript vanilla**, avec séparation claire du front et du back.
Ce projet constitue le **4ᵉ et dernier projet** de mon plan de renforcement en développement web (octobre 2025).

---

## 🚀 Fonctionnalités principales

* 🧩 **Espace administrateur** :

  * Inscription et connexion sécurisées (sessions PHP)
  * Ajout de produits avec upload d’image, titre, description et prix
  * Liste et filtrage des produits
  * Gestion des commandes
  * Déconnexion (logout)

* 🛒 **Interface client** :

  * Affichage dynamique des produits
  * Recherche en temps réel (front + back)
  * Panier stocké côté navigateur (*localStorage*)
  * Calcul automatique du total
  * Passage de commande simulé

* 🔐 **Sécurité & validation** :

  * Validation côté client (UX) et côté serveur (sécurité)
  * Upload d’image sécurisé (type MIME, taille, nom unique)
  * Protection des routes administrateur via sessions

---

## ⚙️ Technologies utilisées

* **Backend** : PHP 8+, MySQL, PDO
* **Frontend** : HTML5, CSS3, JavaScript ES6 (Fetch API, DOM)
* **Sécurité** : Sessions PHP, validations, dossiers sécurisés (`uploads/`)

---

## 📁 Structure du projet

```
E-commerce/
|
├── admin/
│   ├── admin_login.html
│   ├── admin_register.html
│   ├── dashboard.html
│   ├── product_create.html
│   └── product_edit.html
│
├── api/
│   ├── admin/
│   │   ├── admin_login.php
|   |   ├──admin_logout.php
|   |   ├──admin_order_details.php
|   |   ├──admin_orders.php
│   │   ├── admin_register.php
│   │   ├── product_create.php
|   |   ├──product_delete.php
|   |   ├──product_edit.php 
│   │   └── products.php
│   └── public/
|       ├──orders.php
│       └── products.php
│
├── assets/
│   ├── css/
|   |   ├──admin.css
│   │   └── style.css
│   └── js/
│       ├── admin_auth.js
|       ├──admin_orders.js
|       ├──cart.js
|       ├──checkout.js
|       ├──product_edit.js
│       ├── products.js
│       └── shop.js
│
├── public/
│   ├── index.html
│   ├── cart.html
|   ├── checkout.html
│   ├── uploads/
│       ├── products/
│           ├── (images)
│           └── index.html
│       
│   
│
└── utils/ 
    └── db.php
```

---

## 🗃️ Installation

1. **Créer la base de données**

```sql
CREATE DATABASE e-ecommerce;
USE e-ecommerce;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL,
  client_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **Configurer la connexion dans `utils/db.php`**

```php
<?php
function get_pdo(){
    $host = 'localhost';
    $dbname = 'e-commerce';
    $username = 'root';
    $password = '';

    try {
        $pdo = new PDO ("mysql:host=$host;dbname=$dbname;charset=utf8" , $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE , PDO::ERRMODE_EXCEPTION);
        return $pdo;
    }catch (PDOException $e ){
        die("impossible de se connecter à la base de données :" . $e->getMessage());
    }
}

?>
```

3. **Lancer le serveur local**

```bash
php -S localhost:8000
```

4. **Accéder à l’application**

* Espace public : [http://localhost/E-commerce/public/](http://localhost/E-commerce/public/)
* Espace admin : [http://localhost/E-commerce/public/admin/](http://localhost/E-commerce/public/admin/)

---

## 🧠 À propos du projet

Ce projet m’a permis de consolider mes compétences en **PHP moderne**, **gestion de sessions**, **APIs REST**, et **intégration front/back**.
Il clôture ma phase de **renforcement en développement web**, avant ma prochaine étape :
👉 **remise à niveau en Java / Spring Boot**.

---

## 👩‍💻 Auteur

**Maimouna Diarra**
Ingénieure Logiciels & Données – Étudiante à l’ESEO
📫 Contact: mainouna_diarra@reseau.eseo.fr 

---

