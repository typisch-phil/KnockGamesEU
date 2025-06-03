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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private announcements: Map<number, Announcement>;
  private newsArticles: Map<number, NewsArticle>;
  private trainingPrograms: Map<number, TrainingProgram>;
  private siteSettings: Map<string, SiteSetting>;
  private currentUserId: number;
  private currentAnnouncementId: number;
  private currentNewsId: number;
  private currentTrainingId: number;
  private currentSettingId: number;

  constructor() {
    this.users = new Map();
    this.announcements = new Map();
    this.newsArticles = new Map();
    this.trainingPrograms = new Map();
    this.siteSettings = new Map();
    this.currentUserId = 1;
    this.currentAnnouncementId = 1;
    this.currentNewsId = 1;
    this.currentTrainingId = 1;
    this.currentSettingId = 1;
    
    // Initialize with default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      role: "admin"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const announcement: Announcement = {
      ...insertAnnouncement,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement> {
    const announcement = this.announcements.get(id);
    if (!announcement) throw new Error("Announcement not found");
    
    const updatedAnnouncement = { 
      ...announcement, 
      ...updates,
      updatedAt: new Date()
    };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    this.announcements.delete(id);
  }

  // News article operations
  async getNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values());
  }

  async getPublishedNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values()).filter(article => article.published);
  }

  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.currentNewsId++;
    const article: NewsArticle = {
      ...insertArticle,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.newsArticles.set(id, article);
    return article;
  }

  async updateNewsArticle(id: number, updates: Partial<InsertNewsArticle>): Promise<NewsArticle> {
    const article = this.newsArticles.get(id);
    if (!article) throw new Error("News article not found");
    
    const updatedArticle = {
      ...article,
      ...updates,
      updatedAt: new Date()
    };
    this.newsArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteNewsArticle(id: number): Promise<void> {
    this.newsArticles.delete(id);
  }

  // Training program operations
  async getTrainingPrograms(): Promise<TrainingProgram[]> {
    return Array.from(this.trainingPrograms.values());
  }

  async getActiveTrainingPrograms(): Promise<TrainingProgram[]> {
    return Array.from(this.trainingPrograms.values()).filter(program => program.active);
  }

  async getTrainingProgram(id: number): Promise<TrainingProgram | undefined> {
    return this.trainingPrograms.get(id);
  }

  async createTrainingProgram(insertProgram: InsertTrainingProgram): Promise<TrainingProgram> {
    const id = this.currentTrainingId++;
    const program: TrainingProgram = {
      ...insertProgram,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.trainingPrograms.set(id, program);
    return program;
  }

  async updateTrainingProgram(id: number, updates: Partial<InsertTrainingProgram>): Promise<TrainingProgram> {
    const program = this.trainingPrograms.get(id);
    if (!program) throw new Error("Training program not found");
    
    const updatedProgram = {
      ...program,
      ...updates,
      updatedAt: new Date()
    };
    this.trainingPrograms.set(id, updatedProgram);
    return updatedProgram;
  }

  async deleteTrainingProgram(id: number): Promise<void> {
    this.trainingPrograms.delete(id);
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting[]> {
    return Array.from(this.siteSettings.values());
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.siteSettings.get(key);
  }

  async setSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const id = this.currentSettingId++;
    const setting: SiteSetting = {
      ...insertSetting,
      id,
      updatedAt: new Date()
    };
    this.siteSettings.set(insertSetting.key, setting);
    return setting;
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const setting = this.siteSettings.get(key);
    if (!setting) throw new Error("Site setting not found");
    
    const updatedSetting = {
      ...setting,
      value,
      updatedAt: new Date()
    };
    this.siteSettings.set(key, updatedSetting);
    return updatedSetting;
  }

  async deleteSiteSetting(key: string): Promise<void> {
    this.siteSettings.delete(key);
  }
}

export const storage = new MemStorage();
