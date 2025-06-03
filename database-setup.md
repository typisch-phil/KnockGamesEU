# KnockGames.eu - Externe MySQL-Datenbank Setup

## Unterstützte MySQL-Anbieter

### 1. PlanetScale (Empfohlen)
- Kostenlose Stufe verfügbar
- Automatische Skalierung
- Globale Replikation

### 2. Railway
- Einfache Einrichtung
- Automatische Backups
- Entwicklerfreundlich

### 3. AWS RDS MySQL
- Enterprise-Grade
- Hochverfügbarkeit
- Automatische Backups

### 4. Google Cloud SQL
- Vollständig verwaltet
- Automatische Updates
- Hochleistung

### 5. DigitalOcean Managed Databases
- Einfache Verwaltung
- SSD-Storage
- Automatische Failover

## Erforderliche Verbindungsdaten

Für die Konfiguration benötigen Sie:

1. **Host/Server** - z.B. mysql-1234.planetscale.app
2. **Port** - Standardmäßig 3306
3. **Datenbankname** - z.B. knockgames_production
4. **Benutzername** - Ihr Datenbankbenutzer
5. **Passwort** - Ihr Datenbankpasswort

## SSL-Verbindung

Die meisten externen MySQL-Anbieter erfordern SSL-Verbindungen. Das System unterstützt automatisch:
- SSL-verschlüsselte Verbindungen
- Zertifikat-Validierung
- Sichere Authentifizierung

## Automatische Tabellenerstellung

Das System erstellt automatisch alle benötigten Tabellen:
- `users` - Benutzerverwaltung
- `announcements` - Ankündigungen
- `news_articles` - News-Artikel

## Konfiguration über Admin Panel

Besuchen Sie: `/mysql-setup` um Ihre externe Datenbank zu konfigurieren.