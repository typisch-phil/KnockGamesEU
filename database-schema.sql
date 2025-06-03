-- KnockGames.eu - MySQL Database Schema
-- Erstellt automatisch durch das Admin Panel

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    role ENUM('admin', 'user', 'moderator') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ankündigungen-Tabelle
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('success', 'info', 'warning', 'error') DEFAULT 'info',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- News-Artikel-Tabelle
CREATE TABLE IF NOT EXISTS news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Session-Tabelle für Admin-Sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Standard Admin-Benutzer erstellen (falls nicht vorhanden)
INSERT IGNORE INTO users (username, password, email, role) 
VALUES ('admin', 'admin123', 'admin@knockgames.eu', 'admin');

-- Beispiel-Ankündigungen
INSERT IGNORE INTO announcements (title, content, type, active) VALUES 
('Willkommen im KnockGames.eu Admin Panel', 'Das Admin Panel ist jetzt vollständig funktionsfähig. Sie können Benutzer, Ankündigungen und News verwalten.', 'success', TRUE),
('Datenbank erfolgreich konfiguriert', 'Die MySQL-Datenbank wurde erfolgreich eingerichtet und ist einsatzbereit.', 'info', TRUE);

-- Beispiel-News
INSERT IGNORE INTO news_articles (title, content, excerpt, published) VALUES 
('KnockGames.eu geht online', 'Willkommen bei KnockGames.eu - dem ultimativen Minecraft Training Network. Hier findest du professionelle Trainingsmodule für PvP, Building und mehr.', 'Das neue Minecraft Training Network ist online', TRUE),
('Neue Features im Admin Panel', 'Das Admin Panel wurde mit vollständigen CRUD-Funktionen für Benutzer, Ankündigungen und News ausgestattet. Administratoren können jetzt alle Inhalte einfach verwalten.', 'Admin Panel wurde erweitert', TRUE);