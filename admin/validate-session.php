<?php
// Session-Validierung für Admin Panel
require_once '../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Session starten
startSession();

// Überprüfe, ob Benutzer angemeldet ist
if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
    echo json_encode([
        'valid' => false,
        'message' => 'Nicht angemeldet'
    ]);
    exit;
}

$username = $_SESSION['admin_username'] ?? '';
$userRole = $_SESSION['admin_role'] ?? '';

// Überprüfe Standard-Admin-Account
if ($username === ADMIN_USERNAME) {
    echo json_encode([
        'valid' => true,
        'username' => $username,
        'role' => 'admin',
        'message' => 'Standard Admin Account validiert'
    ]);
    exit;
}

// Überprüfe Datenbank-Benutzer
$db = Database::getInstance();

if ($db->isConnected()) {
    try {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT id, username, email, role, created_at FROM users WHERE username = ? AND (role = 'admin' OR role = 'moderator')");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo json_encode([
                'valid' => true,
                'username' => $user['username'],
                'role' => $user['role'],
                'email' => $user['email'],
                'user_id' => $user['id'],
                'message' => 'Datenbankbenutzer validiert'
            ]);
        } else {
            // Benutzer existiert nicht mehr in der Datenbank
            session_destroy();
            echo json_encode([
                'valid' => false,
                'message' => 'Benutzer existiert nicht mehr'
            ]);
        }
        
    } catch (PDOException $e) {
        // Bei Datenbankfehler - Fallback auf JSON-Validierung
        validateFromJson($username, $userRole);
    }
} else {
    // Fallback auf JSON-Validierung
    validateFromJson($username, $userRole);
}

function validateFromJson($username, $userRole) {
    $jsonFile = '../data/users.json';
    
    if (file_exists($jsonFile)) {
        $users = json_decode(file_get_contents($jsonFile), true) ?? [];
        
        $userFound = false;
        foreach ($users as $user) {
            if ($user['username'] === $username && 
                ($user['role'] === 'admin' || $user['role'] === 'moderator')) {
                $userFound = true;
                echo json_encode([
                    'valid' => true,
                    'username' => $user['username'],
                    'role' => $user['role'],
                    'email' => $user['email'] ?? '',
                    'message' => 'JSON-Benutzer validiert'
                ]);
                break;
            }
        }
        
        if (!$userFound) {
            session_destroy();
            echo json_encode([
                'valid' => false,
                'message' => 'Benutzer existiert nicht mehr in JSON'
            ]);
        }
    } else {
        // Keine JSON-Datei vorhanden - Session ungültig
        session_destroy();
        echo json_encode([
            'valid' => false,
            'message' => 'Keine Benutzerdaten verfügbar'
        ]);
    }
}
?>