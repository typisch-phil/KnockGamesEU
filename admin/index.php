<?php
// KnockGames.eu - Admin Panel (PHP Version)
require_once '../config.php';

// Session-Management
startSession();

// Logout-Handling
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: /admin/index.php');
    exit;
}

// Login-Handling
$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    
    $loginSuccess = false;
    
    // Prüfe Standard-Admin-Account
    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['admin_role'] = 'admin';
        $loginSuccess = true;
    } else {
        // Prüfe Benutzer aus Datenbank/JSON
        $db = Database::getInstance();
        
        if ($db->isConnected()) {
            try {
                $pdo = $db->getConnection();
                $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND (role = 'admin' OR role = 'moderator')");
                $stmt->execute([$username]);
                $user = $stmt->fetch();
                
                if ($user && password_verify($password, $user['password'])) {
                    $_SESSION['admin_logged_in'] = true;
                    $_SESSION['admin_username'] = $user['username'];
                    $_SESSION['admin_role'] = $user['role'];
                    $_SESSION['admin_user_id'] = $user['id'];
                    $loginSuccess = true;
                }
            } catch (PDOException $e) {
                // Fallback auf JSON
            }
        }
        
        // Fallback: JSON-Storage
        if (!$loginSuccess) {
            $storage = new JsonStorage();
            $users = $storage->read('users');
            
            foreach ($users as $user) {
                if ($user['username'] === $username && 
                    ($user['role'] === 'admin' || $user['role'] === 'moderator') &&
                    password_verify($password, $user['password'])) {
                    $_SESSION['admin_logged_in'] = true;
                    $_SESSION['admin_username'] = $user['username'];
                    $_SESSION['admin_role'] = $user['role'];
                    $_SESSION['admin_user_id'] = $user['id'];
                    $loginSuccess = true;
                    break;
                }
            }
        }
    }
    
    if ($loginSuccess) {
        header('Location: /admin/index.php');
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
                <li><a href="admin/mysql-setup.php" class="nav-link">🔧 MySQL Setup</a></li>
                <li><a href="?logout=1" class="nav-link logout">🚪 Abmelden</a></li>
            </ul>
        </nav>
        
        <main class="admin-main">
            <header class="admin-header">
                <div class="header-left">
                    <button class="mobile-menu-btn" onclick="toggleMobileMenu()" style="display: none;">☰</button>
                    <h1 id="page-title">Dashboard</h1>
                </div>
                <div class="header-actions">
                    <a href="/index.php" class="btn btn-secondary" style="margin-right: 1rem;">
                        <i class="fas fa-home"></i> Zurück zur Homepage
                    </a>
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
                            <a href="admin/mysql-setup.php" class="btn btn-secondary">
                                <span class="btn-icon">🔧</span> MySQL konfigurieren
                            </a>
                            <a href="admin/phpmyadmin-setup.php" class="btn btn-secondary">
                                <span class="btn-icon">⚙️</span> phpMyAdmin Setup
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
                                    <th onclick="sortNews('excerpt')">Inhalt ↕️</th>
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
    
    <!-- CRUD Modals -->
    
    <!-- Benutzer Modal -->
    <div id="userModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="userModalTitle">Neuer Benutzer</h3>
                <button class="modal-close" onclick="closeUserModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="userForm">
                    <div class="form-group">
                        <label>Benutzername *</label>
                        <input type="text" id="userUsername" required>
                    </div>
                    <div class="form-group">
                        <label>Passwort *</label>
                        <input type="password" id="userPassword" required>
                    </div>
                    <div class="form-group">
                        <label>E-Mail</label>
                        <input type="email" id="userEmail">
                    </div>
                    <div class="form-group">
                        <label>Rolle</label>
                        <select id="userRole">
                            <option value="user">Benutzer</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeUserModal()">Abbrechen</button>
                <button type="button" class="btn btn-primary" onclick="saveUser()">Speichern</button>
            </div>
        </div>
    </div>

    <!-- Ankündigung Modal -->
    <div id="announcementModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="announcementModalTitle">Neue Ankündigung</h3>
                <button class="modal-close" onclick="closeAnnouncementModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="announcementForm">
                    <div class="form-group">
                        <label>Titel *</label>
                        <input type="text" id="announcementTitle" required>
                    </div>
                    <div class="form-group">
                        <label>Typ</label>
                        <select id="announcementType">
                            <option value="info">Info</option>
                            <option value="success">Erfolg</option>
                            <option value="warning">Warnung</option>
                            <option value="error">Fehler</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Inhalt *</label>
                        <textarea id="announcementContent" rows="5" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="announcementActive" checked>
                            Aktiv
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeAnnouncementModal()">Abbrechen</button>
                <button type="button" class="btn btn-primary" onclick="saveAnnouncement()">Speichern</button>
            </div>
        </div>
    </div>

    <!-- News Modal -->
    <div id="newsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="newsModalTitle">Neuer Artikel</h3>
                <button class="modal-close" onclick="closeNewsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="newsForm">
                    <div class="form-group">
                        <label>Titel *</label>
                        <input type="text" id="newsTitle" required>
                    </div>
                    <div class="form-group">
                        <label>Kurzbeschreibung</label>
                        <textarea id="newsExcerpt" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Inhalt *</label>
                        <textarea id="newsContent" rows="8" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="newsPublished" checked>
                            Veröffentlicht
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeNewsModal()">Abbrechen</button>
                <button type="button" class="btn btn-primary" onclick="saveNews()">Speichern</button>
            </div>
        </div>
    </div>
    <?php endif; ?>
    
    <script src="/admin/admin-clean.js"></script>
</body>
</html>