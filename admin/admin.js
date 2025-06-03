// Admin Panel State
let adminData = {
    isLoggedIn: false,
    sessionId: null,
    currentUser: null,
    users: [],
    announcements: [],
    news: [],
    trainingPrograms: [],
    editingAnnouncement: null,
    editingNews: null,
    editingUser: null,
    sortOrder: {
        announcements: 'date-desc',
        news: 'date-desc'
    }
};

// Initialize Admin Panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

// Initialize Admin Panel
function initializeAdminPanel() {
    // Admin Login Form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const loginBtn = document.getElementById('admin-login-btn');
            const errorDiv = document.getElementById('admin-login-error');
            const errorText = document.getElementById('admin-login-error-text');

            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;
            errorDiv.classList.add('hidden');

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                adminData.isLoggedIn = true;
                adminData.sessionId = data.sessionId;
                adminData.currentUser = data.user;
                localStorage.setItem('adminSessionId', data.sessionId);

                document.getElementById('admin-username-display').textContent = data.user.username;
                
                hideAdminLogin();
                showAdminDashboard();
                
            } catch (error) {
                errorText.textContent = error.message;
                errorDiv.classList.remove('hidden');
            } finally {
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        });
    }

    // Announcement Form
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('announcement-title').value,
                content: document.getElementById('announcement-content').value,
                type: document.getElementById('announcement-type').value,
                active: document.getElementById('announcement-active').checked
            };

            try {
                if (adminData.editingAnnouncement) {
                    await apiRequest(`/api/admin/announcements/${adminData.editingAnnouncement.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(formData)
                    });
                } else {
                    await apiRequest('/api/admin/announcements', {
                        method: 'POST',
                        body: JSON.stringify(formData)
                    });
                }

                announcementForm.reset();
                document.getElementById('announcement-active').checked = true;
                cancelAnnouncementEdit();
                loadAdminData();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }

    // User Form
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('user-username').value,
                password: document.getElementById('user-password').value,
                email: document.getElementById('user-email').value,
                role: document.getElementById('user-role').value
            };

            try {
                if (adminData.editingUser) {
                    await apiRequest(`/api/admin/users/${adminData.editingUser.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(formData)
                    });
                } else {
                    await apiRequest('/api/admin/users', {
                        method: 'POST',
                        body: JSON.stringify(formData)
                    });
                }

                userForm.reset();
                cancelUserEdit();
                loadAdminData();
                alert('User saved successfully!');
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }

    // News Form
    const newsForm = document.getElementById('news-form');
    if (newsForm) {
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('news-title').value,
                excerpt: document.getElementById('news-excerpt').value,
                content: document.getElementById('news-content').value,
                published: document.getElementById('news-published').checked
            };

            try {
                if (adminData.editingNews) {
                    await apiRequest(`/api/admin/news/${adminData.editingNews.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(formData)
                    });
                } else {
                    await apiRequest('/api/admin/news', {
                        method: 'POST',
                        body: JSON.stringify(formData)
                    });
                }

                newsForm.reset();
                cancelNewsEdit();
                loadAdminData();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }

    // Check for existing session
    const savedSessionId = localStorage.getItem('adminSessionId');
    if (savedSessionId) {
        adminData.sessionId = savedSessionId;
        apiRequest('/api/auth/me').then(user => {
            adminData.isLoggedIn = true;
            adminData.currentUser = user;
            document.getElementById('admin-username-display').textContent = user.username;
            hideAdminLogin();
            showAdminDashboard();
        }).catch(() => {
            localStorage.removeItem('adminSessionId');
            adminData.sessionId = null;
        });
    }
}

// Admin Panel Functions
function hideAdminLogin() {
    document.getElementById('admin-login').classList.add('hidden');
}

function showAdminDashboard() {
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadAdminData();
}

function hideAdminDashboard() {
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function showAdminTab(tabName) {
    document.querySelectorAll('.tab-trigger').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// API Helper Functions
async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (adminData.sessionId) {
        headers.Authorization = `Bearer ${adminData.sessionId}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

function adminLogout() {
    adminData.isLoggedIn = false;
    adminData.sessionId = null;
    adminData.currentUser = null;
    localStorage.removeItem('adminSessionId');
    hideAdminDashboard();
    
    document.getElementById('admin-login-form').reset();
    document.getElementById('admin-login-error').classList.add('hidden');
    document.getElementById('admin-login').classList.remove('hidden');
}

async function loadAdminData() {
    try {
        // Load users, announcements, and news
        const [users, announcements, news] = await Promise.all([
            fetch('/api/admin/users').then(r => r.ok ? r.json() : []),
            fetch('/api/admin/announcements').then(r => r.ok ? r.json() : []),
            fetch('/api/admin/news').then(r => r.ok ? r.json() : [])
        ]).catch(() => [[], [], []]);

        adminData.users = users;
        adminData.announcements = announcements;
        adminData.news = news;
        adminData.trainingPrograms = []; // Will be populated separately if needed

        updateDashboardStats();
        renderUsers();
        renderAnnouncements();
        renderNews();
        renderTrainingPrograms();
    } catch (error) {
        console.error('Failed to load admin data:', error);
    }
}

// Section Navigation
function showSection(sectionName) {
    // Verstecke alle Sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Entferne aktive Klasse von allen Navigationslinks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Zeige gewählte Section
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.classList.add('active');
    }
    
    // Aktiviere entsprechenden Navigationslink
    const navLink = document.querySelector(`.nav-link[onclick="showSection('${sectionName}')"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Lade entsprechende Daten
    switch(sectionName) {
        case 'users':
            loadUsers();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'news':
            loadNews();
            break;
        case 'dashboard':
            loadAdminData();
            break;
    }
}

// Data Loading Functions
async function loadUsers() {
    try {
        const users = await apiRequest('/api/admin/users');
        adminData.users = users;
        renderUsers();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

async function loadAnnouncements() {
    try {
        const announcements = await apiRequest('/api/admin/announcements');
        adminData.announcements = announcements;
        renderAnnouncements();
    } catch (error) {
        console.error('Failed to load announcements:', error);
    }
}

async function loadNews() {
    try {
        const news = await apiRequest('/api/admin/news');
        adminData.news = news;
        renderNews();
    } catch (error) {
        console.error('Failed to load news:', error);
    }
}

// Modal Functions
let currentEditingUser = null;
let currentEditingAnnouncement = null;
let currentEditingNews = null;

// User Modal Functions
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    
    if (userId) {
        currentEditingUser = adminData.users.find(u => u.id == userId);
        title.textContent = 'Benutzer bearbeiten';
        document.getElementById('userUsername').value = currentEditingUser.username;
        document.getElementById('userPassword').value = '';
        document.getElementById('userPassword').placeholder = 'Leer lassen für keine Änderung';
        document.getElementById('userEmail').value = currentEditingUser.email || '';
        document.getElementById('userRole').value = currentEditingUser.role;
    } else {
        currentEditingUser = null;
        title.textContent = 'Neuer Benutzer';
        document.getElementById('userForm').reset();
        document.getElementById('userPassword').placeholder = '';
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentEditingUser = null;
}

async function saveUser() {
    const username = document.getElementById('userUsername').value;
    const password = document.getElementById('userPassword').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    
    if (!username) {
        alert('Benutzername ist erforderlich');
        return;
    }
    
    if (!currentEditingUser && !password) {
        alert('Passwort ist für neue Benutzer erforderlich');
        return;
    }
    
    const userData = {
        username,
        email,
        role
    };
    
    if (password) {
        userData.password = password;
    }
    
    try {
        const url = currentEditingUser 
            ? `/api/admin/users/${currentEditingUser.id}`
            : '/api/admin/users';
        const method = currentEditingUser ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern');
        }
        
        closeUserModal();
        loadUsers();
        alert('Benutzer erfolgreich gespeichert');
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
}

// Announcement Modal Functions
function openAnnouncementModal(announcementId = null) {
    const modal = document.getElementById('announcementModal');
    const title = document.getElementById('announcementModalTitle');
    
    if (announcementId) {
        currentEditingAnnouncement = adminData.announcements.find(a => a.id == announcementId);
        title.textContent = 'Ankündigung bearbeiten';
        document.getElementById('announcementTitle').value = currentEditingAnnouncement.title;
        document.getElementById('announcementType').value = currentEditingAnnouncement.type;
        document.getElementById('announcementContent').value = currentEditingAnnouncement.content;
        document.getElementById('announcementActive').checked = currentEditingAnnouncement.active;
    } else {
        currentEditingAnnouncement = null;
        title.textContent = 'Neue Ankündigung';
        document.getElementById('announcementForm').reset();
        document.getElementById('announcementActive').checked = true;
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentEditingAnnouncement = null;
}

async function saveAnnouncement() {
    const title = document.getElementById('announcementTitle').value;
    const type = document.getElementById('announcementType').value;
    const content = document.getElementById('announcementContent').value;
    const active = document.getElementById('announcementActive').checked;
    
    if (!title || !content) {
        alert('Titel und Inhalt sind erforderlich');
        return;
    }
    
    const announcementData = { title, type, content, active };
    
    try {
        const url = currentEditingAnnouncement 
            ? `/api/admin/announcements/${currentEditingAnnouncement.id}`
            : '/api/admin/announcements';
        const method = currentEditingAnnouncement ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcementData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern');
        }
        
        closeAnnouncementModal();
        loadAnnouncements();
        alert('Ankündigung erfolgreich gespeichert');
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
}

// News Modal Functions
function openNewsModal(newsId = null) {
    const modal = document.getElementById('newsModal');
    const title = document.getElementById('newsModalTitle');
    
    if (newsId) {
        currentEditingNews = adminData.news.find(n => n.id == newsId);
        title.textContent = 'Artikel bearbeiten';
        document.getElementById('newsTitle').value = currentEditingNews.title;
        document.getElementById('newsExcerpt').value = currentEditingNews.excerpt || '';
        document.getElementById('newsContent').value = currentEditingNews.content;
        document.getElementById('newsPublished').checked = currentEditingNews.published;
    } else {
        currentEditingNews = null;
        title.textContent = 'Neuer Artikel';
        document.getElementById('newsForm').reset();
        document.getElementById('newsPublished').checked = true;
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentEditingNews = null;
}

async function saveNews() {
    const title = document.getElementById('newsTitle').value;
    const excerpt = document.getElementById('newsExcerpt').value;
    const content = document.getElementById('newsContent').value;
    const published = document.getElementById('newsPublished').checked;
    
    if (!title || !content) {
        alert('Titel und Inhalt sind erforderlich');
        return;
    }
    
    const newsData = { title, excerpt, content, published };
    
    try {
        const url = currentEditingNews 
            ? `/api/admin/news/${currentEditingNews.id}`
            : '/api/admin/news';
        const method = currentEditingNews ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newsData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern');
        }
        
        closeNewsModal();
        loadNews();
        alert('Artikel erfolgreich gespeichert');
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
}

// Delete Functions
async function deleteUser(userId) {
    if (!confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Löschen');
        }
        
        loadUsers();
        alert('Benutzer erfolgreich gelöscht');
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
}

async function deleteAnnouncement(announcementId) {
    if (!confirm('Sind Sie sicher, dass Sie diese Ankündigung löschen möchten?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/announcements/${announcementId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Löschen');
        }
        
        loadAnnouncements();
        alert('Ankündigung erfolgreich gelöscht');
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
}

async function deleteNews(newsId) {
    if (!confirm('Sind Sie sicher, dass Sie diesen Artikel löschen möchten?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/news/${newsId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Löschen');
        }
        
        loadNews();
        alert('Artikel erfolgreich gelöscht');
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
}

function updateDashboardStats() {
    document.getElementById('total-users').textContent = adminData.users.length;
    document.getElementById('total-announcements').textContent = adminData.announcements.length;
    document.getElementById('active-announcements').textContent = 
        `${adminData.announcements.filter(a => a.active).length} aktiv`;
    document.getElementById('total-news').textContent = adminData.news.length;
    document.getElementById('published-news').textContent = 
        `${adminData.news.filter(n => n.published).length} veröffentlicht`;
    document.getElementById('total-training').textContent = adminData.trainingPrograms.length;
    document.getElementById('active-training').textContent = 
        `${adminData.trainingPrograms.filter(t => t.active).length} aktiv`;
}

function renderUsers() {
    const tbody = document.getElementById('users-tbody');
    if (tbody) {
        tbody.innerHTML = adminData.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email || '-'}</td>
                <td><span class="badge ${user.role}">${user.role}</span></td>
                <td>${new Date(user.created_at || user.createdAt).toLocaleDateString('de-DE')}</td>
                <td>
                    <button class="action-btn edit" onclick="openUserModal(${user.id})">Bearbeiten</button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})">Löschen</button>
                </td>
            </tr>
        `).join('');
    }
}

function renderAnnouncements() {
    const tbody = document.getElementById('announcements-tbody');
    if (tbody) {
        tbody.innerHTML = adminData.announcements.map(announcement => `
            <tr>
                <td>${announcement.id}</td>
                <td>${announcement.title}</td>
                <td><span class="badge ${announcement.type}">${announcement.type}</span></td>
                <td><span class="badge ${announcement.active ? 'success' : 'secondary'}">${announcement.active ? 'Aktiv' : 'Inaktiv'}</span></td>
                <td>${new Date(announcement.created_at).toLocaleDateString('de-DE')}</td>
                <td>
                    <button class="action-btn edit" onclick="openAnnouncementModal(${announcement.id})">Bearbeiten</button>
                    <button class="action-btn delete" onclick="deleteAnnouncement(${announcement.id})">Löschen</button>
                </td>
            </tr>
        `).join('');
    }
}

function renderNews() {
    const newsList = document.getElementById('news-list');
    if (newsList) {
        // Sort news based on current sort order
        const sortedNews = sortItems([...adminData.news], adminData.sortOrder.news);
        
        newsList.innerHTML = `
            <div class="admin-sort-controls">
                <label class="admin-label">Sortieren nach:</label>
                <select class="admin-input" style="width: auto; display: inline-block; margin-left: 0.5rem;" onchange="changeSortOrder('news', this.value)">
                    <option value="date-desc" ${adminData.sortOrder.news === 'date-desc' ? 'selected' : ''}>Neueste zuerst</option>
                    <option value="date-asc" ${adminData.sortOrder.news === 'date-asc' ? 'selected' : ''}>Älteste zuerst</option>
                    <option value="title-asc" ${adminData.sortOrder.news === 'title-asc' ? 'selected' : ''}>Titel A-Z</option>
                    <option value="title-desc" ${adminData.sortOrder.news === 'title-desc' ? 'selected' : ''}>Titel Z-A</option>
                    <option value="status" ${adminData.sortOrder.news === 'status' ? 'selected' : ''}>Veröffentlichte zuerst</option>
                </select>
            </div>
            ${sortedNews.map(article => `
                <div class="admin-item">
                    <div class="admin-item-header">
                        <div>
                            <h4 class="admin-item-title">${article.title}</h4>
                            <p class="admin-item-content">${article.excerpt || article.content?.substring(0, 150) + '...'}</p>
                            <div style="margin-top: 0.5rem;">
                                ${article.published ? 
                                    '<span class="admin-badge admin-badge-success"><i class="fas fa-eye"></i> Published</span>' : 
                                    '<span class="admin-badge admin-badge-secondary"><i class="fas fa-eye-slash"></i> Draft</span>'
                                }
                                <span style="font-size: 0.75rem; color: #6b7280; margin-left: 0.5rem;">
                                    Erstellt: ${formatDate(article.created_at || article.createdAt)}
                                </span>
                            </div>
                        </div>
                        <div class="admin-item-actions">
                            <button class="admin-button admin-button-secondary" style="padding: 0.5rem;" onclick="editNews(${article.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="admin-button admin-button-danger" style="padding: 0.5rem;" onclick="deleteNews(${article.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

function renderTrainingPrograms() {
    const trainingList = document.getElementById('training-list');
    if (trainingList) {
        trainingList.innerHTML = adminData.trainingPrograms.map(program => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <div>
                        <h4 class="admin-item-title">${program.name}</h4>
                        <p class="admin-item-content">${program.description}</p>
                        <div style="margin-top: 0.5rem;">
                            ${program.popular ? '<span class="admin-badge" style="background: var(--brand-orange);">Popular</span>' : ''}
                            ${program.active ? 
                                '<span class="admin-badge admin-badge-success">Active</span>' : 
                                '<span class="admin-badge admin-badge-secondary">Inactive</span>'
                            }
                            <span style="font-size: 0.875rem; color: #9ca3af; margin-left: 0.5rem;">
                                Price: ${program.price}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function editAnnouncement(id) {
    const announcement = adminData.announcements.find(a => a.id === id);
    if (!announcement) return;

    adminData.editingAnnouncement = announcement;
    
    document.getElementById('announcement-title').value = announcement.title;
    document.getElementById('announcement-content').value = announcement.content;
    document.getElementById('announcement-type').value = announcement.type;
    document.getElementById('announcement-active').checked = announcement.active;
    
    document.getElementById('announcement-form-title').textContent = 'Edit Announcement';
    document.getElementById('announcement-submit-btn').textContent = 'Update';
    document.getElementById('announcement-cancel-btn').classList.remove('hidden');
}

function cancelAnnouncementEdit() {
    adminData.editingAnnouncement = null;
    document.getElementById('announcement-form').reset();
    document.getElementById('announcement-active').checked = true;
    document.getElementById('announcement-form-title').textContent = 'Create Announcement';
    document.getElementById('announcement-submit-btn').textContent = 'Create';
    document.getElementById('announcement-cancel-btn').classList.add('hidden');
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
        await apiRequest(`/api/admin/announcements/${id}`, {
            method: 'DELETE'
        });
        loadAdminData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function editNews(id) {
    const article = adminData.news.find(n => n.id === id);
    if (!article) return;

    adminData.editingNews = article;
    
    document.getElementById('news-title').value = article.title;
    document.getElementById('news-excerpt').value = article.excerpt;
    document.getElementById('news-content').value = article.content;
    document.getElementById('news-published').checked = article.published;
    
    document.getElementById('news-form-title').textContent = 'Edit News Article';
    document.getElementById('news-submit-btn').textContent = 'Update';
    document.getElementById('news-cancel-btn').classList.remove('hidden');
}

// User Management Functions
function editUser(userId) {
    const user = adminData.users.find(u => u.id === userId);
    if (user) {
        adminData.editingUser = user;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-password').value = ''; // Don't show existing password
        document.getElementById('user-email').value = user.email || '';
        document.getElementById('user-role').value = user.role;
        
        document.getElementById('user-form-title').textContent = 'Benutzer bearbeiten';
        document.getElementById('user-submit-btn').textContent = 'Aktualisieren';
        document.getElementById('user-cancel-btn').classList.remove('hidden');
        
        // Switch to users tab if not already there
        showAdminTab('users');
    }
}

async function deleteUser(userId) {
    const user = adminData.users.find(u => u.id === userId);
    if (user && confirm(`Sind Sie sicher, dass Sie den Benutzer "${user.username}" löschen möchten?`)) {
        try {
            await apiRequest(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            loadAdminData();
            alert('Benutzer erfolgreich gelöscht!');
        } catch (error) {
            alert('Fehler beim Löschen des Benutzers: ' + error.message);
        }
    }
}

function cancelUserEdit() {
    adminData.editingUser = null;
    document.getElementById('user-form').reset();
    document.getElementById('user-form-title').textContent = 'Neuen Benutzer erstellen';
    document.getElementById('user-submit-btn').textContent = 'Benutzer erstellen';
    document.getElementById('user-cancel-btn').classList.add('hidden');
}

function cancelNewsEdit() {
    adminData.editingNews = null;
    document.getElementById('news-form').reset();
    document.getElementById('news-form-title').textContent = 'News Artikel erstellen';
    document.getElementById('news-submit-btn').textContent = 'Erstellen';
    document.getElementById('news-cancel-btn').classList.add('hidden');
}

async function deleteNews(id) {
    if (!confirm('Sind Sie sicher, dass Sie diesen News-Artikel löschen möchten?')) return;
    
    try {
        await apiRequest(`/api/admin/news/${id}`, {
            method: 'DELETE'
        });
        loadAdminData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Utility Functions for Sorting and Date Formatting
function formatDate(dateString) {
    if (!dateString) return 'Unbekannt';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('de-DE', options);
}

function sortItems(items, sortOrder) {
    return items.sort((a, b) => {
        switch(sortOrder) {
            case 'date-desc':
                return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
            case 'date-asc':
                return new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'type-asc':
                return a.type ? a.type.localeCompare(b.type) : 0;
            case 'status':
                // For announcements: active first, for news: published first
                if (a.active !== undefined) {
                    return b.active - a.active;
                } else if (a.published !== undefined) {
                    return b.published - a.published;
                }
                return 0;
            default:
                return 0;
        }
    });
}

function changeSortOrder(type, newOrder) {
    adminData.sortOrder[type] = newOrder;
    
    // Re-render the appropriate section
    if (type === 'announcements') {
        renderAnnouncements();
    } else if (type === 'news') {
        renderNews();
    }
}