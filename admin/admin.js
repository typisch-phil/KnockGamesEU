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
    editingNews: null
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
        const [users, announcements, news, trainingPrograms] = await Promise.all([
            apiRequest('/api/admin/users'),
            apiRequest('/api/admin/announcements'),
            apiRequest('/api/admin/news'),
            apiRequest('/api/admin/training-programs')
        ]);

        adminData.users = users;
        adminData.announcements = announcements;
        adminData.news = news;
        adminData.trainingPrograms = trainingPrograms;

        updateDashboardStats();
        renderUsers();
        renderAnnouncements();
        renderNews();
        renderTrainingPrograms();
    } catch (error) {
        console.error('Failed to load admin data:', error);
    }
}

function updateDashboardStats() {
    document.getElementById('total-users').textContent = adminData.users.length;
    document.getElementById('total-announcements').textContent = adminData.announcements.length;
    document.getElementById('active-announcements').textContent = 
        `${adminData.announcements.filter(a => a.active).length} active`;
    document.getElementById('total-news').textContent = adminData.news.length;
    document.getElementById('published-news').textContent = 
        `${adminData.news.filter(n => n.published).length} published`;
    document.getElementById('total-training').textContent = adminData.trainingPrograms.length;
    document.getElementById('active-training').textContent = 
        `${adminData.trainingPrograms.filter(t => t.active).length} active`;
}

function renderUsers() {
    const usersList = document.getElementById('users-list');
    if (usersList) {
        usersList.innerHTML = adminData.users.map(user => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <div>
                        <h4 class="admin-item-title">${user.username}</h4>
                        <p class="admin-item-content">
                            Role: <span class="admin-badge ${user.role === 'admin' ? 'admin-badge-error' : 'admin-badge-secondary'}">${user.role}</span>
                        </p>
                        <p style="font-size: 0.75rem; color: #6b7280;">
                            Created: ${new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderAnnouncements() {
    const announcementsList = document.getElementById('announcements-list');
    if (announcementsList) {
        announcementsList.innerHTML = adminData.announcements.map(announcement => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <div>
                        <h4 class="admin-item-title">${announcement.title}</h4>
                        <p class="admin-item-content">${announcement.content}</p>
                        <div style="margin-top: 0.5rem;">
                            <span class="admin-badge admin-badge-${announcement.type}">${announcement.type}</span>
                            ${announcement.active ? 
                                '<span class="admin-badge admin-badge-success"><i class="fas fa-eye"></i> Active</span>' : 
                                '<span class="admin-badge admin-badge-secondary"><i class="fas fa-eye-slash"></i> Inactive</span>'
                            }
                        </div>
                    </div>
                    <div class="admin-item-actions">
                        <button class="admin-button admin-button-secondary" style="padding: 0.5rem;" onclick="editAnnouncement(${announcement.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-button admin-button-danger" style="padding: 0.5rem;" onclick="deleteAnnouncement(${announcement.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderNews() {
    const newsList = document.getElementById('news-list');
    if (newsList) {
        newsList.innerHTML = adminData.news.map(article => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <div>
                        <h4 class="admin-item-title">${article.title}</h4>
                        <p class="admin-item-content">${article.excerpt}</p>
                        <div style="margin-top: 0.5rem;">
                            ${article.published ? 
                                '<span class="admin-badge admin-badge-success"><i class="fas fa-eye"></i> Published</span>' : 
                                '<span class="admin-badge admin-badge-secondary"><i class="fas fa-eye-slash"></i> Draft</span>'
                            }
                            <span style="font-size: 0.75rem; color: #6b7280; margin-left: 0.5rem;">
                                ${new Date(article.createdAt).toLocaleDateString()}
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
        `).join('');
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

function cancelNewsEdit() {
    adminData.editingNews = null;
    document.getElementById('news-form').reset();
    document.getElementById('news-form-title').textContent = 'Create News Article';
    document.getElementById('news-submit-btn').textContent = 'Create';
    document.getElementById('news-cancel-btn').classList.add('hidden');
}

async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    
    try {
        await apiRequest(`/api/admin/news/${id}`, {
            method: 'DELETE'
        });
        loadAdminData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}