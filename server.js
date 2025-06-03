// KnockGames.eu PHP Server Starter
console.log('=== KnockGames.eu PHP Server ===');
console.log('Starte PHP-Server...');

const { spawn } = require('child_process');
const fs = require('fs');

// Erstelle data-Verzeichnis falls nicht vorhanden
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
    console.log('Data-Verzeichnis erstellt.');
}

// Initialisiere JSON-Dateien falls nicht vorhanden
const initData = {
    'users.json': [],
    'announcements.json': [],
    'news.json': []
};

Object.entries(initData).forEach(([filename, defaultData]) => {
    const filepath = `./data/${filename}`;
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
        console.log(`${filename} erstellt.`);
    }
});

// Starte PHP-Server
const phpServer = spawn('php', ['-S', '0.0.0.0:5000', '-t', '.', 'router.php'], {
    stdio: 'inherit'
});

console.log('Server läuft auf http://0.0.0.0:5000');
console.log('Admin Panel: http://0.0.0.0:5000/admin');
console.log('Standard Admin-Zugangsdaten: admin/admin123');
console.log('MySQL-Datenbank konfiguriert (mit JSON-Fallback)');
console.log('');

phpServer.on('error', (err) => {
    console.error('PHP-Server Fehler:', err);
});

phpServer.on('close', (code) => {
    console.log(`PHP-Server beendet mit Code ${code}`);
});