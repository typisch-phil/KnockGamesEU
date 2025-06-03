<?php
// Router für den PHP-Entwicklungsserver
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Entferne Query-Parameter
$requestUri = strtok($requestUri, '?');

// Statische Dateien direkt ausliefern
$filePath = $_SERVER['DOCUMENT_ROOT'] . $requestUri;
if ($requestUri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false; // Lass PHP die Datei direkt ausliefern
}

// API-Routen
if (strpos($requestUri, '/api/') === 0) {
    require_once 'api.php';
    return;
}

// Admin-Routen
if ($requestUri === '/admin' || $requestUri === '/admin/') {
    require_once 'admin/index.html';
    return;
}

if ($requestUri === '/admin/mysql-setup' || $requestUri === '/admin/mysql-setup/') {
    require_once 'admin/mysql-setup.html';
    return;
}

// Hauptseite
if ($requestUri === '/') {
    require_once 'index.html';
    return;
}

// 404 für alles andere
http_response_code(404);
echo "404 - Seite nicht gefunden";
?>