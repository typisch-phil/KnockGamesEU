<?php
require_once 'config.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Router
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Entferne Query-Parameter
$requestUri = strtok($requestUri, '?');

// Route-Handler
switch (true) {
    // Öffentliche API-Endpunkte
    case $requestUri === '/api/announcements' && $requestMethod === 'GET':
        getPublicAnnouncements();
        break;
    
    case $requestUri === '/api/news' && $requestMethod === 'GET':
        getPublicNews();
        break;
    
    // Admin-Login
    case $requestUri === '/api/admin/login' && $requestMethod === 'POST':
        adminLogin();
        break;
    
    case $requestUri === '/api/admin/logout' && $requestMethod === 'POST':
        adminLogout();
        break;
    
    // Admin-Endpunkte (authentifiziert)
    case $requestUri === '/api/admin/users' && $requestMethod === 'GET':
        requireAuth();
        getUsers();
        break;
    
    case $requestUri === '/api/admin/users' && $requestMethod === 'POST':
        requireAuth();
        createUser();
        break;
    
    case preg_match('/^\/api\/admin\/users\/(\d+)$/', $requestUri, $matches) && $requestMethod === 'PUT':
        requireAuth();
        updateUser($matches[1]);
        break;
    
    case preg_match('/^\/api\/admin\/users\/(\d+)$/', $requestUri, $matches) && $requestMethod === 'DELETE':
        requireAuth();
        deleteUser($matches[1]);
        break;
    
    // Ankündigungen CRUD
    case $requestUri === '/api/admin/announcements' && $requestMethod === 'GET':
        requireAuth();
        getAnnouncements();
        break;
    
    case $requestUri === '/api/admin/announcements' && $requestMethod === 'POST':
        requireAuth();
        createAnnouncement();
        break;
    
    case preg_match('/^\/api\/admin\/announcements\/(\d+)$/', $requestUri, $matches) && $requestMethod === 'PUT':
        requireAuth();
        updateAnnouncement($matches[1]);
        break;
    
    case preg_match('/^\/api\/admin\/announcements\/(\d+)$/', $requestUri, $matches) && $requestMethod === 'DELETE':
        requireAuth();
        deleteAnnouncement($matches[1]);
        break;
    
    // News CRUD
    case $requestUri === '/api/admin/news' && $requestMethod === 'GET':
        requireAuth();
        getNews();
        break;
    
    case $requestUri === '/api/admin/news' && $requestMethod === 'POST':
        requireAuth();
        createNews();
        break;
    
    case preg_match('/^\/api\/admin\/news\/(\d+)$/', $requestUri, $matches) && $requestMethod === 'PUT':
        requireAuth();
        updateNews($matches[1]);
        break;
    
    case preg_match('/^\/api\/admin\/news\/(\d+)$/', $requestUri, $matches) && $requestMethod === 'DELETE':
        requireAuth();
        deleteNews($matches[1]);
        break;
    
    // MySQL-Konfiguration
    case $requestUri === '/api/mysql/status' && $requestMethod === 'GET':
        getMySQLStatus();
        break;
    
    case $requestUri === '/api/mysql/test' && $requestMethod === 'POST':
        testMySQLConnection();
        break;
    
    case $requestUri === '/api/mysql/configure' && $requestMethod === 'POST':
        configureMysQL();
        break;
    
    // Minecraft Server Status
    case $requestUri === '/api/minecraft/status' && $requestMethod === 'GET':
        getMinecraftStatus();
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

// Öffentliche API-Funktionen
function getPublicAnnouncements() {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM announcements WHERE active = 1 ORDER BY created_at DESC");
        $stmt->execute();
        $announcements = $stmt->fetchAll();
    } else {
        $storage = new JsonStorage();
        $announcements = array_filter($storage->read('announcements'), function($a) {
            return $a['active'] === true;
        });
    }
    
    jsonResponse($announcements);
}

function getPublicNews() {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM news_articles WHERE published = 1 ORDER BY created_at DESC");
        $stmt->execute();
        $news = $stmt->fetchAll();
    } else {
        $storage = new JsonStorage();
        $news = array_filter($storage->read('news'), function($n) {
            return $n['published'] === true;
        });
    }
    
    jsonResponse($news);
}

// Admin-Authentifizierung
function adminLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    // Prüfe Standard-Admin-Account
    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        startSession();
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['admin_role'] = 'admin';
        jsonResponse(['success' => true, 'message' => 'Erfolgreich angemeldet']);
        return;
    }
    
    // Prüfe Benutzer aus Datenbank/JSON
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND (role = 'admin' OR role = 'moderator')");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            startSession();
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $user['username'];
            $_SESSION['admin_role'] = $user['role'];
            $_SESSION['admin_user_id'] = $user['id'];
            jsonResponse(['success' => true, 'message' => 'Erfolgreich angemeldet']);
            return;
        }
    } else {
        $storage = new JsonStorage();
        $users = $storage->read('users');
        
        foreach ($users as $user) {
            if ($user['username'] === $username && 
                ($user['role'] === 'admin' || $user['role'] === 'moderator') &&
                password_verify($password, $user['password'])) {
                startSession();
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_username'] = $user['username'];
                $_SESSION['admin_role'] = $user['role'];
                $_SESSION['admin_user_id'] = $user['id'];
                jsonResponse(['success' => true, 'message' => 'Erfolgreich angemeldet']);
                return;
            }
        }
    }
    
    jsonResponse(['error' => 'Ungültige Anmeldedaten'], 401);
}

function adminLogout() {
    startSession();
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'Erfolgreich abgemeldet']);
}

// Benutzer-Management
function getUsers() {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC");
        $stmt->execute();
        $users = $stmt->fetchAll();
    } else {
        $storage = new JsonStorage();
        $users = $storage->read('users');
        // Passwörter entfernen für Sicherheit
        $users = array_map(function($user) {
            unset($user['password']);
            return $user;
        }, $users);
    }
    
    jsonResponse($users);
}

function createUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $email = trim($input['email'] ?? '');
    $role = $input['role'] ?? 'user';
    
    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'Benutzername und Passwort sind erforderlich'], 400);
    }
    
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        
        // Prüfe ob Benutzername bereits existiert
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetchColumn() > 0) {
            jsonResponse(['error' => 'Benutzername bereits vorhanden'], 400);
        }
        
        // Erstelle neuen Benutzer mit gehashtem Passwort
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $hashedPassword, $email ?: null, $role]);
        
        $userId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
    } else {
        $storage = new JsonStorage();
        $users = $storage->read('users');
        
        // Prüfe ob Benutzername bereits existiert
        foreach ($users as $user) {
            if ($user['username'] === $username) {
                jsonResponse(['error' => 'Benutzername bereits vorhanden'], 400);
            }
        }
        
        // Neuen Benutzer erstellen mit gehashtem Passwort
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $newUser = [
            'id' => count($users) + 1,
            'username' => $username,
            'password' => $hashedPassword,
            'email' => $email ?: null,
            'role' => $role,
            'created_at' => date('c')
        ];
        
        $users[] = $newUser;
        $storage->write('users', $users);
        
        // Passwort für Antwort entfernen
        unset($newUser['password']);
        $user = $newUser;
    }
    
    jsonResponse($user);
}

function updateUser($userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $email = trim($input['email'] ?? '');
    $role = $input['role'] ?? 'user';
    
    if (empty($username)) {
        jsonResponse(['error' => 'Benutzername ist erforderlich'], 400);
    }
    
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        
        // Prüfe ob Benutzer existiert
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $existingUser = $stmt->fetch();
        
        if (!$existingUser) {
            jsonResponse(['error' => 'Benutzer nicht gefunden'], 404);
        }
        
        // Prüfe ob Benutzername bereits von anderem Benutzer verwendet wird
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$username, $userId]);
        if ($stmt->fetchColumn() > 0) {
            jsonResponse(['error' => 'Benutzername bereits vorhanden'], 400);
        }
        
        // Update Benutzer
        if (!empty($password)) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET username = ?, password = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$username, $hashedPassword, $email ?: null, $role, $userId]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$username, $email ?: null, $role, $userId]);
        }
        
        // Aktualisierte Daten abrufen
        $stmt = $pdo->prepare("SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
    } else {
        $storage = new JsonStorage();
        $users = $storage->read('users');
        
        $userIndex = -1;
        foreach ($users as $index => $user) {
            if ($user['id'] == $userId) {
                $userIndex = $index;
                break;
            }
        }
        
        if ($userIndex === -1) {
            jsonResponse(['error' => 'Benutzer nicht gefunden'], 404);
        }
        
        // Prüfe ob Benutzername bereits verwendet wird
        foreach ($users as $index => $user) {
            if ($user['username'] === $username && $index !== $userIndex) {
                jsonResponse(['error' => 'Benutzername bereits vorhanden'], 400);
            }
        }
        
        // Update Benutzer
        $users[$userIndex]['username'] = $username;
        $users[$userIndex]['email'] = $email ?: null;
        $users[$userIndex]['role'] = $role;
        $users[$userIndex]['updated_at'] = date('c');
        
        if (!empty($password)) {
            $users[$userIndex]['password'] = password_hash($password, PASSWORD_DEFAULT);
        }
        
        $storage->write('users', $users);
        
        // Passwort für Antwort entfernen
        $user = $users[$userIndex];
        unset($user['password']);
    }
    
    jsonResponse($user);
}

function deleteUser($userId) {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        
        // Prüfe ob Benutzer existiert
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['error' => 'Benutzer nicht gefunden'], 404);
        }
        
        // Verhindere Löschen des letzten Admin-Benutzers
        if ($user['role'] === 'admin') {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
            $stmt->execute();
            $adminCount = $stmt->fetchColumn();
            
            if ($adminCount <= 1) {
                jsonResponse(['error' => 'Der letzte Administrator kann nicht gelöscht werden'], 400);
            }
        }
        
        // Lösche Benutzer
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
    } else {
        $storage = new JsonStorage();
        $users = $storage->read('users');
        
        $userIndex = -1;
        foreach ($users as $index => $user) {
            if ($user['id'] == $userId) {
                $userIndex = $index;
                break;
            }
        }
        
        if ($userIndex === -1) {
            jsonResponse(['error' => 'Benutzer nicht gefunden'], 404);
        }
        
        // Verhindere Löschen des letzten Admin-Benutzers
        if ($users[$userIndex]['role'] === 'admin') {
            $adminCount = count(array_filter($users, function($u) { return $u['role'] === 'admin'; }));
            if ($adminCount <= 1) {
                jsonResponse(['error' => 'Der letzte Administrator kann nicht gelöscht werden'], 400);
            }
        }
        
        // Lösche Benutzer
        array_splice($users, $userIndex, 1);
        $storage->write('users', $users);
    }
    
    jsonResponse(['message' => 'Benutzer erfolgreich gelöscht']);
}

// Ankündigungs-Management
function getAnnouncements() {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM announcements ORDER BY created_at DESC");
        $stmt->execute();
        $announcements = $stmt->fetchAll();
    } else {
        $storage = new JsonStorage();
        $announcements = $storage->read('announcements');
    }
    
    jsonResponse($announcements);
}

function createAnnouncement() {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $type = $input['type'] ?? 'info';
    $active = $input['active'] ?? true;
    
    if (empty($title) || empty($content)) {
        jsonResponse(['error' => 'Titel und Inhalt sind erforderlich'], 400);
    }
    
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("INSERT INTO announcements (title, content, type, active) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $content, $type, $active]);
        
        $announcementId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM announcements WHERE id = ?");
        $stmt->execute([$announcementId]);
        $announcement = $stmt->fetch();
    } else {
        $storage = new JsonStorage();
        $announcements = $storage->read('announcements');
        
        $newAnnouncement = [
            'id' => count($announcements) + 1,
            'title' => $title,
            'content' => $content,
            'type' => $type,
            'active' => $active,
            'created_at' => date('c')
        ];
        
        $announcements[] = $newAnnouncement;
        $storage->write('announcements', $announcements);
        $announcement = $newAnnouncement;
    }
    
    jsonResponse($announcement);
}

function updateAnnouncement($announcementId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $type = $input['type'] ?? 'info';
    $active = $input['active'] ?? true;
    
    if (empty($title) || empty($content)) {
        jsonResponse(['error' => 'Titel und Inhalt sind erforderlich'], 400);
    }
    
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("UPDATE announcements SET title = ?, content = ?, type = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$title, $content, $type, $active, $announcementId]);
        
        $stmt = $pdo->prepare("SELECT * FROM announcements WHERE id = ?");
        $stmt->execute([$announcementId]);
        $announcement = $stmt->fetch();
        
        if (!$announcement) {
            jsonResponse(['error' => 'Ankündigung nicht gefunden'], 404);
        }
    } else {
        $storage = new JsonStorage();
        $announcements = $storage->read('announcements');
        
        $announcementIndex = -1;
        foreach ($announcements as $index => $announcement) {
            if ($announcement['id'] == $announcementId) {
                $announcementIndex = $index;
                break;
            }
        }
        
        if ($announcementIndex === -1) {
            jsonResponse(['error' => 'Ankündigung nicht gefunden'], 404);
        }
        
        $announcements[$announcementIndex]['title'] = $title;
        $announcements[$announcementIndex]['content'] = $content;
        $announcements[$announcementIndex]['type'] = $type;
        $announcements[$announcementIndex]['active'] = $active;
        $announcements[$announcementIndex]['updated_at'] = date('c');
        
        $storage->write('announcements', $announcements);
        $announcement = $announcements[$announcementIndex];
    }
    
    jsonResponse($announcement);
}

function deleteAnnouncement($announcementId) {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM announcements WHERE id = ?");
        $stmt->execute([$announcementId]);
        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Ankündigung nicht gefunden'], 404);
        }
        
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
        $stmt->execute([$announcementId]);
    } else {
        $storage = new JsonStorage();
        $announcements = $storage->read('announcements');
        
        $announcementIndex = -1;
        foreach ($announcements as $index => $announcement) {
            if ($announcement['id'] == $announcementId) {
                $announcementIndex = $index;
                break;
            }
        }
        
        if ($announcementIndex === -1) {
            jsonResponse(['error' => 'Ankündigung nicht gefunden'], 404);
        }
        
        array_splice($announcements, $announcementIndex, 1);
        $storage->write('announcements', $announcements);
    }
    
    jsonResponse(['message' => 'Ankündigung erfolgreich gelöscht']);
}

// News-Management
function getNews() {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM news_articles ORDER BY created_at DESC");
        $stmt->execute();
        $news = $stmt->fetchAll();
    } else {
        $storage = new JsonStorage();
        $news = $storage->read('news');
    }
    
    jsonResponse($news);
}

function createNews() {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $excerpt = trim($input['excerpt'] ?? '');
    $published = $input['published'] ?? false;
    
    if (empty($title) || empty($content)) {
        jsonResponse(['error' => 'Titel und Inhalt sind erforderlich'], 400);
    }
    
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("INSERT INTO news_articles (title, content, excerpt, published) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $content, $excerpt ?: null, $published]);
        
        $newsId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM news_articles WHERE id = ?");
        $stmt->execute([$newsId]);
        $news = $stmt->fetch();
    } else {
        $storage = new JsonStorage();
        $newsArticles = $storage->read('news');
        
        $newNews = [
            'id' => count($newsArticles) + 1,
            'title' => $title,
            'content' => $content,
            'excerpt' => $excerpt ?: null,
            'published' => $published,
            'created_at' => date('c')
        ];
        
        $newsArticles[] = $newNews;
        $storage->write('news', $newsArticles);
        $news = $newNews;
    }
    
    jsonResponse($news);
}

function updateNews($newsId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $excerpt = trim($input['excerpt'] ?? '');
    $published = $input['published'] ?? false;
    
    if (empty($title) || empty($content)) {
        jsonResponse(['error' => 'Titel und Inhalt sind erforderlich'], 400);
    }
    
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("UPDATE news_articles SET title = ?, content = ?, excerpt = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$title, $content, $excerpt ?: null, $published, $newsId]);
        
        $stmt = $pdo->prepare("SELECT * FROM news_articles WHERE id = ?");
        $stmt->execute([$newsId]);
        $news = $stmt->fetch();
        
        if (!$news) {
            jsonResponse(['error' => 'News-Artikel nicht gefunden'], 404);
        }
    } else {
        $storage = new JsonStorage();
        $newsArticles = $storage->read('news');
        
        $newsIndex = -1;
        foreach ($newsArticles as $index => $article) {
            if ($article['id'] == $newsId) {
                $newsIndex = $index;
                break;
            }
        }
        
        if ($newsIndex === -1) {
            jsonResponse(['error' => 'News-Artikel nicht gefunden'], 404);
        }
        
        $newsArticles[$newsIndex]['title'] = $title;
        $newsArticles[$newsIndex]['content'] = $content;
        $newsArticles[$newsIndex]['excerpt'] = $excerpt ?: null;
        $newsArticles[$newsIndex]['published'] = $published;
        $newsArticles[$newsIndex]['updated_at'] = date('c');
        
        $storage->write('news', $newsArticles);
        $news = $newsArticles[$newsIndex];
    }
    
    jsonResponse($news);
}

function deleteNews($newsId) {
    $db = Database::getInstance();
    
    if ($db->isConnected()) {
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM news_articles WHERE id = ?");
        $stmt->execute([$newsId]);
        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'News-Artikel nicht gefunden'], 404);
        }
        
        $stmt = $pdo->prepare("DELETE FROM news_articles WHERE id = ?");
        $stmt->execute([$newsId]);
    } else {
        $storage = new JsonStorage();
        $newsArticles = $storage->read('news');
        
        $newsIndex = -1;
        foreach ($newsArticles as $index => $article) {
            if ($article['id'] == $newsId) {
                $newsIndex = $index;
                break;
            }
        }
        
        if ($newsIndex === -1) {
            jsonResponse(['error' => 'News-Artikel nicht gefunden'], 404);
        }
        
        array_splice($newsArticles, $newsIndex, 1);
        $storage->write('news', $newsArticles);
    }
    
    jsonResponse(['message' => 'News-Artikel erfolgreich gelöscht']);
}

// MySQL-Verwaltung
function getMySQLStatus() {
    $db = Database::getInstance();
    jsonResponse([
        'connected' => $db->isConnected(),
        'database' => $db->isConnected() ? 'MySQL' : 'JSON Files'
    ]);
}

function testMySQLConnection() {
    $input = json_decode(file_get_contents('php://input'), true);
    $host = trim($input['host'] ?? '');
    $port = intval($input['port'] ?? 3306);
    $database = trim($input['database'] ?? '');
    $user = trim($input['user'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($host) || empty($database) || empty($user)) {
        jsonResponse(['error' => 'Host, Datenbank und Benutzer sind erforderlich'], 400);
    }
    
    try {
        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        
        $pdo->query('SELECT 1');
        jsonResponse(['success' => true, 'message' => 'Verbindung erfolgreich']);
    } catch (PDOException $e) {
        $errorMessage = $e->getMessage();
        
        if (strpos($errorMessage, 'Connection refused') !== false) {
            $errorMessage = 'Verbindung verweigert. Überprüfen Sie, ob MySQL läuft und die Verbindungsdaten korrekt sind.';
        } elseif (strpos($errorMessage, 'Access denied') !== false) {
            $errorMessage = 'Zugriff verweigert. Überprüfen Sie Benutzername und Passwort.';
        } elseif (strpos($errorMessage, 'Unknown database') !== false) {
            $errorMessage = 'Datenbank nicht gefunden. Überprüfen Sie den Datenbanknamen.';
        }
        
        jsonResponse(['error' => $errorMessage], 400);
    }
}

function configureMysQL() {
    $input = json_decode(file_get_contents('php://input'), true);
    $host = trim($input['host'] ?? '');
    $port = intval($input['port'] ?? 3306);
    $database = trim($input['database'] ?? '');
    $user = trim($input['user'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($host) || empty($database) || empty($user)) {
        jsonResponse(['error' => 'Host, Datenbank und Benutzer sind erforderlich'], 400);
    }
    
    try {
        // Teste Verbindung
        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 10
        ]);
        
        $pdo->query('SELECT 1');
        
        // Speichere Konfiguration
        $config = [
            'DB_HOST' => $host,
            'DB_PORT' => $port,
            'DB_NAME' => $database,
            'DB_USER' => $user,
            'DB_PASS' => $password
        ];
        
        $configContent = "<?php\n";
        foreach ($config as $key => $value) {
            $configContent .= "define('{$key}', '" . addslashes($value) . "');\n";
        }
        $configContent .= "?>";
        
        file_put_contents('mysql-config.php', $configContent);
        
        jsonResponse(['success' => true, 'message' => 'MySQL erfolgreich konfiguriert']);
    } catch (PDOException $e) {
        $errorMessage = $e->getMessage();
        
        if (strpos($errorMessage, 'Connection refused') !== false) {
            $errorMessage = 'Verbindung verweigert. Überprüfen Sie, ob MySQL läuft und die Verbindungsdaten korrekt sind.';
        } elseif (strpos($errorMessage, 'Access denied') !== false) {
            $errorMessage = 'Zugriff verweigert. Überprüfen Sie Benutzername und Passwort.';
        } elseif (strpos($errorMessage, 'Unknown database') !== false) {
            $errorMessage = 'Datenbank nicht gefunden. Überprüfen Sie den Datenbanknamen.';
        }
        
        jsonResponse(['error' => $errorMessage], 400);
    }
}

// Minecraft Server Status
function getMinecraftStatus() {
    require_once 'minecraft-status.php';
    
    $host = $_GET['host'] ?? 'knockgames.eu';
    $port = intval($_GET['port'] ?? 25565);
    
    $serverStatus = new MinecraftServerStatus($host, $port);
    $status = $serverStatus->getServerStatus();
    
    jsonResponse($status);
}
?>