<?php
// KnockGames.eu - Admin Panel (PHP Version)
require_once '../config.php';

// Session-Management
startSession();

// Logout-Handling
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: /admin');
    exit;
}

// Login-Handling
$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    
    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        header('Location: /admin');
        exit;
    } else {
        $loginError = 'Ungültige Anmeldedaten';
    }
}

$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// Lade Dashboard-Daten
$stats = ['users' => 0, 'announcements' => 0, 'news' => 0];
$db = Database::getInstance();

if ($db->isConnected()) {
    try {
        $pdo = $db->getConnection();
        $stmt = $pdo->query('SELECT COUNT(*) FROM users');
        $stats['users'] = $stmt->fetchColumn();
        
        $stmt = $pdo->query('SELECT COUNT(*) FROM announcements');
        $stats['announcements'] = $stmt->fetchColumn();
        
        $stmt = $pdo->query('SELECT COUNT(*) FROM news_articles');
        $stats['news'] = $stmt->fetchColumn();
    } catch (PDOException $e) {
        // Fallback auf JSON
        $storage = new JsonStorage();
        $stats['users'] = count($storage->read('users'));
        $stats['announcements'] = count($storage->read('announcements'));
        $stats['news'] = count($storage->read('news'));
    }
} else {
    $storage = new JsonStorage();
    $stats['users'] = count($storage->read('users'));
    $stats['announcements'] = count($storage->read('announcements'));
    $stats['news'] = count($storage->read('news'));
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - KnockGames.eu</title>
    <link rel="stylesheet" href="/admin/admin.css">
</head>
<body>
    <?php if (!$isLoggedIn): ?>
    <!-- Login-Formular -->
    <div class="login-container">
        <div class="login-box">
            <div class="logo">
                <h1>KnockGames.eu</h1>
                <p>Admin Panel</p>
            </div>
            
            <?php if ($loginError): ?>
            <div class="alert alert-error"><?= htmlspecialchars($loginError) ?></div>
            <?php endif; ?>
            
            <form method="POST" class="login-form">
                <div class="form-group">
                    <label for="username">Benutzername</label>
                    <input type="text" id="username" name="username" required autocomplete="username">
                </div>
                
                <div class="form-group">
                    <label for="password">Passwort</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password">
                </div>
                
                <button type="submit" name="login" class="btn btn-primary">Anmelden</button>
            </form>
            
            <div class="demo-credentials">
                <p><strong>Demo-Zugangsdaten:</strong></p>
                <p>Benutzername: admin</p>
                <p>Passwort: admin123</p>
            </div>
        </div>
    </div>
    <?php else: ?>
    <!-- Admin Dashboard -->
    <div class="admin-container">
        <nav class="admin-sidebar">
            <div class="sidebar-header">
                <h2>KnockGames.eu</h2>
                <p>Admin Panel</p>
            </div>
            
            <ul class="nav-menu">
                <li><a href="#dashboard" class="nav-link active" onclick="showSection('dashboard')">📊 Dashboard</a></li>
                <li><a href="#users" class="nav-link" onclick="showSection('users')">👥 Benutzer</a></li>
                <li><a href="#announcements" class="nav-link" onclick="showSection('announcements')">📢 Ankündigungen</a></li>
                <li><a href="#news" class="nav-link" onclick="showSection('news')">📰 News</a></li>
                <li><a href="/mysql-setup" class="nav-link">🔧 MySQL Setup</a></li>
                <li><a href="/database-admin" class="nav-link">🗄️ Datenbank</a></li>
                <li><a href="?logout=1" class="nav-link logout">🚪 Abmelden</a></li>
            </ul>
        </nav>
        
        <main class="admin-main">
            <header class="admin-header">
                <h1 id="page-title">Dashboard</h1>
                <div class="header-actions">
                    <span class="user-info">Angemeldet als: <strong><?= htmlspecialchars($_SESSION['admin_username']) ?></strong></span>
                </div>
            </header>
            
            <div class="admin-content">
                <!-- Dashboard Section -->
                <section id="dashboard-section" class="content-section active">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-info">
                                <h3><?= $stats['users'] ?></h3>
                                <p>Benutzer</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">📢</div>
                            <div class="stat-info">
                                <h3><?= $stats['announcements'] ?></h3>
                                <p>Ankündigungen</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">📰</div>
                            <div class="stat-info">
                                <h3><?= $stats['news'] ?></h3>
                                <p>News-Artikel</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">🗄️</div>
                            <div class="stat-info">
                                <h3><?= $db->isConnected() ? 'MySQL' : 'JSON' ?></h3>
                                <p>Datenbank</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <h3>Schnellaktionen</h3>
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="showSection('users')">
                                <span class="btn-icon">👥</span> Benutzer verwalten
                            </button>
                            <button class="btn btn-primary" onclick="showSection('announcements')">
                                <span class="btn-icon">📢</span> Ankündigung erstellen
                            </button>
                            <button class="btn btn-primary" onclick="showSection('news')">
                                <span class="btn-icon">📰</span> News erstellen
                            </button>
                            <a href="/mysql-setup" class="btn btn-secondary">
                                <span class="btn-icon">🔧</span> MySQL konfigurieren
                            </a>
                            <a href="/database-admin" class="btn btn-secondary">
                                <span class="btn-icon">🗄️</span> Datenbank-Admin
                            </a>
                        </div>
                    </div>
                    
                    <div class="recent-activity">
                        <h3>Systemstatus</h3>
                        <div class="status-grid">
                            <div class="status-item">
                                <div class="status-indicator <?= $db->isConnected() ? 'online' : 'offline' ?>"></div>
                                <div class="status-info">
                                    <h4>Datenbank</h4>
                                    <p><?= $db->isConnected() ? 'MySQL verbunden' : 'JSON-Modus aktiv' ?></p>
                                </div>
                            </div>
                            <div class="status-item">
                                <div class="status-indicator online"></div>
                                <div class="status-info">
                                    <h4>Admin Panel</h4>
                                    <p>Vollständig funktional</p>
                                </div>
                            </div>
                            <div class="status-item">
                                <div class="status-indicator online"></div>
                                <div class="status-info">
                                    <h4>API Services</h4>
                                    <p>Alle Services aktiv</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Benutzer Section -->
                <section id="users-section" class="content-section">
                    <div class="section-header">
                        <h3>Benutzerverwaltung</h3>
                        <button class="btn btn-primary" onclick="openUserModal()">Neuer Benutzer</button>
                    </div>
                    
                    <div class="table-container">
                        <table class="data-table" id="users-table">
                            <thead>
                                <tr>
                                    <th onclick="sortUsers('id')">ID ↕️</th>
                                    <th onclick="sortUsers('username')">Benutzername ↕️</th>
                                    <th onclick="sortUsers('email')">E-Mail ↕️</th>
                                    <th onclick="sortUsers('role')">Rolle ↕️</th>
                                    <th onclick="sortUsers('created_at')">Erstellt ↕️</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody id="users-tbody">
                                <!-- Wird via JavaScript geladen -->
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- Ankündigungen Section -->
                <section id="announcements-section" class="content-section">
                    <div class="section-header">
                        <h3>Ankündigungen</h3>
                        <button class="btn btn-primary" onclick="openAnnouncementModal()">Neue Ankündigung</button>
                    </div>
                    
                    <div class="table-container">
                        <table class="data-table" id="announcements-table">
                            <thead>
                                <tr>
                                    <th onclick="sortAnnouncements('id')">ID ↕️</th>
                                    <th onclick="sortAnnouncements('title')">Titel ↕️</th>
                                    <th onclick="sortAnnouncements('type')">Typ ↕️</th>
                                    <th onclick="sortAnnouncements('active')">Status ↕️</th>
                                    <th onclick="sortAnnouncements('created_at')">Erstellt ↕️</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody id="announcements-tbody">
                                <!-- Wird via JavaScript geladen -->
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- News Section -->
                <section id="news-section" class="content-section">
                    <div class="section-header">
                        <h3>News-Artikel</h3>
                        <button class="btn btn-primary" onclick="openNewsModal()">Neuer Artikel</button>
                    </div>
                    
                    <div class="table-container">
                        <table class="data-table" id="news-table">
                            <thead>
                                <tr>
                                    <th onclick="sortNews('id')">ID ↕️</th>
                                    <th onclick="sortNews('title')">Titel ↕️</th>
                                    <th onclick="sortNews('published')">Status ↕️</th>
                                    <th onclick="sortNews('created_at')">Erstellt ↕️</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody id="news-tbody">
                                <!-- Wird via JavaScript geladen -->
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    </div>
    
    <!-- Modals werden via JavaScript erstellt -->
    <div id="modal-container"></div>
    <?php endif; ?>
    
    <script src="/admin/admin.js"></script>
</body>
</html>