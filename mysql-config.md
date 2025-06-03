# MySQL Konfiguration für KnockGames Admin Panel

## Umgebungsvariablen

Für die MySQL-Verbindung können Sie folgende Umgebungsvariablen setzen:

```bash
MYSQL_HOST=localhost          # oder Ihre MySQL-Server-Adresse
MYSQL_USER=root              # Ihr MySQL-Benutzername
MYSQL_PASSWORD=              # Ihr MySQL-Passwort
MYSQL_DATABASE=knockgames    # Name der Datenbank
MYSQL_PORT=3306              # MySQL-Port (Standard: 3306)
```

## Automatische Datenbank-Erstellung

Das System erstellt automatisch:

1. **Datenbank** `knockgames` (falls nicht vorhanden)
2. **Tabellen**:
   - `users` - Benutzer mit Admin-Rechten
   - `announcements` - Ankündigungen für die Website
   - `news_articles` - News-Artikel für die Website
   - `training_programs` - Training-Programme

## Standard-Admin-Zugang

- **Benutzername:** admin
- **Passwort:** admin123

## Admin Panel Features

- **Benutzer-Verwaltung:** Neue Benutzer anlegen, bearbeiten, löschen
- **Ankündigungen:** Erstellen und verwalten von Website-Ankündigungen
- **News-Artikel:** Erstellen und publizieren von News-Artikeln
- **Training-Programme:** Verwalten von Trainingsprogrammen

## Zugang zum Admin Panel

Nach dem Server-Start: http://localhost:5000/admin