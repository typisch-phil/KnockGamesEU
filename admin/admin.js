// Admin Panel State - Lokale Version ohne Node.js Backend
let adminData = {
    isLoggedIn: false,
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

// Standard Admin Login Daten
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Initialize Admin Panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

// Initialize Admin Panel
function initializeAdminPanel() {
    // Lade Daten aus localStorage
    loadLocalData();
    
    // Prüfe ob bereits eingeloggt
    const savedSession = localStorage.getItem('adminLoggedIn');
    if (savedSession === 'true') {
        adminData.isLoggedIn = true;
        adminData.currentUser = { username: 'admin', role: 'admin' };
        hideAdminLogin();
        showAdminDashboard();
        loadAdminData();
    }

    // Admin Login Form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const loginBtn = document.getElementById('admin-login-btn');
            const errorDiv = document.getElementById('admin-login-error');
            const errorText = document.getElementById('admin-login-error-text');

            loginBtn.textContent = 'Anmelden...';
            loginBtn.disabled = true;
            errorDiv.classList.add('hidden');

            // Lokale Authentifizierung
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                adminData.isLoggedIn = true;
                adminData.currentUser = { username: 'admin', role: 'admin' };
                localStorage.setItem('adminLoggedIn', 'true');

                document.getElementById('admin-username-display').textContent = username;
                
                hideAdminLogin();
                showAdminDashboard();
                loadAdminData();
            } else {
                errorText.textContent = 'Ungültige Anmeldedaten';
                errorDiv.classList.remove('hidden');
            }

            loginBtn.textContent = 'Anmelden';
            loginBtn.disabled = false;
        });
    }

    // Announcement Form
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                id: adminData.editingAnnouncement ? adminData.editingAnnouncement.id : Date.now(),
                title: document.getElementById('announcement-title').value,
                content: document.getElementById('announcement-content').value,
                type: document.getElementById('announcement-type').value,
                active: document.getElementById('announcement-active').checked,
                created_at: adminData.editingAnnouncement ? adminData.editingAnnouncement.created_at : new Date().toISOString()
            };

            if (adminData.editingAnnouncement) {
                // Update existing announcement
                const index = adminData.announcements.findIndex(a => a.id === adminData.editingAnnouncement.id);
                if (index !== -1) {
                    adminData.announcements[index] = formData;
                }
            } else {
                // Add new announcement
                adminData.announcements.push(formData);
            }

            saveLocalData();
            cancelAnnouncementEdit();
            loadAdminData();
        });
    }

    // News Form
    const newsForm = document.getElementById('news-form');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                id: adminData.editingNews ? adminData.editingNews.id : Date.now(),
                title: document.getElementById('news-title').value,
                content: document.getElementById('news-content').value,
                author: document.getElementById('news-author').value,
                published: document.getElementById('news-published').checked,
                created_at: adminData.editingNews ? adminData.editingNews.created_at : new Date().toISOString()
            };

            if (adminData.editingNews) {
                // Update existing news
                const index = adminData.news.findIndex(n => n.id === adminData.editingNews.id);
                if (index !== -1) {
                    adminData.news[index] = formData;
                }
            } else {
                // Add new news
                adminData.news.push(formData);
            }

            saveLocalData();
            cancelNewsEdit();
            loadAdminData();
        });
    }

    // User Form
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('user-username').value;
            const email = document.getElementById('user-email').value;
            const role = document.getElementById('user-role').value;
            
            // Prüfe auf doppelte Benutzernamen
            if (!adminData.editingUser && adminData.users.some(u => u.username === username)) {
                alert('Benutzername bereits vorhanden!');
                return;
            }

            const formData = {
                id: adminData.editingUser ? adminData.editingUser.id : Date.now(),
                username: username,
                email: email,
                role: role,
                created_at: adminData.editingUser ? adminData.editingUser.created_at : new Date().toISOString()
            };

            if (adminData.editingUser) {
                // Update existing user
                const index = adminData.users.findIndex(u => u.id === adminData.editingUser.id);
                if (index !== -1) {
                    adminData.users[index] = formData;
                }
            } else {
                // Add new user
                adminData.users.push(formData);
            }

            saveLocalData();
            cancelUserEdit();
            loadAdminData();
        });
    }

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            showAdminTab(tabName);
        });
    });

    // Logout Button
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', adminLogout);
    }

    // Sortierung Event Listeners
    const sortSelects = document.querySelectorAll('.sort-select');
    sortSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const type = e.target.getAttribute('data-type');
            const order = e.target.value;
            changeSortOrder(type, order);
        });
    });
}

function hideAdminLogin() {
    const loginSection = document.getElementById('admin-login');
    if (loginSection) {
        loginSection.style.display = 'none';
    }
}

function showAdminDashboard() {
    const dashboardSection = document.getElementById('admin-dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
    }
}

function hideAdminDashboard() {
    const dashboardSection = document.getElementById('admin-dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
    }
}

function showAdminTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

function adminLogout() {
    adminData.isLoggedIn = false;
    adminData.currentUser = null;
    localStorage.removeItem('adminLoggedIn');
    
    hideAdminDashboard();
    const loginSection = document.getElementById('admin-login');
    if (loginSection) {
        loginSection.style.display = 'block';
    }
    
    // Reset forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
}

function loadLocalData() {
    // Lade gespeicherte Daten aus localStorage
    const savedUsers = localStorage.getItem('knockgames_users');
    const savedAnnouncements = localStorage.getItem('knockgames_announcements');
    const savedNews = localStorage.getItem('knockgames_news');

    if (savedUsers) {
        adminData.users = JSON.parse(savedUsers);
    } else {
        // Initialdaten wenn keine vorhanden
        adminData.users = [
            {
                id: 1,
                username: 'TestUser1',
                email: 'test1@example.com',
                role: 'Spieler',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                username: 'TestUser2',
                email: 'test2@example.com',
                role: 'Moderator',
                created_at: new Date().toISOString()
            }
        ];
    }

    if (savedAnnouncements) {
        adminData.announcements = JSON.parse(savedAnnouncements);
    } else {
        adminData.announcements = [
            {
                id: 1,
                title: 'Willkommen bei KnockGames!',
                content: 'Herzlich willkommen auf unserem neuen Training Server!',
                type: 'info',
                active: true,
                created_at: new Date().toISOString()
            }
        ];
    }

    if (savedNews) {
        adminData.news = JSON.parse(savedNews);
    } else {
        adminData.news = [
            {
                id: 1,
                title: 'Server Launch',
                content: 'Unser neuer Training Server ist jetzt live!',
                author: 'Admin',
                published: true,
                created_at: new Date().toISOString()
            }
        ];
    }
}

function saveLocalData() {
    localStorage.setItem('knockgames_users', JSON.stringify(adminData.users));
    localStorage.setItem('knockgames_announcements', JSON.stringify(adminData.announcements));
    localStorage.setItem('knockgames_news', JSON.stringify(adminData.news));
}

async function loadAdminData() {
    updateDashboardStats();
    renderUsers();
    renderAnnouncements();
    renderNews();
}

function updateDashboardStats() {
    const statsElements = {
        'total-users': adminData.users.length,
        'total-announcements': adminData.announcements.length,
        'total-news': adminData.news.length,
        'active-announcements': adminData.announcements.filter(a => a.active).length
    };

    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function renderUsers() {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;

    if (adminData.users.length === 0) {
        usersList.innerHTML = '<div class="empty-state">Keine Benutzer vorhanden</div>';
        return;
    }

    usersList.innerHTML = adminData.users.map(user => `
        <div class="admin-item">
            <div class="item-content">
                <h4>${user.username}</h4>
                <p>Email: ${user.email}</p>
                <p>Rolle: ${user.role}</p>
                <p>Erstellt: ${formatDate(user.created_at)}</p>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editUser(${user.id})">Bearbeiten</button>
                <button class="btn-delete" onclick="deleteUser(${user.id})">Löschen</button>
            </div>
        </div>
    `).join('');
}

function renderAnnouncements() {
    const announcementsList = document.getElementById('announcements-list');
    if (!announcementsList) return;

    const sortedAnnouncements = sortItems(adminData.announcements, adminData.sortOrder.announcements);

    if (sortedAnnouncements.length === 0) {
        announcementsList.innerHTML = '<div class="empty-state">Keine Ankündigungen vorhanden</div>';
        return;
    }

    announcementsList.innerHTML = sortedAnnouncements.map(announcement => `
        <div class="admin-item">
            <div class="item-content">
                <h4>${announcement.title}</h4>
                <p>${announcement.content}</p>
                <p>Typ: ${announcement.type}</p>
                <p>Status: ${announcement.active ? 'Aktiv' : 'Inaktiv'}</p>
                <p>Erstellt: ${formatDate(announcement.created_at)}</p>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editAnnouncement(${announcement.id})">Bearbeiten</button>
                <button class="btn-delete" onclick="deleteAnnouncement(${announcement.id})">Löschen</button>
            </div>
        </div>
    `).join('');
}

function renderNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    const sortedNews = sortItems(adminData.news, adminData.sortOrder.news);

    if (sortedNews.length === 0) {
        newsList.innerHTML = '<div class="empty-state">Keine Nachrichten vorhanden</div>';
        return;
    }

    newsList.innerHTML = sortedNews.map(news => `
        <div class="admin-item">
            <div class="item-content">
                <h4>${news.title}</h4>
                <p>${news.content}</p>
                <p>Autor: ${news.author}</p>
                <p>Status: ${news.published ? 'Veröffentlicht' : 'Entwurf'}</p>
                <p>Erstellt: ${formatDate(news.created_at)}</p>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editNews(${news.id})">Bearbeiten</button>
                <button class="btn-delete" onclick="deleteNews(${news.id})">Löschen</button>
            </div>
        </div>
    `).join('');
}

function editAnnouncement(id) {
    const announcement = adminData.announcements.find(a => a.id === id);
    if (!announcement) return;

    adminData.editingAnnouncement = announcement;

    document.getElementById('announcement-title').value = announcement.title;
    document.getElementById('announcement-content').value = announcement.content;
    document.getElementById('announcement-type').value = announcement.type;
    document.getElementById('announcement-active').checked = announcement.active;

    const submitBtn = document.querySelector('#announcement-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Ankündigung Aktualisieren';
    }

    const cancelBtn = document.getElementById('cancel-announcement-edit');
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-block';
    }
}

function cancelAnnouncementEdit() {
    adminData.editingAnnouncement = null;
    document.getElementById('announcement-form').reset();
    
    const submitBtn = document.querySelector('#announcement-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Ankündigung Erstellen';
    }

    const cancelBtn = document.getElementById('cancel-announcement-edit');
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
}

function deleteAnnouncement(id) {
    if (confirm('Sind Sie sicher, dass Sie diese Ankündigung löschen möchten?')) {
        adminData.announcements = adminData.announcements.filter(a => a.id !== id);
        saveLocalData();
        loadAdminData();
    }
}

function editNews(id) {
    const news = adminData.news.find(n => n.id === id);
    if (!news) return;

    adminData.editingNews = news;

    document.getElementById('news-title').value = news.title;
    document.getElementById('news-content').value = news.content;
    document.getElementById('news-author').value = news.author;
    document.getElementById('news-published').checked = news.published;

    const submitBtn = document.querySelector('#news-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Nachricht Aktualisieren';
    }

    const cancelBtn = document.getElementById('cancel-news-edit');
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-block';
    }
}

function editUser(userId) {
    const user = adminData.users.find(u => u.id === userId);
    if (!user) return;

    adminData.editingUser = user;

    document.getElementById('user-username').value = user.username;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role;

    const submitBtn = document.querySelector('#user-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Benutzer Aktualisieren';
    }

    const cancelBtn = document.getElementById('cancel-user-edit');
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-block';
    }
}

function deleteUser(userId) {
    if (confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
        adminData.users = adminData.users.filter(u => u.id !== userId);
        saveLocalData();
        loadAdminData();
    }
}

function cancelUserEdit() {
    adminData.editingUser = null;
    document.getElementById('user-form').reset();
    
    const submitBtn = document.querySelector('#user-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Benutzer Erstellen';
    }

    const cancelBtn = document.getElementById('cancel-user-edit');
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
}

function cancelNewsEdit() {
    adminData.editingNews = null;
    document.getElementById('news-form').reset();
    
    const submitBtn = document.querySelector('#news-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Nachricht Erstellen';
    }

    const cancelBtn = document.getElementById('cancel-news-edit');
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
}

function deleteNews(id) {
    if (confirm('Sind Sie sicher, dass Sie diese Nachricht löschen möchten?')) {
        adminData.news = adminData.news.filter(n => n.id !== id);
        saveLocalData();
        loadAdminData();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function sortItems(items, sortOrder) {
    const sorted = [...items];
    
    switch (sortOrder) {
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'title-asc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default:
            return sorted;
    }
}

function changeSortOrder(type, newOrder) {
    adminData.sortOrder[type] = newOrder;
    loadAdminData();
}