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

import { 
  insertUserSchema, 
  insertAnnouncementSchema, 
  insertNewsArticleSchema, 
  insertTrainingProgramSchema,
  insertSiteSettingSchema 
} from "@shared/schema";

// Simple session middleware
interface AuthenticatedRequest extends Express.Request {
  user?: any;
}

const sessions = new Map<string, any>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isAuthenticated(req: AuthenticatedRequest, res: Express.Response, next: Function) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = sessions.get(sessionId);
  next();
}

function isAdmin(req: AuthenticatedRequest, res: Express.Response, next: Function) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sessionId = generateSessionId();
      sessions.set(sessionId, { id: user.id, username: user.username, role: user.role });
      
      res.json({ 
        sessionId, 
        user: { id: user.id, username: user.username, role: user.role } 
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", isAuthenticated, (req: AuthenticatedRequest, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", isAuthenticated, (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

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

  // Admin routes
  
  // Users management
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.put("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete user" });
    }
  });

  // Announcements management
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements.filter(a => a.active));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.get("/api/admin/announcements", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const announcement = await storage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: "Invalid announcement data" });
    }
  });

  app.put("/api/admin/announcements/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const announcement = await storage.updateAnnouncement(id, req.body);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete announcement" });
    }
  });

  // News articles management
  app.get("/api/news", async (req, res) => {
    try {
      const articles = await storage.getPublishedNewsArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/admin/news", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const articles = await storage.getNewsArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news articles" });
    }
  });

  app.post("/api/admin/news", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const articleData = insertNewsArticleSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      const article = await storage.createNewsArticle(articleData);
      res.json(article);
    } catch (error) {
      res.status(400).json({ error: "Invalid article data" });
    }
  });

  app.put("/api/admin/news/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.updateNewsArticle(id, req.body);
      res.json(article);
    } catch (error) {
      res.status(400).json({ error: "Failed to update article" });
    }
  });

  app.delete("/api/admin/news/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNewsArticle(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete article" });
    }
  });

  // Training programs management
  app.get("/api/training-programs", async (req, res) => {
    try {
      const programs = await storage.getActiveTrainingPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training programs" });
    }
  });

  app.get("/api/admin/training-programs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const programs = await storage.getTrainingPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training programs" });
    }
  });

  app.post("/api/admin/training-programs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const programData = insertTrainingProgramSchema.parse(req.body);
      const program = await storage.createTrainingProgram(programData);
      res.json(program);
    } catch (error) {
      res.status(400).json({ error: "Invalid program data" });
    }
  });

  app.put("/api/admin/training-programs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.updateTrainingProgram(id, req.body);
      res.json(program);
    } catch (error) {
      res.status(400).json({ error: "Failed to update program" });
    }
  });

  app.delete("/api/admin/training-programs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTrainingProgram(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete program" });
    }
  });

  // Site settings management
  app.get("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settingData = insertSiteSettingSchema.parse(req.body);
      const setting = await storage.setSiteSetting(settingData);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: "Invalid setting data" });
    }
  });

  app.put("/api/admin/settings/:key", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const setting = await storage.updateSiteSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: "Failed to update setting" });
    }
  });

  app.delete("/api/admin/settings/:key", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      await storage.deleteSiteSetting(key);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete setting" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
