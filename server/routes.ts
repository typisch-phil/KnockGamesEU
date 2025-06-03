import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import net from "net";

interface ServerStatus {
  online: boolean;
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  motd?: string;
  ping?: number;
  error?: string;
}

// Minecraft server status checker
async function checkMinecraftServer(host: string, port: number = 25565): Promise<ServerStatus> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({
        online: false,
        error: "Connection timeout"
      });
    }, 5000);

    socket.setTimeout(5000);
    
    socket.connect(port, host, () => {
      clearTimeout(timeout);
      const ping = Date.now() - startTime;
      
      // Send status request packet
      const handshake = Buffer.concat([
        Buffer.from([0x00]), // Packet ID
        Buffer.from([0x00]), // Protocol version
        Buffer.from([host.length]), // Host length
        Buffer.from(host), // Host
        Buffer.from([port >> 8, port & 0xFF]), // Port
        Buffer.from([0x01]) // Next state (status)
      ]);
      
      const handshakeLength = Buffer.from([handshake.length]);
      const handshakePacket = Buffer.concat([handshakeLength, handshake]);
      
      const statusRequest = Buffer.from([0x01, 0x00]); // Length and packet ID
      
      socket.write(handshakePacket);
      socket.write(statusRequest);
      
      let responseData = Buffer.alloc(0);
      
      socket.on('data', (data) => {
        responseData = Buffer.concat([responseData, data]);
        
        try {
          if (responseData.length > 5) {
            const packetLength = responseData.readUInt8(0);
            const packetId = responseData.readUInt8(1);
            
            if (packetId === 0x00) {
              const jsonLength = responseData.readUInt8(2);
              const jsonStart = 3;
              
              if (responseData.length >= jsonStart + jsonLength) {
                const jsonData = responseData.slice(jsonStart, jsonStart + jsonLength).toString();
                const serverInfo = JSON.parse(jsonData);
                
                socket.destroy();
                resolve({
                  online: true,
                  players: {
                    online: serverInfo.players?.online || 0,
                    max: serverInfo.players?.max || 0
                  },
                  version: serverInfo.version?.name,
                  motd: serverInfo.description?.text || serverInfo.description,
                  ping
                });
                return;
              }
            }
          }
        } catch (error) {
          // If JSON parsing fails, still consider server online
          socket.destroy();
          resolve({
            online: true,
            ping
          });
        }
      });
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        online: false,
        error: error.message
      });
    });

    socket.on('timeout', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({
        online: false,
        error: "Connection timeout"
      });
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Server status endpoint
  app.get("/api/server-status", async (req, res) => {
    try {
      const { host = "play.knockgames.eu", port = 25565 } = req.query;
      const status = await checkMinecraftServer(host as string, parseInt(port as string));
      res.json(status);
    } catch (error) {
      res.status(500).json({
        online: false,
        error: "Failed to check server status"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
