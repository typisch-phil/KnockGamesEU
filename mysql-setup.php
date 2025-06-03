<?php
// KnockGames.eu - MySQL Setup und Konfiguration
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'test_connection') {
        $host = trim($_POST['host'] ?? '');
        $port = intval($_POST['port'] ?? 3306);
        $database = trim($_POST['database'] ?? '');
        $user = trim($_POST['user'] ?? '');
        $password = $_POST['password'] ?? '';
        
        try {
            // SSL-Optionen für externe Anbieter
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 15,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ];
            
            // Automatische SSL-Erkennung für externe Hosts
            $isExternal = !in_array($host, ['localhost', '127.0.0.1', '::1']);
            if ($isExternal) {
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            }
            
            // Teste Verbindung ohne Datenbank
            $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
            if ($isExternal) {
                $dsn .= ";sslmode=require";
            }
            
            $pdo = new PDO($dsn, $user, $password, $options);
            
            // Teste Datenbankzugriff und Erstellung
            if (!empty($database)) {
                $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                
                // Teste Zugriff auf spezifische Datenbank
                $dbDsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                if ($isExternal) {
                    $dbDsn .= ";sslmode=require";
                }
                $testPdo = new PDO($dbDsn, $user, $password, $options);
                $testPdo->query('SELECT 1');
            }
            
            echo json_encode([
                'success' => true, 
                'message' => 'MySQL-Verbindung erfolgreich getestet' . ($isExternal ? ' (SSL aktiviert)' : '')
            ]);
        } catch (PDOException $e) {
            $errorMsg = $e->getMessage();
            
            // Benutzerfreundliche Fehlermeldungen
            if (strpos($errorMsg, 'Access denied') !== false) {
                $errorMsg = 'Zugriff verweigert. Überprüfen Sie Benutzername und Passwort.';
            } elseif (strpos($errorMsg, 'Unknown database') !== false) {
                $errorMsg = 'Datenbank nicht gefunden. Sie wird automatisch erstellt.';
            } elseif (strpos($errorMsg, 'Connection refused') !== false) {
                $errorMsg = 'Verbindung verweigert. Überprüfen Sie Host und Port.';
            } elseif (strpos($errorMsg, 'timed out') !== false) {
                $errorMsg = 'Verbindung zeitüberschreitung. Überprüfen Sie die Netzwerkverbindung.';
            }
            
            echo json_encode(['success' => false, 'message' => 'Verbindungsfehler: ' . $errorMsg]);
        }
        exit;
    }
    
    if ($action === 'save_config') {
        $host = trim($_POST['host'] ?? '');
        $port = intval($_POST['port'] ?? 3306);
        $database = trim($_POST['database'] ?? '');
        $user = trim($_POST['user'] ?? '');
        $password = $_POST['password'] ?? '';
        
        // SSL automatisch aktivieren für externe Hosts
        $isExternal = !in_array($host, ['localhost', '127.0.0.1', '::1']);
        
        $configContent = "<?php\n";
        $configContent .= "// KnockGames.eu - MySQL Datenbankkonfiguration\n";
        $configContent .= "// Generiert am: " . date('Y-m-d H:i:s') . "\n\n";
        $configContent .= "define('DB_HOST', '" . addslashes($host) . "');\n";
        $configContent .= "define('DB_PORT', {$port});\n";
        $configContent .= "define('DB_NAME', '" . addslashes($database) . "');\n";
        $configContent .= "define('DB_USER', '" . addslashes($user) . "');\n";
        $configContent .= "define('DB_PASS', '" . addslashes($password) . "');\n";
        $configContent .= "define('DB_TYPE', 'mysql');\n";
        
        if ($isExternal) {
            $configContent .= "define('DB_SSL', true);\n";
            $configContent .= "define('DB_EXTERNAL', true);\n";
        } else {
            $configContent .= "define('DB_SSL', false);\n";
            $configContent .= "define('DB_EXTERNAL', false);\n";
        }
        
        $configContent .= "\n// Verbindungstyp: " . ($isExternal ? 'Externe Datenbank (SSL)' : 'Lokale Datenbank') . "\n";
        $configContent .= "?>";
        
        if (file_put_contents('mysql-config.php', $configContent)) {
            echo json_encode(['success' => true, 'message' => 'MySQL-Konfiguration gespeichert']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern der Konfiguration']);
        }
        exit;
    }
}

// Status der aktuellen Datenbankverbindung
$db = Database::getInstance();
$isConnected = $db->isConnected();
$currentDatabase = $isConnected ? 'MySQL' : 'JSON-Dateien';
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MySQL Setup - KnockGames.eu</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            line-height: 1.6;
            min-height: 100vh;
            padding: 2rem;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 145, 36, 0.2);
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .header h1 {
            color: #ff9124;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .status {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            border-left: 4px solid <?= $isConnected ? '#28a745' : '#ffc107' ?>;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #ff9124;
            font-weight: bold;
        }

        .form-group input {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid rgba(255, 145, 36, 0.3);
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: 1rem;
        }

        .form-group input:focus {
            outline: none;
            border-color: #ff9124;
            box-shadow: 0 0 10px rgba(255, 145, 36, 0.3);
        }

        .btn {
            background: linear-gradient(45deg, #ff9124, #ff7700);
            color: #000;
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-right: 1rem;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 145, 36, 0.3);
        }

        .btn-secondary {
            background: #6c757d;
            color: #fff;
        }

        .alert {
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
            display: none;
        }

        .alert-success {
            background: rgba(40, 167, 69, 0.2);
            border: 1px solid #28a745;
            color: #28a745;
        }

        .alert-error {
            background: rgba(220, 53, 69, 0.2);
            border: 1px solid #dc3545;
            color: #dc3545;
        }

        .back-link {
            display: inline-block;
            color: #ff9124;
            text-decoration: none;
            margin-top: 2rem;
            padding: 0.5rem 1rem;
            border: 1px solid #ff9124;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        .back-link:hover {
            background: #ff9124;
            color: #000;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .provider-btn {
            background: rgba(255, 145, 36, 0.2);
            color: #ff9124;
            border: 1px solid #ff9124;
            padding: 0.8rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
        }

        .provider-btn:hover {
            background: #ff9124;
            color: #000;
            transform: translateY(-2px);
        }

        .connection-info {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
            border-left: 3px solid #17a2b8;
            display: none;
        }

        .connection-info.show {
            display: block;
        }

        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 1rem;
                margin: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MySQL Setup</h1>
            <p>Konfigurieren Sie Ihre MySQL-Datenbankverbindung für KnockGames.eu</p>
        </div>

        <div class="provider-templates" style="margin-bottom: 2rem;">
            <h3 style="color: #ff9124; margin-bottom: 1rem;">Beliebte Anbieter</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <button class="provider-btn" onclick="loadTemplate('planetscale')">PlanetScale</button>
                <button class="provider-btn" onclick="loadTemplate('railway')">Railway</button>
                <button class="provider-btn" onclick="loadTemplate('aws')">AWS RDS</button>
                <button class="provider-btn" onclick="loadTemplate('digitalocean')">DigitalOcean</button>
                <button class="provider-btn" onclick="setupPhpMyAdmin()" style="background: rgba(40, 167, 69, 0.2); border-color: #28a745; color: #28a745;">
                    📊 phpMyAdmin Setup
                </button>
            </div>
        </div>

        <div class="status">
            <h3>Aktueller Status</h3>
            <p><strong>Datenbank:</strong> <?= $currentDatabase ?></p>
            <p><strong>Status:</strong> <?= $isConnected ? '✅ Verbunden' : '⚠️ Verwende JSON-Fallback' ?></p>
        </div>

        <div class="alert alert-success" id="success-alert"></div>
        <div class="alert alert-error" id="error-alert"></div>

        <div class="connection-info" id="connection-info">
            <h4 style="color: #17a2b8; margin-bottom: 0.5rem;">Verbindungshinweise</h4>
            <p id="provider-info"></p>
        </div>

        <form id="mysql-config-form">
            <div class="grid">
                <div class="form-group">
                    <label for="host">Host</label>
                    <input type="text" id="host" name="host" value="localhost" required>
                </div>
                <div class="form-group">
                    <label for="port">Port</label>
                    <input type="number" id="port" name="port" value="3306" required>
                </div>
            </div>

            <div class="form-group">
                <label for="database">Datenbankname</label>
                <input type="text" id="database" name="database" value="knockgames" required>
            </div>

            <div class="grid">
                <div class="form-group">
                    <label for="user">Benutzername</label>
                    <input type="text" id="user" name="user" value="root" required>
                </div>
                <div class="form-group">
                    <label for="password">Passwort</label>
                    <input type="password" id="password" name="password">
                </div>
            </div>

            <div class="form-group">
                <button type="button" class="btn" onclick="testConnection()">Verbindung testen</button>
                <button type="button" class="btn btn-secondary" onclick="saveConfig()">Konfiguration speichern</button>
            </div>
        </form>

        <a href="/admin" class="back-link">← Zurück zum Admin Panel</a>
    </div>

    <script>
        const providerTemplates = {
            planetscale: {
                port: 3306,
                info: 'PlanetScale verwendet SSL-Verbindungen. Format: [username].[database-name].psdb.cloud',
                example: 'main.knockgames.psdb.cloud'
            },
            railway: {
                port: 3306,
                info: 'Railway MySQL-Instanz. Verwenden Sie die Verbindungsdetails aus Ihrem Railway-Dashboard.',
                example: 'containers-us-west-xxx.railway.app'
            },
            aws: {
                port: 3306,
                info: 'AWS RDS MySQL-Instanz. Endpoint aus der RDS-Konsole verwenden.',
                example: 'knockgames.cluster-xxx.eu-central-1.rds.amazonaws.com'
            },
            digitalocean: {
                port: 25060,
                info: 'DigitalOcean Managed Database. SSL wird automatisch konfiguriert.',
                example: 'db-mysql-fra1-xxx-do-user-xxx.b.db.ondigitalocean.com'
            }
        };

        function loadTemplate(provider) {
            const template = providerTemplates[provider];
            if (!template) return;

            document.getElementById('port').value = template.port;
            document.getElementById('host').placeholder = template.example;
            
            const infoDiv = document.getElementById('connection-info');
            const infoText = document.getElementById('provider-info');
            
            infoText.textContent = template.info;
            infoDiv.classList.add('show');
            
            showAlert(`${provider.charAt(0).toUpperCase() + provider.slice(1)}-Vorlage geladen`, 'success');
        }

        function showAlert(message, type) {
            const successAlert = document.getElementById('success-alert');
            const errorAlert = document.getElementById('error-alert');
            
            successAlert.style.display = 'none';
            errorAlert.style.display = 'none';
            
            if (type === 'success') {
                successAlert.textContent = message;
                successAlert.style.display = 'block';
            } else {
                errorAlert.textContent = message;
                errorAlert.style.display = 'block';
            }
        }

        function testConnection() {
            const formData = new FormData();
            formData.append('action', 'test_connection');
            formData.append('host', document.getElementById('host').value);
            formData.append('port', document.getElementById('port').value);
            formData.append('database', document.getElementById('database').value);
            formData.append('user', document.getElementById('user').value);
            formData.append('password', document.getElementById('password').value);

            fetch('/mysql-setup', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(data.message, 'success');
                } else {
                    showAlert(data.message, 'error');
                }
            })
            .catch(error => {
                showAlert('Netzwerkfehler: ' + error.message, 'error');
            });
        }

        function saveConfig() {
            const formData = new FormData();
            formData.append('action', 'save_config');
            formData.append('host', document.getElementById('host').value);
            formData.append('port', document.getElementById('port').value);
            formData.append('database', document.getElementById('database').value);
            formData.append('user', document.getElementById('user').value);
            formData.append('password', document.getElementById('password').value);

            fetch('/mysql-setup', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(data.message + ' - Seite wird neu geladen...', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showAlert(data.message, 'error');
                }
            })
            .catch(error => {
                showAlert('Netzwerkfehler: ' + error.message, 'error');
            });
        }

        function setupPhpMyAdmin() {
            showAlert('Weiterleitung zu phpMyAdmin Setup...', 'success');
            setTimeout(() => {
                window.location.href = '/phpmyadmin-setup';
            }, 1000);
        }
    </script>
</body>
</html>