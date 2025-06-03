<?php
// KnockGames.eu PHP Server Starter
echo "=== KnockGames.eu PHP Server ===\n";
echo "Initialisiere System...\n";

// Erstelle data-Verzeichnis falls nicht vorhanden
if (!is_dir('./data')) {
    mkdir('./data', 0755, true);
    echo "Data-Verzeichnis erstellt.\n";
}

// Lade Konfiguration
require_once 'config.php';

echo "System initialisiert.\n";
echo "Server startet auf http://0.0.0.0:5000\n";
echo "Admin Panel: http://0.0.0.0:5000/admin\n";
echo "Standard Admin-Zugangsdaten: admin/admin123\n";
echo "MySQL-Setup: http://0.0.0.0:5000/admin/mysql-setup\n";
echo "\nServer läuft... (Strg+C zum Beenden)\n";

// Starte den PHP-Server
$command = 'php -S 0.0.0.0:5000 -t . router.php';
passthru($command);
?>