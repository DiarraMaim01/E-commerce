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