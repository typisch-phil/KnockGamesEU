<?php
// Router für den PHP-Entwicklungsserver
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Entferne Query-Parameter
$requestUri = strtok($requestUri, '?');

// Statische Dateien direkt ausliefern (CSS, JS, Bilder)
$filePath = $_SERVER['DOCUMENT_ROOT'] . $requestUri;
if ($requestUri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    // Setze richtige Content-Type Headers
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    switch ($extension) {
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
        case 'gif':
            header('Content-Type: image/gif');
            break;
        case 'svg':
            header('Content-Type: image/svg+xml');
            break;
    }
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

if ($requestUri === '/mysql-setup' || $requestUri === '/mysql-setup/') {
    require_once 'mysql-setup.php';
    return;
}

// Hauptseite - Verwende PHP-Version
if ($requestUri === '/') {
    require_once 'index.php';
    return;
}

// Test-Seite
if ($requestUri === '/test') {
    require_once 'test-php.php';
    return;
}

// 404 für alles andere
http_response_code(404);
echo "<h1>404 - Seite nicht gefunden</h1>";
echo "<p>Die angeforderte Seite existiert nicht.</p>";
echo "<a href='/'>Zurück zur Hauptseite</a>";
?>