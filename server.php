<?php
// Einfacher PHP-Entwicklungsserver für KnockGames.eu
$host = '0.0.0.0';
$port = 5000;

echo "KnockGames.eu PHP Server starting...\n";
echo "Server running on http://{$host}:{$port}\n";
echo "Admin Panel: http://{$host}:{$port}/admin\n";
echo "Default admin credentials: admin/admin123\n";

// Starte den eingebauten PHP-Server
$command = "php -S {$host}:{$port} -t . router.php";
passthru($command);
?>