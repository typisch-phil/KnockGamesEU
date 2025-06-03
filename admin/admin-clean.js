// Admin Panel State
let adminData = {
    isLoggedIn: false,
    sessionId: null,
    currentUser: null,
    users: [],
    announcements: [],
    news: [],
    trainingPrograms: []
};

// Initialize Admin Panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

// Initialize Admin Panel
function initializeAdminPanel() {
    // Check for existing session
    const savedSessionId = localStorage.getItem('adminSessionId');
    if (savedSessionId) {
        adminData.sessionId = savedSessionId;
        adminData.isLoggedIn = true;
        showAdminDashboard();
    }
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup periodic session validation (every 5 minutes)
    setInterval(validateSession, 5 * 60 * 1000);
}

// Mobile Menu Setup
function setupMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.admin-sidebar');
    
    // Show mobile button on small screens
    function checkMobileView() {
        if (window.innerWidth <= 1024) {
            if (mobileBtn) mobileBtn.style.display = 'flex';
        } else {
            if (mobileBtn) mobileBtn.style.display = 'none';
            if (sidebar) sidebar.classList.remove('open');
        }
    }
    
    // Initial check
    checkMobileView();
    
    // Check on resize
    window.addEventListener('resize', checkMobileView);
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Session Validation
async function validateSession() {
    try {
        const response = await fetch('/admin/validate-session.php', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Session validation failed');
        }
        
        const result = await response.json();
        
        if (!result.valid) {
            console.warn('Session invalid:', result.message);
            handleInvalidSession(result.message);
            return false;
        }
        
        // Session ist gültig - aktualisiere Benutzerdaten falls nötig
        if (result.username) {
            adminData.currentUser = {
                username: result.username,
                role: result.role,
                email: result.email || ''
            };
        }
        
        return true;
        
    } catch (error) {
        console.error('Session validation error:', error);
        handleInvalidSession('Verbindungsfehler bei Session-Überprüfung');
        return false;
    }
}

// Handle invalid session
function handleInvalidSession(message) {
    // Zeige Warnung
    showAlert('Session ungültig: ' + message + ' Sie werden abgemeldet.', 'error');
    
    // Kurze Verzögerung für Benutzer-Feedback
    setTimeout(() => {
        // Session-Daten löschen
        adminData.isLoggedIn = false;
        adminData.sessionId = null;
        adminData.currentUser = null;
        localStorage.removeItem('adminSessionId');
        
        // Umleitung zur Login-Seite
        window.location.href = '/admin/index.php';
    }, 2000);
}

// Alert system
function showAlert(message, type = 'info') {
    // Erstelle Alert-Element falls nicht vorhanden
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(alertContainer);
    }
    
    // Erstelle Alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    alert.style.cssText = `
        padding: 1rem 1.5rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Farben je nach Typ
    const colors = {
        'error': { bg: 'rgba(220, 53, 69, 0.9)', color: 'white' },
        'warning': { bg: 'rgba(255, 193, 7, 0.9)', color: '#333' },
        'success': { bg: 'rgba(40, 167, 69, 0.9)', color: 'white' },
        'info': { bg: 'rgba(23, 162, 184, 0.9)', color: 'white' }
    };
    
    const color = colors[type] || colors['info'];
    alert.style.backgroundColor = color.bg;
    alert.style.color = color.color;
    
    alertContainer.appendChild(alert);
    
    // Animation einblenden
    setTimeout(() => {
        alert.style.opacity = '1';
        alert.style.transform = 'translateX(0)';
    }, 100);
    
    // Automatisch ausblenden
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
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
        adminData.trainingPrograms = [];

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
async function showSection(sectionName) {
    // Validiere Session vor Sektionswechsel
    const isValid = await validateSession();
    if (!isValid) {
        return; // Session ungültig, Benutzer wird umgeleitet
    }
    
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
    
    // Update Seitentitel
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'users': 'Benutzer',
            'announcements': 'Ankündigungen',
            'news': 'News'
        };
        pageTitle.textContent = titles[sectionName] || 'Admin Panel';
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
        const users = await fetch('/api/admin/users').then(r => r.ok ? r.json() : []);
        adminData.users = users;
        renderUsers();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

async function loadAnnouncements() {
    try {
        const announcements = await fetch('/api/admin/announcements').then(r => r.ok ? r.json() : []);
        adminData.announcements = announcements;
        renderAnnouncements();
    } catch (error) {
        console.error('Failed to load announcements:', error);
    }
}

async function loadNews() {
    try {
        const news = await fetch('/api/admin/news').then(r => r.ok ? r.json() : []);
        adminData.news = news;
        renderNews();
    } catch (error) {
        console.error('Failed to load news:', error);
    }
}

function updateDashboardStats() {
    const totalUsersEl = document.getElementById('total-users');
    const totalAnnouncementsEl = document.getElementById('total-announcements');
    const activeAnnouncementsEl = document.getElementById('active-announcements');
    const totalNewsEl = document.getElementById('total-news');
    const publishedNewsEl = document.getElementById('published-news');
    const totalTrainingEl = document.getElementById('total-training');
    const activeTrainingEl = document.getElementById('active-training');

    if (totalUsersEl) totalUsersEl.textContent = adminData.users.length;
    if (totalAnnouncementsEl) totalAnnouncementsEl.textContent = adminData.announcements.length;
    if (activeAnnouncementsEl) activeAnnouncementsEl.textContent = 
        `${adminData.announcements.filter(a => a.active).length} aktiv`;
    if (totalNewsEl) totalNewsEl.textContent = adminData.news.length;
    if (publishedNewsEl) publishedNewsEl.textContent = 
        `${adminData.news.filter(n => n.published).length} veröffentlicht`;
    if (totalTrainingEl) totalTrainingEl.textContent = adminData.trainingPrograms.length;
    if (activeTrainingEl) activeTrainingEl.textContent = 
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
    const tbody = document.getElementById('news-tbody');
    if (tbody) {
        tbody.innerHTML = adminData.news.map(article => `
            <tr>
                <td>${article.id}</td>
                <td>${article.title}</td>
                <td>${article.excerpt || article.content.substring(0, 50) + '...'}</td>
                <td><span class="badge ${article.published ? 'success' : 'secondary'}">${article.published ? 'Veröffentlicht' : 'Entwurf'}</span></td>
                <td>${new Date(article.created_at).toLocaleDateString('de-DE')}</td>
                <td>
                    <button class="action-btn edit" onclick="openNewsModal(${article.id})">Bearbeiten</button>
                    <button class="action-btn delete" onclick="deleteNews(${article.id})">Löschen</button>
                </td>
            </tr>
        `).join('');
    }
}

function renderTrainingPrograms() {
    // Training programs functionality can be added later
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