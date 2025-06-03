<?php
require_once 'config.php';

class MinecraftServerStatus {
    private $serverHost;
    private $serverPort;
    private $timeout;
    
    public function __construct($host = 'mc.hypixel.net', $port = 25565, $timeout = 5) {
        $this->serverHost = $host;
        $this->serverPort = $port;
        $this->timeout = $timeout;
    }
    
    public function getServerStatus() {
        try {
            // Ping-basierte Statusabfrage
            $socket = @fsockopen($this->serverHost, $this->serverPort, $errno, $errstr, $this->timeout);
            
            if (!$socket) {
                return [
                    'online' => false,
                    'error' => "Verbindung fehlgeschlagen: $errstr ($errno)",
                    'host' => $this->serverHost,
                    'port' => $this->serverPort
                ];
            }
            
            // Server List Ping Protocol (1.7+)
            $data = $this->performServerListPing($socket);
            fclose($socket);
            
            return $data;
            
        } catch (Exception $e) {
            return [
                'online' => false,
                'error' => $e->getMessage(),
                'host' => $this->serverHost,
                'port' => $this->serverPort
            ];
        }
    }
    
    private function performServerListPing($socket) {
        // Handshake packet
        $handshake = $this->packVarInt(0x00) . // Packet ID
                    $this->packVarInt(47) .   // Protocol version (1.8)
                    $this->packString($this->serverHost) . // Server address
                    pack('n', $this->serverPort) . // Server port
                    $this->packVarInt(1);     // Next state (status)
        
        $this->sendPacket($socket, $handshake);
        
        // Status request packet
        $statusRequest = $this->packVarInt(0x00); // Packet ID
        $this->sendPacket($socket, $statusRequest);
        
        // Read response
        $response = $this->readPacket($socket);
        
        if ($response === false) {
            return [
                'online' => false,
                'error' => 'Keine Antwort vom Server',
                'host' => $this->serverHost,
                'port' => $this->serverPort
            ];
        }
        
        // Parse JSON response
        $jsonStart = strpos($response, '{');
        if ($jsonStart !== false) {
            $jsonData = substr($response, $jsonStart);
            $status = json_decode($jsonData, true);
            
            if ($status) {
                return [
                    'online' => true,
                    'host' => $this->serverHost,
                    'port' => $this->serverPort,
                    'version' => $status['version']['name'] ?? 'Unbekannt',
                    'protocol' => $status['version']['protocol'] ?? 0,
                    'players' => [
                        'online' => $status['players']['online'] ?? 0,
                        'max' => $status['players']['max'] ?? 0,
                        'list' => $status['players']['sample'] ?? []
                    ],
                    'description' => $this->parseDescription($status['description'] ?? ''),
                    'favicon' => $status['favicon'] ?? null,
                    'ping' => $this->measurePing()
                ];
            }
        }
        
        return [
            'online' => false,
            'error' => 'Ungültige Server-Antwort',
            'host' => $this->serverHost,
            'port' => $this->serverPort
        ];
    }
    
    private function packVarInt($value) {
        $packed = '';
        while (($value & 0x80) != 0) {
            $packed .= chr($value & 0x7F | 0x80);
            $value >>= 7;
        }
        $packed .= chr($value & 0x7F);
        return $packed;
    }
    
    private function packString($string) {
        return $this->packVarInt(strlen($string)) . $string;
    }
    
    private function sendPacket($socket, $data) {
        $packet = $this->packVarInt(strlen($data)) . $data;
        fwrite($socket, $packet);
    }
    
    private function readPacket($socket) {
        $length = $this->readVarInt($socket);
        if ($length === false || $length <= 0) {
            return false;
        }
        
        $data = '';
        while (strlen($data) < $length) {
            $chunk = fread($socket, $length - strlen($data));
            if ($chunk === false || $chunk === '') {
                return false;
            }
            $data .= $chunk;
        }
        
        return $data;
    }
    
    private function readVarInt($socket) {
        $value = 0;
        $position = 0;
        
        do {
            $byte = fread($socket, 1);
            if ($byte === false || $byte === '') {
                return false;
            }
            
            $byte = ord($byte);
            $value |= ($byte & 0x7F) << $position;
            
            if (($byte & 0x80) == 0) {
                break;
            }
            
            $position += 7;
            
            if ($position >= 32) {
                return false; // VarInt too big
            }
        } while (true);
        
        return $value;
    }
    
    private function parseDescription($description) {
        if (is_string($description)) {
            return strip_tags($description);
        }
        
        if (is_array($description)) {
            if (isset($description['text'])) {
                return strip_tags($description['text']);
            }
            
            // Parse complex description format
            $text = '';
            if (isset($description['extra'])) {
                foreach ($description['extra'] as $part) {
                    if (is_string($part)) {
                        $text .= $part;
                    } elseif (isset($part['text'])) {
                        $text .= $part['text'];
                    }
                }
            }
            return strip_tags($text);
        }
        
        return 'KnockGames.eu Minecraft Server';
    }
    
    private function measurePing() {
        $startTime = microtime(true);
        $socket = @fsockopen($this->serverHost, $this->serverPort, $errno, $errstr, $this->timeout);
        
        if ($socket) {
            fclose($socket);
            return round((microtime(true) - $startTime) * 1000);
        }
        
        return null;
    }
}

// API Endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET' && 
    (strpos($_SERVER['REQUEST_URI'], '/api/minecraft/status') !== false || 
     strpos($_SERVER['REQUEST_URI'], '/minecraft-status.php') !== false)) {
    
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    
    $host = $_GET['host'] ?? 'knockgames.eu';
    $port = intval($_GET['port'] ?? 25565);
    
    $serverStatus = new MinecraftServerStatus($host, $port);
    $status = $serverStatus->getServerStatus();
    
    echo json_encode($status, JSON_PRETTY_PRINT);
    exit;
}

// Standalone usage
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    $serverStatus = new MinecraftServerStatus();
    $status = $serverStatus->getServerStatus();
    
    echo "KnockGames.eu Server Status:\n";
    echo "============================\n";
    
    if ($status['online']) {
        echo "Status: ONLINE ✓\n";
        echo "Version: " . $status['version'] . "\n";
        echo "Spieler: " . $status['players']['online'] . "/" . $status['players']['max'] . "\n";
        echo "Beschreibung: " . $status['description'] . "\n";
        if ($status['ping']) {
            echo "Ping: " . $status['ping'] . "ms\n";
        }
    } else {
        echo "Status: OFFLINE ✗\n";
        echo "Fehler: " . $status['error'] . "\n";
    }
    
    echo "\nServer: " . $status['host'] . ":" . $status['port'] . "\n";
}
?>