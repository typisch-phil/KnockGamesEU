<?php
// KnockGames.eu - phpMyAdmin Setup für MySQL-Datenbanken
require_once 'config.php';

session_start();

// Nur für eingeloggte Admins
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: /admin');
    exit;
}

$message = '';
$messageType = '';

// phpMyAdmin Download und Setup
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['download_phpmyadmin'])) {
        $phpMyAdminVersion = '5.2.1';
        $downloadUrl = "https://files.phpmyadmin.net/phpMyAdmin/{$phpMyAdminVersion}/phpMyAdmin-{$phpMyAdminVersion}-all-languages.zip";
        
        try {
            // Erstelle phpMyAdmin Verzeichnis
            $phpMyAdminDir = __DIR__ . '/phpmyadmin';
            if (!is_dir($phpMyAdminDir)) {
                mkdir($phpMyAdminDir, 0755, true);
            }
            
            // Download phpMyAdmin
            $zipFile = $phpMyAdminDir . '/phpmyadmin.zip';
            $zipContent = file_get_contents($downloadUrl);
            
            if ($zipContent === false) {
                throw new Exception('Download fehlgeschlagen');
            }
            
            file_put_contents($zipFile, $zipContent);
            
            // Entpacke ZIP
            $zip = new ZipArchive;
            if ($zip->open($zipFile) === TRUE) {
                $zip->extractTo($phpMyAdminDir);
                $zip->close();
                unlink($zipFile);
                
                // Verschiebe Dateien aus dem Unterordner
                $extractedDir = $phpMyAdminDir . "/phpMyAdmin-{$phpMyAdminVersion}-all-languages";
                if (is_dir($extractedDir)) {
                    $iterator = new RecursiveIteratorIterator(
                        new RecursiveDirectoryIterator($extractedDir, RecursiveDirectoryIterator::SKIP_DOTS),
                        RecursiveIteratorIterator::SELF_FIRST
                    );
                    
                    foreach ($iterator as $item) {
                        $relativePath = substr($item->getPathname(), strlen($extractedDir) + 1);
                        $target = $phpMyAdminDir . '/' . $relativePath;
                        if ($item->isDir()) {
                            if (!is_dir($target)) {
                                mkdir($target, 0755, true);
                            }
                        } else {
                            if (!is_dir(dirname($target))) {
                                mkdir(dirname($target), 0755, true);
                            }
                            copy($item, $target);
                        }
                    }
                    
                    // Lösche temporären Ordner
                    removeDirectory($extractedDir);
                }
                
                $message = 'phpMyAdmin erfolgreich heruntergeladen und installiert!';
                $messageType = 'success';
            } else {
                throw new Exception('Entpacken fehlgeschlagen');
            }
        } catch (Exception $e) {
            $message = 'Fehler beim Download: ' . $e->getMessage();
            $messageType = 'error';
        }
    }
    
    if (isset($_POST['configure_phpmyadmin'])) {
        $host = trim($_POST['host']);
        $port = trim($_POST['port']);
        $user = trim($_POST['user']);
        $password = trim($_POST['password']);
        $database = trim($_POST['database']);
        
        try {
            $configContent = generatePhpMyAdminConfig($host, $port, $user, $password, $database);
            $configFile = __DIR__ . '/phpmyadmin/config.inc.php';
            
            if (file_put_contents($configFile, $configContent)) {
                $message = 'phpMyAdmin Konfiguration erfolgreich erstellt!';
                $messageType = 'success';
            } else {
                throw new Exception('Konfigurationsdatei konnte nicht geschrieben werden');
            }
        } catch (Exception $e) {
            $message = 'Konfigurationsfehler: ' . $e->getMessage();
            $messageType = 'error';
        }
    }
}

function removeDirectory($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (is_dir($dir . "/" . $object) && !is_link($dir . "/" . $object)) {
                    removeDirectory($dir . "/" . $object);
                } else {
                    unlink($dir . "/" . $object);
                }
            }
        }
        rmdir($dir);
    }
}

function generatePhpMyAdminConfig($host, $port, $user, $password, $database) {
    $blowfishSecret = bin2hex(random_bytes(32));
    
    return "<?php
/* KnockGames.eu - phpMyAdmin Konfiguration */
declare(strict_types=1);

\$cfg['blowfish_secret'] = '{$blowfishSecret}';

/* Server configuration */
\$i = 0;

/* Server: MySQL [1] */
\$i++;
\$cfg['Servers'][\$i]['verbose'] = 'KnockGames MySQL Database';
\$cfg['Servers'][\$i]['host'] = '{$host}';
\$cfg['Servers'][\$i]['port'] = '{$port}';
\$cfg['Servers'][\$i]['socket'] = '';
\$cfg['Servers'][\$i]['auth_type'] = 'config';
\$cfg['Servers'][\$i]['user'] = '{$user}';
\$cfg['Servers'][\$i]['password'] = '{$password}';
\$cfg['Servers'][\$i]['only_db'] = '{$database}';

/* Optional: SSL Configuration */
\$cfg['Servers'][\$i]['ssl'] = true;
\$cfg['Servers'][\$i]['ssl_verify'] = false;

/* UI Settings */
\$cfg['DefaultLang'] = 'de';
\$cfg['DefaultConnectionCollation'] = 'utf8mb4_unicode_ci';
\$cfg['ShowCreateDb'] = false;
\$cfg['ShowStats'] = false;
\$cfg['ShowServerInfo'] = false;
\$cfg['ShowPhpInfo'] = false;
\$cfg['ShowChgPassword'] = false;
\$cfg['ShowDbStructureCreation'] = false;
\$cfg['ShowDbStructureLastUpdate'] = false;
\$cfg['ShowDbStructureLastCheck'] = false;

/* Theme */
\$cfg['ThemeDefault'] = 'pmahomme';

/* Upload directory */
\$cfg['UploadDir'] = '';
\$cfg['SaveDir'] = '';

/* Security */
\$cfg['CheckConfigurationPermissions'] = false;
\$cfg['TempDir'] = './tmp/';
";
}

$phpMyAdminExists = is_dir(__DIR__ . '/phpmyadmin') && file_exists(__DIR__ . '/phpmyadmin/index.php');
$configExists = file_exists(__DIR__ . '/phpmyadmin/config.inc.php');

// Lade aktuelle MySQL Konfiguration
$mysqlConfig = [];
if (file_exists('mysql_config.json')) {
    $mysqlConfig = json_decode(file_get_contents('mysql_config.json'), true) ?: [];
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>phpMyAdmin Setup - KnockGames.eu Admin</title>
    <link rel="stylesheet" href="/admin/admin.css">
    <style>
        .setup-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
        }
        
        .setup-step {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .step-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
        }
        
        .step-title {
            color: var(--light-color);
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .status-badge {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: auto;
        }
        
        .status-badge.success {
            background: var(--success-color);
            color: white;
        }
        
        .status-badge.pending {
            background: var(--warning-color);
            color: #333;
        }
        
        .phpmyadmin-link {
            display: inline-block;
            background: linear-gradient(135deg, var(--success-color), #1e7e34);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 1rem;
            transition: var(--transition);
        }
        
        .phpmyadmin-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
        }
        
        .requirements {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid var(--warning-color);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .requirements h4 {
            color: var(--warning-color);
            margin-bottom: 0.5rem;
        }
        
        .requirements ul {
            color: rgba(255, 255, 255, 0.8);
            margin-left: 1rem;
        }
    </style>
</head>
<body>
    <div class="setup-container">
        <div class="admin-header">
            <h1>phpMyAdmin Setup</h1>
            <div class="header-actions">
                <a href="/admin" class="btn btn-secondary">← Zurück zum Admin Panel</a>
            </div>
        </div>
        
        <?php if ($message): ?>
            <div class="alert alert-<?= $messageType ?> show">
                <?= htmlspecialchars($message) ?>
            </div>
        <?php endif; ?>
        
        <!-- Schritt 1: Requirements -->
        <div class="setup-step">
            <div class="step-header">
                <div class="step-number">1</div>
                <div class="step-title">Systemanforderungen</div>
                <div class="status-badge success">✓ Erfüllt</div>
            </div>
            
            <div class="requirements">
                <h4>Benötigte PHP-Erweiterungen:</h4>
                <ul>
                    <li>PHP 7.4+ (Aktuell: <?= PHP_VERSION ?>)</li>
                    <li>ZIP Extension (<?= extension_loaded('zip') ? '✓ Installiert' : '✗ Fehlt' ?>)</li>
                    <li>MySQL/MySQLi Extension (<?= extension_loaded('mysqli') ? '✓ Installiert' : '✗ Fehlt' ?>)</li>
                    <li>mbstring Extension (<?= extension_loaded('mbstring') ? '✓ Installiert' : '✗ Fehlt' ?>)</li>
                </ul>
            </div>
        </div>
        
        <!-- Schritt 2: Download phpMyAdmin -->
        <div class="setup-step">
            <div class="step-header">
                <div class="step-number">2</div>
                <div class="step-title">phpMyAdmin herunterladen</div>
                <div class="status-badge <?= $phpMyAdminExists ? 'success' : 'pending' ?>">
                    <?= $phpMyAdminExists ? '✓ Installiert' : 'Ausstehend' ?>
                </div>
            </div>
            
            <?php if (!$phpMyAdminExists): ?>
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">
                    phpMyAdmin wird automatisch heruntergeladen und konfiguriert.
                </p>
                
                <form method="POST">
                    <button type="submit" name="download_phpmyadmin" class="btn btn-primary">
                        📥 phpMyAdmin herunterladen und installieren
                    </button>
                </form>
            <?php else: ?>
                <p style="color: var(--success-color);">
                    ✓ phpMyAdmin ist bereits installiert und bereit für die Konfiguration.
                </p>
            <?php endif; ?>
        </div>
        
        <!-- Schritt 3: Konfiguration -->
        <div class="setup-step">
            <div class="step-header">
                <div class="step-number">3</div>
                <div class="step-title">MySQL-Verbindung konfigurieren</div>
                <div class="status-badge <?= $configExists ? 'success' : 'pending' ?>">
                    <?= $configExists ? '✓ Konfiguriert' : 'Ausstehend' ?>
                </div>
            </div>
            
            <?php if ($phpMyAdminExists): ?>
                <form method="POST">
                    <div class="form-group">
                        <label>MySQL Host:</label>
                        <input type="text" name="host" value="<?= htmlspecialchars($mysqlConfig['host'] ?? 'localhost') ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Port:</label>
                        <input type="number" name="port" value="<?= htmlspecialchars($mysqlConfig['port'] ?? '3306') ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Benutzername:</label>
                        <input type="text" name="user" value="<?= htmlspecialchars($mysqlConfig['username'] ?? '') ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Passwort:</label>
                        <input type="password" name="password" value="<?= htmlspecialchars($mysqlConfig['password'] ?? '') ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Datenbank:</label>
                        <input type="text" name="database" value="<?= htmlspecialchars($mysqlConfig['database'] ?? 'knockgames') ?>" required>
                    </div>
                    
                    <button type="submit" name="configure_phpmyadmin" class="btn btn-primary">
                        🔧 phpMyAdmin konfigurieren
                    </button>
                </form>
            <?php else: ?>
                <p style="color: rgba(255, 255, 255, 0.6);">
                    Bitte installieren Sie zuerst phpMyAdmin in Schritt 2.
                </p>
            <?php endif; ?>
        </div>
        
        <!-- Schritt 4: Zugriff -->
        <?php if ($phpMyAdminExists && $configExists): ?>
        <div class="setup-step">
            <div class="step-header">
                <div class="step-number">4</div>
                <div class="step-title">phpMyAdmin öffnen</div>
                <div class="status-badge success">✓ Bereit</div>
            </div>
            
            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">
                phpMyAdmin ist jetzt konfiguriert und einsatzbereit. Sie können die Datenbank-Verwaltungsoberfläche über den folgenden Link öffnen:
            </p>
            
            <a href="/phpmyadmin" class="phpmyadmin-link" target="_blank">
                🗄️ phpMyAdmin öffnen
            </a>
            
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(23, 162, 184, 0.1); border-radius: 8px; border-left: 4px solid var(--info-color);">
                <h4 style="color: var(--info-color); margin-bottom: 0.5rem;">Sicherheitshinweise:</h4>
                <ul style="color: rgba(255, 255, 255, 0.8); margin-left: 1rem;">
                    <li>phpMyAdmin sollte nur für Entwicklung und Testing verwendet werden</li>
                    <li>Für Produktionsumgebungen zusätzliche Sicherheitsmaßnahmen implementieren</li>
                    <li>Regelmäßige Backups der Datenbank erstellen</li>
                </ul>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Zusätzliche Informationen -->
        <div class="setup-step">
            <div class="step-header">
                <div class="step-number">ℹ️</div>
                <div class="step-title">Weitere Informationen</div>
            </div>
            
            <div style="color: rgba(255, 255, 255, 0.8);">
                <h4 style="color: var(--light-color); margin-bottom: 1rem;">Unterstützte MySQL-Provider:</h4>
                <ul style="margin-left: 1rem; margin-bottom: 1.5rem;">
                    <li>PlanetScale (MySQL-kompatibel)</li>
                    <li>Railway MySQL</li>
                    <li>AWS RDS MySQL</li>
                    <li>DigitalOcean Managed MySQL</li>
                    <li>Google Cloud SQL</li>
                    <li>Azure Database for MySQL</li>
                </ul>
                
                <h4 style="color: var(--light-color); margin-bottom: 1rem;">Problembehandlung:</h4>
                <ul style="margin-left: 1rem;">
                    <li>Bei Verbindungsproblemen SSL-Einstellungen überprüfen</li>
                    <li>Firewall-Regeln für ausgehende Verbindungen kontrollieren</li>
                    <li>MySQL-Benutzerrechte für externe Verbindungen verifizieren</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>