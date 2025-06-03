-- KnockGames.eu MySQL Database Setup
-- Execute these commands in your MySQL/phpMyAdmin to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS knockgames;
USE knockgames;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create training_programs table
CREATE TABLE IF NOT EXISTS training_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    features TEXT,
    price VARCHAR(100),
    popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT IGNORE INTO users (username, password, role, email) VALUES 
('admin', 'admin123', 'admin', 'admin@knockgames.eu');

-- Insert sample announcements
INSERT IGNORE INTO announcements (id, title, content, type, active) VALUES 
(1, 'Willkommen bei KnockGames!', 'Herzlich willkommen auf unserem Minecraft Training Server. Hier findest du die besten PvP-Trainingsmöglichkeiten.', 'success', true),
(2, 'Server Update', 'Unser Server wurde erfolgreich aktualisiert. Neue Features sind verfügbar!', 'info', true),
(3, 'Wartungsarbeiten', 'Geplante Wartungsarbeiten am Sonntag von 2-4 Uhr morgens.', 'warning', true);

-- Insert sample news articles
INSERT IGNORE INTO news_articles (id, title, content, excerpt, published) VALUES 
(1, 'Neue PvP Arena eröffnet', 'Wir freuen uns, die Eröffnung unserer brandneuen PvP Arena bekannt zu geben. Mit modernster Ausstattung und verschiedenen Kampfmodi bietet sie das ultimative Trainingsvergnügen.', 'Brandneue PvP Arena mit modernster Ausstattung jetzt verfügbar.', true),
(2, 'Training-Update 2.0', 'Das große Training-Update 2.0 ist da! Neue Übungsmodule, verbesserte KI-Gegner und erweiterte Statistiken warten auf euch.', 'Umfangreiches Update mit neuen Trainingsfeatures und Verbesserungen.', true),
(3, 'Community Event angekündigt', 'Unser erstes großes Community-Event findet nächsten Monat statt. Teilnehmer können exklusive Belohnungen und Ränge gewinnen.', 'Großes Community-Event mit exklusiven Belohnungen angekündigt.', true);

-- Insert sample training programs
INSERT IGNORE INTO training_programs (id, name, description, features, price, popular, active) VALUES 
(1, 'PvP Basis Training', 'Grundlagen des Player vs Player Kampfes', 'Schwert-Kombos, Bogen-Training, Rüstungs-Optimierung', 'Kostenlos', true, true),
(2, 'Advanced Combat', 'Fortgeschrittene Kampftechniken', 'Erweiterte Kombos, Taktiken, Team-Strategien', '9.99€', false, true),
(3, 'Pro Master Class', 'Elite Training für Fortgeschrittene', 'Individuelles Coaching, Profi-Strategien, Turnier-Vorbereitung', '24.99€', true, true);