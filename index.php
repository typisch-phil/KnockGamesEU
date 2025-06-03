<?php
// KnockGames.eu - Hauptseite
require_once 'config.php';

// Lade öffentliche Daten
$db = Database::getInstance();
$announcements = [];
$news = [];

if ($db->isConnected()) {
    try {
        $pdo = $db->getConnection();
        
        // Aktive Ankündigungen laden
        $stmt = $pdo->prepare("SELECT * FROM announcements WHERE active = ? ORDER BY created_at DESC LIMIT 3");
        $stmt->execute([true]);
        $announcements = $stmt->fetchAll();
        
        // Veröffentlichte News laden
        $stmt = $pdo->prepare("SELECT * FROM news_articles WHERE published = ? ORDER BY created_at DESC LIMIT 3");
        $stmt->execute([true]);
        $news = $stmt->fetchAll();
    } catch (PDOException $e) {
        // Fallback auf JSON
        $storage = new JsonStorage();
        $announcements = array_slice(array_filter($storage->read('announcements'), function($a) { return $a['active']; }), 0, 3);
        $news = array_slice(array_filter($storage->read('news'), function($n) { return $n['published']; }), 0, 3);
    }
} else {
    // JSON-Fallback
    $storage = new JsonStorage();
    $announcements = array_slice(array_filter($storage->read('announcements'), function($a) { return $a['active']; }), 0, 3);
    $news = array_slice(array_filter($storage->read('news'), function($n) { return $n['published']; }), 0, 3);
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <meta name="description" content="KnockGames.eu - Das ultimative Minecraft Training Network für PvP, Combo Training und Speed Building. Verbessere deine Skills!">
    <meta name="keywords" content="Minecraft, Training, PvP, KnockGames, Server, Gaming">
    <title>KnockGames.eu - Minecraft Training Network</title>
    <meta name="description" content="KnockGames.eu ist Ihr ultimatives Minecraft Training Network. Verbessern Sie Ihre PvP-Fähigkeiten mit professionellen Trainingsmodulen und einer aktiven Community.">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="KnockGames.eu - Minecraft Training Network">
    <meta property="og:description" content="Verbessern Sie Ihre Minecraft PvP-Fähigkeiten mit professionellen Trainingsmodulen">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://knockgames.eu">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        header {
            background: rgba(0, 0, 0, 0.8);
            padding: 1rem 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #ff9124;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .logo:hover {
            text-shadow: 0 0 20px #ff9124;
        }

        nav ul {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        nav a {
            color: #ffffff;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        nav a:hover {
            background: #ff9124;
            color: #000;
        }

        main {
            margin-top: 80px;
            padding: 2rem 0;
        }

        .hero {
            text-align: center;
            padding: 4rem 0;
            background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23333" width="1200" height="600"/><rect fill="%23ff9124" opacity="0.1" x="100" y="100" width="200" height="200" rx="10"/><rect fill="%23ff9124" opacity="0.1" x="400" y="200" width="200" height="200" rx="10"/><rect fill="%23ff9124" opacity="0.1" x="800" y="150" width="200" height="200" rx="10"/></svg>') center/cover;
            border-radius: 15px;
            margin: 2rem 0;
        }

        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            color: #ff9124;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff9124 0%, #e67e0e 100%);
            color: #fff;
            padding: 1rem 2rem;
            text-decoration: none;
            border: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 145, 36, 0.3);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s ease;
        }

        .cta-button:hover::before {
            left: 100%;
        }

        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(255, 145, 36, 0.5);
        }

        .cta-button:active {
            transform: translateY(-1px);
        }

        .copy-success {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
            animation: copy-feedback 0.3s ease;
        }

        @keyframes copy-feedback {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .section {
            margin: 3rem 0;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 145, 36, 0.2);
        }

        .section h2 {
            color: #ff9124;
            margin-bottom: 1.5rem;
            font-size: 2rem;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .card {
            background: rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            border-radius: 10px;
            border: 1px solid rgba(255, 145, 36, 0.3);
            transition: all 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            border-color: #ff9124;
            box-shadow: 0 10px 30px rgba(255, 145, 36, 0.2);
        }

        .card h3 {
            color: #ff9124;
            margin-bottom: 1rem;
        }

        .card-type {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .type-success { background: #28a745; }
        .type-info { background: #17a2b8; }
        .type-warning { background: #ffc107; color: #000; }
        .type-error { background: #dc3545; }

        .date {
            color: #888;
            font-size: 0.9rem;
            margin-top: 1rem;
        }

        footer {
            background: rgba(0, 0, 0, 0.8);
            text-align: center;
            padding: 2rem 0;
            margin-top: 4rem;
        }

        .admin-link {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff9124;
            color: #000;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 145, 36, 0.3);
        }

        .admin-link:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(255, 145, 36, 0.5);
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        }

        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-in-out;
        }

        .modal-content {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid #ff9124;
            border-radius: 15px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(255, 145, 36, 0.3);
            animation: slideIn 0.3s ease-out;
        }

        .modal-header {
            background: linear-gradient(135deg, #ff9124 0%, #e67e0e 100%);
            color: #fff;
            padding: 1.5rem 2rem;
            border-radius: 13px 13px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            color: #fff;
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }

        .modal-body {
            padding: 2rem;
            color: #fff;
            line-height: 1.6;
        }

        .modal-meta {
            background: rgba(255, 145, 36, 0.1);
            border-left: 4px solid #ff9124;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 0 8px 8px 0;
        }

        .modal-content-text {
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
            white-space: pre-wrap;
        }

        .read-more-btn {
            background: linear-gradient(135deg, #ff9124 0%, #e67e0e 100%);
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 0.5rem;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .read-more-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 145, 36, 0.4);
        }

        .card {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(255, 145, 36, 0.2);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-50px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        /* Server Status Kacheln */
        .server-status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .status-tile {
            background: linear-gradient(135deg, rgba(255, 145, 36, 0.15) 0%, rgba(255, 145, 36, 0.05) 100%);
            backdrop-filter: blur(20px);
            border-radius: 15px;
            padding: 1.5rem 1rem;
            border: 2px solid rgba(255, 145, 36, 0.3);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            text-align: center;
            box-shadow: 0 5px 15px rgba(255, 145, 36, 0.1);
        }

        .status-tile::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 145, 36, 0.1), transparent);
            transition: left 0.6s ease;
        }

        .status-tile:hover::before {
            left: 100%;
        }

        .status-tile:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(255, 145, 36, 0.2);
            border-color: rgba(255, 145, 36, 0.5);
        }

        .tile-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            filter: drop-shadow(0 0 10px rgba(255, 145, 36, 0.5));
        }

        .tile-content {
            position: relative;
            z-index: 2;
        }

        .tile-label {
            color: #ff9124;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.3rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tile-value {
            color: #fff;
            font-size: 1.1rem;
            font-weight: bold;
        }

        .status-online {
            color: #28a745;
        }

        .status-offline {
            color: #dc3545;
        }

        .status-loading {
            color: #ffc107;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }

            header {
                padding: 0.5rem 0;
            }

            .header-content {
                flex-direction: column;
                gap: 1rem;
            }

            nav ul {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                gap: 0.8rem;
            }

            nav a {
                padding: 0.4rem 0.8rem;
                font-size: 0.9rem;
            }

            .hero {
                padding: 2rem 0;
                margin: 1rem 0;
            }

            .hero h1 {
                font-size: 2.2rem;
                margin-bottom: 1rem;
            }
            
            .hero p {
                font-size: 1rem;
                margin-bottom: 1rem;
            }

            .server-status-grid {
                grid-template-columns: 1fr;
                gap: 0.8rem;
                margin: 1.5rem 0;
                max-width: 100%;
            }

            .status-tile {
                padding: 1.2rem 1rem;
            }

            .tile-icon {
                font-size: 1.8rem;
            }

            .tile-label {
                font-size: 0.8rem;
            }

            .tile-value {
                font-size: 1rem;
            }

            .cta-button {
                padding: 0.8rem 1.5rem;
                font-size: 1rem;
                margin-top: 1.5rem;
            }

            .section {
                margin: 2rem 0;
                padding: 1.5rem;
            }

            .section h2 {
                font-size: 1.6rem;
                margin-bottom: 1rem;
            }
            
            .cards {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .card {
                padding: 1.2rem;
            }

            .card h3 {
                font-size: 1.1rem;
            }

            .card p {
                font-size: 0.9rem;
            }

            .read-more-btn {
                padding: 0.4rem 0.8rem;
                font-size: 0.8rem;
            }
            
            .modal-content {
                width: 95%;
                max-height: 90vh;
                margin: 2rem auto;
            }

            .modal-header {
                padding: 1rem 1.5rem;
            }

            .modal-title {
                font-size: 1.2rem;
            }

            .modal-body {
                padding: 1.5rem;
            }

            .modal-meta {
                padding: 0.8rem;
                margin-bottom: 1rem;
            }

            .modal-content-text {
                font-size: 1rem;
            }

            .admin-link {
                bottom: 1rem;
                right: 1rem;
                padding: 0.8rem 1.2rem;
                font-size: 0.9rem;
            }

            footer {
                padding: 1.5rem 0;
                text-align: center;
            }

            footer p {
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
        }

        @media (max-width: 480px) {
            .container {
                padding: 0 0.8rem;
            }

            .hero h1 {
                font-size: 1.8rem;
            }

            .hero p {
                font-size: 0.9rem;
            }

            .server-status-grid {
                gap: 0.6rem;
                margin: 1rem 0;
            }

            .status-tile {
                padding: 1rem 0.8rem;
            }

            .tile-icon {
                font-size: 1.6rem;
            }

            .tile-label {
                font-size: 0.75rem;
            }

            .tile-value {
                font-size: 0.9rem;
            }

            .cta-button {
                padding: 0.7rem 1.2rem;
                font-size: 0.9rem;
            }

            .section {
                padding: 1rem;
                margin: 1.5rem 0;
            }

            .section h2 {
                font-size: 1.4rem;
            }

            .card {
                padding: 1rem;
            }

            nav ul {
                gap: 0.5rem;
            }

            nav a {
                padding: 0.3rem 0.6rem;
                font-size: 0.8rem;
            }

            .logo {
                font-size: 1.3rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="/index.php" class="logo">KnockGames.eu</a>
                <nav>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#training">Training</a></li>
                        <li><a href="#community">Community</a></li>
                        <li><a href="#news">News</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <section class="hero" id="home">
                <h1>KnockGames.eu</h1>
                <p>Das ultimative Minecraft Training Network</p>
                <p>Verbessere deine PvP-Fähigkeiten mit professionellen Trainingsmodulen</p>
                
                <!-- Server Status Kacheln -->
                <div class="server-status-grid" id="serverStatus">
                    <div class="status-tile">
                        <div class="tile-icon">🟢</div>
                        <div class="tile-content">
                            <div class="tile-label">Server Status</div>
                            <div class="tile-value status-loading">Lädt...</div>
                        </div>
                    </div>
                    <div class="status-tile">
                        <div class="tile-icon">👥</div>
                        <div class="tile-content">
                            <div class="tile-label">Spieler Online</div>
                            <div class="tile-value" id="playerCount">-/-</div>
                        </div>
                    </div>
                    <div class="status-tile">
                        <div class="tile-icon">📋</div>
                        <div class="tile-content">
                            <div class="tile-label">Server Version</div>
                            <div class="tile-value" id="serverVersion">-</div>
                        </div>
                    </div>
                </div>
                
                <button class="cta-button" onclick="copyServerIP()">Server IP Kopieren</button>
            </section>

            <?php if (!empty($announcements)): ?>
            <section class="section" id="announcements">
                <h2>📢 Aktuelle Ankündigungen</h2>
                <div class="cards">
                    <?php foreach ($announcements as $index => $announcement): ?>
                    <div class="card" onclick="openModal('announcement', <?= $index ?>)">
                        <div class="card-type type-<?= htmlspecialchars($announcement['type']) ?>">
                            <?= ucfirst(htmlspecialchars($announcement['type'])) ?>
                        </div>
                        <h3><?= htmlspecialchars($announcement['title']) ?></h3>
                        <p><?= htmlspecialchars(substr($announcement['content'], 0, 150)) ?><?= strlen($announcement['content']) > 150 ? '...' : '' ?></p>
                        <button class="read-more-btn">Vollständig lesen</button>
                        <div class="date">
                            Erstellt: <?= date('d.m.Y H:i', strtotime($announcement['created_at'])) ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>

            <section class="section" id="training">
                <h2>🎯 Training Bereiche</h2>
                <div class="cards">
                    <div class="card">
                        <h3>PvP Arena</h3>
                        <p>Kämpfe gegen andere Spieler und verbessere deine Kampffähigkeiten in unserer hochmodernen PvP-Arena.</p>
                    </div>
                    <div class="card">
                        <h3>Combo Training</h3>
                        <p>Perfektioniere deine Kombos mit unseren speziellen Trainingsmodulen und KI-Gegnern.</p>
                    </div>
                    <div class="card">
                        <h3>Speed Building</h3>
                        <p>Lerne schnelles und effizientes Bauen für den Wettkampf und das Überleben.</p>
                    </div>
                </div>
            </section>

            <?php if (!empty($news)): ?>
            <section class="section" id="news">
                <h2>📰 Neueste News</h2>
                <div class="cards">
                    <?php foreach ($news as $index => $article): ?>
                    <div class="card" onclick="openModal('news', <?= $index ?>)">
                        <h3><?= htmlspecialchars($article['title']) ?></h3>
                        <p><?= htmlspecialchars(substr($article['content'], 0, 150)) ?><?= strlen($article['content']) > 150 ? '...' : '' ?></p>
                        <button class="read-more-btn">Vollständig lesen</button>
                        <div class="date">
                            Erstellt: <?= date('d.m.Y H:i', strtotime($article['created_at'])) ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>

            <section class="section" id="community">
                <h2>👥 Community</h2>
                <div class="cards">
                    <div class="card">
                        <h3>Discord Server</h3>
                        <p>Tritt unserem Discord bei und vernetze dich mit anderen Spielern aus der Community.</p>
                    </div>
                    <div class="card">
                        <h3>Events & Turniere</h3>
                        <p>Nimm an regelmäßigen Events und Turnieren teil und gewinne exklusive Belohnungen.</p>
                    </div>
                    <div class="card">
                        <h3>Leaderboard</h3>
                        <p>Sieh wo du stehst und messe dich mit den besten Spielern des Servers.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 KnockGames.eu - Alle Rechte vorbehalten</p>
            <p>Dein ultimatives Minecraft Training Network</p>
        </div>
    </footer>

    <a href="/admin/index.php" class="admin-link">Admin</a>

    <!-- Modal für Ankündigungen und News -->
    <div id="contentModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitle">Titel</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-meta" id="modalMeta">
                    <strong>Typ:</strong> <span id="modalType"></span><br>
                    <strong>Erstellt:</strong> <span id="modalDate"></span>
                </div>
                <div class="modal-content-text" id="modalText">
                    Inhalt wird geladen...
                </div>
            </div>
        </div>
    </div>

    <script>
        // Smooth scrolling für Navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Parallax Effekt für Hero Section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });

        // Daten für Modal
        const announcements = <?= json_encode($announcements) ?>;
        const news = <?= json_encode($news) ?>;

        // Modal-Funktionen
        function openModal(type, index) {
            const modal = document.getElementById('contentModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalText = document.getElementById('modalText');
            const modalMeta = document.getElementById('modalMeta');

            // Überprüfe, ob alle Elemente gefunden wurden
            if (!modal || !modalTitle || !modalText || !modalMeta) {
                console.error('Modal-Elemente nicht gefunden');
                return;
            }

            let content = null;
            let typeText = '';

            if (type === 'announcement' && announcements && announcements[index]) {
                content = announcements[index];
                typeText = content.type ? content.type.charAt(0).toUpperCase() + content.type.slice(1) : 'Ankündigung';
                modalMeta.innerHTML = `
                    <strong>Typ:</strong> <span style="color: #ff9124;">${typeText}</span><br>
                    <strong>Erstellt:</strong> ${formatDate(content.created_at)}
                `;
            } else if (type === 'news' && news && news[index]) {
                content = news[index];
                typeText = 'News Artikel';
                modalMeta.innerHTML = `
                    <strong>Typ:</strong> <span style="color: #ff9124;">${typeText}</span><br>
                    <strong>Erstellt:</strong> ${formatDate(content.created_at)}
                `;
            }

            if (content && content.title && content.content) {
                modalTitle.textContent = content.title;
                modalText.textContent = content.content;
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            } else {
                console.error('Inhalt nicht gefunden:', type, index);
            }
        }

        function closeModal() {
            const modal = document.getElementById('contentModal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        }

        // Datum formatieren
        function formatDate(dateString) {
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return 'Datum nicht verfügbar';
            }
        }

        // Event Listeners nach DOM Load
        document.addEventListener('DOMContentLoaded', function() {
            // Modal schließen bei Klick außerhalb
            const modal = document.getElementById('contentModal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal();
                    }
                });
            }

            // Modal schließen mit Escape-Taste
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });

            // Verhindere Propagation bei "Vollständig lesen" Button
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('read-more-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            // Server Status laden
            loadServerStatus();
            
            // Server Status alle 30 Sekunden aktualisieren
            setInterval(loadServerStatus, 30000);
        });

        // Server Status Abfrage
        async function loadServerStatus() {
            const statusWidget = document.getElementById('serverStatus');
            if (!statusWidget) return;

            const statusTile = statusWidget.querySelector('.tile-value.status-loading');
            const playerCountElement = document.getElementById('playerCount');
            const serverVersionElement = document.getElementById('serverVersion');
            const statusIcon = statusWidget.querySelector('.tile-icon');

            // Fallback für Demo-Zwecke - zeigt statische Informationen
            // Für echte Server-Daten benötigen wir externe API-Schlüssel oder Server-Zugang
            /*
            if (statusTile) {
                statusTile.className = 'tile-value status-online';
                statusTile.textContent = 'Online';
                statusIcon.textContent = '🟢';
            }

            if (playerCountElement) {
                playerCountElement.textContent = '15/100';
            }

            if (serverVersionElement) {
                serverVersionElement.textContent = '1.20.4';
            }
            */
            // Kommentiert aus wegen API-Fehlern - kann mit echtem Server reaktiviert werden
            
            try {
                const response = await fetch('/minecraft-status.php?host=lydoria.de&port=25565');
                const data = await response.json();

                if (data.online) {
                    statusTile.className = 'tile-value status-online';
                    statusTile.textContent = 'Online';
                    statusIcon.textContent = '🟢';

                    if (playerCountElement) {
                        playerCountElement.textContent = `${data.players.online}/${data.players.max}`;
                    }

                    if (serverVersionElement) {
                        serverVersionElement.textContent = data.version || '1.8+';
                    }
                } else {
                    statusTile.className = 'tile-value status-offline';
                    statusTile.textContent = 'Offline';
                    statusIcon.textContent = '🔴';

                    if (playerCountElement) {
                        playerCountElement.textContent = '0/0';
                    }

                    if (serverVersionElement) {
                        serverVersionElement.textContent = '-';
                    }
                }
            } catch (error) {
                statusTile.className = 'tile-value status-offline';
                statusTile.textContent = 'Wartung';
                statusIcon.textContent = '🔧';

                if (playerCountElement) {
                    playerCountElement.textContent = '-/-';
                }

                if (serverVersionElement) {
                    serverVersionElement.textContent = '-';
                }
            }
            
        }

        // Server IP kopieren Funktionalität
        async function copyServerIP() {
            const serverIP = 'knockgames.eu';
            const button = event.target;
            const originalText = button.textContent;

            try {
                await navigator.clipboard.writeText(serverIP);
                
                // Erfolgsfeedback
                button.classList.add('copy-success');
                button.textContent = '✓ IP Kopiert!';
                
                // Button nach 2 Sekunden zurücksetzen
                setTimeout(() => {
                    button.classList.remove('copy-success');
                    button.textContent = originalText;
                }, 2000);
                
            } catch (err) {
                // Fallback für ältere Browser
                const textArea = document.createElement('textarea');
                textArea.value = serverIP;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Erfolgsfeedback
                button.classList.add('copy-success');
                button.textContent = '✓ IP Kopiert!';
                
                setTimeout(() => {
                    button.classList.remove('copy-success');
                    button.textContent = originalText;
                }, 2000);
            }
        }
    </script>
</body>
</html>