<?php
// Test-Datei für PHP-Funktionalität
echo "PHP funktioniert!<br>";
echo "PHP Version: " . phpversion() . "<br>";

// Teste MySQL-Erweiterung
if (extension_loaded('pdo_mysql')) {
    echo "MySQL PDO-Erweiterung ist verfügbar<br>";
} else {
    echo "MySQL PDO-Erweiterung ist NICHT verfügbar<br>";
}

// Teste Datei-/Verzeichniszugriff
if (is_writable('.')) {
    echo "Schreibzugriff auf aktuelles Verzeichnis: Ja<br>";
} else {
    echo "Schreibzugriff auf aktuelles Verzeichnis: Nein<br>";
}

// Teste JSON-Funktionen
$testData = ['test' => 'data', 'number' => 123];
$json = json_encode($testData);
echo "JSON-Test: " . $json . "<br>";

// Teste Session-Funktionalität
session_start();
$_SESSION['test'] = 'PHP Session funktioniert';
echo "Session-Test: " . $_SESSION['test'] . "<br>";

echo "<hr>";
echo "Alle Tests abgeschlossen. System bereit für KnockGames.eu!";
?>