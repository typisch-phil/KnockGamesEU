<?php
// KnockGames.eu - Datenbankkonfiguration
// PostgreSQL-Verbindung über Umgebungsvariablen
$databaseUrl = getenv('DATABASE_URL');
if ($databaseUrl) {
    // Parse DATABASE_URL für PostgreSQL
    $dbParts = parse_url($databaseUrl);
    define('DB_HOST', $dbParts['host'] ?? 'localhost');
    define('DB_PORT', isset($dbParts['port']) ? (int)$dbParts['port'] : 5432);
    define('DB_NAME', isset($dbParts['path']) ? ltrim($dbParts['path'], '/') : 'postgres');
    define('DB_USER', $dbParts['user'] ?? 'postgres');
    define('DB_PASS', $dbParts['pass'] ?? '');
    define('DB_TYPE', 'pgsql');
} else {
    // Fallback auf MySQL
    define('DB_HOST', 'localhost');
    define('DB_PORT', 3306);
    define('DB_NAME', 'knockgames');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_TYPE', 'mysql');
}

// Session Konfiguration
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123');

// Basis-URL Konfiguration
define('BASE_URL', '/');
define('ADMIN_URL', '/admin/');

// Datenbankverbindung aufbauen
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            // Verwende direkt die DATABASE_URL wenn verfügbar (für PostgreSQL)
            $databaseUrl = getenv('DATABASE_URL');
            if ($databaseUrl && DB_TYPE === 'pgsql') {
                $this->connection = new PDO($databaseUrl, null, null, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
            } else if (DB_TYPE === 'pgsql') {
                $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
                $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
            } else {
                $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
            }
        } catch (PDOException $e) {
            // Fallback auf JSON-Dateien wenn Datenbank nicht verfügbar
            $this->connection = null;
            error_log("Database Connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function isConnected() {
        return $this->connection !== null;
    }
}

// JSON-Dateien Fallback
class JsonStorage {
    private $dataDir = './data/';
    
    public function __construct() {
        if (!is_dir($this->dataDir)) {
            mkdir($this->dataDir, 0755, true);
        }
    }
    
    public function read($filename) {
        $filepath = $this->dataDir . $filename . '.json';
        if (file_exists($filepath)) {
            $content = file_get_contents($filepath);
            return json_decode($content, true);
        }
        return [];
    }
    
    public function write($filename, $data) {
        $filepath = $this->dataDir . $filename . '.json';
        return file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT));
    }
}

// Hilfsfunktionen
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function isAuthenticated() {
    startSession();
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function initializeData() {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        // Datenbank-Tabellen erstellen falls sie nicht existieren
        $pdo = $db->getConnection();
        
        if (DB_TYPE === 'pgsql') {
            // PostgreSQL-Tabellen
            $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            
            $pdo->exec("CREATE TABLE IF NOT EXISTS announcements (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            
            $pdo->exec("CREATE TABLE IF NOT EXISTS news_articles (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                excerpt TEXT,
                published BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
        } else {
            // MySQL-Tabellen
            $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
            
            $pdo->exec("CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
            
            $pdo->exec("CREATE TABLE IF NOT EXISTS news_articles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                excerpt TEXT,
                published BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
        }
        
        // Standard-Admin-Benutzer einfügen
        if (DB_TYPE === 'pgsql') {
            $stmt = $pdo->prepare("INSERT INTO users (username, password, role, email) VALUES (?, ?, 'admin', 'admin@knockgames.eu') ON CONFLICT (username) DO NOTHING");
        } else {
            $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, password, role, email) VALUES (?, ?, 'admin', 'admin@knockgames.eu')");
        }
        $stmt->execute([ADMIN_USERNAME, ADMIN_PASSWORD]);
        
        // Standard-Ankündigungen einfügen
        $announcements = [
            ['Willkommen bei KnockGames!', 'Herzlich willkommen auf unserem Minecraft Training Server. Hier findest du die besten PvP-Trainingsmöglichkeiten.', 'success', true],
            ['Server Update', 'Unser Server wurde erfolgreich aktualisiert. Neue Features sind verfügbar!', 'info', true],
            ['Wartungsarbeiten', 'Geplante Wartungsarbeiten am Sonntag von 2-4 Uhr morgens.', 'warning', true]
        ];
        
        foreach ($announcements as $index => $announcement) {
            if (DB_TYPE === 'pgsql') {
                $stmt = $pdo->prepare("INSERT INTO announcements (title, content, type, active) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING");
                $stmt->execute($announcement);
            } else {
                $stmt = $pdo->prepare("INSERT IGNORE INTO announcements (id, title, content, type, active) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$index + 1, ...$announcement]);
            }
        }
        
        // Standard-News einfügen
        $news = [
            ['Neue PvP Arena eröffnet', 'Wir freuen uns, die Eröffnung unserer brandneuen PvP Arena bekannt zu geben. Mit modernster Ausstattung und verschiedenen Kampfmodi bietet sie das ultimative Trainingsvergnügen.', 'Brandneue PvP Arena mit modernster Ausstattung jetzt verfügbar.', true],
            ['Training-Update 2.0', 'Das große Training-Update 2.0 ist da! Neue Übungsmodule, verbesserte KI-Gegner und erweiterte Statistiken warten auf euch.', 'Umfangreiches Update mit neuen Trainingsfeatures und Verbesserungen.', true],
            ['Community Event angekündigt', 'Unser erstes großes Community-Event findet nächsten Monat statt. Teilnehmer können exklusive Belohnungen und Ränge gewinnen.', 'Großes Community-Event mit exklusiven Belohnungen angekündigt.', true]
        ];
        
        foreach ($news as $index => $article) {
            if (DB_TYPE === 'pgsql') {
                $stmt = $pdo->prepare("INSERT INTO news_articles (title, content, excerpt, published) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING");
                $stmt->execute($article);
            } else {
                $stmt = $pdo->prepare("INSERT IGNORE INTO news_articles (id, title, content, excerpt, published) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$index + 1, ...$article]);
            }
        }
        
        return true;
    } else {
        // JSON-Fallback initialisieren
        $storage = new JsonStorage();
        
        // Standard-Daten für JSON-Files
        if (empty($storage->read('users'))) {
            $storage->write('users', [
                ['id' => 1, 'username' => 'admin', 'password' => 'admin123', 'role' => 'admin', 'email' => 'admin@knockgames.eu', 'created_at' => date('c')]
            ]);
        }
        
        if (empty($storage->read('announcements'))) {
            $storage->write('announcements', [
                ['id' => 1, 'title' => 'Willkommen bei KnockGames!', 'content' => 'Herzlich willkommen auf unserem Minecraft Training Server. Hier findest du die besten PvP-Trainingsmöglichkeiten.', 'type' => 'success', 'active' => true, 'created_at' => date('c')],
                ['id' => 2, 'title' => 'Server Update', 'content' => 'Unser Server wurde erfolgreich aktualisiert. Neue Features sind verfügbar!', 'type' => 'info', 'active' => true, 'created_at' => date('c')],
                ['id' => 3, 'title' => 'Wartungsarbeiten', 'content' => 'Geplante Wartungsarbeiten am Sonntag von 2-4 Uhr morgens.', 'type' => 'warning', 'active' => true, 'created_at' => date('c')]
            ]);
        }
        
        if (empty($storage->read('news'))) {
            $storage->write('news', [
                ['id' => 1, 'title' => 'Neue PvP Arena eröffnet', 'content' => 'Wir freuen uns, die Eröffnung unserer brandneuen PvP Arena bekannt zu geben. Mit modernster Ausstattung und verschiedenen Kampfmodi bietet sie das ultimative Trainingsvergnügen.', 'excerpt' => 'Brandneue PvP Arena mit modernster Ausstattung jetzt verfügbar.', 'published' => true, 'created_at' => date('c')],
                ['id' => 2, 'title' => 'Training-Update 2.0', 'content' => 'Das große Training-Update 2.0 ist da! Neue Übungsmodule, verbesserte KI-Gegner und erweiterte Statistiken warten auf euch.', 'excerpt' => 'Umfangreiches Update mit neuen Trainingsfeatures und Verbesserungen.', 'published' => true, 'created_at' => date('c')],
                ['id' => 3, 'title' => 'Community Event angekündigt', 'content' => 'Unser erstes großes Community-Event findet nächsten Monat statt. Teilnehmer können exklusive Belohnungen und Ränge gewinnen.', 'excerpt' => 'Großes Community-Event mit exklusiven Belohnungen angekündigt.', 'published' => true, 'created_at' => date('c')]
            ]);
        }
        
        return false; // MySQL nicht verfügbar, JSON-Fallback verwendet
    }
}

// System initialisieren
initializeData();
?>