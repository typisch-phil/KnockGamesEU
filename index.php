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
    <link rel="icon" type="image/png" href="attached_assets/knockgameseu.png">
    <link rel="shortcut icon" type="image/png" href="attached_assets/knockgameseu.png">
    <link rel="apple-touch-icon" href="attached_assets/knockgameseu.png">
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 2rem;
            font-weight: bold;
            color: #ff9124;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .logo:hover {
            text-shadow: 0 0 20px #ff9124;
            transform: scale(1.05);
        }

        .logo img {
            width: 40px;
            height: 40px;
            object-fit: contain;
            filter: drop-shadow(0 0 5px rgba(255, 145, 36, 0.5));
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
            position: relative;
        }

        nav a:hover,
        nav a.active {
            background: #ff9124;
            color: #000;
            box-shadow: 0 0 15px rgba(255, 145, 36, 0.4);
        }

        nav a.active::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            background: #ff9124;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(255, 145, 36, 0.6);
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

        /* Animated Server Dashboard */
        .server-dashboard {
            background: linear-gradient(135deg, rgba(255, 145, 36, 0.1) 0%, rgba(255, 145, 36, 0.05) 100%);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 2rem;
            border: 2px solid rgba(255, 145, 36, 0.3);
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(255, 145, 36, 0.15);
            animation: dashboardFloat 6s ease-in-out infinite;
        }

        @keyframes dashboardFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255, 145, 36, 0.2);
            padding-bottom: 1rem;
        }

        .dashboard-header h3 {
            color: #ff9124;
            font-size: 1.4rem;
            font-weight: 700;
            text-shadow: 0 0 10px rgba(255, 145, 36, 0.3);
        }

        .refresh-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }

        .pulse-dot {
            width: 8px;
            height: 8px;
            background: #28a745;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .status-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border-radius: 15px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            animation: cardSlideIn 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }

        @keyframes cardSlideIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .status-card:nth-child(1) { animation-delay: 0.1s; }
        .status-card:nth-child(2) { animation-delay: 0.2s; }
        .status-card:nth-child(3) { animation-delay: 0.3s; }
        .status-card:nth-child(4) { animation-delay: 0.4s; }

        .status-card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 15px 35px rgba(255, 145, 36, 0.2);
            border-color: rgba(255, 145, 36, 0.4);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 1rem;
        }

        .status-icon, .player-icon, .version-icon, .perf-icon {
            font-size: 1.8rem;
            filter: drop-shadow(0 0 8px rgba(255, 145, 36, 0.4));
            animation: iconRotate 4s linear infinite;
        }

        @keyframes iconRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .card-title {
            color: #ff9124;
            font-weight: 600;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .card-content {
            position: relative;
            z-index: 2;
        }

        .status-value, .player-count, .version-value, .tps-value {
            color: #fff;
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            transition: all 0.3s ease;
        }

        .status-uptime, .ping-value {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
        }

        .player-bar, .performance-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-top: 0.5rem;
        }

        .player-fill, .performance-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff9124, #ff7a00);
            border-radius: 3px;
            width: 0%;
            transition: width 1s ease-out;
            position: relative;
        }

        .player-fill::after, .performance-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: barShine 2s infinite;
        }

        @keyframes barShine {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        .card-animation {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 4px;
            overflow: hidden;
        }

        .wave {
            position: absolute;
            bottom: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, #ff9124, transparent);
            animation: wave 3s linear infinite;
        }

        .wave:nth-child(2) { animation-delay: 1s; }
        .wave:nth-child(3) { animation-delay: 2s; }

        @keyframes wave {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        .dashboard-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 145, 36, 0.2);
        }

        .last-update {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
        }

        .dashboard-buttons {
            display: flex;
            gap: 0.8rem;
        }

        .refresh-btn, .copy-ip-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 25px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.9rem;
        }

        .refresh-btn {
            background: linear-gradient(135deg, #ff9124, #ff7a00);
        }

        .copy-ip-btn {
            background: linear-gradient(135deg, #28a745, #20c997);
        }

        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 145, 36, 0.4);
            background: linear-gradient(135deg, #ff7a00, #ff6500);
        }

        .copy-ip-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
            background: linear-gradient(135deg, #20c997, #17a2b8);
        }

        .refresh-icon, .copy-icon {
            transition: transform 0.3s ease;
        }

        .refresh-btn:hover .refresh-icon {
            transform: rotate(180deg);
        }

        .copy-ip-btn:hover .copy-icon {
            transform: scale(1.2);
        }

        .status-online {
            color: #28a745;
            text-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
        }

        .status-offline {
            color: #dc3545;
            text-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
        }

        .status-loading {
            color: #ffc107;
            text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
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

            .server-dashboard {
                padding: 1.5rem;
                margin: 1rem 0;
            }

            .dashboard-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .dashboard-header {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }

            .dashboard-footer {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }

            .dashboard-buttons {
                flex-direction: column;
                width: 100%;
                gap: 0.5rem;
            }

            .refresh-btn, .copy-ip-btn {
                padding: 0.7rem 1.2rem;
                font-size: 0.8rem;
                width: 100%;
                justify-content: center;
            }

            .status-card {
                padding: 1rem;
            }

            .card-header {
                gap: 0.5rem;
            }

            .status-icon, .player-icon, .version-icon, .perf-icon {
                font-size: 1.5rem;
            }

            /* Mobile Spacer Anpassung - größere Abstände für kleine Bildschirme */
            .section + div[style*="height: 250px"] {
                height: 450px !important;
            }
            
            /* Extra Abstand für sehr kleine Handys */
            @media (max-width: 480px) {
                .section + div[style*="height: 250px"] {
                    height: 500px !important;
                }
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
            
            .logo img {
                width: 32px;
                height: 32px;
            }
        }

        /* Footer Styles */
        footer {
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
            backdrop-filter: blur(20px);
            padding: 3rem 0 1rem 0;
            margin-top: 3rem;
            border-top: 2px solid rgba(255, 145, 36, 0.3);
        }

        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .footer-section h3 {
            color: #ff9124;
            font-size: 1.4rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 10px rgba(255, 145, 36, 0.3);
        }

        .footer-section h4 {
            color: #ff9124;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .footer-section p {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .footer-section ul {
            list-style: none;
            padding: 0;
        }

        .footer-section ul li {
            margin-bottom: 0.5rem;
        }

        .footer-section ul li a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .footer-section ul li a:hover {
            color: #ff9124;
            padding-left: 5px;
        }

        .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }

        .social-link {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(255, 145, 36, 0.1);
            border: 1px solid rgba(255, 145, 36, 0.3);
            border-radius: 5px;
            color: #ff9124;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            background: rgba(255, 145, 36, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 145, 36, 0.3);
        }

        .footer-bottom {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 145, 36, 0.2);
        }

        .footer-bottom p {
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }

        /* Footer Mobile Responsiveness */
        @media (max-width: 768px) {
            .footer-content {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .social-links {
                justify-content: center;
            }

            .footer-section {
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="/index.php" class="logo">
                    <img src="attached_assets/knockgameseu.png" alt="KnockGames.eu Logo">
                    KnockGames.eu
                </a>
                <nav>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#announcements">Ankündigungen</a></li>
                        <li><a href="#training">Training</a></li>
                        <li><a href="#news">News</a></li>
                        <li><a href="#community">Community</a></li>
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
                
                <!-- Animated Server Status Mini-Dashboard -->
                <div class="server-dashboard" id="serverDashboard">
                    <div class="dashboard-header">
                        <h3>Live Server Status</h3>
                        <div class="refresh-indicator" id="refreshIndicator">
                            <div class="pulse-dot"></div>
                            <span>Live</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-grid">
                        <div class="status-card primary" id="statusCard">
                            <div class="card-header">
                                <div class="status-icon" id="statusIcon">🔄</div>
                                <div class="card-title">Server Status</div>
                            </div>
                            <div class="card-content">
                                <div class="status-value" id="statusValue">Verbindung...</div>
                                <div class="status-uptime" id="uptimeValue">Prüfung läuft</div>
                            </div>
                            <div class="card-animation">
                                <div class="wave"></div>
                                <div class="wave"></div>
                                <div class="wave"></div>
                            </div>
                        </div>
                        
                        <div class="status-card players" id="playersCard">
                            <div class="card-header">
                                <div class="player-icon">👥</div>
                                <div class="card-title">Spieler Online</div>
                            </div>
                            <div class="card-content">
                                <div class="player-count" id="playerCount">-/-</div>
                                <div class="player-bar">
                                    <div class="player-fill" id="playerFill"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="status-card version" id="versionCard">
                            <div class="card-header">
                                <div class="version-icon">📋</div>
                                <div class="card-title">Server Info</div>
                            </div>
                            <div class="card-content">
                                <div class="version-value" id="serverVersion">-</div>
                                <div class="ping-value" id="pingValue">Ping: -ms</div>
                            </div>
                        </div>
                        
                        <div class="status-card performance" id="performanceCard">
                            <div class="card-header">
                                <div class="perf-icon">⚡</div>
                                <div class="card-title">Performance</div>
                            </div>
                            <div class="card-content">
                                <div class="tps-value" id="tpsValue">TPS: 20.0</div>
                                <div class="performance-bar">
                                    <div class="performance-fill" id="performanceFill"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-footer">
                        <div class="last-update">Letzte Aktualisierung: <span id="lastUpdate">-</span></div>
                        <div class="dashboard-buttons">
                            <button class="copy-ip-btn" onclick="copyServerIP()">
                                <span class="copy-icon">📋</span>
                                Server IP Kopieren
                            </button>
                            <button class="refresh-btn" id="manualRefresh" onclick="refreshServerStatus()">
                                <span class="refresh-icon">🔄</span>
                                Aktualisieren
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Spacer zwischen Live Server Status und Ankündigungen -->
            <div style="height: 250px;"></div>

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
                        <p>Tritt unserem Discord bei und vernetze dich mit anderen Spielern aus der Community. Hier findest du immer Mitspieler für Training und PvP.</p>
                    </div>
                    <div class="card">
                        <h3>Events & Turniere</h3>
                        <p>Nimm an regelmäßigen Events und Turnieren teil und gewinne exklusive Belohnungen. Wöchentliche PvP-Turniere mit attraktiven Preisen.</p>
                    </div>
                    <div class="card">
                        <h3>Leaderboard</h3>
                        <p>Sieh wo du stehst und messe dich mit den besten Spielern des Servers. Kämpfe um den ersten Platz in verschiedenen Kategorien.</p>
                    </div>
                    <div class="card">
                        <h3>Team Recruitment</h3>
                        <p>Finde dein perfektes Team oder recrute neue Mitglieder für deine Gruppe. Gemeinsam seid ihr stärker!</p>
                    </div>
                    <div class="card">
                        <h3>Coaching & Mentoring</h3>
                        <p>Erfahrene Spieler helfen Neulingen beim Einstieg. Profitiere von wertvollen Tipps und Tricks der Community.</p>
                    </div>
                    <div class="card">
                        <h3>Community Feedback</h3>
                        <p>Deine Meinung ist wichtig! Teile Feedback und Vorschläge für Verbesserungen direkt mit dem Team.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>KnockGames.eu</h3>
                    <p>Das ultimative Minecraft Training Network für PvP-Enthusiasten. Verbessere deine Fähigkeiten in einer professionellen Umgebung.</p>
                    <div class="social-links">
                        <a href="#" class="social-link">Discord</a>
                        <a href="#" class="social-link">YouTube</a>
                        <a href="#" class="social-link">Twitter</a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Training</h4>
                    <ul>
                        <li><a href="#training">PvP Arena</a></li>
                        <li><a href="#training">Combo Training</a></li>
                        <li><a href="#training">Speed Building</a></li>
                        <li><a href="#community">Turniere</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Community</h4>
                    <ul>
                        <li><a href="#community">Discord Server</a></li>
                        <li><a href="#community">Events</a></li>
                        <li><a href="#community">Leaderboard</a></li>
                        <li><a href="#community">Teams</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Server Info</h4>
                    <ul>
                        <li>IP: <span class="copy-ip" onclick="copyServerIP()" style="cursor: pointer; color: #ff9124;">knockgames.eu</span></li>
                        <li>Status: <span id="footerServerStatus" class="status-loading">Lädt...</span></li>
                        <li>Spieler: <span id="footerPlayerCount">-/-</span></li>
                        <li>Version: <span id="footerServerVersion">-</span></li>
                        <li><a href="/admin">Admin Panel</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2025 KnockGames.eu - Alle Rechte vorbehalten</p>
                <p>Erstellt mit ❤️ für die Minecraft Community</p>
            </div>
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

        // Scroll Spy für Navigation
        function updateActiveNavigation() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a[href^="#"]');
            const scrollPosition = window.scrollY + 100; // Reduzierter Offset
            
            let currentSection = null;

            // Durchlaufe Sektionen in umgekehrter Reihenfolge für bessere Erkennung
            const sectionsArray = Array.from(sections).reverse();
            
            sectionsArray.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionId = section.getAttribute('id');
                
                // Spezielle Behandlung für announcements Sektion
                let offset = 300; // Standard-Offset
                if (sectionId === 'announcements') {
                    // Größerer Offset für Ankündigungen - mehr auf mobilen Geräten
                    offset = window.innerWidth <= 768 ? 600 : 400;
                } else if (sectionId === 'home') {
                    offset = 100; // Kleinerer Offset für Home
                }

                if (scrollPosition >= sectionTop - offset && !currentSection) {
                    currentSection = sectionId;
                }
            });

            // Entferne active-Klasse von allen Links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Füge active-Klasse zum entsprechenden Link hinzu
            if (currentSection) {
                const activeLink = document.querySelector(`nav a[href="#${currentSection}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            } else {
                // Fallback: Aktiviere Home wenn ganz oben
                if (scrollPosition < 300) {
                    const homeLink = document.querySelector('nav a[href="#home"]');
                    if (homeLink) {
                        homeLink.classList.add('active');
                    }
                }
            }
        }

        // Event Listener für Scroll
        window.addEventListener('scroll', updateActiveNavigation);
        
        // Initiale Aktivierung beim Laden
        document.addEventListener('DOMContentLoaded', updateActiveNavigation);

        // Smooth Scrolling für Navigation
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('nav a[href^="#"]');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href').substring(1);
                    
                    if (targetId === 'home') {
                        // Scroll ganz nach oben für Home
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    } else {
                        // Scroll zu anderen Sektionen
                        const targetSection = document.getElementById(targetId);
                        if (targetSection) {
                            let headerHeight = 80; // Standard Header-Höhe
                            
                            // Spezielle Offsets für verschiedene Sektionen
                            if (targetId === 'announcements') {
                                // Mehr Abstand für Ankündigungen - deutlich mehr auf mobilen Geräten
                                headerHeight = window.innerWidth <= 768 ? 200 : 120;
                            } else if (targetId === 'home') {
                                headerHeight = 60; // Weniger Abstand für Home
                            }
                            
                            const targetPosition = targetSection.offsetTop - headerHeight;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                });
            });
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

        // Enhanced Server Status for Animated Dashboard
        async function loadServerStatus() {
            const dashboard = document.getElementById('serverDashboard');
            if (!dashboard) return;

            // Dashboard Elements
            const statusIcon = document.getElementById('statusIcon');
            const statusValue = document.getElementById('statusValue');
            const uptimeValue = document.getElementById('uptimeValue');
            const playerCount = document.getElementById('playerCount');
            const playerFill = document.getElementById('playerFill');
            const serverVersion = document.getElementById('serverVersion');
            const pingValue = document.getElementById('pingValue');
            const tpsValue = document.getElementById('tpsValue');
            const performanceFill = document.getElementById('performanceFill');
            const lastUpdate = document.getElementById('lastUpdate');
            const refreshIndicator = document.getElementById('refreshIndicator');
            
            // Footer Elements
            const footerStatusElement = document.getElementById('footerServerStatus');
            const footerPlayerCountElement = document.getElementById('footerPlayerCount');
            const footerVersionElement = document.getElementById('footerServerVersion');

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
            
            // Show loading state
            if (statusIcon) statusIcon.textContent = '🔄';
            if (statusValue) statusValue.textContent = 'Verbindung...';
            
            const startTime = Date.now();
            
            try {
                const response = await fetch('/minecraft-status.php?host=77.90.15.172&port=25565');
                const data = await response.json();
                const ping = Date.now() - startTime;

                if (data.online) {
                    // Update dashboard - online state
                    if (statusIcon) statusIcon.textContent = '🟢';
                    if (statusValue) {
                        statusValue.textContent = 'Online';
                        statusValue.className = 'status-value status-online';
                    }
                    if (uptimeValue) uptimeValue.textContent = '24/7 Verfügbar';
                    
                    // Update player information
                    if (playerCount) {
                        playerCount.textContent = `${data.players.online}/${data.players.max}`;
                        const percentage = (data.players.online / data.players.max) * 100;
                        if (playerFill) {
                            playerFill.style.width = `${percentage}%`;
                        }
                    }
                    
                    // Update server info
                    if (serverVersion) serverVersion.textContent = data.version || '1.20.x';
                    if (pingValue) pingValue.textContent = `Ping: ${ping}ms`;
                    
                    // Update performance (simulated TPS)
                    const tps = 20.0 - (ping / 100);
                    if (tpsValue) tpsValue.textContent = `TPS: ${Math.max(tps, 18.0).toFixed(1)}`;
                    if (performanceFill) {
                        const perfPercentage = Math.max((tps / 20) * 100, 90);
                        performanceFill.style.width = `${perfPercentage}%`;
                    }
                    
                    // Update pulse indicator
                    if (refreshIndicator) {
                        const pulseDot = refreshIndicator.querySelector('.pulse-dot');
                        if (pulseDot) pulseDot.style.background = '#28a745';
                    }
                    
                    // Footer Updates
                    if (footerStatusElement) {
                        footerStatusElement.textContent = 'Online';
                        footerStatusElement.className = 'status-online';
                    }
                    if (footerPlayerCountElement) {
                        footerPlayerCountElement.textContent = `${data.players.online}/${data.players.max}`;
                    }
                    if (footerVersionElement) {
                        footerVersionElement.textContent = data.version || '1.20.x';
                    }
                } else {
                    // Update dashboard - offline state
                    if (statusIcon) statusIcon.textContent = '🔴';
                    if (statusValue) {
                        statusValue.textContent = 'Offline';
                        statusValue.className = 'status-value status-offline';
                    }
                    if (uptimeValue) uptimeValue.textContent = 'Server nicht erreichbar';
                    
                    // Reset values
                    if (playerCount) playerCount.textContent = '0/0';
                    if (playerFill) playerFill.style.width = '0%';
                    if (serverVersion) serverVersion.textContent = '-';
                    if (pingValue) pingValue.textContent = 'Ping: -ms';
                    if (tpsValue) tpsValue.textContent = 'TPS: -';
                    if (performanceFill) performanceFill.style.width = '0%';
                    
                    // Update pulse indicator
                    if (refreshIndicator) {
                        const pulseDot = refreshIndicator.querySelector('.pulse-dot');
                        if (pulseDot) pulseDot.style.background = '#dc3545';
                    }
                    
                    // Footer Updates
                    if (footerStatusElement) {
                        footerStatusElement.textContent = 'Offline';
                        footerStatusElement.className = 'status-offline';
                    }
                    if (footerPlayerCountElement) footerPlayerCountElement.textContent = '0/0';
                    if (footerVersionElement) footerVersionElement.textContent = '-';
                }
            } catch (error) {
                // Update dashboard - error state
                if (statusIcon) statusIcon.textContent = '🔧';
                if (statusValue) {
                    statusValue.textContent = 'Wartung';
                    statusValue.className = 'status-value status-loading';
                }
                if (uptimeValue) uptimeValue.textContent = 'Systemwartung';
                
                // Reset values
                if (playerCount) playerCount.textContent = '-/-';
                if (playerFill) playerFill.style.width = '0%';
                if (serverVersion) serverVersion.textContent = '-';
                if (pingValue) pingValue.textContent = 'Ping: -ms';
                if (tpsValue) tpsValue.textContent = 'TPS: -';
                if (performanceFill) performanceFill.style.width = '0%';
                
                // Update pulse indicator
                if (refreshIndicator) {
                    const pulseDot = refreshIndicator.querySelector('.pulse-dot');
                    if (pulseDot) pulseDot.style.background = '#ffc107';
                }
                
                // Footer Updates
                if (footerStatusElement) {
                    footerStatusElement.textContent = 'Wartung';
                    footerStatusElement.className = 'status-offline';
                }
                if (footerPlayerCountElement) footerPlayerCountElement.textContent = '-/-';
                if (footerVersionElement) footerVersionElement.textContent = '-';
            }
            
            // Update last refresh time
            if (lastUpdate) {
                lastUpdate.textContent = new Date().toLocaleTimeString('de-DE');
            }
            
        }

        // Manual refresh function for dashboard
        async function refreshServerStatus() {
            const refreshBtn = document.getElementById('manualRefresh');
            if (refreshBtn) {
                refreshBtn.style.opacity = '0.7';
                refreshBtn.disabled = true;
                const refreshIcon = refreshBtn.querySelector('.refresh-icon');
                if (refreshIcon) {
                    refreshIcon.style.transform = 'rotate(360deg)';
                }
            }
            
            await loadServerStatus();
            
            setTimeout(() => {
                if (refreshBtn) {
                    refreshBtn.style.opacity = '1';
                    refreshBtn.disabled = false;
                    const refreshIcon = refreshBtn.querySelector('.refresh-icon');
                    if (refreshIcon) {
                        refreshIcon.style.transform = 'rotate(0deg)';
                    }
                }
            }, 1000);
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