import {
  users,
  announcements,
  newsArticles,
  trainingPrograms,
  siteSettings,
  type User,
  type InsertUser,
  type Announcement,
  type InsertAnnouncement,
  type NewsArticle,
  type InsertNewsArticle,
  type TrainingProgram,
  type InsertTrainingProgram,
  type SiteSetting,
  type InsertSiteSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Announcement operations
  getAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // News article operations
  getNewsArticles(): Promise<NewsArticle[]>;
  getPublishedNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: number): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: number, updates: Partial<InsertNewsArticle>): Promise<NewsArticle>;
  deleteNewsArticle(id: number): Promise<void>;
  
  // Training program operations
  getTrainingPrograms(): Promise<TrainingProgram[]>;
  getActiveTrainingPrograms(): Promise<TrainingProgram[]>;
  getTrainingProgram(id: number): Promise<TrainingProgram | undefined>;
  createTrainingProgram(program: InsertTrainingProgram): Promise<TrainingProgram>;
  updateTrainingProgram(id: number, updates: Partial<InsertTrainingProgram>): Promise<TrainingProgram>;
  deleteTrainingProgram(id: number): Promise<void>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  setSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  updateSiteSetting(key: string, value: string): Promise<SiteSetting>;
  deleteSiteSetting(key: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  
  constructor() {
    // Initialize database with default data
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if admin user exists, create if not
      const adminUser = await db.select().from(users).where(eq(users.username, 'admin'));
      if (adminUser.length === 0) {
        await db.insert(users).values({
          username: 'admin',
          password: 'admin123', // In production, this should be hashed
          role: 'admin'
        });
      }

      // Initialize sample training programs if none exist
      const existingPrograms = await db.select().from(trainingPrograms);
      if (existingPrograms.length === 0) {
        await db.insert(trainingPrograms).values([
          {
            name: "Beginner Package",
            description: "Perfect for new players starting their Minecraft journey",
            features: JSON.stringify(["Basic commands", "Server rules", "Getting started guide"]),
            price: "Free",
            popular: false,
            active: true
          },
          {
            name: "Professional Package", 
            description: "Advanced training for experienced players",
            features: JSON.stringify(["Advanced techniques", "PvP training", "Building workshops", "Resource management"]),
            price: "€19.99",
            popular: true,
            active: true
          },
          {
            name: "Elite Package",
            description: "Comprehensive training with personal coaching", 
            features: JSON.stringify(["Everything in Professional", "1-on-1 coaching", "Custom strategies", "Priority support", "Exclusive content"]),
            price: "€39.99",
            popular: false,
            active: true
          }
        ]);
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements);
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).where(eq(announcements.active, true));
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db.insert(announcements)
      .values({
        ...insertAnnouncement,
        updatedAt: new Date()
      })
      .returning();
    return announcement;
  }

  async updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [announcement] = await db.update(announcements)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // News article operations
  async getNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles);
  }

  async getPublishedNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles).where(eq(newsArticles.published, true));
  }

  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const [article] = await db.insert(newsArticles)
      .values({
        ...insertArticle,
        updatedAt: new Date()
      })
      .returning();
    return article;
  }

  async updateNewsArticle(id: number, updates: Partial<InsertNewsArticle>): Promise<NewsArticle> {
    const [article] = await db.update(newsArticles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(newsArticles.id, id))
      .returning();
    return article;
  }

  async deleteNewsArticle(id: number): Promise<void> {
    await db.delete(newsArticles).where(eq(newsArticles.id, id));
  }

  // Training program operations
  async getTrainingPrograms(): Promise<TrainingProgram[]> {
    return await db.select().from(trainingPrograms);
  }

  async getActiveTrainingPrograms(): Promise<TrainingProgram[]> {
    return await db.select().from(trainingPrograms).where(eq(trainingPrograms.active, true));
  }

  async getTrainingProgram(id: number): Promise<TrainingProgram | undefined> {
    const [program] = await db.select().from(trainingPrograms).where(eq(trainingPrograms.id, id));
    return program;
  }

  async createTrainingProgram(insertProgram: InsertTrainingProgram): Promise<TrainingProgram> {
    const [program] = await db.insert(trainingPrograms)
      .values({
        ...insertProgram,
        updatedAt: new Date()
      })
      .returning();
    return program;
  }

  async updateTrainingProgram(id: number, updates: Partial<InsertTrainingProgram>): Promise<TrainingProgram> {
    const [program] = await db.update(trainingPrograms)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(trainingPrograms.id, id))
      .returning();
    return program;
  }

  async deleteTrainingProgram(id: number): Promise<void> {
    await db.delete(trainingPrograms).where(eq(trainingPrograms.id, id));
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async setSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const [setting] = await db.insert(siteSettings)
      .values({
        ...insertSetting,
        updatedAt: new Date()
      })
      .returning();
    return setting;
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const [setting] = await db.update(siteSettings)
      .set({
        value,
        updatedAt: new Date()
      })
      .where(eq(siteSettings.key, key))
      .returning();
    return setting;
  }

  async deleteSiteSetting(key: string): Promise<void> {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }
}

export const storage = new DatabaseStorage();