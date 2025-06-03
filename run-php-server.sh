#!/bin/bash
echo "=== KnockGames.eu PHP Server ==="
echo "Starte PHP-Server auf Port 5000..."

# Erstelle data-Verzeichnis falls nicht vorhanden
mkdir -p ./data

echo "Server läuft auf http://0.0.0.0:5000"
echo "Admin Panel: http://0.0.0.0:5000/admin"
echo "Standard Admin-Zugangsdaten: admin/admin123"
echo "MySQL-Setup: http://0.0.0.0:5000/admin/mysql-setup"
echo ""
echo "Server startet... (Strg+C zum Beenden)"

# Starte PHP-Entwicklungsserver
php -S 0.0.0.0:5000 -t . router.php