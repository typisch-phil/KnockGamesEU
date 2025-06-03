import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Newspaper, 
  GraduationCap, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  active: boolean;
  createdAt: string;
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
}

interface TrainingProgram {
  id: number;
  name: string;
  description: string;
  features: string;
  price: string;
  popular: boolean;
  active: boolean;
}

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  if (!isAdmin) {
    setLocation("/admin/login");
    return null;
  }

  // API functions
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const sessionId = localStorage.getItem("sessionId");
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  };

  // Queries
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => makeAuthenticatedRequest("/api/admin/users"),
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["admin-announcements"],
    queryFn: () => makeAuthenticatedRequest("/api/admin/announcements"),
  });

  const { data: newsArticles = [] } = useQuery<NewsArticle[]>({
    queryKey: ["admin-news"],
    queryFn: () => makeAuthenticatedRequest("/api/admin/news"),
  });

  const { data: trainingPrograms = [] } = useQuery<TrainingProgram[]>({
    queryKey: ["admin-training-programs"],
    queryFn: () => makeAuthenticatedRequest("/api/admin/training-programs"),
  });

  // Mutations
  const createAnnouncementMutation = useMutation({
    mutationFn: (data: any) => makeAuthenticatedRequest("/api/admin/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast({ title: "Success", description: "Announcement created successfully" });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => makeAuthenticatedRequest(`/api/admin/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast({ title: "Success", description: "Announcement updated successfully" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: number) => makeAuthenticatedRequest(`/api/admin/announcements/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast({ title: "Success", description: "Announcement deleted successfully" });
    },
  });

  const createNewsArticleMutation = useMutation({
    mutationFn: (data: any) => makeAuthenticatedRequest("/api/admin/news", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast({ title: "Success", description: "News article created successfully" });
    },
  });

  const updateNewsArticleMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => makeAuthenticatedRequest(`/api/admin/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast({ title: "Success", description: "News article updated successfully" });
    },
  });

  const deleteNewsArticleMutation = useMutation({
    mutationFn: (id: number) => makeAuthenticatedRequest(`/api/admin/news/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast({ title: "Success", description: "News article deleted successfully" });
    },
  });

  // State for forms
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "info",
    active: true,
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: false,
  });

  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);

  const handleCreateAnnouncement = () => {
    createAnnouncementMutation.mutate(announcementForm);
    setAnnouncementForm({ title: "", content: "", type: "info", active: true });
  };

  const handleUpdateAnnouncement = () => {
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({
        id: editingAnnouncement.id,
        ...announcementForm,
      });
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: "", content: "", type: "info", active: true });
    }
  };

  const handleCreateNews = () => {
    createNewsArticleMutation.mutate(newsForm);
    setNewsForm({ title: "", content: "", excerpt: "", published: false });
  };

  const handleUpdateNews = () => {
    if (editingNews) {
      updateNewsArticleMutation.mutate({
        id: editingNews.id,
        ...newsForm,
      });
      setEditingNews(null);
      setNewsForm({ title: "", content: "", excerpt: "", published: false });
    }
  };

  const startEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      active: announcement.active,
    });
  };

  const startEditNews = (article: NewsArticle) => {
    setEditingNews(article);
    setNewsForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      published: article.published,
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--dark-bg))] text-white">
      {/* Header */}
      <header className="bg-[hsl(var(--dark-secondary))] border-b border-[hsl(var(--dark-tertiary))] p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="text-[hsl(var(--brand-orange))] w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
              <p className="text-gray-400">KnockGames.eu Content Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user?.username}</span>
            <Button
              onClick={() => {
                logout();
                setLocation("/");
              }}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center space-x-2">
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center space-x-2">
              <Newspaper className="w-4 h-4" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Training</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-[hsl(var(--brand-orange))]" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[hsl(var(--brand-orange))]">{users.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Megaphone className="w-5 h-5 mr-2 text-[hsl(var(--brand-orange))]" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[hsl(var(--brand-orange))]">{announcements.length}</p>
                  <p className="text-sm text-gray-400">
                    {announcements.filter(a => a.active).length} active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Newspaper className="w-5 h-5 mr-2 text-[hsl(var(--brand-orange))]" />
                    News Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[hsl(var(--brand-orange))]">{newsArticles.length}</p>
                  <p className="text-sm text-gray-400">
                    {newsArticles.filter(a => a.published).length} published
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-[hsl(var(--brand-orange))]" />
                    Training Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[hsl(var(--brand-orange))]">{trainingPrograms.length}</p>
                  <p className="text-sm text-gray-400">
                    {trainingPrograms.filter(p => p.active).length} active
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage registered users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-[hsl(var(--dark-tertiary))] rounded-lg">
                      <div>
                        <h3 className="font-semibold text-white">{user.username}</h3>
                        <p className="text-sm text-gray-400">
                          Role: <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Management */}
          <TabsContent value="announcements">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create/Edit Announcement */}
              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Title</Label>
                    <Input
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="bg-[hsl(var(--dark-tertiary))] border-[hsl(var(--dark-tertiary))] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Content</Label>
                    <Textarea
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="bg-[hsl(var(--dark-tertiary))] border-[hsl(var(--dark-tertiary))] text-white"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Type</Label>
                    <select
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                      className="w-full p-2 bg-[hsl(var(--dark-tertiary))] border border-[hsl(var(--dark-tertiary))] text-white rounded"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={announcementForm.active}
                      onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, active: checked })}
                    />
                    <Label className="text-white">Active</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                      className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))]"
                    >
                      {editingAnnouncement ? "Update" : "Create"}
                    </Button>
                    {editingAnnouncement && (
                      <Button
                        onClick={() => {
                          setEditingAnnouncement(null);
                          setAnnouncementForm({ title: "", content: "", type: "info", active: true });
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Announcements List */}
              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white">Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 bg-[hsl(var(--dark-tertiary))] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white">{announcement.title}</h3>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditAnnouncement(announcement)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                              className="border-red-500 text-red-400 hover:bg-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{announcement.content}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={announcement.type === 'error' ? 'destructive' : 'secondary'}>
                            {announcement.type}
                          </Badge>
                          {announcement.active ? (
                            <Badge className="bg-green-600"><Eye className="w-3 h-3 mr-1" />Active</Badge>
                          ) : (
                            <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Inactive</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* News Management */}
          <TabsContent value="news">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create/Edit News Article */}
              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingNews ? "Edit News Article" : "Create News Article"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Title</Label>
                    <Input
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="bg-[hsl(var(--dark-tertiary))] border-[hsl(var(--dark-tertiary))] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Excerpt</Label>
                    <Textarea
                      value={newsForm.excerpt}
                      onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                      className="bg-[hsl(var(--dark-tertiary))] border-[hsl(var(--dark-tertiary))] text-white"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Content</Label>
                    <Textarea
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      className="bg-[hsl(var(--dark-tertiary))] border-[hsl(var(--dark-tertiary))] text-white"
                      rows={6}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newsForm.published}
                      onCheckedChange={(checked) => setNewsForm({ ...newsForm, published: checked })}
                    />
                    <Label className="text-white">Published</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={editingNews ? handleUpdateNews : handleCreateNews}
                      className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))]"
                    >
                      {editingNews ? "Update" : "Create"}
                    </Button>
                    {editingNews && (
                      <Button
                        onClick={() => {
                          setEditingNews(null);
                          setNewsForm({ title: "", content: "", excerpt: "", published: false });
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* News Articles List */}
              <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
                <CardHeader>
                  <CardTitle className="text-white">News Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newsArticles.map((article) => (
                      <div key={article.id} className="p-4 bg-[hsl(var(--dark-tertiary))] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white">{article.title}</h3>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditNews(article)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteNewsArticleMutation.mutate(article.id)}
                              className="border-red-500 text-red-400 hover:bg-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{article.excerpt}</p>
                        <div className="flex items-center space-x-2">
                          {article.published ? (
                            <Badge className="bg-green-600"><Eye className="w-3 h-3 mr-1" />Published</Badge>
                          ) : (
                            <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Draft</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Training Programs Management */}
          <TabsContent value="training">
            <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
              <CardHeader>
                <CardTitle className="text-white">Training Programs</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage training programs and courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingPrograms.map((program) => (
                    <div key={program.id} className="p-4 bg-[hsl(var(--dark-tertiary))] rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white">{program.name}</h3>
                          <p className="text-gray-300 text-sm">{program.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {program.popular && <Badge className="bg-[hsl(var(--brand-orange))]">Popular</Badge>}
                            {program.active ? (
                              <Badge className="bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            <span className="text-sm text-gray-400">Price: {program.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}