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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            background: linear-gradient(45deg, #ff9124, #ff7700);
            color: #000;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 145, 36, 0.3);
        }

        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(255, 145, 36, 0.5);
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

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero p {
                font-size: 1.1rem;
            }
            
            nav ul {
                flex-direction: column;
                gap: 1rem;
            }
            
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }

            .modal-content {
                width: 95%;
                max-height: 90vh;
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
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">KnockGames.eu</a>
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
                <a href="#training" class="cta-button">Jetzt trainieren</a>
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

    <a href="/admin" class="admin-link">Admin</a>

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
        });
    </script>
</body>
</html>