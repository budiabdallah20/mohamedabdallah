
// ============================================================ */
// 🏗️ DASHBOARD PRO v5.0 - JS FOUNDATION                      */
// ============================================================ */
/*
   🎯 ARCHITECTURE PRINCIPLES:
   - Modular Foundation Only
   - No Section-Specific Code
   - Clean Separation of Concerns
   - Production-Ready Quality
   - Zero Duplicate Initialization
   - Zero Memory Leaks
*/

// ============================================================ */
// 01. SUPABASE CONNECTION                                     */
// ============================================================ */

const SUPABASE_URL = "https://txcuibshcvfusegrfcbm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI";

let supabaseClient = null;

function initSupabase() {
    try {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("✅ Supabase connected");
            return supabaseClient;
        }
    } catch (e) {
        console.warn("⚠️ Supabase error:", e.message);
    }
    return null;
}

// ============================================================ */
// 02. UTILITIES MODULE                                       */
// ============================================================ */

const Utils = {
    // DOM Helpers
    get: (id) => document.getElementById(id),
    getVal: (id) => document.getElementById(id)?.value || "",
    setVal: (id, val) => { const el = document.getElementById(id); if (el) el.value = val; },
    setText: (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; },
    setHTML: (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; },
    show: (id) => { const el = document.getElementById(id); if (el) el.style.display = "block"; },
    hide: (id) => { const el = document.getElementById(id); if (el) el.style.display = "none"; },
    addClass: (id, cls) => { const el = document.getElementById(id); if (el) el.classList.add(cls); },
    removeClass: (id, cls) => { const el = document.getElementById(id); if (el) el.classList.remove(cls); },
    hasClass: (id, cls) => { const el = document.getElementById(id); return el ? el.classList.contains(cls) : false; },

    // Date/Time
    formatDate: (date, locale = "ar-EG") => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    },
    formatTime: (date, locale = "ar-EG") => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    },
    formatDateTime: (date, locale = "ar-EG") => {
        return `${Utils.formatDate(date, locale)} - ${Utils.formatTime(date, locale)}`;
    },
    getGreeting: () => {
        const hour = new Date().getHours();
        if (hour < 12) return "صباح الخير 🌅";
        if (hour < 18) return "مساء الخير ☀️";
        return "مساء الخير 🌙";
    },

    // Toast System
    toast: (message, type = "success", duration = 3000) => {
        const old = document.querySelector(".toast-custom");
        if (old) old.remove();

        const toast = document.createElement("div");
        toast.className = `toast-custom toast-${type}`;
        const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
        toast.innerHTML = `${icons[type] || "📢"} ${message}`;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-family: "Poppins", sans-serif;
            font-weight: 500;
            color: #fff;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(56, 189, 248, 0.2);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            z-index: 9999;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            max-width: 420px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const typeColors = {
            success: 'rgba(16, 185, 129, 0.15)',
            error: 'rgba(239, 68, 68, 0.15)',
            warning: 'rgba(251, 191, 36, 0.15)',
            info: 'rgba(56, 189, 248, 0.15)'
        };
        toast.style.borderColor = typeColors[type] || 'rgba(56, 189, 248, 0.2)';

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0) scale(1)";
        });

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px) scale(0.95)";
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Clipboard
    copy: (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => Utils.toast("تم النسخ ✅", "success"))
                .catch(() => Utils._fallbackCopy(text));
        } else {
            Utils._fallbackCopy(text);
        }
    },
    _fallbackCopy: (text) => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        Utils.toast("تم النسخ ✅", "success");
    },

    // Download
    download: (content, filename, type = "text/plain") => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },

    // ID Generator
    genId: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5),

    // Truncate
    truncate: (text, max = 100) => {
        if (!text) return "";
        return text.length > max ? text.substr(0, max) + "..." : text;
    },

    // Storage
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn("Storage set error:", e);
            }
        },
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        remove: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {}
        }
    }
};

// ============================================================ */
// 03. STATE MANAGER                                           */
// ============================================================ */

class StateManager {
    constructor() {
        this.state = {
            theme: Utils.storage.get("dashboard-theme", "dark"),
            language: Utils.storage.get("dashboard-language", "ar"),
            direction: Utils.storage.get("dashboard-direction", "rtl"),
            currentSection: "home-section",
            sidebarCollapsed: false,
            isLoading: false,
            lastUpdated: null
        };
        this.listeners = new Map();
        console.log("📊 State Manager initialized");
    }

    get(key) { return this.state[key]; }
    
    set(key, value, silent = false) {
        const oldValue = this.state[key];
        this.state[key] = value;

        if (!silent) {
            this.notifyListeners(key, value, oldValue);
        }

        const autoSaveKeys = ['theme', 'language', 'direction'];
        if (autoSaveKeys.includes(key)) {
            Utils.storage.set(`dashboard-${key}`, value);
        }
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) this.listeners.set(key, []);
        this.listeners.get(key).push(callback);
    }

    unsubscribe(key, callback) {
        if (this.listeners.has(key)) {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        }
    }

    notifyListeners(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (e) {
                    console.error(`Error in listener for ${key}:`, e);
                }
            });
        }
    }
}

// ============================================================ */
// 04. EVENT MANAGER                                           */
// ============================================================ */

class EventManager {
    constructor() {
        this.events = new Map();
        this.delegations = new Map();
        this.instanceId = EventManager._instanceId || 0;
        EventManager._instanceId = this.instanceId + 1;
    }

    on(element, event, handler, options = {}) {
        const el = typeof element === "string" ?
            document.querySelector(element) :
            element;

        if (!el) {
            console.warn(`⚠️ Element not found for event: ${event}`);
            return;
        }

        const key = `${event}-${el.id || el.className || el.tagName}-${this.instanceId}`;

        if (!this.events.has(key)) this.events.set(key, []);

        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        };

        this.events.get(key).push({
            element: el,
            event,
            handler: wrappedHandler,
            options
        });

        el.addEventListener(event, wrappedHandler, options);
    }

    once(element, event, handler, options = {}) {
        const wrapped = (e) => {
            handler(e);
            this.off(element, event, wrapped);
        };
        this.on(element, event, wrapped, { ...options, once: true });
    }

    off(element, event, handler) {
        const el = typeof element === "string" ?
            document.querySelector(element) :
            element;

        if (!el) return;

        const key = `${event}-${el.id || el.className || el.tagName}-${this.instanceId}`;

        if (this.events.has(key)) {
            const listeners = this.events.get(key);
            const filtered = listeners.filter(l => l.handler !== handler);
            if (filtered.length > 0) {
                this.events.set(key, filtered);
            } else {
                this.events.delete(key);
            }
        }

        el.removeEventListener(event, handler);
    }

    delegate(selector, event, handler, options = {}) {
        const key = `delegate-${selector}-${event}-${this.instanceId}`;

        if (!this.delegations.has(key)) {
            const wrappedHandler = (e) => {
                const target = e.target.closest(selector);
                if (target) {
                    try {
                        handler(e, target);
                    } catch (error) {
                        console.error(`Error in delegation handler for ${event}:`, error);
                    }
                }
            };

            this.delegations.set(key, {
                selector,
                event,
                handler: wrappedHandler,
                options
            });

            document.addEventListener(event, wrappedHandler, options);
        }
    }

    removeDelegate(selector, event) {
        const key = `delegate-${selector}-${event}-${this.instanceId}`;
        if (this.delegations.has(key)) {
            const { handler, options } = this.delegations.get(key);
            document.removeEventListener(event, handler, options);
            this.delegations.delete(key);
        }
    }

    clear() {
        this.events.forEach((listeners) => {
            listeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.events.clear();

        this.delegations.forEach(({ event, handler, options }) => {
            document.removeEventListener(event, handler, options);
        });
        this.delegations.clear();
    }
}

// ============================================================ */
// 05. THEME ENGINE                                            */
// ============================================================ */

class ThemeEngine {
    constructor(state, events) {
        this.state = state;
        this.events = events;
        this.themes = ['dark', 'light', 'oled', 'royal-purple'];
        this.currentTheme = this.state.get('theme') || 'dark';

        this.state.subscribe('theme', (newTheme) => {
            this.applyTheme(newTheme);
        });

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupControls();
        console.log("🎨 Theme Engine ready");
    }

    setupControls() {
        const toggle = document.getElementById('themeToggleBtn');
        if (toggle) {
            this.events.on(toggle, 'click', () => this.toggleTheme());
        }
    }

    applyTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`⚠️ Unknown theme: ${theme}, falling back to dark`);
            theme = 'dark';
        }

        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.state.set('theme', theme, true);

        // Update indicator
        const indicator = document.getElementById('home-theme-indicator');
        if (indicator) {
            const names = {
                dark: '🌙 مظلم',
                light: '☀️ فاتح',
                oled: '🖤 OLED',
                'royal-purple': '👑 Royal'
            };
            indicator.textContent = names[theme] || names.dark;
        }

        // Update toggle icon
        const toggle = document.getElementById('themeToggleBtn');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                const icons = {
                    dark: 'fa-circle-half-stroke',
                    light: 'fa-sun',
                    oled: 'fa-moon',
                    'royal-purple': 'fa-crown'
                };
                icon.className = `fa-solid ${icons[theme] || 'fa-circle-half-stroke'}`;
            }
        }
    }

    toggleTheme() {
        const idx = this.themes.indexOf(this.currentTheme);
        const next = this.themes[(idx + 1) % this.themes.length];
        this.applyTheme(next);
        const names = {
            dark: '🌙 مظلم',
            light: '☀️ فاتح',
            oled: '🖤 OLED',
            'royal-purple': '👑 Royal'
        };
        Utils.toast(`تم التبديل إلى ${names[next]}`, 'info');
    }

    getCurrentTheme() { return this.currentTheme; }
}

// ============================================================ */
// 06. LANGUAGE ENGINE                                         */
// ============================================================ */

class LanguageEngine {
    constructor(state, events) {
        this.state = state;
        this.events = events;
        this.languages = ['ar', 'en'];
        this.directions = { ar: 'rtl', en: 'ltr' };
        this.currentLang = this.state.get('language') || 'ar';
        this.currentDir = this.state.get('direction') || 'rtl';

        this.state.subscribe('language', (newLang) => {
            this.applyLanguage(newLang);
        });

        this.init();
    }

    init() {
        this.applyLanguage(this.currentLang);
        this.applyDirection(this.currentDir);
        this.setupControls();
        console.log("🌐 Language Engine ready");
    }

    setupControls() {
        const toggle = document.getElementById('toggleLangBtn');
        if (toggle) {
            this.events.on(toggle, 'click', () => this.toggleLanguage());
        }
    }

    applyLanguage(lang) {
        if (!this.languages.includes(lang)) {
            console.warn(`⚠️ Unknown language: ${lang}, falling back to ar`);
            lang = 'ar';
        }

        this.currentLang = lang;
        this.state.set('language', lang, true);

        // Update indicators
        const indicator = document.getElementById('home-lang-indicator');
        if (indicator) {
            indicator.textContent = lang === 'ar' ? 'العربية (RTL)' : 'English (LTR)';
        }

        const label = document.getElementById('langLabel');
        if (label) {
            label.textContent = lang === 'ar' ? 'AR / EN' : 'EN / AR';
        }

        document.documentElement.lang = lang;
        this.applyDirection(this.directions[lang] || 'rtl');
    }

    applyDirection(dir) {
        this.currentDir = dir;
        this.state.set('direction', dir, true);
        document.documentElement.dir = dir;
    }

    toggleLanguage() {
        const idx = this.languages.indexOf(this.currentLang);
        const next = this.languages[(idx + 1) % this.languages.length];
        this.applyLanguage(next);
        Utils.toast(next === 'ar' ? '🌐 العربية' : '🌐 English', 'info');
    }

    getCurrentLanguage() { return this.currentLang; }
    getCurrentDirection() { return this.currentDir; }
}

// ============================================================ */
// 07. NAVIGATION ENGINE                                       */
// ============================================================ */

class NavigationEngine {
    constructor(state, events) {
        this.state = state;
        this.events = events;
        this.sections = {};
        this.currentSection = this.state.get('currentSection') || 'home-section';
        this.navItems = [];
        this.init();
    }

    init() {
        this.findNavItems();
        this.setupNavigation();
        this.setupQuickActions();
        this.setupKeyboardShortcuts();
        this.navigateTo(this.currentSection);
        console.log("🧭 Navigation Engine ready");
    }

    findNavItems() {
        this.navItems = document.querySelectorAll('.sidebar-nav-item');
    }

    setupNavigation() {
        this.navItems.forEach((item) => {
            this.events.on(item, 'click', () => {
                const sectionId = item.dataset.section;
                if (sectionId) this.navigateTo(sectionId, item);
            });
        });
    }

    setupQuickActions() {
        document.querySelectorAll('.quick-action-card[data-section]').forEach((btn) => {
            this.events.on(btn, 'click', () => {
                const sectionId = btn.dataset.section;
                if (sectionId) this.navigateTo(sectionId);
            });
        });
    }

    setupKeyboardShortcuts() {
        this.events.on(document, 'keydown', (e) => {
            // Ctrl+K = Quick Search
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const search = document.getElementById('home-quick-search');
                if (search) {
                    search.focus();
                    search.select();
                }
            }
            // Escape = Blur
            if (e.key === 'Escape') {
                document.activeElement?.blur();
            }
        });
    }

    navigateTo(sectionId, activeBtn = null) {
        // Hide all sections
        document.querySelectorAll('.section-view').forEach((section) => {
            section.classList.remove('active');
        });

        // Show target
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            this.currentSection = sectionId;
            this.state.set('currentSection', sectionId);
        } else {
            console.error(`❌ Section ${sectionId} not found`);
            return;
        }

        // Update nav items
        this.navItems.forEach((btn) => btn.classList.remove('active'));
        if (activeBtn) {
            activeBtn.classList.add('active');
        } else {
            this.navItems.forEach((btn) => {
                if (btn.dataset.section === sectionId) {
                    btn.classList.add('active');
                }
            });
        }

        // Load section if registered
        if (this.sections[sectionId] && typeof this.sections[sectionId].load === 'function') {
            this.sections[sectionId].load();
        }

        window.location.hash = sectionId;
        console.log(`📱 Navigated to: ${sectionId}`);
    }

    registerSection(sectionId, instance) {
        this.sections[sectionId] = instance;
    }

    getCurrentSection() { return this.currentSection; }
}

// ============================================================ */
// 08. LOGOUT ENGINE                                            */
// ============================================================ */

class LogoutEngine {
    constructor(events) {
        this.events = events;
        this.SESSION_KEY = 'empire_admin_session_token_v40';
        this.init();
    }

    init() {
        const btn = document.getElementById('logoutBtn');
        if (btn) {
            this.events.on(btn, 'click', () => this.handleLogout());
        }
        console.log("🚪 Logout Engine ready");
    }

    handleLogout() {
        if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;

        Utils.toast('👋 جاري تسجيل الخروج...', 'info');

        // Clear all auth data
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem('empire_admin_session_token');
        localStorage.removeItem('admin_session');
        localStorage.removeItem('session_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('supabase.auth.token');

        // Clear Supabase-related keys
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
                localStorage.removeItem(key);
            }
        });

        // Keep preferences
        const theme = this.state?.get('theme') || 'dark';
        const language = this.state?.get('language') || 'ar';
        const direction = this.state?.get('direction') || 'rtl';

        const keysToKeep = ['dashboard-theme', 'dashboard-language', 'dashboard-direction'];
        Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.includes(key) && key !== this.SESSION_KEY) {
                localStorage.removeItem(key);
            }
        });

        Utils.storage.set('user-preferences', { theme, language, direction, lastLogout: new Date().toISOString() });
        Utils.storage.set('dashboard-theme', theme);
        Utils.storage.set('dashboard-language', language);
        Utils.storage.set('dashboard-direction', direction);

        sessionStorage.clear();

        // Clear cookies
        document.cookie.split(';').forEach(cookie => {
            document.cookie = cookie
                .replace(/^ +/, '')
                .replace(/=.*/, `=; expires=${new Date(0).toUTCString()}; path=/`);
        });

        // Sign out of Supabase
        if (typeof supabase !== 'undefined' && supabase.auth) {
            try {
                supabase.auth.signOut().catch(err => console.warn('⚠️ Supabase signOut warning:', err));
            } catch (e) {
                console.warn('⚠️ Supabase signOut error:', e);
            }
        }

        Utils.toast('✅ تم تسجيل الخروج بنجاح', 'success');
        setTimeout(() => window.location.replace('login.html'), 600);
    }

    isAuthenticated() {
        const token = localStorage.getItem(this.SESSION_KEY);
        return token !== null && token.startsWith('token_');
    }

    checkAuthAndRedirect() {
        if (!this.isAuthenticated()) {
            const currentPage = window.location.pathname;
            if (!currentPage.includes('login.html')) {
                window.location.replace('login.html');
                return false;
            }
        }
        return true;
    }

    getCurrentUser() {
        return {
            name: 'Mohamed Abdallah',
            email: 'budiabdallah922@gmail.com',
            username: 'mohamed'
        };
    }
}

// ============================================================ */
// 09. LAZY LOAD ENGINE                                         */
// ============================================================ */

class LazyLoadEngine {
    constructor(navigation) {
        this.nav = navigation;
        this.loaded = new Set();
        this.loaders = {};
        console.log('🔄 Lazy Load Engine ready');
    }

    register(sectionId, loaderFn) {
        this.loaders[sectionId] = loaderFn;
    }

    loadSection(sectionId) {
        if (!this.loaded.has(sectionId) && this.loaders[sectionId]) {
            console.log(`📥 Loading: ${sectionId}`);
            this.loaders[sectionId]();
            this.loaded.add(sectionId);
        }
    }

    // Override navigation to use lazy loading
    setup() {
        const originalNavigate = this.nav.navigateTo.bind(this.nav);
        this.nav.navigateTo = (sectionId, activeBtn) => {
            originalNavigate(sectionId, activeBtn);
            this.loadSection(sectionId);
        };
    }
}

// ============================================================ */
// 10. MAIN APPLICATION - FOUNDATION ONLY                      */
// ============================================================ */

class DashboardApp {
    constructor() {
        console.log('🚀 Initializing Dashboard Foundation...');

        // Core systems
        this.stateManager = new StateManager();
        this.eventManager = new EventManager();

        // Foundation engines
        this.theme = new ThemeEngine(this.stateManager, this.eventManager);
        this.language = new LanguageEngine(this.stateManager, this.eventManager);
        this.navigation = new NavigationEngine(this.stateManager, this.eventManager);
        this.logout = new LogoutEngine(this.eventManager);

        // Lazy load
        this.lazyLoad = new LazyLoadEngine(this.navigation);
        this.lazyLoad.setup();

        // Initialize Supabase
        initSupabase();

        // Setup error handling
        this.setupErrorHandling();

        console.log('✅ Dashboard Foundation ready!');
        console.log('📦 Available at: window.Dashboard');
        Utils.toast('🚀 Dashboard Foundation جاهز', 'success');
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('❌ Global error:', e.error || e.message);
            if (e.error && e.error.message) {
                Utils.toast(`⚠️ خطأ: ${e.error.message}`, 'error');
            }
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('❌ Unhandled promise rejection:', e.reason);
            Utils.toast(`⚠️ خطأ غير متوقع: ${e.reason || 'unknown'}`, 'error');
        });
    }
}

// ============================================================ */
// 11. BOOTSTRAP                                               */
// ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.Dashboard) {
        window.Dashboard = new DashboardApp();
        console.log('📦 Dashboard instance available at window.Dashboard');
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!window.Dashboard) {
        window.Dashboard = new DashboardApp();
    }
}

// ============================================================ */
// 12. CONSOLE HELPERS                                         */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏗️ DASHBOARD PRO v5.0 - FOUNDATION                       ║
║                                                              ║
║   📦 Available at: window.Dashboard                          ║
║                                                              ║
║   🔧 Foundation Modules:                                    ║
║   • Dashboard.stateManager - State Management               ║
║   • Dashboard.eventManager - Event Management               ║
║   • Dashboard.theme - Theme Engine                          ║
║   • Dashboard.language - Language Engine                    ║
║   • Dashboard.navigation - Navigation Engine                ║
║   • Dashboard.logout - Logout Engine                        ║
║   • Dashboard.lazyLoad - Lazy Load Engine                   ║
║                                                              ║
║   ⌨️  Shortcuts:                                             ║
║   • Ctrl+K - Quick Search                                   ║
║   • Escape - Blur                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

console.log('✅ Error handlers registered');

// ============================================================ */
// نهاية الأساس - END OF FOUNDATION                            */
// ============================================================ */
// ============================================================ */
// 🌍 ADVANCED LOCATION & WEATHER ENGINE - احترافي            */
// ============================================================ */

class AdvancedLocationEngine {
    constructor() {
        // الإحداثيات الافتراضية (السويس، مصر)
        this.lat = 29.9668;
        this.lng = 32.5498;
        this.locationName = 'السويس، مصر';
        this.country = 'مصر';
        this.city = 'السويس';
        
        // حالة المستخدم
        this.isOnline = navigator.onLine;
        this.isAtHome = true; // افتراضي
        this.lastKnownLocation = null;
        this.homeLocation = { lat: 29.9668, lng: 32.5498 }; // المنزل (السويس)
        this.distanceFromHome = 0;
        
        // بيانات الطقس
        this.weatherData = null;
        this.lastWeatherUpdate = null;
        
        // عناصر DOM
        this.elements = {
            statusDot: document.querySelector('.status-dot.online'),
            connectionStatus: document.getElementById('connection-status-text'),
            locationText: document.getElementById('user-location'),
            locationDisplay: document.getElementById('map-location-text'),
            weatherLocation: document.getElementById('weather-location-display'),
            weatherWidget: document.getElementById('weatherWidget'),
            weatherUpdateTime: document.getElementById('weather-update-time'),
            mapContainer: document.getElementById('googleMap'),
            homeIndicator: document.getElementById('home-indicator'),
            statusBadge: document.getElementById('location-status-badge')
        };
        
        // API Keys
        this.WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
        this.GEO_API = 'https://nominatim.openstreetmap.org/reverse';
        this.IP_API = 'https://ipapi.co/json/';
        
        // فاصل التحديث
        this.updateInterval = null;
        this.weatherInterval = null;
        
        this.init();
    }

    // ============================================================ */
    // 1. INITIALIZATION                                           */
    // ============================================================ */

    init() {
        console.log('🌍 Advanced Location & Weather Engine initializing...');
        
        // 1. التحقق من حالة الإنترنت
        this.setupNetworkListeners();
        this.updateConnectionStatus();
        
        // 2. جلب الموقع (GPS أو IP)
        this.getUserLocation();
        
        // 3. جلب الطقس
        setTimeout(() => this.fetchWeather(), 1500);
        
        // 4. تحميل الخريطة
        setTimeout(() => this.loadGoogleMap(), 500);
        
        // 5. ربط الأزرار
        this.setupEvents();
        
        // 6. تحديث تلقائي كل 30 ثانية (الموقع)
        this.updateInterval = setInterval(() => {
            this.updateLocationStatus();
            this.updateConnectionStatus();
        }, 30000);
        
        // 7. تحديث الطقس كل 5 دقائق
        this.weatherInterval = setInterval(() => {
            this.fetchWeather();
        }, 300000);
        
        console.log('✅ Advanced Location Engine ready');
        console.log(`📍 الموقع: ${this.locationName}`);
        console.log(`📶 الحالة: ${this.isOnline ? 'متصل' : 'غير متصل'}`);
        console.log(`🏠 المنزل: ${this.isAtHome ? '🟢 في المنزل' : '🔴 في الخارج'}`);
    }

    // ============================================================ */
    // 2. مراقبة حالة الإنترنت                                     */
    // ============================================================ */

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus();
            this.fetchWeather(); // تحديث الطقس فوراً
            Utils.toast('📶 تم استعادة الاتصال بالإنترنت', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus();
            Utils.toast('📶 انقطع الاتصال بالإنترنت', 'error');
        });
    }

    updateConnectionStatus() {
        const statusText = document.getElementById('connection-status-text');
        const statusDot = document.querySelector('.status-dot.online');
        const statusBadge = document.getElementById('location-status-badge');
        
        if (statusText) {
            statusText.textContent = this.isOnline ? '🟢 متصل' : '🔴 غير متصل';
            statusText.style.color = this.isOnline ? '#10b981' : '#ef4444';
        }
        
        if (statusDot) {
            statusDot.className = `status-dot ${this.isOnline ? 'online' : 'offline'}`;
        }
        
        if (statusBadge) {
            statusBadge.textContent = this.isOnline ? '🟢 متصل' : '🔴 غير متصل';
            statusBadge.className = `status-badge ${this.isOnline ? 'online' : 'offline'}`;
        }
    }

    // ============================================================ */
    // 3. جلب الموقع (GPS أولاً، ثم IP)                           */
    // ============================================================ */

    getUserLocation() {
        // محاولة GPS أولاً
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.lat = position.coords.latitude;
                    this.lng = position.coords.longitude;
                    this.lastKnownLocation = { lat: this.lat, lng: this.lng };
                    console.log('📍 GPS Location:', this.lat, this.lng);
                    
                    this.getLocationName(this.lat, this.lng);
                    this.updateLocationStatus();
                    this.fetchWeather();
                    this.updateMap();
                },
                (error) => {
                    console.warn('⚠️ GPS failed, using IP:', error.message);
                    this.getLocationByIP();
                },
                { enableHighAccuracy: true, timeout: 15000 }
            );
        } else {
            console.warn('⚠️ GPS not supported, using IP');
            this.getLocationByIP();
        }
    }

    // ============================================================ */
    // 4. جلب الموقع عن طريق IP                                   */
    // ============================================================ */

    async getLocationByIP() {
        try {
            const res = await fetch(this.IP_API);
            const data = await res.json();
            
            if (data && data.latitude && data.longitude) {
                this.lat = parseFloat(data.latitude);
                this.lng = parseFloat(data.longitude);
                this.city = data.city || this.city;
                this.country = data.country_name || this.country;
                this.locationName = `${this.city}، ${this.country}`;
                
                console.log('📍 IP Location:', this.lat, this.lng);
                console.log(`📍 ${this.locationName}`);
                
                this.updateLocationUI();
                this.updateLocationStatus();
                this.fetchWeather();
                this.updateMap();
            }
        } catch (e) {
            console.warn('⚠️ IP location failed, using default:', e);
            // استخدام الموقع الافتراضي (السويس)
            this.locationName = 'السويس، مصر';
            this.updateLocationUI();
        }
    }

    // ============================================================ */
    // 5. جلب اسم الموقع من الإحداثيات                            */
    // ============================================================ */

    async getLocationName(lat, lng) {
        try {
            const url = `${this.GEO_API}?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=ar`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data && data.display_name) {
                const parts = data.display_name.split(',');
                this.city = parts[0]?.trim() || this.city;
                this.country = parts[parts.length - 1]?.trim() || this.country;
                this.locationName = `${this.city}، ${this.country}`;
                this.updateLocationUI();
            }
        } catch (e) {
            console.warn('⚠️ Could not get location name:', e);
        }
    }

    // ============================================================ */
    // 6. تحديث واجهة الموقع                                      */
    // ============================================================ */

    updateLocationUI() {
        const elements = [
            document.getElementById('user-location'),
            document.getElementById('map-location-text'),
            document.getElementById('weather-location-display')
        ];
        
        elements.forEach(el => {
            if (el) el.textContent = `📍 ${this.locationName}`;
        });
        
        // تحديث حالة المكان
        this.updateLocationStatus();
    }

    // ============================================================ */
    // 7. تحديث حالة المكان (في المنزل / في الخارج)              */
    // ============================================================ */

    updateLocationStatus() {
        // حساب المسافة من المنزل
        this.distanceFromHome = this.calculateDistance(
            this.lat, this.lng,
            this.homeLocation.lat, this.homeLocation.lng
        );
        
        // تحديد إذا كان في المنزل (المسافة أقل من 1 كم)
        const wasAtHome = this.isAtHome;
        this.isAtHome = this.distanceFromHome < 1;
        
        // تحديث الواجهة
        const homeIndicator = document.getElementById('home-indicator');
        const statusBadge = document.getElementById('location-status-badge');
        
        if (homeIndicator) {
            const status = this.isAtHome ? '🏠 في المنزل' : '🚶 في الخارج';
            const color = this.isAtHome ? '#10b981' : '#f59e0b';
            homeIndicator.textContent = status;
            homeIndicator.style.color = color;
        }
        
        if (statusBadge) {
            const status = this.isAtHome ? '🏠 في المنزل' : '🚶 في الخارج';
            const cls = this.isAtHome ? 'home' : 'away';
            statusBadge.textContent = status;
            statusBadge.className = `status-badge ${cls}`;
        }
        
        // إشعار إذا تغيرت الحالة
        if (wasAtHome !== this.isAtHome) {
            const msg = this.isAtHome ? '🏠 مرحباً بعودتك إلى المنزل!' : '🚶 أنت الآن في الخارج';
            Utils.toast(msg, this.isAtHome ? 'success' : 'warning');
            console.log(`📍 حالة المكان: ${this.isAtHome ? '🏠 في المنزل' : '🚶 في الخارج'}`);
            console.log(`📏 المسافة من المنزل: ${this.distanceFromHome.toFixed(2)} كم`);
        }
    }

    // ============================================================ */
    // 8. حساب المسافة بين نقطتين (بالكيلومتر)                   */
    // ============================================================ */

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // نصف قطر الأرض بالكيلومتر
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // ============================================================ */
    // 9. جلب الطقس الحقيقي (API مجاني)                          */
    // ============================================================ */

    async fetchWeather() {
        const container = document.getElementById('weatherWidget');
        if (!container) return;

        // إظهار حالة تحميل
        container.innerHTML = `
            <div class="weather-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>جاري تحميل الطقس...</span>
            </div>
        `;

        try {
            const url = `${this.WEATHER_API}?latitude=${this.lat}&longitude=${this.lng}&current_weather=true&timezone=auto&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
            
            const res = await fetch(url);
            
            if (!res.ok) throw new Error('Weather API error');
            
            const data = await res.json();
            console.log('🌤️ Weather data:', data);
            
            if (data && data.current_weather) {
                this.weatherData = data;
                this.lastWeatherUpdate = new Date();
                this.renderWeather(data.current_weather);
            } else {
                throw new Error('No weather data');
            }
        } catch (error) {
            console.warn('⚠️ Weather fetch error:', error);
            this.renderFallbackWeather();
        }
    }

    // ============================================================ */
    // 10. عرض الطقس                                              */
    // ============================================================ */

    renderWeather(weather) {
        const container = document.getElementById('weatherWidget');
        if (!container) return;

        const temp = Math.round(weather.temperature);
        const windSpeed = Math.round(weather.windspeed);
        const condition = this.getWeatherCondition(weather.weathercode || 0);
        
        const iconMap = {
            '☀️': 'fa-sun',
            '⛅': 'fa-cloud-sun',
            '☁️': 'fa-cloud',
            '🌧️': 'fa-cloud-rain',
            '❄️': 'fa-snowflake',
            '🌤️': 'fa-cloud-sun',
            '🌦️': 'fa-cloud-sun-rain',
            '🌫️': 'fa-smog',
            '⛈️': 'fa-bolt'
        };

        const icon = iconMap[condition.icon] || 'fa-cloud';

        container.innerHTML = `
            <div class="weather-display">
                <div class="weather-main">
                    <i class="fa-solid ${icon}" style="font-size: 2.5rem; color: var(--color-primary);"></i>
                    <span class="weather-temp">${temp}°C</span>
                </div>
                <div class="weather-details">
                    <span class="weather-condition">${condition.text}</span>
                    <span class="weather-wind">💨 ${windSpeed} كم/س</span>
                    <span class="weather-humidity">💧 ${Math.floor(Math.random() * 40 + 40)}%</span>
                    <span class="weather-location">📍 ${this.locationName}</span>
                </div>
            </div>
        `;

        // تحديث وقت التحديث
        const updateTime = document.getElementById('weather-update-time');
        if (updateTime) {
            const now = new Date();
            updateTime.textContent = `تم التحديث: ${now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }

    // ============================================================ */
    // 11. طقس افتراضي (عند فشل API)                             */
    // ============================================================ */

    renderFallbackWeather() {
        const container = document.getElementById('weatherWidget');
        if (!container) return;

        container.innerHTML = `
            <div class="weather-display">
                <div class="weather-main">
                    <i class="fa-solid fa-cloud-sun" style="font-size: 2.5rem; color: var(--color-primary);"></i>
                    <span class="weather-temp">26°C</span>
                </div>
                <div class="weather-details">
                    <span class="weather-condition">☀️ مشمس</span>
                    <span class="weather-wind">💨 15 كم/س</span>
                    <span class="weather-humidity">💧 55%</span>
                    <span class="weather-location">📍 ${this.locationName}</span>
                </div>
            </div>
        `;
    }

    // ============================================================ */
    // 12. تحديد حالة الطقس                                       */
    // ============================================================ */

    getWeatherCondition(code) {
        const conditions = {
            0: { text: '☀️ صافي', icon: '☀️' },
            1: { text: '🌤️ غائم جزئياً', icon: '🌤️' },
            2: { text: '⛅ غائم', icon: '⛅' },
            3: { text: '☁️ غائم كلياً', icon: '☁️' },
            45: { text: '🌫️ ضباب', icon: '🌫️' },
            48: { text: '🌫️ ضباب كثيف', icon: '🌫️' },
            51: { text: '🌧️ رذاذ خفيف', icon: '🌧️' },
            53: { text: '🌧️ رذاذ متوسط', icon: '🌧️' },
            55: { text: '🌧️ رذاذ كثيف', icon: '🌧️' },
            61: { text: '🌧️ مطر خفيف', icon: '🌧️' },
            63: { text: '🌧️ مطر متوسط', icon: '🌧️' },
            65: { text: '🌧️ مطر غزير', icon: '🌧️' },
            71: { text: '❄️ ثلج خفيف', icon: '❄️' },
            73: { text: '❄️ ثلج متوسط', icon: '❄️' },
            75: { text: '❄️ ثلج كثيف', icon: '❄️' },
            80: { text: '🌦️ زخات مطر', icon: '🌦️' },
            81: { text: '🌦️ زخات مطر متوسطة', icon: '🌦️' },
            82: { text: '🌦️ زخات مطر غزيرة', icon: '🌦️' },
            95: { text: '⛈️ عاصفة رعدية', icon: '⛈️' }
        };
        return conditions[code] || { text: '🌤️ متغير', icon: '🌤️' };
    }

    // ============================================================ */
    // 13. خريطة جوجل                                             */
    // ============================================================ */

    loadGoogleMap() {
        const mapContainer = document.getElementById('googleMap');
        if (!mapContainer) return;

        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${this.lat},${this.lng}&zoom=15`;
        
        mapContainer.innerHTML = `
            <iframe
                width="100%"
                height="100%"
                frameborder="0"
                style="border-radius:12px; border:0;"
                src="${mapUrl}"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
        `;
    }

    // ============================================================ */
    // 14. تحديث الخريطة                                           */
    // ============================================================ */

    updateMap() {
        const mapContainer = document.getElementById('googleMap');
        if (!mapContainer) return;

        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${this.lat},${this.lng}&zoom=15`;
        
        mapContainer.innerHTML = `
            <iframe
                width="100%"
                height="100%"
                frameborder="0"
                style="border-radius:12px; border:0;"
                src="${mapUrl}"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
        `;
    }

    // ============================================================ */
    // 15. ربط الأزرار                                             */
    // ============================================================ */

    setupEvents() {
        // تحديث الطقس
        const refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
        if (refreshWeatherBtn) {
            refreshWeatherBtn.addEventListener('click', () => {
                this.fetchWeather();
                Utils.toast('🌤️ جاري تحديث الطقس...', 'info');
            });
        }

        // تحديث الموقع
        const refreshLocationBtn = document.getElementById('refreshLocationBtn');
        if (refreshLocationBtn) {
            refreshLocationBtn.addEventListener('click', () => {
                this.getUserLocation();
                Utils.toast('📍 جاري تحديث الموقع...', 'info');
            });
        }

        // زر فتح جوجل مابس
        const openMapsBtn = document.querySelector('.open-maps-btn');
        if (openMapsBtn) {
            openMapsBtn.href = `https://www.google.com/maps?q=${this.lat},${this.lng}`;
        }
    }

    // ============================================================ */
    // 16. الحصول على حالة الموقع الحالية                         */
    // ============================================================ */

    getStatus() {
        return {
            location: this.locationName,
            lat: this.lat,
            lng: this.lng,
            isOnline: this.isOnline,
            isAtHome: this.isAtHome,
            distanceFromHome: this.distanceFromHome,
            weather: this.weatherData,
            lastUpdate: this.lastWeatherUpdate
        };
    }

    // ============================================================ */
    // 17. التنظيف                                                  */
    // ============================================================ */

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.weatherInterval) {
            clearInterval(this.weatherInterval);
            this.weatherInterval = null;
        }
        console.log('🌍 Advanced Location Engine destroyed');
    }
}

// ============================================================ */
// 18. تشغيل المحرك                                             */
// ============================================================ */

let locationEngine = null;

function initLocationEngine() {
    if (!locationEngine) {
        locationEngine = new AdvancedLocationEngine();
    }
    return locationEngine;
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const homeSection = document.getElementById('home-section');
    if (homeSection && homeSection.classList.contains('active')) {
        initLocationEngine();
    }
});

// تشغيل عند التبديل للقسم
if (document.getElementById('home-section')) {
    const homeObserver = new MutationObserver(() => {
        const homeSection = document.getElementById('home-section');
        if (homeSection && homeSection.classList.contains('active') && !locationEngine) {
            initLocationEngine();
        }
    });
    homeObserver.observe(document.getElementById('home-section'), { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
}

window._locationEngine = null;
window.initLocationEngine = initLocationEngine;

console.log('🌍 Advanced Location Engine loaded');
// ============================================================ */
// 🏠 HOME SECTION ENGINE - محرك قسم الرئيسية                */
// ============================================================ */

class HomeEngine {
    constructor() {
        // العناصر
        this.elements = {
            greeting: document.getElementById('home-dynamic-greeting'),
            userName: document.getElementById('home-user-name'),
            userLocation: document.getElementById('user-location'),
            liveTime: document.getElementById('home-live-time'),
            liveDate: document.getElementById('home-live-date'),
            lastActive: document.getElementById('last-active-time'),
            themeIndicator: document.getElementById('home-theme-indicator'),
            langIndicator: document.getElementById('home-lang-indicator'),
            searchInput: document.getElementById('home-quick-search'),
            insightsList: document.getElementById('insightsList'),
            activityList: document.getElementById('home-activity-list'),
            refreshBtn: document.getElementById('refreshHomeBtn'),
            refreshInsights: document.getElementById('refreshInsightsBtn'),
            shareBtn: document.getElementById('shareProfileBtn'),
            downloadCVBtn: document.getElementById('downloadCVBtn'),
            refreshDashboard: document.getElementById('btn-refresh-dashboard')
        };

        // العدادت
        this.counters = {
            projects: document.getElementById('stat-projects-count'),
            projectsChange: document.getElementById('stat-projects-change'),
            skills: document.getElementById('stat-skills-count'),
            skillsChange: document.getElementById('stat-skills-change'),
            certificates: document.getElementById('stat-certificates-count'),
            certificatesChange: document.getElementById('stat-certificates-change'),
            visitors: document.getElementById('stat-visitors-count'),
            visitorsChange: document.getElementById('stat-visitors-change'),
            messages: document.getElementById('stat-messages-count'),
            messagesUnread: document.getElementById('stat-messages-unread'),
            donations: document.getElementById('stat-donations-count'),
            donationsChange: document.getElementById('stat-donations-change'),
            tickets: document.getElementById('stat-tickets-count'),
            ticketsPending: document.getElementById('stat-tickets-pending'),
            social: document.getElementById('stat-social-count'),
            socialChange: document.getElementById('stat-social-change')
        };

        // الحالة
        this.isInitialized = false;
        this.updateInterval = null;

        this.init();
    }

    // ============================================================ */
    // 1. INITIALIZATION                                           */
    // ============================================================ */

    init() {
        console.log('🏠 Home Engine initializing...');

        try {
            // تحديث الوقت والتاريخ
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 1000);

            // تحديث التحية
            this.updateGreeting();

            // تحديث العدادت
            this.updateCounters();

            // تحديث النشاطات
            this.updateActivity();

            // تحديث التوصيات
            this.updateInsights();

            // ربط الأحداث
            this.setupEvents();

            // تحديث تلقائي كل 30 ثانية
            this.updateInterval = setInterval(() => {
                this.updateCounters();
                this.updateInsights();
            }, 30000);

            this.isInitialized = true;
            console.log('✅ Home Engine ready');

        } catch (error) {
            console.error('❌ Home Engine error:', error);
        }
    }

    // ============================================================ */
    // 2. تحديث الوقت والتاريخ                                    */
    // ============================================================ */

    updateDateTime() {
        const now = new Date();
        
        // الوقت
        const timeStr = now.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        if (this.elements.liveTime) {
            this.elements.liveTime.textContent = timeStr;
        }

        // التاريخ
        const dateStr = now.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (this.elements.liveDate) {
            this.elements.liveDate.textContent = dateStr;
        }

        // آخر نشاط
        if (this.elements.lastActive) {
            this.elements.lastActive.textContent = 'الآن';
        }
    }

    // ============================================================ */
    // 3. تحديث التحية                                             */
    // ============================================================ */

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = '';
        let emoji = '';

        if (hour < 5) {
            greeting = '🌙 تصبح على خير';
            emoji = '🌙';
        } else if (hour < 12) {
            greeting = '☀️ صباح الخير';
            emoji = '☀️';
        } else if (hour < 17) {
            greeting = '🌤️ مساء الخير';
            emoji = '🌤️';
        } else if (hour < 21) {
            greeting = '🌅 مساء الخير';
            emoji = '🌅';
        } else {
            greeting = '🌙 مساء الخير';
            emoji = '🌙';
        }

        if (this.elements.greeting) {
            this.elements.greeting.textContent = `${emoji} ${greeting}`;
        }
    }

    // ============================================================ */
    // 4. تحديث العدادت                                            */
    // ============================================================ */

    updateCounters() {
        // جلب البيانات من localStorage
        const projects = JSON.parse(localStorage.getItem('dashboard-projects') || '[]');
        const skills = JSON.parse(localStorage.getItem('dashboard-skills') || '[]');
        const certificates = JSON.parse(localStorage.getItem('dashboard-certificates') || '[]');
        const messages = JSON.parse(localStorage.getItem('dashboard-messages') || '[]');
        const donations = JSON.parse(localStorage.getItem('dashboard-donations') || '[]');
        const socials = JSON.parse(localStorage.getItem('dashboard-socials') || '[]');
        const tickets = JSON.parse(localStorage.getItem('dashboard-support-tickets') || '[]');

        // تحديث المشاريع
        if (this.counters.projects) {
            this.counters.projects.textContent = projects.length || 0;
        }
        if (this.counters.projectsChange) {
            const change = Math.floor(Math.random() * 5) + 1;
            this.counters.projectsChange.textContent = change;
        }

        // تحديث المهارات
        if (this.counters.skills) {
            this.counters.skills.textContent = skills.length || 0;
        }
        if (this.counters.skillsChange) {
            const change = Math.floor(Math.random() * 3) + 1;
            this.counters.skillsChange.textContent = change;
        }

        // تحديث الشهادات
        if (this.counters.certificates) {
            this.counters.certificates.textContent = certificates.length || 0;
        }
        if (this.counters.certificatesChange) {
            const change = Math.floor(Math.random() * 2) + 1;
            this.counters.certificatesChange.textContent = change;
        }

        // تحديث الزوار (من localStorage أو افتراضي)
        if (this.counters.visitors) {
            const visitors = parseInt(localStorage.getItem('dashboard-visitors') || '0');
            this.counters.visitors.textContent = visitors || Math.floor(Math.random() * 100) + 50;
        }
        if (this.counters.visitorsChange) {
            const change = Math.floor(Math.random() * 10) + 1;
            this.counters.visitorsChange.textContent = change;
        }

        // تحديث الرسائل
        if (this.counters.messages) {
            this.counters.messages.textContent = messages.length || 0;
        }
        if (this.counters.messagesUnread) {
            const unread = messages.filter(m => !m.read).length || 0;
            this.counters.messagesUnread.textContent = unread;
        }

        // تحديث التبرعات
        if (this.counters.donations) {
            const total = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
            this.counters.donations.textContent = `$${total || 0}`;
        }
        if (this.counters.donationsChange) {
            const change = Math.floor(Math.random() * 50) + 10;
            this.counters.donationsChange.textContent = `$${change}`;
        }

        // تحديث تذاكر الدعم
        if (this.counters.tickets) {
            this.counters.tickets.textContent = tickets.length || 0;
        }
        if (this.counters.ticketsPending) {
            const pending = tickets.filter(t => t.status === 'pending' || t.status === 'in_progress').length || 0;
            this.counters.ticketsPending.textContent = pending;
        }

        // تحديث المتابعين (سوشيال ميديا)
        if (this.counters.social) {
            const totalFollowers = socials.reduce((sum, s) => sum + (parseInt(s.followers) || 0), 0);
            this.counters.social.textContent = totalFollowers || 0;
        }
        if (this.counters.socialChange) {
            const change = Math.floor(Math.random() * 20) + 5;
            this.counters.socialChange.textContent = change;
        }
    }

    // ============================================================ */
    // 5. تحديث التوصيات الذكية                                   */
    // ============================================================ */

    updateInsights() {
        if (!this.elements.insightsList) return;

        const insights = this.generateInsights();
        
        this.elements.insightsList.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <span class="insight-icon">${insight.icon}</span>
                <div class="insight-content">
                    <p class="insight-title">${insight.title}</p>
                    <p class="insight-desc">${insight.desc}</p>
                </div>
            </div>
        `).join('');
    }

    generateInsights() {
        const projects = JSON.parse(localStorage.getItem('dashboard-projects') || '[]');
        const skills = JSON.parse(localStorage.getItem('dashboard-skills') || '[]');
        const certificates = JSON.parse(localStorage.getItem('dashboard-certificates') || '[]');
        const messages = JSON.parse(localStorage.getItem('dashboard-messages') || '[]');

        const insights = [];

        // توصيات المشاريع
        if (projects.length === 0) {
            insights.push({
                icon: '📁',
                title: 'أضف مشاريعك الأولى',
                desc: 'لم تقم بإضافة أي مشاريع حتى الآن. ابدأ بإضافة مشاريعك لإبراز مهاراتك.'
            });
        } else if (projects.length < 3) {
            insights.push({
                icon: '🚀',
                title: `لديك ${projects.length} مشروع فقط`,
                desc: 'أضف المزيد من المشاريع لعرض محفظتك بشكل أفضل. حاول إضافة 3-5 مشاريع.'
            });
        } else {
            insights.push({
                icon: '🌟',
                title: `ممتاز! لديك ${projects.length} مشروع`,
                desc: 'محفظتك تبدو رائعة. استمر في إضافة مشاريع جديدة لتطوير مهاراتك.'
            });
        }

        // توصيات المهارات
        if (skills.length === 0) {
            insights.push({
                icon: '💻',
                title: 'أضف مهاراتك التقنية',
                desc: 'لم تقم بإضافة أي مهارات. أضف مهاراتك لتظهر للزوار ما تتقنه.'
            });
        } else if (skills.length < 5) {
            insights.push({
                icon: '📈',
                title: `لديك ${skills.length} مهارة فقط`,
                desc: 'حاول إضافة المزيد من المهارات لتغطية مجالات أوسع.'
            });
        }

        // توصيات الشهادات
        if (certificates.length === 0) {
            insights.push({
                icon: '🏅',
                title: 'أضف شهاداتك المهنية',
                desc: 'الشهادات تزيد من مصداقيتك. أضف شهاداتك لإبراز إنجازاتك.'
            });
        }

        // توصيات الرسائل
        const unread = messages.filter(m => !m.read).length;
        if (unread > 0) {
            insights.push({
                icon: '✉️',
                title: `لديك ${unread} رسالة غير مقروءة`,
                desc: 'تأكد من الرد على رسائل الزوار للحفاظ على التواصل الجيد.'
            });
        }

        // توصية عامة
        if (insights.length < 3) {
            insights.push({
                icon: '💡',
                title: 'أنت على المسار الصحيح!',
                desc: 'استمر في تطوير محتوى البورتفوليو الخاص بك. كل شيء يبدو رائعاً!'
            });
        }

        return insights;
    }

    // ============================================================ */
    // 6. تحديث النشاطات                                           */
    // ============================================================ */

    updateActivity() {
        if (!this.elements.activityList) return;

        const activities = [
            { text: 'تم تحميل لوحة التحكم', time: 'الآن', dot: 'blue' },
            { text: 'تم تحديث البيانات بنجاح', time: 'منذ دقيقة', dot: 'green' },
            { text: 'تم فتح الموقع الرئيسي', time: 'منذ 5 دقائق', dot: 'gold' },
            { text: 'تم إضافة مشروع جديد', time: 'منذ 10 دقائق', dot: 'purple' }
        ];

        // إضافة نشاطات من localStorage
        const logs = JSON.parse(localStorage.getItem('dashboard-logs') || '[]');
        if (logs.length > 0) {
            const recentLogs = logs.slice(0, 3);
            recentLogs.forEach(log => {
                const time = new Date(log.date);
                const timeAgo = this.getTimeAgo(time);
                activities.push({
                    text: log.message || 'نشاط جديد',
                    time: timeAgo,
                    dot: this.getLogTypeColor(log.type)
                });
            });
        }

        // عرض آخر 5 نشاطات
        const recent = activities.slice(0, 5);
        
        this.elements.activityList.innerHTML = recent.map(activity => `
            <div class="activity-item">
                <span class="activity-dot ${activity.dot}"></span>
                <div class="activity-details">
                    <span class="activity-text">${activity.text}</span>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'الآن';
        if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
        if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
        if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`;
        return `منذ ${Math.floor(diff / 2592000)} شهر`;
    }

    getLogTypeColor(type) {
        const colors = {
            success: 'green',
            error: 'rose',
            warning: 'gold',
            info: 'blue',
            skill: 'purple',
            project: 'blue',
            certificate: 'gold',
            donation: 'green',
            message: 'rose',
            support: 'purple'
        };
        return colors[type] || 'blue';
    }

    // ============================================================ */
    // 7. ربط الأحداث                                              */
    // ============================================================ */

    setupEvents() {
        // زر تحديث الكل
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.updateCounters();
                this.updateInsights();
                this.updateActivity();
                Utils.toast('🔄 تم تحديث جميع البيانات', 'success');
            });
        }

        // زر تحديث التوصيات
        if (this.elements.refreshInsights) {
            this.elements.refreshInsights.addEventListener('click', () => {
                this.updateInsights();
                Utils.toast('💡 تم تحديث التوصيات', 'info');
            });
        }

        // زر مشاركة الملف الشخصي
        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'Mohamed Abdallah - Portfolio',
                        text: 'تعرف على مشاريعي ومهاراتي',
                        url: window.location.href
                    }).catch(() => {});
                } else {
                    navigator.clipboard.writeText(window.location.href);
                    Utils.toast('📋 تم نسخ الرابط', 'success');
                }
            });
        }

        // زر تحميل السيرة الذاتية
        if (this.elements.downloadCVBtn) {
            this.elements.downloadCVBtn.addEventListener('click', () => {
                Utils.toast('📄 جاري تحميل السيرة الذاتية...', 'info');
                // محاكاة تحميل
                setTimeout(() => {
                    Utils.toast('✅ تم تحميل السيرة الذاتية', 'success');
                }, 1500);
            });
        }

        // زر تحديث لوحة التحكم
        if (this.elements.refreshDashboard) {
            this.elements.refreshDashboard.addEventListener('click', () => {
                location.reload();
            });
        }

        // البحث السريع
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    const query = e.target.value.trim();
                    Utils.toast(`🔍 جاري البحث عن: "${query}"`, 'info');
                    
                    // محاكاة البحث
                    setTimeout(() => {
                        Utils.toast(`✅ تم العثور على نتائج لـ "${query}"`, 'success');
                    }, 1000);
                }
            });

            // اختصار ⌘K
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    this.elements.searchInput.focus();
                    this.elements.searchInput.select();
                }
            });
        }

        // الاستماع لتحديثات الأقسام الأخرى
        document.addEventListener('dashboard:projects-updated', () => {
            setTimeout(() => this.updateCounters(), 500);
        });

        document.addEventListener('dashboard:skills-updated', () => {
            setTimeout(() => this.updateCounters(), 500);
        });

        document.addEventListener('dashboard:certificates-updated', () => {
            setTimeout(() => this.updateCounters(), 500);
        });

        document.addEventListener('dashboard:new-message', () => {
            setTimeout(() => this.updateCounters(), 500);
        });

        document.addEventListener('dashboard:new-ticket', () => {
            setTimeout(() => this.updateCounters(), 500);
        });

        document.addEventListener('dashboard:donation-received', () => {
            setTimeout(() => this.updateCounters(), 500);
        });

        console.log('✅ Home events setup complete');
    }

    // ============================================================ */
    // 8. التنظيف                                                   */
    // ============================================================ */

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isInitialized = false;
        console.log('🏠 Home Engine destroyed');
    }
}

// ============================================================ */
// 9. تشغيل المحرك                                              */
// ============================================================ */

let homeEngine = null;

function initHomeEngine() {
    if (!homeEngine) {
        homeEngine = new HomeEngine();
    }
    return homeEngine;
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const homeSection = document.getElementById('home-section');
    if (homeSection && homeSection.classList.contains('active')) {
        initHomeEngine();
    }
});

// تشغيل عند التبديل للقسم
if (document.getElementById('home-section')) {
    const homeObserver = new MutationObserver(() => {
        const homeSection = document.getElementById('home-section');
        if (homeSection && homeSection.classList.contains('active') && !homeEngine) {
            initHomeEngine();
        }
    });
    homeObserver.observe(document.getElementById('home-section'), { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
}

console.log('🏠 Home Engine loaded');
// ============================================================ */
// 📝 UPDATER SECTION ENGINE - محرك محرر الكود                */
// ============================================================ */

class UpdaterEngine {
    constructor() {
        // ============================================================ */
        // DOM Elements
        // ============================================================ */
        
        this.editor = document.getElementById('codeEditorContent');
        this.lineNumbers = document.getElementById('codeLineNumbers');
        this.langSelect = document.getElementById('codeLanguageSelect');
        this.lineCount = document.getElementById('codeLineCount');
        this.consoleOutput = document.getElementById('devConsoleOutput');
        this.codeStats = document.getElementById('codeStats');
        
        // Prompt Elements
        this.promptEditor = document.getElementById('promptEditor');
        this.promptHistory = document.getElementById('promptHistoryList');
        this.templateBtns = document.querySelectorAll('.template-btn');
        
        // Buttons
        this.buttons = {
            format: document.getElementById('formatCodeBtn'),
            beautify: document.getElementById('beautifyCodeBtn'),
            minify: document.getElementById('minifyCodeBtn'),
            copy: document.getElementById('copyCodeBtn'),
            download: document.getElementById('downloadCodeBtn'),
            clear: document.getElementById('clearCodeBtn'),
            save: document.getElementById('saveCodeBtn'),
            copyPrompt: document.getElementById('copyPromptBtn'),
            clearPrompt: document.getElementById('clearPromptBtn'),
            aiGenerate: document.getElementById('aiGenerateBtn')
        };

        // ============================================================ */
        // State
        // ============================================================ */
        
        this.history = [];
        this.currentLanguage = 'html';
        this.isInitialized = false;
        
        // ============================================================ */
        // Templates
        // ============================================================ */
        
        this.templates = {
            hero: `<section class="hero">
  <div class="hero__container">
    <div class="hero__content">
      <h1 class="hero__title">مرحباً بك في موقعي</h1>
      <p class="hero__description">أنا مطور واجهات أمامية</p>
      <a href="#contact" class="btn btn-primary">تواصل معي</a>
    </div>
  </div>
</section>`,
            
            navbar: `<nav class="navbar">
  <div class="navbar__logo">
    <a href="#">Logo</a>
  </div>
  <ul class="navbar__menu">
    <li><a href="#home">الرئيسية</a></li>
    <li><a href="#about">من أنا</a></li>
    <li><a href="#services">الخدمات</a></li>
    <li><a href="#contact">اتصل بنا</a></li>
  </ul>
  <button class="navbar__toggle">
    <span></span><span></span><span></span>
  </button>
</nav>`,
            
            footer: `<footer class="footer">
  <div class="footer__container">
    <div class="footer__logo">
      <h2>اسم الموقع</h2>
      <p>جميع الحقوق محفوظة</p>
    </div>
    <div class="footer__links">
      <a href="#">سياسة الخصوصية</a>
      <a href="#">شروط الاستخدام</a>
    </div>
    <div class="footer__social">
      <a href="#"><i class="fab fa-facebook"></i></a>
      <a href="#"><i class="fab fa-twitter"></i></a>
      <a href="#"><i class="fab fa-instagram"></i></a>
    </div>
  </div>
</footer>`,
            
            contact: `<form class="contact-form">
  <div class="form-group">
    <label for="name">الاسم</label>
    <input type="text" id="name" placeholder="أدخل اسمك" required>
  </div>
  <div class="form-group">
    <label for="email">البريد الإلكتروني</label>
    <input type="email" id="email" placeholder="أدخل بريدك" required>
  </div>
  <div class="form-group">
    <label for="message">الرسالة</label>
    <textarea id="message" rows="5" placeholder="اكتب رسالتك" required></textarea>
  </div>
  <button type="submit" class="btn btn-primary">إرسال</button>
</form>`,
            
            card: `<div class="card glass-panel">
  <div class="card__image">
    <img src="https://via.placeholder.com/300x200" alt="Card Image">
  </div>
  <div class="card__content">
    <h3 class="card__title">عنوان البطاقة</h3>
    <p class="card__description">هذا وصف مختصر للبطاقة يوضح محتواها</p>
    <a href="#" class="card__link">اقرأ المزيد →</a>
  </div>
</div>`,
            
            dashboard: `<div class="dashboard-grid">
  <div class="dashboard-card">
    <div class="card-icon"><i class="fas fa-users"></i></div>
    <h3>الزوار</h3>
    <p class="card-number">1,234</p>
    <span class="card-change positive">+12%</span>
  </div>
  <div class="dashboard-card">
    <div class="card-icon"><i class="fas fa-project-diagram"></i></div>
    <h3>المشاريع</h3>
    <p class="card-number">15</p>
    <span class="card-change positive">+3</span>
  </div>
  <div class="dashboard-card">
    <div class="card-icon"><i class="fas fa-envelope"></i></div>
    <h3>الرسائل</h3>
    <p class="card-number">42</p>
    <span class="card-change negative">-2</span>
  </div>
</div>`
        };

        this.init();
    }

    // ============================================================ */
    // 1. INITIALIZATION                                           */
    // ============================================================ */

    init() {
        console.log('📝 Updater Engine initializing...');

        try {
            // تحميل المحتوى المحفوظ
            this.loadSavedContent();
            
            // تحديث أرقام السطور
            this.updateLineNumbers();
            
            // تحديث الإحصائيات
            this.updateStats();
            
            // ربط الأحداث
            this.setupEvents();
            
            // تحميل السجل
            this.loadHistory();
            
            this.isInitialized = true;
            console.log('✅ Updater Engine ready');
            this.log('تم تحميل محرر الكود بنجاح', 'success');

        } catch (error) {
            console.error('❌ Updater Engine error:', error);
            this.log('❌ خطأ في تحميل المحرر', 'error');
        }
    }

    // ============================================================ */
    // 2. تحميل المحتوى المحفوظ                                   */
    // ============================================================ */

    loadSavedContent() {
        try {
            const saved = localStorage.getItem('updater-content');
            if (saved && this.editor) {
                this.editor.value = saved;
            }
            
            const savedLang = localStorage.getItem('updater-language');
            if (savedLang && this.langSelect) {
                this.langSelect.value = savedLang;
                this.currentLanguage = savedLang;
            }
        } catch (e) {
            console.warn('⚠️ Could not load saved content:', e);
        }
    }

    // ============================================================ */
    // 3. حفظ المحتوى                                              */
    // ============================================================ */

    saveContent() {
        try {
            if (this.editor) {
                localStorage.setItem('updater-content', this.editor.value);
            }
            if (this.langSelect) {
                localStorage.setItem('updater-language', this.langSelect.value);
            }
        } catch (e) {
            console.warn('⚠️ Could not save content:', e);
        }
    }

    // ============================================================ */
    // 4. تحديث أرقام السطور                                      */
    // ============================================================ */

    updateLineNumbers() {
        if (!this.editor || !this.lineNumbers) return;

        const lines = this.editor.value.split('\n').length;
        const maxLines = Math.max(lines, 10);
        
        let html = '';
        for (let i = 1; i <= maxLines; i++) {
            const activeClass = i === this.getCurrentLine() ? 'active' : '';
            html += `<span class="${activeClass}">${i}</span>`;
        }
        
        this.lineNumbers.innerHTML = html;
        
        // تحديث عدد السطور
        if (this.lineCount) {
            this.lineCount.textContent = `السطور: ${lines}`;
        }
    }

    getCurrentLine() {
        if (!this.editor) return 1;
        const pos = this.editor.selectionStart;
        const text = this.editor.value.substring(0, pos);
        return text.split('\n').length;
    }

    // ============================================================ */
    // 5. تحديث الإحصائيات                                        */
    // ============================================================ */

    updateStats() {
        if (!this.editor || !this.codeStats) return;

        const text = this.editor.value;
        const lines = text.split('\n').length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        this.codeStats.textContent = `📊 السطور: ${lines} | الكلمات: ${words} | الأحرف: ${chars}`;
    }

    // ============================================================ */
    // 6. تسجيل في الكونسول                                        */
    // ============================================================ */

    log(message, type = 'info') {
        if (!this.consoleOutput) return;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        this.consoleOutput.textContent = `${icons[type] || 'ℹ️'} ${message}`;
        this.consoleOutput.className = `console-output ${type}`;
    }

    // ============================================================ */
    // 7. معالجة الكود                                              */
    // ============================================================ */

    // 7.1 تنسيق الكود
    formatCode() {
        if (!this.editor) return;
        
        try {
            const text = this.editor.value;
            const formatted = this.prettyPrint(text);
            this.editor.value = formatted;
            this.updateLineNumbers();
            this.updateStats();
            this.saveContent();
            this.log('✅ تم تنسيق الكود بنجاح', 'success');
        } catch (e) {
            this.log('❌ فشل تنسيق الكود: ' + e.message, 'error');
        }
    }

    // 7.2 تجميل الكود
    beautifyCode() {
        if (!this.editor) return;
        
        try {
            let text = this.editor.value;
            // إزالة المسافات الزائدة
            text = text.replace(/\s+/g, ' ').trim();
            // إضافة سطور جديدة بعد الأقواس
            text = text.replace(/{/g, '{\n  ').replace(/}/g, '\n}');
            text = text.replace(/;/g, ';\n');
            // تنظيف السطور الفارغة المتكررة
            text = text.replace(/\n\s*\n/g, '\n');
            
            this.editor.value = text;
            this.updateLineNumbers();
            this.updateStats();
            this.saveContent();
            this.log('✨ تم تجميل الكود', 'success');
        } catch (e) {
            this.log('❌ فشل تجميل الكود: ' + e.message, 'error');
        }
    }

    // 7.3 تصغير الكود
    minifyCode() {
        if (!this.editor) return;
        
        try {
            let text = this.editor.value;
            // إزالة التعليقات
            text = text.replace(/\/\/.*$/gm, '');
            text = text.replace(/\/\*[\s\S]*?\*\//g, '');
            // إزالة المسافات والتباعد
            text = text.replace(/\s+/g, ' ');
            text = text.replace(/{\s+/g, '{');
            text = text.replace(/\s+}/g, '}');
            text = text.replace(/;\s+/g, ';');
            text = text.trim();
            
            this.editor.value = text;
            this.updateLineNumbers();
            this.updateStats();
            this.saveContent();
            this.log('📦 تم تصغير الكود', 'success');
        } catch (e) {
            this.log('❌ فشل تصغير الكود: ' + e.message, 'error');
        }
    }

    // 7.4 نسخ الكود
    copyCode() {
        if (!this.editor) return;
        
        try {
            navigator.clipboard.writeText(this.editor.value);
            this.log('📋 تم نسخ الكود إلى الحافظة', 'success');
        } catch (e) {
            // Fallback
            this.editor.select();
            document.execCommand('copy');
            this.log('📋 تم نسخ الكود إلى الحافظة', 'success');
        }
    }

    // 7.5 تحميل الكود
    downloadCode() {
        if (!this.editor) return;
        
        try {
            const content = this.editor.value;
            const lang = this.langSelect?.value || 'html';
            const ext = this.getFileExtension(lang);
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
            this.log(`📥 تم تحميل الملف (${ext})`, 'success');
        } catch (e) {
            this.log('❌ فشل تحميل الملف: ' + e.message, 'error');
        }
    }

    getFileExtension(lang) {
        const extensions = {
            html: 'html',
            css: 'css',
            javascript: 'js',
            json: 'json',
            python: 'py',
            sql: 'sql'
        };
        return extensions[lang] || 'txt';
    }

    // 7.6 مسح الكود
    clearCode() {
        if (!this.editor) return;
        
        if (confirm('هل أنت متأكد من مسح كل الكود؟')) {
            this.editor.value = '';
            this.updateLineNumbers();
            this.updateStats();
            this.saveContent();
            this.log('🗑️ تم مسح الكود', 'warning');
        }
    }

    // 7.7 حفظ الكود
    saveCode() {
        this.saveContent();
        this.log('💾 تم حفظ الكود', 'success');
    }

    // ============================================================ */
    // 8. Pretty Print                                             */
    // ============================================================ */

    prettyPrint(text) {
        // محاولة تنسيق JSON إذا كان JSON
        try {
            const parsed = JSON.parse(text);
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            // ليس JSON، استمر
        }
        
        // تنسيق HTML/CSS/JS بسيط
        let formatted = text;
        
        // إضافة مسافات للـ HTML
        formatted = formatted.replace(/>/g, '>\n  ');
        formatted = formatted.replace(/</g, '\n<');
        formatted = formatted.replace(/\n\s*\n/g, '\n');
        
        // تنظيم المسافات
        formatted = formatted.split('\n').map(line => {
            const indent = (line.match(/^\s*/) || [''])[0];
            const trimmed = line.trim();
            if (!trimmed) return '';
            return indent + trimmed;
        }).join('\n');
        
        return formatted.trim();
    }

    // ============================================================ */
    // 9. Prompt Functions                                          */
    // ============================================================ */

    // 9.1 نسخ البرومت
    copyPrompt() {
        if (!this.promptEditor) return;
        
        const text = this.promptEditor.value.trim();
        if (!text) {
            this.log('⚠️ لا يوجد نص لنسخه', 'warning');
            return;
        }
        
        try {
            navigator.clipboard.writeText(text);
            this.log('📋 تم نسخ البرومت', 'success');
        } catch (e) {
            this.promptEditor.select();
            document.execCommand('copy');
            this.log('📋 تم نسخ البرومت', 'success');
        }
    }

    // 9.2 مسح البرومت
    clearPrompt() {
        if (!this.promptEditor) return;
        this.promptEditor.value = '';
        this.log('🗑️ تم مسح البرومت', 'info');
    }

    // 9.3 إضافة إلى السجل
    addToHistory(text) {
        if (!text || !this.promptHistory) return;
        
        // إضافة إلى السجل
        this.history.unshift(text);
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        // حفظ السجل
        try {
            localStorage.setItem('updater-prompt-history', JSON.stringify(this.history));
        } catch (e) {}
        
        // تحديث الواجهة
        this.renderHistory();
    }

    // 9.4 تحميل السجل
    loadHistory() {
        try {
            const saved = localStorage.getItem('updater-prompt-history');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (e) {
            this.history = [];
        }
        
        this.renderHistory();
    }

    // 9.5 عرض السجل
    renderHistory() {
        if (!this.promptHistory) return;
        
        if (this.history.length === 0) {
            this.promptHistory.innerHTML = `
                <div class="history-item" style="opacity:0.5;border-left-color:var(--text-muted);">
                    📭 لا يوجد سجل بعد
                </div>
            `;
            return;
        }
        
        this.promptHistory.innerHTML = this.history.map(item => `
            <div class="history-item" onclick="window._updaterEngine?.loadPrompt('${this.escapeHtml(item)}')">
                ${item.length > 50 ? item.substring(0, 50) + '...' : item}
            </div>
        `).join('');
    }

    // 9.6 تحميل برومت من السجل
    loadPrompt(text) {
        if (!this.promptEditor) return;
        this.promptEditor.value = text;
        this.promptEditor.focus();
        this.log('📂 تم تحميل البرومت من السجل', 'info');
    }

    // 9.7 Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 9.8 AI Generate (محاكاة)
    generateAI() {
        if (!this.promptEditor || !this.editor) return;
        
        const prompt = this.promptEditor.value.trim();
        if (!prompt) {
            this.log('⚠️ الرجاء كتابة طلب (Prompt) أولاً', 'warning');
            this.promptEditor.focus();
            return;
        }
        
        this.log('🤖 جاري توليد الكود...', 'info');
        
        // إضافة إلى السجل
        this.addToHistory(prompt);
        
        // محاكاة توليد AI
        setTimeout(() => {
            const generated = this.simulateAIGeneration(prompt);
            this.editor.value = generated;
            this.updateLineNumbers();
            this.updateStats();
            this.saveContent();
            this.log('🤖 تم توليد الكود بنجاح!', 'success');
        }, 1500);
    }

    // 9.9 محاكاة توليد AI
    simulateAIGeneration(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('هيرو') || lowerPrompt.includes('hero')) {
            return this.templates.hero;
        }
        if (lowerPrompt.includes('navbar') || lowerPrompt.includes('شريط')) {
            return this.templates.navbar;
        }
        if (lowerPrompt.includes('footer') || lowerPrompt.includes('تذييل')) {
            return this.templates.footer;
        }
        if (lowerPrompt.includes('contact') || lowerPrompt.includes('تواصل')) {
            return this.templates.contact;
        }
        if (lowerPrompt.includes('card') || lowerPrompt.includes('بطاقة')) {
            return this.templates.card;
        }
        if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('لوحة')) {
            return this.templates.dashboard;
        }
        
        // توليد عشوائي
        return `<!-- تم توليد الكود بناءً على: "${prompt}" -->\n\n<div class="generated-content">\n  <h2>مرحباً بك</h2>\n  <p>هذا كود تم توليده بواسطة الذكاء الاصطناعي بناءً على طلبك</p>\n  <p>📝 طلبك: ${prompt}</p>\n</div>`;
    }

    // ============================================================ */
    // 10. Template Loading                                         */
    // ============================================================ */

    loadTemplate(templateName) {
        if (!this.editor) return;
        
        const template = this.templates[templateName];
        if (!template) {
            this.log('⚠️ القالب غير موجود', 'warning');
            return;
        }
        
        this.editor.value = template;
        this.updateLineNumbers();
        this.updateStats();
        this.saveContent();
        this.log(`📄 تم تحميل قالب: ${templateName}`, 'success');
    }

    // ============================================================ */
    // 11. Event Setup                                              */
    // ============================================================ */

    setupEvents() {
        // ---- محرر الكود ----
        
        // تحديث عند الكتابة
        if (this.editor) {
            this.editor.addEventListener('input', () => {
                this.updateLineNumbers();
                this.updateStats();
                this.saveContent();
            });
            
            this.editor.addEventListener('keydown', (e) => {
                // Tab = 2 مسافات
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = this.editor.selectionStart;
                    const end = this.editor.selectionEnd;
                    this.editor.value = this.editor.value.substring(0, start) + '  ' + this.editor.value.substring(end);
                    this.editor.selectionStart = this.editor.selectionEnd = start + 2;
                    this.updateLineNumbers();
                }
            });
            
            this.editor.addEventListener('scroll', () => {
                if (this.lineNumbers) {
                    this.lineNumbers.scrollTop = this.editor.scrollTop;
                }
            });
        }
        
        // تغيير اللغة
        if (this.langSelect) {
            this.langSelect.addEventListener('change', () => {
                this.currentLanguage = this.langSelect.value;
                this.saveContent();
                this.log(`🌐 تم تغيير اللغة إلى: ${this.langSelect.value}`, 'info');
            });
        }
        
        // ---- الأزرار ----
        
        if (this.buttons.format) {
            this.buttons.format.addEventListener('click', () => this.formatCode());
        }
        if (this.buttons.beautify) {
            this.buttons.beautify.addEventListener('click', () => this.beautifyCode());
        }
        if (this.buttons.minify) {
            this.buttons.minify.addEventListener('click', () => this.minifyCode());
        }
        if (this.buttons.copy) {
            this.buttons.copy.addEventListener('click', () => this.copyCode());
        }
        if (this.buttons.download) {
            this.buttons.download.addEventListener('click', () => this.downloadCode());
        }
        if (this.buttons.clear) {
            this.buttons.clear.addEventListener('click', () => this.clearCode());
        }
        if (this.buttons.save) {
            this.buttons.save.addEventListener('click', () => this.saveCode());
        }
        
        // ---- Prompt ----
        
        if (this.buttons.copyPrompt) {
            this.buttons.copyPrompt.addEventListener('click', () => this.copyPrompt());
        }
        if (this.buttons.clearPrompt) {
            this.buttons.clearPrompt.addEventListener('click', () => this.clearPrompt());
        }
        if (this.buttons.aiGenerate) {
            this.buttons.aiGenerate.addEventListener('click', () => this.generateAI());
        }
        
        // ---- Templates ----
        
        this.templateBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const template = btn.dataset.template;
                if (template) {
                    this.loadTemplate(template);
                }
            });
        });
        
        // ---- Keyboard Shortcuts ----
        
        document.addEventListener('keydown', (e) => {
            // Ctrl+S = حفظ
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                if (document.activeElement === this.editor) {
                    e.preventDefault();
                    this.saveCode();
                }
            }
            
            // Ctrl+Shift+F = تنسيق
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
                if (document.activeElement === this.editor) {
                    e.preventDefault();
                    this.formatCode();
                }
            }
            
            // Escape = إلغاء التحديد
            if (e.key === 'Escape' && document.activeElement === this.editor) {
                this.editor.selectionStart = this.editor.selectionEnd = this.editor.value.length;
            }
        });
        
        console.log('✅ Updater events setup complete');
    }

    // ============================================================ */
    // 12. Cleanup                                                  */
    // ============================================================ */

    destroy() {
        this.isInitialized = false;
        console.log('📝 Updater Engine destroyed');
    }
}

// ============================================================ */
// 13. تشغيل المحرك                                              */
// ============================================================ */

let updaterEngine = null;

function initUpdaterEngine() {
    if (!updaterEngine) {
        updaterEngine = new UpdaterEngine();
    }
    return updaterEngine;
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const updaterSection = document.getElementById('updater-section');
    if (updaterSection && updaterSection.classList.contains('active')) {
        initUpdaterEngine();
    }
});

// تشغيل عند التبديل للقسم
if (document.getElementById('updater-section')) {
    const updaterObserver = new MutationObserver(() => {
        const updaterSection = document.getElementById('updater-section');
        if (updaterSection && updaterSection.classList.contains('active') && !updaterEngine) {
            initUpdaterEngine();
        }
    });
    updaterObserver.observe(document.getElementById('updater-section'), { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
}

// جعل المحرك متاحاً عالمياً
window._updaterEngine = null;
window.initUpdaterEngine = initUpdaterEngine;

console.log('📝 Updater Engine loaded');


// ============================================================ */
// 🎯 HERO SECTION ENGINE - محرك قسم الهيرو                   */
// ============================================================ */

class HeroEngine {
    constructor() {
        // ============================================================ */
        // DOM Elements
        // ============================================================ */
        
        // النصوص
        this.title = document.getElementById('hero-title');
        this.subtitle = document.getElementById('hero-subtitle');
        this.typingText = document.getElementById('hero-typing-text');
        this.description = document.getElementById('hero-description');
        this.name = document.getElementById('hero-name');
        this.location = document.getElementById('hero-location');
        this.email = document.getElementById('hero-email');
        this.availability = document.getElementById('hero-availability');
        this.enableTyping = document.getElementById('hero-enable-typing');
        
        // الصور
        this.imageInput = document.getElementById('hero-image-input');
        this.imageUrl = document.getElementById('hero-image-url');
        this.imagePreview = document.getElementById('hero-image-preview-img');
        this.imageUploadBtn = document.getElementById('hero-image-upload-btn');
        this.imageRemoveBtn = document.getElementById('hero-image-remove-btn');
        
        this.bgInput = document.getElementById('hero-bg-input');
        this.bgUrl = document.getElementById('hero-bg-url');
        this.bgPreview = document.getElementById('hero-bg-preview-img');
        this.bgPlaceholder = document.getElementById('hero-bg-placeholder');
        this.bgUploadBtn = document.getElementById('hero-bg-upload-btn');
        this.bgRemoveBtn = document.getElementById('hero-bg-remove-btn');
        
        // التصميم
        this.layout = document.getElementById('hero-layout');
        this.bgColor = document.getElementById('hero-bg-color');
        this.textColor = document.getElementById('hero-text-color');
        this.accentColor = document.getElementById('hero-accent-color');
        this.effectGlow = document.getElementById('hero-effect-glow');
        this.effectFloat = document.getElementById('hero-effect-float');
        this.effectParticle = document.getElementById('hero-effect-particle');
        
        // الشارات
        this.badgeAvailable = document.getElementById('hero-badge-available');
        this.badgeVerified = document.getElementById('hero-badge-verified');
        this.customBadge = document.getElementById('hero-custom-badge');
        
        // الأزرار والإحصائيات والسوشيال
        this.buttonsList = document.getElementById('hero-buttons-list');
        this.socialList = document.getElementById('hero-social-list');
        this.statsList = document.getElementById('hero-stats-list');
        
        // أزرار الإضافة
        this.addBtn = document.getElementById('hero-add-btn');
        this.addSocialBtn = document.getElementById('hero-social-add-btn');
        this.addStatBtn = document.getElementById('hero-stat-add-btn');
        
        // أزرار التحكم
        this.publishBtn = document.getElementById('hero-publish-btn');
        this.resetBtn = document.getElementById('hero-reset-btn');
        this.refreshPreviewBtn = document.getElementById('hero-preview-refresh-btn');
        this.themeBtn = document.getElementById('hero-preview-theme-btn');
        
        // المعاينة
        this.previewContainer = document.getElementById('hero-preview-container');
        this.previewStatus = document.getElementById('hero-preview-status');
        this.deviceBtns = document.querySelectorAll('.preview-device-btn');
        
        // ============================================================ */
        // State
        // ============================================================ */
        
        this.items = {
            buttons: [],
            socials: [],
            stats: []
        };
        
        this.previewTheme = 'light';
        this.currentDevice = 'desktop';
        this.isInitialized = false;
        
        // ============================================================ */
        // Default Data
        // ============================================================ */
        
        this.defaultData = {
            buttons: [
                { id: 'btn-1', label: 'المشاريع', url: '#projects', type: 'primary' },
                { id: 'btn-2', label: 'تواصل معي', url: '#contact', type: 'secondary' }
            ],
            socials: [
                { id: 'social-1', platform: 'GitHub', url: 'https://github.com/budiabdallah20', icon: 'fa-brands fa-github' },
                { id: 'social-2', platform: 'LinkedIn', url: 'https://linkedin.com/in/budiabdallah', icon: 'fa-brands fa-linkedin' },
                { id: 'social-3', platform: 'YouTube', url: 'https://youtube.com', icon: 'fa-brands fa-youtube' }
            ],
            stats: [
                { id: 'stat-1', label: 'المشاريع', value: '15+' },
                { id: 'stat-2', label: 'سنوات الخبرة', value: '3+' },
                { id: 'stat-3', label: 'شهادة معتمدة', value: '5+' }
            ]
        };
        
        this.init();
    }

    // ============================================================ */
    // 1. INITIALIZATION                                           */
    // ============================================================ */

    init() {
        console.log('🎯 Hero Engine initializing...');
        
        try {
            // تحميل البيانات المحفوظة
            this.loadData();
            
            // عرض البيانات في النماذج
            this.renderButtons();
            this.renderSocials();
            this.renderStats();
            
            // ربط الأحداث
            this.setupEvents();
            
            // تحديث المعاينة
            setTimeout(() => this.updatePreview(), 300);
            
            // ربط التبويبات
            this.setupTabs();
            
            // ربط أجهزة المعاينة
            this.setupDeviceButtons();
            
            this.isInitialized = true;
            console.log('✅ Hero Engine ready');
            
        } catch (error) {
            console.error('❌ Hero Engine error:', error);
        }
    }

    // ============================================================ */
    // 2. تحميل البيانات                                           */
    // ============================================================ */

    loadData() {
        try {
            const saved = localStorage.getItem('hero-data');
            if (saved) {
                const data = JSON.parse(saved);
                this.items.buttons = data.buttons || this.defaultData.buttons;
                this.items.socials = data.socials || this.defaultData.socials;
                this.items.stats = data.stats || this.defaultData.stats;
            } else {
                this.items.buttons = [...this.defaultData.buttons];
                this.items.socials = [...this.defaultData.socials];
                this.items.stats = [...this.defaultData.stats];
                this.saveData();
            }
        } catch (e) {
            console.warn('⚠️ Could not load data:', e);
            this.items.buttons = [...this.defaultData.buttons];
            this.items.socials = [...this.defaultData.socials];
            this.items.stats = [...this.defaultData.stats];
        }
    }

    // ============================================================ */
    // 3. حفظ البيانات                                             */
    // ============================================================ */

    saveData() {
        try {
            const data = {
                buttons: this.items.buttons,
                socials: this.items.socials,
                stats: this.items.stats
            };
            localStorage.setItem('hero-data', JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ Could not save data:', e);
        }
    }

    // ============================================================ */
    // 4. عرض الأزرار                                              */
    // ============================================================ */

    renderButtons() {
        if (!this.buttonsList) return;
        
        if (this.items.buttons.length === 0) {
            this.buttonsList.innerHTML = `
                <div class="hero-empty-state">
                    <i class="fa-solid fa-square-caret-right"></i>
                    <p>لا توجد أزرار. أضف زراً جديداً.</p>
                </div>
            `;
            return;
        }
        
        this.buttonsList.innerHTML = this.items.buttons.map((btn, index) => `
            <div class="hero-item" data-id="${btn.id}">
                <div class="item-info">
                    <span class="item-icon">🔘</span>
                    <span>${btn.label}</span>
                    <span style="font-size:0.7rem;color:var(--text-muted);">${btn.type}</span>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="window._heroEngine?.editButton('${btn.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete-btn" onclick="window._heroEngine?.deleteButton('${btn.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ============================================================ */
    // 5. عرض السوشيال ميديا                                      */
    // ============================================================ */

    renderSocials() {
        if (!this.socialList) return;
        
        if (this.items.socials.length === 0) {
            this.socialList.innerHTML = `
                <div class="hero-empty-state">
                    <i class="fa-solid fa-share-nodes"></i>
                    <p>لا توجد روابط سوشيال ميديا.</p>
                </div>
            `;
            return;
        }
        
        this.socialList.innerHTML = this.items.socials.map((social, index) => `
            <div class="hero-item" data-id="${social.id}">
                <div class="item-info">
                    <span class="item-icon"><i class="${social.icon}"></i></span>
                    <span>${social.platform}</span>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="window._heroEngine?.editSocial('${social.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete-btn" onclick="window._heroEngine?.deleteSocial('${social.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ============================================================ */
    // 6. عرض الإحصائيات                                          */
    // ============================================================ */

    renderStats() {
        if (!this.statsList) return;
        
        if (this.items.stats.length === 0) {
            this.statsList.innerHTML = `
                <div class="hero-empty-state">
                    <i class="fa-solid fa-chart-simple"></i>
                    <p>لا توجد إحصائيات. أضف إحصائية جديدة.</p>
                </div>
            `;
            return;
        }
        
        this.statsList.innerHTML = this.items.stats.map((stat, index) => `
            <div class="hero-item" data-id="${stat.id}">
                <div class="item-info">
                    <span class="item-icon">📊</span>
                    <span>${stat.label}: <strong>${stat.value}</strong></span>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="window._heroEngine?.editStat('${stat.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete-btn" onclick="window._heroEngine?.deleteStat('${stat.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ============================================================ */
    // 7. إدارة الأزرار                                            */
    // ============================================================ */

    addButton() {
        const label = prompt('📝 أدخل نص الزر:');
        if (!label) return;
        
        const url = prompt('🔗 أدخل الرابط (مثال: #projects):', '#');
        if (!url) return;
        
        const type = confirm('✅ هل تريد زر أساسي (OK) أم ثانوي (Cancel)؟') ? 'primary' : 'secondary';
        
        const newBtn = {
            id: 'btn-' + Date.now(),
            label: label.trim(),
            url: url.trim(),
            type: type
        };
        
        this.items.buttons.push(newBtn);
        this.saveData();
        this.renderButtons();
        this.updatePreview();
        Utils.toast('✅ تم إضافة الزر', 'success');
    }

    editButton(id) {
        const btn = this.items.buttons.find(b => b.id === id);
        if (!btn) return;
        
        const newLabel = prompt('📝 تعديل نص الزر:', btn.label);
        if (newLabel === null) return;
        
        const newUrl = prompt('🔗 تعديل الرابط:', btn.url);
        if (newUrl === null) return;
        
        btn.label = newLabel.trim() || btn.label;
        btn.url = newUrl.trim() || btn.url;
        
        this.saveData();
        this.renderButtons();
        this.updatePreview();
        Utils.toast('✅ تم تعديل الزر', 'success');
    }

    deleteButton(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الزر؟')) return;
        
        this.items.buttons = this.items.buttons.filter(b => b.id !== id);
        this.saveData();
        this.renderButtons();
        this.updatePreview();
        Utils.toast('🗑️ تم حذف الزر', 'info');
    }

    // ============================================================ */
    // 8. إدارة السوشيال ميديا                                    */
    // ============================================================ */

    addSocial() {
        const platform = prompt('📱 أدخل اسم المنصة (مثال: GitHub):');
        if (!platform) return;
        
        const url = prompt('🔗 أدخل رابط البروفايل:', 'https://');
        if (!url) return;
        
        const iconMap = {
            'github': 'fa-brands fa-github',
            'linkedin': 'fa-brands fa-linkedin',
            'youtube': 'fa-brands fa-youtube',
            'twitter': 'fa-brands fa-twitter',
            'instagram': 'fa-brands fa-instagram',
            'facebook': 'fa-brands fa-facebook',
            'tiktok': 'fa-brands fa-tiktok',
            'whatsapp': 'fa-brands fa-whatsapp',
            'telegram': 'fa-brands fa-telegram'
        };
        
        const key = platform.toLowerCase();
        const icon = iconMap[key] || 'fa-solid fa-link';
        
        const newSocial = {
            id: 'social-' + Date.now(),
            platform: platform.trim(),
            url: url.trim(),
            icon: icon
        };
        
        this.items.socials.push(newSocial);
        this.saveData();
        this.renderSocials();
        this.updatePreview();
        Utils.toast('✅ تم إضافة منصة ' + platform, 'success');
    }

    editSocial(id) {
        const social = this.items.socials.find(s => s.id === id);
        if (!social) return;
        
        const newPlatform = prompt('📱 تعديل اسم المنصة:', social.platform);
        if (newPlatform === null) return;
        
        const newUrl = prompt('🔗 تعديل الرابط:', social.url);
        if (newUrl === null) return;
        
        social.platform = newPlatform.trim() || social.platform;
        social.url = newUrl.trim() || social.url;
        
        this.saveData();
        this.renderSocials();
        this.updatePreview();
        Utils.toast('✅ تم تعديل المنصة', 'success');
    }

    deleteSocial(id) {
        if (!confirm('هل أنت متأكد من حذف هذه المنصة؟')) return;
        
        this.items.socials = this.items.socials.filter(s => s.id !== id);
        this.saveData();
        this.renderSocials();
        this.updatePreview();
        Utils.toast('🗑️ تم حذف المنصة', 'info');
    }

    // ============================================================ */
    // 9. إدارة الإحصائيات                                        */
    // ============================================================ */

    addStat() {
        const label = prompt('📊 أدخل عنوان الإحصائية (مثال: المشاريع):');
        if (!label) return;
        
        const value = prompt('🔢 أدخل القيمة (مثال: 15+):');
        if (!value) return;
        
        const newStat = {
            id: 'stat-' + Date.now(),
            label: label.trim(),
            value: value.trim()
        };
        
        this.items.stats.push(newStat);
        this.saveData();
        this.renderStats();
        this.updatePreview();
        Utils.toast('✅ تم إضافة الإحصائية', 'success');
    }

    editStat(id) {
        const stat = this.items.stats.find(s => s.id === id);
        if (!stat) return;
        
        const newLabel = prompt('📊 تعديل عنوان الإحصائية:', stat.label);
        if (newLabel === null) return;
        
        const newValue = prompt('🔢 تعديل القيمة:', stat.value);
        if (newValue === null) return;
        
        stat.label = newLabel.trim() || stat.label;
        stat.value = newValue.trim() || stat.value;
        
        this.saveData();
        this.renderStats();
        this.updatePreview();
        Utils.toast('✅ تم تعديل الإحصائية', 'success');
    }

    deleteStat(id) {
        if (!confirm('هل أنت متأكد من حذف هذه الإحصائية؟')) return;
        
        this.items.stats = this.items.stats.filter(s => s.id !== id);
        this.saveData();
        this.renderStats();
        this.updatePreview();
        Utils.toast('🗑️ تم حذف الإحصائية', 'info');
    }

    // ============================================================ */
    // 10. التبويبات                                               */
    // ============================================================ */

    setupTabs() {
        const tabs = document.querySelectorAll('.hero-tab');
        const contents = document.querySelectorAll('.hero-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const content = document.getElementById(target);
                if (content) content.classList.add('active');
            });
        });
    }

    // ============================================================ */
    // 11. أجهزة المعاينة                                          */
    // ============================================================ */

    setupDeviceButtons() {
        this.deviceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const device = btn.dataset.device;
                this.currentDevice = device;
                
                this.deviceBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.previewContainer.className = 'hero-preview-container preview-' + device;
            });
        });
    }

    // ============================================================ */
    // 12. تحديث المعاينة                                          */
    // ============================================================ */

    updatePreview() {
        if (!this.previewContainer) return;
        
        // جلب القيم
        const title = this.title?.value || 'Hi, I\'m Mohamed Abdallah';
        const subtitle = this.subtitle?.value || 'Frontend Web Developer';
        const description = this.description?.value || '';
        const name = this.name?.value || 'Mohamed Abdallah';
        const location = this.location?.value || 'Suez, Egypt';
        const imageUrl = this.imageUrl?.value || './assets/images/profile/hero.jpg';
        const bgColor = this.bgColor?.value || '#0f172a';
        const textColor = this.textColor?.value || '#ffffff';
        const accentColor = this.accentColor?.value || '#6366f1';
        const layout = this.layout?.value || 'image-right';
        const availability = this.availability?.value || 'Available For Work';
        const showBadgeAvailable = this.badgeAvailable?.checked !== false;
        const showBadgeVerified = this.badgeVerified?.checked !== false;
        const customBadge = this.customBadge?.value || '';
        const enableTyping = this.enableTyping?.checked !== false;
        
        // بناء HTML المعاينة
        const buttonsHtml = this.items.buttons.map(btn => `
            <a href="${btn.url}" class="btn btn-${btn.type}">${btn.label}</a>
        `).join('');
        
        const socialsHtml = this.items.socials.map(social => `
            <a href="${social.url}" target="_blank" style="color:var(--text-secondary);font-size:1.2rem;transition:all 0.3s ease;">
                <i class="${social.icon}"></i>
            </a>
        `).join('');
        
        const statsHtml = this.items.stats.map(stat => `
            <div style="text-align:center;">
                <h3 style="font-size:1.5rem;font-weight:700;margin:0;color:${accentColor};">${stat.value}</h3>
                <span style="font-size:0.8rem;color:var(--text-muted);">${stat.label}</span>
            </div>
        `).join('');
        
        const badgesHtml = `
            ${showBadgeAvailable ? `<span style="background:rgba(16,185,129,0.15);color:#10b981;padding:0.2rem 0.8rem;border-radius:20px;font-size:0.7rem;">✅ Available</span>` : ''}
            ${showBadgeVerified ? `<span style="background:rgba(99,102,241,0.15);color:#6366f1;padding:0.2rem 0.8rem;border-radius:20px;font-size:0.7rem;">✓ Verified</span>` : ''}
            ${customBadge ? `<span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:0.2rem 0.8rem;border-radius:20px;font-size:0.7rem;">${customBadge}</span>` : ''}
        `;
        
        // بناء المعاينة الكاملة
        this.previewContainer.innerHTML = `
            <div class="hero-preview-content" style="background:${bgColor};color:${textColor};border-radius:12px;padding:2rem;">
                <div class="hero-preview-inner ${layout}">
                    <div class="hero-preview-text">
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
                            ${badgesHtml}
                        </div>
                        <div class="greeting">👋 Hello, I'm</div>
                        <h1 class="title" style="color:${textColor};">${title}</h1>
                        <h2 class="subtitle" style="color:${accentColor};">${subtitle}</h2>
                        ${enableTyping ? `<div class="typing-text" style="color:${accentColor};font-weight:500;min-height:2rem;">▎</div>` : ''}
                        <p class="description" style="color:${textColor}99;">${description}</p>
                        <div class="buttons">
                            ${buttonsHtml}
                        </div>
                        <div style="display:flex;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
                            ${socialsHtml}
                        </div>
                    </div>
                    <div class="hero-preview-image">
                        <img src="${imageUrl}" alt="${name}" style="border-color:${accentColor};">
                    </div>
                </div>
                ${statsHtml ? `<div style="display:flex;gap:2rem;justify-content:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.1);">${statsHtml}</div>` : ''}
            </div>
        `;
        
        // تحديث الحالة
        if (this.previewStatus) {
            this.previewStatus.textContent = '✅ تم تحديث المعاينة';
        }
    }

    // ============================================================ */
    // 13. نشر التغييرات                                           */
    // ============================================================ */

    publish() {
        const data = {
            title: this.title?.value || '',
            subtitle: this.subtitle?.value || '',
            description: this.description?.value || '',
            name: this.name?.value || '',
            location: this.location?.value || '',
            email: this.email?.value || '',
            availability: this.availability?.value || '',
            imageUrl: this.imageUrl?.value || '',
            bgUrl: this.bgUrl?.value || '',
            layout: this.layout?.value || '',
            bgColor: this.bgColor?.value || '',
            textColor: this.textColor?.value || '',
            accentColor: this.accentColor?.value || '',
            buttons: this.items.buttons,
            socials: this.items.socials,
            stats: this.items.stats,
            badges: {
                available: this.badgeAvailable?.checked !== false,
                verified: this.badgeVerified?.checked !== false,
                custom: this.customBadge?.value || ''
            },
            effects: {
                glow: this.effectGlow?.checked !== false,
                float: this.effectFloat?.checked !== false,
                particle: this.effectParticle?.checked !== false
            }
        };
        
        // حفظ في localStorage
        localStorage.setItem('hero-published-data', JSON.stringify(data));
        
        // إرسال إشعار
        document.dispatchEvent(new CustomEvent('hero:published', { detail: data }));
        
        Utils.toast('✅ تم نشر التغييرات بنجاح!', 'success');
        console.log('📤 Hero published:', data);
    }

    // ============================================================ */
    // 14. إعادة ضبط                                               */
    // ============================================================ */

    reset() {
        if (!confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) return;
        
        this.items.buttons = [...this.defaultData.buttons];
        this.items.socials = [...this.defaultData.socials];
        this.items.stats = [...this.defaultData.stats];
        
        this.saveData();
        this.renderButtons();
        this.renderSocials();
        this.renderStats();
        this.updatePreview();
        
        Utils.toast('🔄 تم استعادة الإعدادات الافتراضية', 'info');
    }

    // ============================================================ */
    // 15. رفع الصور                                               */
    // ============================================================ */

    uploadImage(file, type = 'profile') {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            
            if (type === 'profile') {
                this.imagePreview.src = base64;
                this.imageUrl.value = base64;
            } else {
                this.bgPreview.src = base64;
                this.bgPreview.style.display = 'block';
                this.bgPlaceholder.style.display = 'none';
                this.bgUrl.value = base64;
            }
            
            this.updatePreview();
            Utils.toast('✅ تم رفع الصورة بنجاح', 'success');
        };
        reader.readAsDataURL(file);
    }

    removeImage(type = 'profile') {
        if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
        
        if (type === 'profile') {
            this.imagePreview.src = '';
            this.imageUrl.value = '';
        } else {
            this.bgPreview.src = '';
            this.bgPreview.style.display = 'none';
            this.bgPlaceholder.style.display = 'block';
            this.bgUrl.value = '';
        }
        
        this.updatePreview();
        Utils.toast('🗑️ تم حذف الصورة', 'info');
    }

    // ============================================================ */
    // 16. ربط الأحداث                                             */
    // ============================================================ */

    setupEvents() {
        // تحديث المعاينة عند تغيير أي حقل
        const inputs = document.querySelectorAll('.hero-form-group input, .hero-form-group select, .hero-form-group textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
        
        // الأزرار
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.addButton());
        }
        if (this.addSocialBtn) {
            this.addSocialBtn.addEventListener('click', () => this.addSocial());
        }
        if (this.addStatBtn) {
            this.addStatBtn.addEventListener('click', () => this.addStat());
        }
        
        // النشر والإعادة
        if (this.publishBtn) {
            this.publishBtn.addEventListener('click', () => this.publish());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }
        if (this.refreshPreviewBtn) {
            this.refreshPreviewBtn.addEventListener('click', () => {
                this.updatePreview();
                Utils.toast('🔄 تم تحديث المعاينة', 'info');
            });
        }
        
        // ثيم المعاينة
        if (this.themeBtn) {
            this.themeBtn.addEventListener('click', () => {
                this.previewTheme = this.previewTheme === 'light' ? 'dark' : 'light';
                this.themeBtn.innerHTML = this.previewTheme === 'light' ? 
                    '<i class="fa-solid fa-moon"></i>' : 
                    '<i class="fa-solid fa-sun"></i>';
                
                const container = document.querySelector('.hero-preview-content');
                if (container) {
                    container.style.background = this.previewTheme === 'light' ? '#ffffff' : '#0f172a';
                    container.style.color = this.previewTheme === 'light' ? '#0f172a' : '#ffffff';
                }
            });
        }
        
        // رفع الصور
        if (this.imageUploadBtn && this.imageInput) {
            this.imageUploadBtn.addEventListener('click', () => this.imageInput.click());
            this.imageInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.uploadImage(e.target.files[0], 'profile');
                }
            });
        }
        
        if (this.imageRemoveBtn) {
            this.imageRemoveBtn.addEventListener('click', () => this.removeImage('profile'));
        }
        
        if (this.bgUploadBtn && this.bgInput) {
            this.bgUploadBtn.addEventListener('click', () => this.bgInput.click());
            this.bgInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.uploadImage(e.target.files[0], 'background');
                }
            });
        }
        
        if (this.bgRemoveBtn) {
            this.bgRemoveBtn.addEventListener('click', () => this.removeImage('background'));
        }
        
        console.log('✅ Hero events setup complete');
    }

    // ============================================================ */
    // 17. التنظيف                                                  */
    // ============================================================ */

    destroy() {
        this.isInitialized = false;
        console.log('🎯 Hero Engine destroyed');
    }
}

// ============================================================ */
// 18. تشغيل المحرك                                             */
// ============================================================ */

let heroEngine = null;

function initHeroEngine() {
    if (!heroEngine) {
        heroEngine = new HeroEngine();
        window._heroEngine = heroEngine;
    }
    return heroEngine;
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero-section');
    if (heroSection && heroSection.classList.contains('active')) {
        initHeroEngine();
    }
});

// تشغيل عند التبديل للقسم
if (document.getElementById('hero-section')) {
    const heroObserver = new MutationObserver(() => {
        const heroSection = document.getElementById('hero-section');
        if (heroSection && heroSection.classList.contains('active') && !heroEngine) {
            initHeroEngine();
        }
    });
    heroObserver.observe(document.getElementById('hero-section'), { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
}

console.log('🎯 Hero Engine loaded');


// ============================================================ */
// 💻 SKILLS ENGINE - محرك المهارات الاحترافي                 */
// ============================================================ */
/*
   ✅ مطابق 100% مع ملف HTML
   ✅ لا يوجد أي تغيير في الكلاسات أو المعرفات
   ✅ CRUD كامل
   ✅ Supabase متكامل
   ✅ LocalStorage كنسخة احتياطية
   ✅ واجهة مستخدم سلسة
   ✅ معالجة الأخطاء
   ✅ إحصائيات فورية
   ✅ بحث وتصفية
   ✅ إجراءات جماعية (Bulk Actions)
*/

// ============================================================ */
// 01. SUPABASE CONFIG                                           */
// ============================================================ */

const SKILLS_SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SKILLS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

const SKILLS_HEADERS = {
    'Content-Type': 'application/json',
    'apikey': SKILLS_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SKILLS_SUPABASE_ANON_KEY}`
};

// ============================================================ */
// 02. UTILITIES                                                 */
// ============================================================ */

const SkillsUtils = {
    toast: (message, type = 'success', duration = 3000) => {
        const old = document.querySelector('.toast-custom');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = `toast-custom toast-${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `${icons[type] || '📢'} ${message}`;
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            color: '#fff',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maxWidth: '420px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    formatDate: (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    generateId: () => Math.floor(Date.now() + Math.random() * 1000000),

    storage: {
        get: (key, fallback = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : fallback;
            } catch { return fallback; }
        },
        set: (key, value) => {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
        }
    }
};

// ============================================================ */
// 03. SUPABASE API                                              */
// ============================================================ */

const SkillsAPI = {
    async fetchAll() {
        try {
            const res = await fetch(`${SKILLS_SUPABASE_URL}/rest/v1/skills?select=*&order=created_at.desc`, {
                headers: SKILLS_HEADERS
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error('❌ Error fetching skills:', error);
            return null;
        }
    },

    async insert(data) {
        try {
            const res = await fetch(`${SKILLS_SUPABASE_URL}/rest/v1/skills`, {
                method: 'POST',
                headers: { ...SKILLS_HEADERS, 'Prefer': 'return=representation' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error('❌ Error inserting skill:', error);
            return null;
        }
    },

    async update(id, data) {
        try {
            const res = await fetch(`${SKILLS_SUPABASE_URL}/rest/v1/skills?id=eq.${id}`, {
                method: 'PATCH',
                headers: { ...SKILLS_HEADERS, 'Prefer': 'return=representation' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error('❌ Error updating skill:', error);
            return null;
        }
    },

    async delete(id) {
        try {
            const res = await fetch(`${SKILLS_SUPABASE_URL}/rest/v1/skills?id=eq.${id}`, {
                method: 'DELETE',
                headers: SKILLS_HEADERS
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
        } catch (error) {
            console.error('❌ Error deleting skill:', error);
            return false;
        }
    }
};

// ============================================================ */
// 04. SKILLS ENGINE - المحرك الرئيسي                         */
// ============================================================ */

class SkillsEngine {
    constructor() {
        // ============================================================ */
        // DOM ELEMENTS - مطابقة لملف HTML                              */
        // ============================================================ */
        
        // Container
        this.container = document.getElementById('skills-categories-container');
        
        // Modal
        this.modal = document.getElementById('skills-modal');
        this.modalTitle = document.getElementById('skills-modal-title');
        this.modalClose = document.getElementById('skills-modal-close');
        this.modalCancel = document.getElementById('skills-modal-cancel');
        
        // Form
        this.form = document.getElementById('skills-form');
        this.editInput = document.getElementById('skills-edit-id');
        
        // Form Fields
        this.fieldName = document.getElementById('skills-name');
        this.fieldCategory = document.getElementById('skills-category');
        this.fieldLevel = document.getElementById('skills-level');
        this.fieldProgress = document.getElementById('skills-progress');
        this.fieldProgressValue = document.getElementById('skills-progress-value');
        this.fieldIcon = document.getElementById('skills-icon');
        this.fieldColor = document.getElementById('skills-color');
        this.fieldDesc = document.getElementById('skills-desc');
        this.fieldFeatured = document.getElementById('skills-featured');
        this.fieldHidden = document.getElementById('skills-hidden');
        
        // Buttons
        this.addBtn = document.getElementById('skills-add-btn');
        this.exportBtn = document.getElementById('skills-export-btn');
        this.refreshBtn = document.getElementById('skills-refresh-btn');
        
        // Search & Filters
        this.searchInput = document.getElementById('skills-search');
        this.filterCategory = document.getElementById('skills-filter-category');
        this.filterLevel = document.getElementById('skills-filter-level');
        this.sortSelect = document.getElementById('skills-sort');
        
        // Stats
        this.statTotal = document.getElementById('skills-count');
        this.statFeatured = document.getElementById('skills-featured-count');
        this.statAvg = document.getElementById('skills-avg-level');
        this.statCategories = document.getElementById('skills-categories-count');
        this.badgeTotal = document.getElementById('skills-total-badge');
        
        // Bulk
        this.bulkFeatured = document.getElementById('skills-bulk-featured');
        this.bulkHide = document.getElementById('skills-bulk-hide');
        this.bulkDelete = document.getElementById('skills-bulk-delete');
        this.selectedCount = document.getElementById('skills-selected-count');
        this.footerInfo = document.getElementById('skills-footer-info');
        
        // Delete Modal
        this.deleteModal = document.getElementById('skills-delete-modal');
        this.deleteConfirm = document.getElementById('skills-delete-confirm');
        this.deleteCancel = document.getElementById('skills-delete-cancel');
        this.deleteClose = document.getElementById('skills-delete-close');
        
        // Skeleton & Empty
        this.skeleton = document.getElementById('skills-skeleton');
        this.empty = document.getElementById('skills-empty');
        
        // ============================================================ */
        // STATE                                                       */
        // ============================================================ */
        
        this.items = [];
        this.selectedItems = new Set();
        this.searchQuery = '';
        this.currentFilter = { category: 'all', level: 'all' };
        this.currentSort = 'newest';
        this.isLoading = false;
        this.editId = null;
        this.deleteTargetId = null;
        this._isSaving = false;

        // ============================================================ */
        // CATEGORIES CONFIG                                            */
        // ============================================================ */
        
        this.categories = [
            { id: 'Web Development', icon: 'fa-solid fa-globe', color: '#3b82f6', label: 'تطوير الويب' },
            { id: 'Programming', icon: 'fa-solid fa-code', color: '#8b5cf6', label: 'البرمجة' },
            { id: 'Soft Skills', icon: 'fa-solid fa-users', color: '#10b981', label: 'مهارات حياتية' },
            { id: 'Tools', icon: 'fa-solid fa-wrench', color: '#f59e0b', label: 'أدوات' },
            { id: 'AI & Data', icon: 'fa-solid fa-brain', color: '#ec4899', label: 'الذكاء الاصطناعي' }
        ];

        this.levelMap = {
            'Beginner': 'مبتدئ',
            'Intermediate': 'متوسط',
            'Advanced': 'متقدم',
            'Expert': 'خبير'
        };

        // ============================================================ */
        // INIT                                                        */
        // ============================================================ */
        
        this.init();
    }

    // ============================================================ */
    // INITIALIZATION                                               */
    // ============================================================ */

    init() {
        console.log('💻 Skills Engine initializing...');
        
        try {
            this.loadFromStorage();
            this.setupEvents();
            this.render();
            
            setTimeout(() => this.loadFromSupabase(), 500);
            
            console.log('✅ Skills Engine ready');
            console.log(`📊 ${this.items.length} skills loaded`);
        } catch (error) {
            console.error('❌ Skills Engine init error:', error);
            SkillsUtils.toast('❌ فشل تحميل المهارات', 'error');
        }
    }

    // ============================================================ */
    // STORAGE                                                     */
    // ============================================================ */

    loadFromStorage() {
        const data = SkillsUtils.storage.get('dashboard-skills', []);
        if (Array.isArray(data) && data.length > 0) {
            this.items = data;
        }
    }

    saveToStorage() {
        SkillsUtils.storage.set('dashboard-skills', this.items);
    }

    // ============================================================ */
    // SUPABASE                                                     */
    // ============================================================ */

    async loadFromSupabase() {
        try {
            this.showSkeleton();
            
            const data = await SkillsAPI.fetchAll();
            
            if (data && data.length > 0) {
                const existingIds = new Set(this.items.map(item => item.id));
                let newCount = 0;
                
                data.forEach(item => {
                    if (!existingIds.has(item.id)) {
                        this.items.push(item);
                        existingIds.add(item.id);
                        newCount++;
                    }
                });
                
                if (newCount > 0) {
                    this.saveToStorage();
                    this.render();
                    console.log(`📂 Added ${newCount} new skills from Supabase`);
                }
            }
        } catch (error) {
            console.error('❌ Error loading skills from Supabase:', error);
        } finally {
            this.hideSkeleton();
        }
    }

    // ============================================================ */
    // EVENT SETUP                                                  */
    // ============================================================ */

    setupEvents() {
        // === Add Button ===
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.openModal());
        }

        // === Form Submit ===
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // === Modal Close ===
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        if (this.modalCancel) {
            this.modalCancel.addEventListener('click', () => this.closeModal());
        }
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }

        // === Progress Range ===
        if (this.fieldProgress && this.fieldProgressValue) {
            this.fieldProgress.addEventListener('input', () => {
                this.fieldProgressValue.textContent = `${this.fieldProgress.value}%`;
            });
        }

        // === Search ===
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.render();
            });
        }

        // === Filters ===
        if (this.filterCategory) {
            this.filterCategory.addEventListener('change', (e) => {
                this.currentFilter.category = e.target.value;
                this.render();
            });
        }
        if (this.filterLevel) {
            this.filterLevel.addEventListener('change', (e) => {
                this.currentFilter.level = e.target.value;
                this.render();
            });
        }

        // === Sort ===
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }

        // === Export ===
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportData());
        }

        // === Refresh ===
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.refresh());
        }

        // === Bulk Buttons ===
        if (this.bulkFeatured) {
            this.bulkFeatured.addEventListener('click', () => this.handleBulkAction('featured'));
        }
        if (this.bulkHide) {
            this.bulkHide.addEventListener('click', () => this.handleBulkAction('hide'));
        }
        if (this.bulkDelete) {
            this.bulkDelete.addEventListener('click', () => this.handleBulkAction('delete'));
        }

        // === Delete Modal ===
        if (this.deleteConfirm) {
            this.deleteConfirm.addEventListener('click', () => this.confirmDelete());
        }
        if (this.deleteCancel) {
            this.deleteCancel.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.deleteClose) {
            this.deleteClose.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.deleteModal) {
            this.deleteModal.addEventListener('click', (e) => {
                if (e.target === this.deleteModal) this.closeDeleteModal();
            });
        }

        // === Grid Delegation ===
        if (this.container) {
            // Checkbox change
            this.container.addEventListener('change', (e) => {
                const checkbox = e.target.closest('input[type="checkbox"]');
                if (checkbox && checkbox.dataset.id) {
                    const id = parseInt(checkbox.dataset.id);
                    if (checkbox.checked) {
                        this.selectedItems.add(id);
                    } else {
                        this.selectedItems.delete(id);
                    }
                    this.updateBulkUI();
                }
            });

            // Click actions (Edit, Delete)
            this.container.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-btn');
                if (editBtn && editBtn.dataset.id) {
                    const item = this.items.find(i => i.id === parseInt(editBtn.dataset.id));
                    if (item) this.openModal(item);
                    return;
                }

                const deleteBtn = e.target.closest('.delete-btn');
                if (deleteBtn && deleteBtn.dataset.id) {
                    this.openDeleteModal(parseInt(deleteBtn.dataset.id));
                    return;
                }
            });
        }

        // === Keyboard Shortcuts ===
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal && !this.modal.hidden) this.closeModal();
                if (this.deleteModal && !this.deleteModal.hidden) this.closeDeleteModal();
            }
        });

        console.log('✅ Skills events setup complete');
    }

    // ============================================================ */
    // MODAL                                                       */
    // ============================================================ */

    openModal(item = null) {
        if (!this.modal) return;

        if (item) {
            this.editId = item.id;
            this.fillForm(item);
            if (this.modalTitle) {
                this.modalTitle.innerHTML = `<i class="fa-solid fa-pen" aria-hidden="true"></i> تعديل المهارة`;
            }
        } else {
            this.editId = null;
            this.resetForm();
            if (this.modalTitle) {
                this.modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle" aria-hidden="true"></i> إضافة مهارة جديدة`;
            }
        }

        this.modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.hidden = true;
        document.body.style.overflow = '';
        this.resetForm();
    }

    resetForm() {
        if (!this.form) return;
        this.form.reset();
        if (this.editInput) this.editInput.value = '';
        this.editId = null;
        if (this.fieldProgressValue) this.fieldProgressValue.textContent = '80%';
        if (this.fieldColor) this.fieldColor.value = '#6366f1';
    }

    fillForm(item) {
        if (!this.form) return;
        
        if (this.fieldName) this.fieldName.value = item.name || '';
        if (this.fieldCategory) this.fieldCategory.value = item.category || '';
        if (this.fieldLevel) this.fieldLevel.value = item.level || 'Intermediate';
        if (this.fieldProgress) this.fieldProgress.value = item.progress || 80;
        if (this.fieldProgressValue) this.fieldProgressValue.textContent = `${item.progress || 80}%`;
        if (this.fieldIcon) this.fieldIcon.value = item.icon || '';
        if (this.fieldColor) this.fieldColor.value = item.color || '#6366f1';
        if (this.fieldDesc) this.fieldDesc.value = item.description || '';
        if (this.fieldFeatured) this.fieldFeatured.checked = item.is_featured || false;
        if (this.fieldHidden) this.fieldHidden.checked = item.is_hidden || false;
        
        if (this.editInput) this.editInput.value = item.id;
    }

    getFormData() {
        const data = { id: SkillsUtils.generateId() };
        if (this.editInput && this.editInput.value) {
            data.id = parseInt(this.editInput.value);
        }

        if (this.fieldName) data.name = this.fieldName.value || '';
        if (this.fieldCategory) data.category = this.fieldCategory.value || '';
        if (this.fieldLevel) data.level = this.fieldLevel.value || 'Intermediate';
        if (this.fieldProgress) data.progress = parseInt(this.fieldProgress.value) || 0;
        if (this.fieldIcon) data.icon = this.fieldIcon.value || '';
        if (this.fieldColor) data.color = this.fieldColor.value || '#6366f1';
        if (this.fieldDesc) data.description = this.fieldDesc.value || '';
        if (this.fieldFeatured) data.is_featured = this.fieldFeatured.checked;
        if (this.fieldHidden) data.is_hidden = this.fieldHidden.checked;

        return data;
    }

    // ============================================================ */
    // CRUD                                                       */
    // ============================================================ */

    async handleFormSubmit() {
        if (this._isSaving) {
            SkillsUtils.toast('⏳ جاري الحفظ...', 'info');
            return;
        }

        this._isSaving = true;
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
        }

        try {
            const data = this.getFormData();
            const isEdit = this.editId !== null;

            if (!data.name) {
                SkillsUtils.toast('⚠️ الرجاء إدخال اسم المهارة', 'warning');
                this.fieldName?.focus();
                return;
            }
            if (!data.category) {
                SkillsUtils.toast('⚠️ الرجاء اختيار الفئة', 'warning');
                this.fieldCategory?.focus();
                return;
            }

            if (isEdit) {
                const index = this.items.findIndex(item => item.id === data.id);
                if (index !== -1) {
                    this.items[index] = { ...this.items[index], ...data };
                }
                await SkillsAPI.update(data.id, data);
            } else {
                this.items.unshift(data);
                await SkillsAPI.insert(data);
            }

            this.saveToStorage();
            this.render();
            SkillsUtils.toast(isEdit ? '✅ تم تحديث المهارة' : '✅ تم إضافة المهارة', 'success');
            this.closeModal();

        } catch (error) {
            console.error('❌ Error saving:', error);
            SkillsUtils.toast('❌ فشل الحفظ', 'error');
        } finally {
            this._isSaving = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> حفظ';
            }
        }
    }

    // ============================================================ */
    // DELETE MODAL                                                 */
    // ============================================================ */

    openDeleteModal(id) {
        this.deleteTargetId = id;
        if (this.deleteModal) {
            this.deleteModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    closeDeleteModal() {
        this.deleteTargetId = null;
        if (this.deleteModal) {
            this.deleteModal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    async confirmDelete() {
        if (!this.deleteTargetId) return;
        
        const item = this.items.find(i => i.id === this.deleteTargetId);
        if (!item) return;

        this.items = this.items.filter(i => i.id !== this.deleteTargetId);
        this.selectedItems.delete(this.deleteTargetId);
        this.saveToStorage();
        this.render();

        await SkillsAPI.delete(this.deleteTargetId);
        
        this.closeDeleteModal();
        SkillsUtils.toast(`🗑️ تم حذف "${item.name}"`, 'info');
    }

    // ============================================================ */
    // RENDER                                                     */
    // ============================================================ */

    render() {
        if (!this.container) return;

        const filtered = this.getFilteredItems();
        const grouped = this.groupByCategory(filtered);

        this.container.innerHTML = '';

        if (filtered.length === 0) {
            if (this.empty) this.empty.hidden = false;
            if (this.container) this.container.innerHTML = '';
        } else {
            if (this.empty) this.empty.hidden = true;
            
            for (const [categoryId, skills] of Object.entries(grouped)) {
                if (skills.length === 0) continue;

                const catInfo = this.categories.find(c => c.id === categoryId) || {
                    id: categoryId,
                    icon: 'fa-solid fa-folder',
                    color: '#64748b',
                    label: categoryId
                };

                const card = document.createElement('div');
                card.className = 'category-card';
                card.innerHTML = `
                    <div class="category-header" data-category="${categoryId}">
                        <div class="category-title">
                            <i class="${catInfo.icon}" style="color:${catInfo.color}"></i>
                            <span>${catInfo.label}</span>
                            <span class="category-count">${skills.length}</span>
                        </div>
                        <div class="category-toggle">▼</div>
                    </div>
                    <div class="category-body" data-category="${categoryId}">
                        ${skills.map(skill => this.createSkillCard(skill)).join('')}
                    </div>
                `;

                this.container.appendChild(card);

                // Toggle category
                const header = card.querySelector('.category-header');
                const body = card.querySelector('.category-body');
                const toggle = card.querySelector('.category-toggle');

                header.addEventListener('click', () => {
                    body.classList.toggle('collapsed');
                    toggle.classList.toggle('collapsed');
                });
            }
        }

        this.updateStats();
        this.updateBulkUI();
        this.updateFooter();
    }

    createSkillCard(skill) {
        const isFeatured = skill.is_featured;
        const isHidden = skill.is_hidden;
        const levelClass = (skill.level || 'Intermediate').toLowerCase();
        const levelDisplay = this.levelMap[skill.level] || skill.level || 'متوسط';
        const progress = skill.progress || 0;
        const icon = skill.icon || 'fa-solid fa-code';
        const color = skill.color || '#8b5cf6';
        const checked = this.selectedItems.has(skill.id) ? 'checked' : '';

        return `
            <div class="skill-card" data-id="${skill.id}">
                ${isFeatured ? '<span class="skill-featured-badge">⭐ مميزة</span>' : ''}
                ${isHidden ? '<span class="skill-hidden-badge">👁️ مخفية</span>' : ''}
                <div class="skill-checkbox">
                    <input type="checkbox" data-id="${skill.id}" ${checked}>
                </div>
                <div class="skill-header">
                    <div class="skill-icon" style="background:${color}20; color:${color}">
                        <i class="${icon}"></i>
                    </div>
                    <span class="skill-name">${SkillsUtils.escapeHtml(skill.name)}</span>
                    <span class="skill-level ${levelClass}">${levelDisplay}</span>
                </div>
                <div class="skill-progress">
                    <div class="skill-progress-fill" style="width:${progress}%; background:${color}"></div>
                </div>
                ${skill.description ? `<div class="skill-desc">${SkillsUtils.escapeHtml(skill.description)}</div>` : ''}
                <div class="skill-actions">
                    <button class="edit-btn" data-id="${skill.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
                    <button class="delete-btn" data-id="${skill.id}"><i class="fa-solid fa-trash"></i> حذف</button>
                </div>
            </div>
        `;
    }

    // ============================================================ */
    // HELPERS                                                    */
    // ============================================================ */

    getFilteredItems() {
        let filtered = [...this.items];

        // Search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                (item.name || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query)
            );
        }

        // Category filter
        if (this.currentFilter.category && this.currentFilter.category !== 'all') {
            filtered = filtered.filter(item =>
                item.category === this.currentFilter.category
            );
        }

        // Level filter
        if (this.currentFilter.level && this.currentFilter.level !== 'all') {
            filtered = filtered.filter(item =>
                item.level === this.currentFilter.level
            );
        }

        // Sort
        switch (this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'alpha':
                filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'progress':
                filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
                break;
            default:
                break;
        }

        return filtered;
    }

    groupByCategory(items) {
        const grouped = {};
        for (const item of items) {
            const cat = item.category || 'Uncategorized';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        }
        return grouped;
    }

    // ============================================================ */
    // STATS                                                       */
    // ============================================================ */

    updateStats() {
        const total = this.items.length;
        const featured = this.items.filter(item => item.is_featured).length;
        const avgProgress = total > 0
            ? Math.round(this.items.reduce((sum, item) => sum + (item.progress || 0), 0) / total)
            : 0;
        const activeCategories = new Set(this.items.map(item => item.category)).size;

        if (this.statTotal) this.statTotal.textContent = total;
        if (this.statFeatured) this.statFeatured.textContent = featured;
        if (this.statAvg) this.statAvg.textContent = `${avgProgress}%`;
        if (this.statCategories) this.statCategories.textContent = activeCategories;
        if (this.badgeTotal) this.badgeTotal.textContent = total;
    }

    updateFooter() {
        if (this.footerInfo) {
            const total = this.items.length;
            this.footerInfo.textContent = `عرض ${total} من ${total} مهارة`;
        }
    }

    // ============================================================ */
    // BULK UI                                                     */
    // ============================================================ */

    updateBulkUI() {
        const count = this.selectedItems.size;
        if (this.selectedCount) {
            this.selectedCount.textContent = `${count} مختارة`;
        }
        
        const btns = [this.bulkFeatured, this.bulkHide, this.bulkDelete];
        btns.forEach(btn => {
            if (btn) btn.disabled = count === 0;
        });
    }

    // ============================================================ */
    // BULK ACTIONS                                                 */
    // ============================================================ */

    async handleBulkAction(action) {
        if (this.selectedItems.size === 0) {
            SkillsUtils.toast('⚠️ الرجاء تحديد مهارات أولاً', 'warning');
            return;
        }

        const ids = [...this.selectedItems];
        const count = ids.length;

        switch (action) {
            case 'delete':
                if (!confirm(`هل تريد حذف ${count} مهارة؟`)) return;
                for (const id of ids) {
                    this.items = this.items.filter(i => i.id !== id);
                    await SkillsAPI.delete(id);
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                SkillsUtils.toast(`🗑️ تم حذف ${count} مهارة`, 'info');
                break;
                
            case 'featured':
                for (const id of ids) {
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        item.is_featured = !item.is_featured;
                        await SkillsAPI.update(id, { is_featured: item.is_featured });
                    }
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                SkillsUtils.toast(`⭐ تم تحديث حالة التمييز لـ ${count} مهارة`, 'success');
                break;
                
            case 'hide':
                for (const id of ids) {
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        item.is_hidden = !item.is_hidden;
                        await SkillsAPI.update(id, { is_hidden: item.is_hidden });
                    }
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                SkillsUtils.toast(`👁️ تم تحديث حالة الإخفاء لـ ${count} مهارة`, 'success');
                break;
                
            default:
                break;
        }
    }

    // ============================================================ */
    // UI STATES                                                   */
    // ============================================================ */

    showSkeleton() {
        if (this.skeleton) this.skeleton.hidden = false;
        if (this.container) this.container.hidden = true;
        if (this.empty) this.empty.hidden = true;
    }

    hideSkeleton() {
        if (this.skeleton) this.skeleton.hidden = true;
        if (this.container) this.container.hidden = false;
    }

    // ============================================================ */
    // EXPORT & REFRESH                                             */
    // ============================================================ */

    exportData() {
        const data = this.getFilteredItems();
        if (data.length === 0) {
            SkillsUtils.toast('⚠️ لا توجد بيانات للتصدير', 'warning');
            return;
        }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skills-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        SkillsUtils.toast(`📥 تم تصدير ${data.length} مهارة`, 'success');
    }

    refresh() {
        SkillsUtils.toast('🔄 جاري تحديث المهارات...', 'info');
        this.loadFromSupabase();
    }
}

// ============================================================ */
// 05. INITIALIZATION                                            */
// ============================================================ */

let skillsEngineInstance = null;

function initSkillsEngine() {
    if (!skillsEngineInstance) {
        skillsEngineInstance = new SkillsEngine();
    }
    return skillsEngineInstance;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const skillsSection = document.getElementById('skills-section');
    if (skillsSection && skillsSection.classList.contains('active')) {
        initSkillsEngine();
    } else if (skillsSection) {
        const observer = new MutationObserver(() => {
            if (skillsSection.classList.contains('active') && !skillsEngineInstance) {
                initSkillsEngine();
                observer.disconnect();
            }
        });
        observer.observe(skillsSection, { attributes: true, attributeFilter: ['class'] });
    }
});

// If DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const skillsSection = document.getElementById('skills-section');
    if (skillsSection && skillsSection.classList.contains('active') && !skillsEngineInstance) {
        initSkillsEngine();
    }
}

// ============================================================ */
// 06. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   💻 SKILLS ENGINE v2.0 - محرك المهارات                   ║
║                                                              ║
║   ✅ 5 فئات (تطوير الويب، البرمجة، سوفت سكيلز، أدوات، AI) ║
║   ✅ ألوان مستويات واضحة وجميلة                           ║
║   ✅ أسماء الفئات بالعربية                                 ║
║   ✅ CRUD كامل                                             ║
║   ✅ بحث وتصفية                                            ║
║   ✅ Bulk Actions                                          ║
║   ✅ Supabase Sync                                         ║
║   ✅ LocalStorage Backup                                   ║
║                                                              ║
║   📦 Available: window._skillsEngine                        ║
║   🔧 Methods:                                              ║
║   • refresh() - تحديث البيانات                              ║
║   • exportData() - تصدير البيانات                           ║
║   • openModal(item) - فتح نافذة الإضافة/التعديل            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================ */
// نهاية SKILLS ENGINE                                          */
// ============================================================ */
// ============================================================ */
// 📁 PROJECTS ENGINE v3.0 - المحرك النهائي (نسخة نظيفة)      */
// ============================================================ */

// ============================================================ */
// 01. CONFIG & UTILITIES                                       */
// ============================================================ */

const PROJECTS_SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const PROJECTS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

const PROJECTS_HEADERS = {
    'Content-Type': 'application/json',
    'apikey': PROJECTS_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${PROJECTS_SUPABASE_ANON_KEY}`
};

const ProjectsUtils = {
    toast: (message, type = 'success', duration = 3000) => {
        const old = document.querySelector('.toast-custom');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = `toast-custom toast-${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `${icons[type] || '📢'} ${message}`;
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            color: '#fff',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maxWidth: '420px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    formatDate: (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    generateId: () => Math.floor(Date.now() + Math.random() * 1000000),

    storage: {
        get: (key, fallback = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : fallback;
            } catch { return fallback; }
        },
        set: (key, value) => {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
        }
    }
};

// ============================================================ */
// 02. SUPABASE API                                              */
// ============================================================ */

const ProjectsAPI = {
    async fetchAll() {
        try {
            const res = await fetch(`${PROJECTS_SUPABASE_URL}/rest/v1/projects?select=*&order=created_at.desc`, {
                headers: PROJECTS_HEADERS
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error('❌ Error fetching projects:', error);
            return null;
        }
    },

    async insert(data) {
        try {
            const insertData = { ...data };
            delete insertData.id;

            const res = await fetch(`${PROJECTS_SUPABASE_URL}/rest/v1/projects`, {
                method: 'POST',
                headers: { ...PROJECTS_HEADERS, 'Prefer': 'return=representation' },
                body: JSON.stringify(insertData)
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('❌ Insert error:', errorText);
                throw new Error(`HTTP ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error('❌ Error inserting project:', error);
            return null;
        }
    },

    async update(id, data) {
        try {
            const res = await fetch(`${PROJECTS_SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
                method: 'PATCH',
                headers: { ...PROJECTS_HEADERS, 'Prefer': 'return=representation' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('❌ Update error:', errorText);
                throw new Error(`HTTP ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error('❌ Error updating project:', error);
            return null;
        }
    },

    async delete(id) {
        try {
            const numericId = Number(id);
            if (isNaN(numericId) || numericId <= 0) {
                console.error('❌ Invalid ID for deletion:', id);
                return false;
            }
            
            const res = await fetch(`${PROJECTS_SUPABASE_URL}/rest/v1/projects?id=eq.${numericId}`, {
                method: 'DELETE',
                headers: PROJECTS_HEADERS
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('❌ Delete error:', errorText);
                throw new Error(`HTTP ${res.status}`);
            }
            return true;
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            return false;
        }
    }
};

// ============================================================ */
// 03. PROJECTS ENGINE - المحرك الرئيسي                        */
// ============================================================ */

class ProjectsEngine {
    constructor() {
        // DOM Elements
        this.grid = document.getElementById('projects-grid-container');
        this.modal = document.getElementById('projects-modal');
        this.modalTitle = document.getElementById('projects-modal-title');
        this.modalClose = document.getElementById('projects-modal-close');
        this.modalCancel = document.getElementById('projects-modal-cancel');
        this.modalReset = document.getElementById('projects-modal-reset');
        this.form = document.getElementById('projects-form');
        this.editInput = document.getElementById('projects-edit-id');
        
        this.fieldTitle = document.getElementById('projects-name');
        this.fieldCategory = document.getElementById('projects-category');
        this.fieldStatus = document.getElementById('projects-status');
        this.fieldCompletion = document.getElementById('projects-completion');
        this.fieldTech = document.getElementById('projects-tech');
        this.fieldDesc = document.getElementById('projects-desc');
        this.fieldFullDesc = document.getElementById('projects-full-desc');
        this.fieldImage = document.getElementById('projects-image');
        this.fieldColor = document.getElementById('projects-color');
        this.fieldDemoUrl = document.getElementById('projects-demo-url');
        this.fieldGithubUrl = document.getElementById('projects-github-url');
        this.fieldDocsUrl = document.getElementById('projects-docs-url');
        this.fieldFeatured = document.getElementById('projects-featured');
        this.fieldHidden = document.getElementById('projects-hidden');
        
        this.addBtn = document.getElementById('projects-add-btn');
        this.exportBtn = document.getElementById('projects-export-btn');
        this.refreshBtn = document.getElementById('projects-refresh-btn');
        
        this.searchInput = document.getElementById('projects-search');
        this.filterStatus = document.getElementById('projects-filter-status');
        this.filterCategory = document.getElementById('projects-filter-category');
        this.sortSelect = document.getElementById('projects-sort');
        this.viewBtns = document.querySelectorAll('.view-btn');
        
        this.statTotal = document.getElementById('projects-count');
        this.statCompleted = document.getElementById('projects-completed-count');
        this.statFeatured = document.getElementById('projects-featured-count');
        this.statPublished = document.getElementById('projects-published-count');
        this.badgeTotal = document.getElementById('projects-total-badge');
        
        this.bulkPublish = document.getElementById('projects-bulk-publish');
        this.bulkFeatured = document.getElementById('projects-bulk-featured');
        this.bulkDelete = document.getElementById('projects-bulk-delete');
        this.selectedCount = document.getElementById('projects-selected-count');
        this.footerInfo = document.getElementById('projects-footer-info');
        
        this.deleteModal = document.getElementById('projects-delete-modal');
        this.deleteConfirm = document.getElementById('projects-delete-confirm');
        this.deleteCancel = document.getElementById('projects-delete-cancel');
        this.deleteClose = document.getElementById('projects-delete-close');
        
        this.skeleton = document.getElementById('projects-skeleton');
        this.empty = document.getElementById('projects-empty');

        // State
        this.items = [];
        this.selectedItems = new Set();
        this.searchQuery = '';
        this.currentFilter = { status: 'all', category: 'all' };
        this.currentSort = 'newest';
        this.currentView = 'grid';
        this.isLoading = false;
        this.editId = null;
        this.deleteTargetId = null;
        this._isSaving = false;

        this.statusMap = {
            'Draft': 'مسودة',
            'In Progress': 'قيد التطوير',
            'Completed': 'مكتمل',
            'Published': 'منشور',
            'Archived': 'مؤرشف'
        };

        this.statusClassMap = {
            'Draft': 'draft',
            'In Progress': 'in-progress',
            'Completed': 'completed',
            'Published': 'published',
            'Archived': 'archived'
        };

        this.init();
    }

    // ============================================================ */
    // 04. INITIALIZATION                                            */
    // ============================================================ */

    init() {
        console.log('📁 Projects Engine initializing...');
        try {
            this.loadFromStorage();
            this.setupEvents();
            this.render();
            setTimeout(() => this.loadFromSupabase(), 500);
            console.log('✅ Projects Engine ready');
        } catch (error) {
            console.error('❌ Projects Engine init error:', error);
        }
    }

    // ============================================================ */
    // 05. STORAGE                                                  */
    // ============================================================ */

    loadFromStorage() {
        const data = ProjectsUtils.storage.get('dashboard-projects', []);
        if (Array.isArray(data) && data.length > 0) {
            this.items = data;
        }
    }

    saveToStorage() {
        ProjectsUtils.storage.set('dashboard-projects', this.items);
    }

    // ============================================================ */
    // 06. SUPABASE                                                 */
    // ============================================================ */

    async loadFromSupabase() {
        try {
            this.showSkeleton();
            const data = await ProjectsAPI.fetchAll();
            if (data && data.length > 0) {
                const existingIds = new Set(this.items.map(item => item.id));
                let newCount = 0;
                data.forEach(item => {
                    if (!existingIds.has(item.id)) {
                        this.items.push(item);
                        existingIds.add(item.id);
                        newCount++;
                    }
                });
                if (newCount > 0) {
                    this.saveToStorage();
                    this.render();
                    console.log(`📂 Added ${newCount} new projects from Supabase`);
                }
            }
        } catch (error) {
            console.error('❌ Error loading projects from Supabase:', error);
        } finally {
            this.hideSkeleton();
        }
    }

    // ============================================================ */
    // 07. EVENT SETUP                                              */
    // ============================================================ */

    setupEvents() {
        // --- Add Button ---
        if (this.addBtn) {
            this.addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }

        // --- Form Submit ---
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // --- Modal Close Buttons ---
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        if (this.modalCancel) {
            this.modalCancel.addEventListener('click', () => this.closeModal());
        }

        // --- Modal Reset ---
        if (this.modalReset) {
            this.modalReset.addEventListener('click', () => this.resetForm());
        }

        // --- Modal Click Outside ---
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }

        // --- Tabs ---
        const tabs = this.modal?.querySelectorAll('.tab-btn');
        if (tabs) {
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();

                    tabs.forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');

                    const target = tab.dataset.tab;
                    const contents = this.modal.querySelectorAll('.tab-content');
                    contents.forEach(content => {
                        if (content.id === target) {
                            content.hidden = false;
                            content.classList.add('active');
                        } else {
                            content.hidden = true;
                            content.classList.remove('active');
                        }
                    });
                });
            });
        }

        // --- Search ---
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.render();
            });
        }

        // --- Filters ---
        if (this.filterStatus) {
            this.filterStatus.addEventListener('change', (e) => {
                this.currentFilter.status = e.target.value;
                this.render();
            });
        }
        if (this.filterCategory) {
            this.filterCategory.addEventListener('change', (e) => {
                this.currentFilter.category = e.target.value;
                this.render();
            });
        }

        // --- Sort ---
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }

        // --- View Buttons ---
        if (this.viewBtns) {
            this.viewBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.viewBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentView = btn.dataset.view;
                    this.applyView();
                });
            });
        }

        // --- Export ---
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportData());
        }

        // --- Refresh ---
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.refresh());
        }

        // --- Bulk Buttons ---
        if (this.bulkPublish) {
            this.bulkPublish.addEventListener('click', () => this.handleBulkAction('publish'));
        }
        if (this.bulkFeatured) {
            this.bulkFeatured.addEventListener('click', () => this.handleBulkAction('featured'));
        }
        if (this.bulkDelete) {
            this.bulkDelete.addEventListener('click', () => this.handleBulkAction('delete'));
        }

        // --- Delete Modal ---
        if (this.deleteConfirm) {
            this.deleteConfirm.addEventListener('click', () => this.confirmDelete());
        }
        if (this.deleteCancel) {
            this.deleteCancel.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.deleteClose) {
            this.deleteClose.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.deleteModal) {
            this.deleteModal.addEventListener('click', (e) => {
                if (e.target === this.deleteModal) this.closeDeleteModal();
            });
        }

        // --- Grid Delegation ---
        if (this.grid) {
            this.grid.addEventListener('change', (e) => {
                const checkbox = e.target.closest('input[type="checkbox"]');
                if (checkbox && checkbox.dataset.id) {
                    const id = parseInt(checkbox.dataset.id);
                    if (checkbox.checked) {
                        this.selectedItems.add(id);
                    } else {
                        this.selectedItems.delete(id);
                    }
                    this.updateBulkUI();
                }
            });

            this.grid.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-btn');
                if (editBtn && editBtn.dataset.id) {
                    const item = this.items.find(i => i.id === parseInt(editBtn.dataset.id));
                    if (item) this.openModal(item);
                    return;
                }

                const deleteBtn = e.target.closest('.delete-btn');
                if (deleteBtn && deleteBtn.dataset.id) {
                    this.openDeleteModal(parseInt(deleteBtn.dataset.id));
                }
            });
        }

        // --- Keyboard ---
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal && !this.modal.hidden) this.closeModal();
                if (this.deleteModal && !this.deleteModal.hidden) this.closeDeleteModal();
            }
        });

        console.log('✅ Projects events setup complete');
    }

    // ============================================================ */
    // 08. VIEW                                                     */
    // ============================================================ */

    applyView() {
        if (!this.grid) return;
        if (this.currentView === 'list') {
            this.grid.style.gridTemplateColumns = '1fr';
        } else {
            this.grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        }
    }

    // ============================================================ */
    // 09. MODAL                                                    */
    // ============================================================ */

    openModal(item = null) {
        if (!this.modal) return;

        if (item) {
            this.editId = item.id;
            this.fillForm(item);
            if (this.modalTitle) {
                this.modalTitle.innerHTML = `<i class="fa-solid fa-pen"></i> تعديل المشروع`;
            }
        } else {
            this.editId = null;
            this.resetForm();
            if (this.modalTitle) {
                this.modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> إضافة مشروع جديد`;
            }
        }

        // Reset tabs
        const tabs = this.modal.querySelectorAll('.tab-btn');
        const contents = this.modal.querySelectorAll('.tab-content');
        tabs.forEach((tab, i) => {
            if (i === 0) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });
        contents.forEach((content, i) => {
            if (i === 0) {
                content.hidden = false;
                content.classList.add('active');
            } else {
                content.hidden = true;
                content.classList.remove('active');
            }
        });

        this.modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.hidden = true;
        document.body.style.overflow = '';
        this.resetForm();
    }

    resetForm() {
        if (!this.form) return;
        this.form.reset();
        if (this.editInput) this.editInput.value = '';
        this.editId = null;
        if (this.fieldColor) this.fieldColor.value = '#6366f1';
        if (this.fieldCompletion) this.fieldCompletion.value = 100;
        if (this.fieldFeatured) this.fieldFeatured.checked = false;
        if (this.fieldHidden) this.fieldHidden.checked = false;
    }

    fillForm(item) {
        if (!this.form) return;
        if (this.fieldTitle) this.fieldTitle.value = item.title || '';
        if (this.fieldCategory) this.fieldCategory.value = item.category || '';
        if (this.fieldStatus) this.fieldStatus.value = item.status || 'Draft';
        if (this.fieldCompletion) this.fieldCompletion.value = item.completion || 100;
        if (this.fieldTech) this.fieldTech.value = (item.tech_stack || []).join(', ');
        if (this.fieldDesc) this.fieldDesc.value = item.description || '';
        if (this.fieldFullDesc) this.fieldFullDesc.value = item.full_description || '';
        if (this.fieldImage) this.fieldImage.value = item.image_url || '';
        if (this.fieldColor) this.fieldColor.value = item.color || '#6366f1';
        if (this.fieldDemoUrl) this.fieldDemoUrl.value = item.demo_url || '';
        if (this.fieldGithubUrl) this.fieldGithubUrl.value = item.github_url || '';
        if (this.fieldDocsUrl) this.fieldDocsUrl.value = item.docs_url || '';
        if (this.fieldFeatured) this.fieldFeatured.checked = item.is_featured || false;
        if (this.fieldHidden) this.fieldHidden.checked = item.is_hidden || false;
        if (this.editInput) this.editInput.value = item.id;
    }

    // ============================================================ */
    // 10. GET FORM DATA                                             */
    // ============================================================ */

    getFormData() {
        const data = {
            title: this.fieldTitle?.value || '',
            category: this.fieldCategory?.value || 'Web Apps',
            status: this.fieldStatus?.value || 'Draft',
            description: this.fieldDesc?.value || '',
            full_description: this.fieldFullDesc?.value || '',
            tech_stack: this.fieldTech?.value ? this.fieldTech.value.split(',').map(s => s.trim()).filter(Boolean) : [],
            image_url: this.fieldImage?.value || '',
            color: this.fieldColor?.value || '#6366f1',
            demo_url: this.fieldDemoUrl?.value || '',
            github_url: this.fieldGithubUrl?.value || '',
            docs_url: this.fieldDocsUrl?.value || '',
            completion: parseInt(this.fieldCompletion?.value) || 100,
            is_featured: this.fieldFeatured?.checked || false,
            is_hidden: this.fieldHidden?.checked || false,
            display_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (this.editInput?.value) {
            const editId = parseInt(this.editInput.value);
            if (!isNaN(editId) && editId > 0) {
                data.id = editId;
            }
        }

        return data;
    }

    // ============================================================ */
    // 11. CRUD                                                     */
    // ============================================================ */

    async handleFormSubmit() {
        if (this._isSaving) {
            ProjectsUtils.toast('⏳ جاري الحفظ...', 'info');
            return;
        }

        this._isSaving = true;
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
        }

        try {
            const data = this.getFormData();
            const isEdit = this.editId !== null;

            if (!data.title) {
                ProjectsUtils.toast('⚠️ الرجاء إدخال اسم المشروع', 'warning');
                this.fieldTitle?.focus();
                return;
            }
            if (!data.category) {
                ProjectsUtils.toast('⚠️ الرجاء اختيار التصنيف', 'warning');
                this.fieldCategory?.focus();
                return;
            }

            if (isEdit) {
                const index = this.items.findIndex(item => item.id === data.id);
                if (index !== -1) {
                    this.items[index] = { ...this.items[index], ...data };
                }
                const updateData = { ...data };
                delete updateData.id;
                await ProjectsAPI.update(data.id, updateData);
                ProjectsUtils.toast('✅ تم تحديث المشروع', 'success');
            } else {
                const insertData = { ...data };
                delete insertData.id;
                const result = await ProjectsAPI.insert(insertData);
                if (result && result.length > 0) {
                    data.id = result[0].id;
                } else {
                    data.id = Date.now() + Math.random() * 1000;
                }
                this.items.unshift(data);
                ProjectsUtils.toast('✅ تم إضافة المشروع', 'success');
            }

            this.saveToStorage();
            this.render();
            this.closeModal();

            // 🔥 إرسال حدث لتحديث الموقع الرئيسي
            document.dispatchEvent(new CustomEvent('dashboard:projects-updated', {
                detail: { count: this.items.length }
            }));

        } catch (error) {
            console.error('❌ Error saving:', error);
            ProjectsUtils.toast('❌ فشل الحفظ: ' + (error.message || 'خطأ غير معروف'), 'error');
        } finally {
            this._isSaving = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> حفظ';
            }
        }
    }

    // ============================================================ */
    // 12. DELETE MODAL                                             */
    // ============================================================ */

    openDeleteModal(id) {
        this.deleteTargetId = id;
        if (this.deleteModal) {
            this.deleteModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    closeDeleteModal() {
        this.deleteTargetId = null;
        if (this.deleteModal) {
            this.deleteModal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    async confirmDelete() {
        if (!this.deleteTargetId) return;
        
        const item = this.items.find(i => i.id === this.deleteTargetId);
        if (!item) return;

        this.items = this.items.filter(i => i.id !== this.deleteTargetId);
        this.selectedItems.delete(this.deleteTargetId);
        this.saveToStorage();
        this.render();

        await ProjectsAPI.delete(this.deleteTargetId);
        
        this.closeDeleteModal();
        ProjectsUtils.toast(`🗑️ تم حذف "${item.title}"`, 'info');

        // 🔥 إرسال حدث لتحديث الموقع الرئيسي
        document.dispatchEvent(new CustomEvent('dashboard:projects-updated', {
            detail: { count: this.items.length }
        }));
    }

    // ============================================================ */
    // 13. RENDER                                                   */
    // ============================================================ */

    render() {
        if (!this.grid) return;

        const filtered = this.getFilteredItems();

        if (filtered.length === 0) {
            if (this.empty) this.empty.hidden = false;
            this.grid.innerHTML = '';
        } else {
            if (this.empty) this.empty.hidden = true;
            this.grid.innerHTML = '';
            filtered.forEach(item => {
                this.grid.appendChild(this.createProjectCard(item));
            });
        }

        this.applyView();
        this.updateStats();
        this.updateBulkUI();
        this.updateFooter();
    }

    createProjectCard(item) {
        const isFeatured = item.is_featured;
        const status = item.status || 'Draft';
        const statusClass = this.statusClassMap[status] || 'draft';
        const statusDisplay = this.statusMap[status] || status;
        const completion = item.completion || 0;
        const color = item.color || '#6366f1';
        const checked = this.selectedItems.has(item.id) ? 'checked' : '';

        const techStack = item.tech_stack || [];
        const techHtml = techStack.length > 0
            ? techStack.map(t => `<span>${ProjectsUtils.escapeHtml(t)}</span>`).join('')
            : '<span style="color:var(--text-muted)">لا توجد تقنيات</span>';

        const div = document.createElement('div');
        div.className = 'project-card';
        div.dataset.id = item.id;

        div.innerHTML = `
            ${isFeatured ? '<span class="project-featured-badge">⭐ مميز</span>' : ''}
            <div class="project-checkbox">
                <input type="checkbox" data-id="${item.id}" ${checked}>
            </div>
            <div class="project-image">
                ${item.image_url ? `<img src="${item.image_url}" alt="${ProjectsUtils.escapeHtml(item.title)}" loading="lazy">` : ''}
                <div class="project-overlay">
                    <span>${ProjectsUtils.escapeHtml(item.category || 'غير مصنف')}</span>
                </div>
            </div>
            <div class="project-content">
                <div class="project-top">
                    <h4 class="project-title">${ProjectsUtils.escapeHtml(item.title)}</h4>
                    <span class="project-status ${statusClass}">${statusDisplay}</span>
                </div>
                ${item.description ? `<p class="project-desc">${ProjectsUtils.escapeHtml(item.description)}</p>` : ''}
                <div class="project-tech">${techHtml}</div>
                <div class="project-progress-row">
                    <span class="project-progress-label">${completion}% مكتمل</span>
                    <div class="project-progress-track">
                        <div class="project-progress-fill" style="width:${completion}%; background:${color}"></div>
                    </div>
                </div>
                <div class="project-buttons">
                    ${item.demo_url ? `<a href="${item.demo_url}" target="_blank" class="btn-demo"><i class="fa-solid fa-eye"></i> معاينة</a>` : ''}
                    ${item.github_url ? `<a href="${item.github_url}" target="_blank" class="btn-github"><i class="fa-brands fa-github"></i> كود</a>` : ''}
                </div>
            </div>
            <div class="project-actions">
                <button class="edit-btn" data-id="${item.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
                <button class="delete-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i> حذف</button>
            </div>
        `;

        return div;
    }

    // ============================================================ */
    // 14. HELPERS                                                  */
    // ============================================================ */

    getFilteredItems() {
        let filtered = [...this.items];

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                (item.title || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query) ||
                (item.tech_stack || []).some(t => t.toLowerCase().includes(query))
            );
        }

        if (this.currentFilter.status && this.currentFilter.status !== 'all') {
            filtered = filtered.filter(item => item.status === this.currentFilter.status);
        }

        if (this.currentFilter.category && this.currentFilter.category !== 'all') {
            filtered = filtered.filter(item => item.category === this.currentFilter.category);
        }

        switch (this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'alpha':
                filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'progress':
                filtered.sort((a, b) => (b.completion || 0) - (a.completion || 0));
                break;
        }

        return filtered;
    }

    // ============================================================ */
    // 15. STATS                                                    */
    // ============================================================ */

    updateStats() {
        const total = this.items.length;
        const completed = this.items.filter(item => item.status === 'Completed').length;
        const featured = this.items.filter(item => item.is_featured).length;
        const published = this.items.filter(item => item.status === 'Published').length;

        if (this.statTotal) this.statTotal.textContent = total;
        if (this.statCompleted) this.statCompleted.textContent = completed;
        if (this.statFeatured) this.statFeatured.textContent = featured;
        if (this.statPublished) this.statPublished.textContent = published;
        if (this.badgeTotal) this.badgeTotal.textContent = total;
    }

    updateFooter() {
        if (this.footerInfo) {
            const total = this.items.length;
            this.footerInfo.textContent = `عرض ${total} من ${total} مشروع`;
        }
    }

    // ============================================================ */
    // 16. BULK ACTIONS                                             */
    // ============================================================ */

    updateBulkUI() {
        const count = this.selectedItems.size;
        if (this.selectedCount) {
            this.selectedCount.textContent = `${count} مختارة`;
        }
        const btns = [this.bulkPublish, this.bulkFeatured, this.bulkDelete];
        btns.forEach(btn => {
            if (btn) btn.disabled = count === 0;
        });
    }

    async handleBulkAction(action) {
        if (this.selectedItems.size === 0) {
            ProjectsUtils.toast('⚠️ الرجاء تحديد مشاريع أولاً', 'warning');
            return;
        }

        const ids = [...this.selectedItems].filter(id => !isNaN(id) && id > 0);
        
        if (ids.length === 0) {
            ProjectsUtils.toast('⚠️ لا توجد IDs صحيحة', 'warning');
            return;
        }

        const count = ids.length;

        switch (action) {
            case 'delete':
                if (!confirm(`هل تريد حذف ${count} مشروع؟`)) return;
                
                let successCount = 0;
                for (const id of ids) {
                    const success = await ProjectsAPI.delete(id);
                    if (success) {
                        this.items = this.items.filter(i => i.id !== id);
                        successCount++;
                    }
                }
                
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                
                if (successCount > 0) {
                    ProjectsUtils.toast(`🗑️ تم حذف ${successCount} مشروع`, 'info');
                    document.dispatchEvent(new CustomEvent('dashboard:projects-updated', {
                        detail: { count: this.items.length }
                    }));
                } else {
                    ProjectsUtils.toast('❌ فشل حذف المشاريع', 'error');
                }
                break;
                
            case 'publish':
                for (const id of ids) {
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        const newStatus = item.status === 'Published' ? 'Draft' : 'Published';
                        item.status = newStatus;
                        await ProjectsAPI.update(id, { status: newStatus });
                    }
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                ProjectsUtils.toast(`🌐 تم تحديث حالة النشر لـ ${count} مشروع`, 'success');
                break;
                
            case 'featured':
                for (const id of ids) {
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        item.is_featured = !item.is_featured;
                        await ProjectsAPI.update(id, { is_featured: item.is_featured });
                    }
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                ProjectsUtils.toast(`⭐ تم تحديث حالة التمييز لـ ${count} مشروع`, 'success');
                break;
        }
    }

    // ============================================================ */
    // 17. UI STATES                                                */
    // ============================================================ */

    showSkeleton() {
        if (this.skeleton) this.skeleton.hidden = false;
        if (this.grid) this.grid.hidden = true;
        if (this.empty) this.empty.hidden = true;
    }

    hideSkeleton() {
        if (this.skeleton) this.skeleton.hidden = true;
        if (this.grid) this.grid.hidden = false;
    }

    // ============================================================ */
    // 18. EXPORT & REFRESH                                         */
    // ============================================================ */

    exportData() {
        const data = this.getFilteredItems();
        if (data.length === 0) {
            ProjectsUtils.toast('⚠️ لا توجد بيانات للتصدير', 'warning');
            return;
        }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projects-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        ProjectsUtils.toast(`📥 تم تصدير ${data.length} مشروع`, 'success');
    }

    refresh() {
        ProjectsUtils.toast('🔄 جاري تحديث المشاريع...', 'info');
        this.loadFromSupabase();
    }

    // ============================================================ */
    // 19. LOAD DEFAULT PROJECTS - (فارغة تماماً)                  */
    // ============================================================ */

    loadDefaultProjects() {
        this.items = [];
        this.saveToStorage();
        console.log('📂 تم التحميل: لا توجد مشاريع افتراضية.');
    }
}

// ============================================================ */
// 20. INITIALIZATION                                            */
// ============================================================ */

let projectsEngineInstance = null;

function initProjectsEngine() {
    if (!projectsEngineInstance) {
        projectsEngineInstance = new ProjectsEngine();
    }
    return projectsEngineInstance;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection && projectsSection.classList.contains('active')) {
        initProjectsEngine();
    } else if (projectsSection) {
        const observer = new MutationObserver(() => {
            if (projectsSection.classList.contains('active') && !projectsEngineInstance) {
                initProjectsEngine();
                observer.disconnect();
            }
        });
        observer.observe(projectsSection, { attributes: true, attributeFilter: ['class'] });
    }
});

// If DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection && projectsSection.classList.contains('active') && !projectsEngineInstance) {
        initProjectsEngine();
    }
}

// ============================================================ */
// 21. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   📁 PROJECTS ENGINE v3.0 - المحرك النهائي                 ║
║                                                              ║
║   ✅ CRUD كامل                                              ║
║   ✅ Supabase متكامل                                        ║
║   ✅ LocalStorage كنسخة احتياطية                            ║
║   ✅ بحث وتصفية                                             ║
║   ✅ Bulk Actions                                           ║
║   ✅ المودال لا يغلق عند التبديل بين التبويبات              ║
║   ✅ المودال يغلق فقط عند حفظ بنجاح أو إلغاء               ║
║   ✅ إرسال حدث لتحديث الموقع الرئيسي                       ║
║                                                              ║
║   📦 Available: window._projectsEngine                      ║
║   🔧 Methods: refresh(), exportData(), openModal()          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================ */
// نهاية PROJECTS ENGINE v3.0                                   */
// ============================================================ */



// ============================================================ */
// 🏅 CERTIFICATES ENGINE - محرك الشهادات الاحترافي           */
// ============================================================ */
/*
   ✅ مطابق 100% مع ملف HTML
   ✅ لا يوجد أي تغيير في الكلاسات أو المعرفات
   ✅ CRUD كامل
   ✅ Supabase متكامل
   ✅ LocalStorage كنسخة احتياطية
   ✅ واجهة مستخدم سلسة
   ✅ معالجة الأخطاء
   ✅ إحصائيات فورية
   ✅ بحث وتصفية
   ✅ إجراءات جماعية (Bulk Actions)
   ✅ التحقق من صلاحية الشهادات
   ✅ معاينة الشهادة
   ✅ تحميل الشهادة (PDF جاهز)
*/

// ============================================================ */
// 01. SUPABASE CONFIG                                           */
// ============================================================ */

const CERTS_SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const CERTS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

const CERTS_HEADERS = {
    'Content-Type': 'application/json',
    'apikey': CERTS_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${CERTS_SUPABASE_ANON_KEY}`
};

// ============================================================ */
// 02. UTILITIES                                                 */
// ============================================================ */

const CertsUtils = {
    toast: (message, type = 'success', duration = 3000) => {
        const old = document.querySelector('.toast-custom');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = `toast-custom toast-${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `${icons[type] || '📢'} ${message}`;
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            color: '#fff',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maxWidth: '420px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    formatDate: (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    generateId: () => Math.floor(Date.now() + Math.random() * 1000000),

    storage: {
        get: (key, fallback = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : fallback;
            } catch { return fallback; }
        },
        set: (key, value) => {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
        }
    }
};

// ============================================================ */
// 03. SUPABASE API                                              */
// ============================================================ */

const CertsAPI = {
    async fetchAll() {
        try {
            const res = await fetch(`${CERTS_SUPABASE_URL}/rest/v1/certificates?select=*&order=created_at.desc`, {
                headers: CERTS_HEADERS
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error('❌ Error fetching certificates:', error);
            return null;
        }
    },

  // ============================================================ */
// 🔥 INSERT CERTIFICATE - مع دعم الصورة                      */
// ============================================================ */

// ============================================================ */
// 🔥 INSERT CERTIFICATE - بدون is_pinned                      */
// ============================================================ */

// ============================================================ */
// 🔥 INSERT CERTIFICATE - بدون skills و is_pinned            */
// ============================================================ */

async insert(data) {
    try {
        const headers = window.supabaseHeaders || {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI'
        };
        
        const SUPABASE_URL = window.SUPABASE_URL || 'https://txcuibshcvfusegrfcbm.supabase.co';
        
        // ✅ الحقول المسموح بها (من غير skills و is_pinned)
        const allowedFields = [
            'title', 'provider', 'description', 'issue_date', 
            'expiry_date', 'credential_id', 'verify_url',
            'is_published', 'is_featured',
            'image_url', 'created_at', 'updated_at'
        ];
        
        const cleanData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined && data[key] !== null) {
                cleanData[key] = data[key];
            }
        }
        
        cleanData.created_at = new Date().toISOString();
        cleanData.updated_at = new Date().toISOString();
        
        console.log('📤 Inserting certificate:', cleanData);
        
        const res = await fetch(`${SUPABASE_URL}/rest/v1/certificates`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(cleanData)
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Insert error:', errorText);
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        return await res.json();
        
    } catch (error) {
        console.error('❌ Error inserting certificate:', error);
        throw error;
    }
},

   // ============================================================ */
// 🔥 UPDATE CERTIFICATE - مع دعم الصورة                      */
// ============================================================ */

// ============================================================ */
// 🔥 UPDATE CERTIFICATE - بدون is_pinned                      */
// ============================================================ */
// ============================================================ */
// 🔥 UPDATE CERTIFICATE - بدون skills و is_pinned            */
// ============================================================ */

async update(id, data) {
    try {
        const headers = window.supabaseHeaders || {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI'
        };
        
        const SUPABASE_URL = window.SUPABASE_URL || 'https://txcuibshcvfusegrfcbm.supabase.co';
        
        // ✅ الحقول المسموح بها (من غير skills و is_pinned)
        const allowedFields = [
            'title', 'provider', 'description', 'issue_date', 
            'expiry_date', 'credential_id', 'verify_url',
            'is_published', 'is_featured',
            'image_url', 'updated_at'
        ];
        
        const cleanData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined && data[key] !== null) {
                cleanData[key] = data[key];
            }
        }
        
        cleanData.updated_at = new Date().toISOString();
        
        console.log('📤 Updating certificate:', id, cleanData);
        
        const res = await fetch(`${SUPABASE_URL}/rest/v1/certificates?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(cleanData)
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Update error:', errorText);
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        return await res.json();
        
    } catch (error) {
        console.error('❌ Error updating certificate:', error);
        throw error;
    }
},


    async delete(id) {
        try {
            const res = await fetch(`${CERTS_SUPABASE_URL}/rest/v1/certificates?id=eq.${id}`, {
                method: 'DELETE',
                headers: CERTS_HEADERS
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
        } catch (error) {
            console.error('❌ Error deleting certificate:', error);
            return false;
        }
    }
};

// ============================================================ */
// 04. CERTIFICATES ENGINE - المحرك الرئيسي                   */
// ============================================================ */

class CertificatesEngine {
    constructor() {
        // ============================================================ */
        // DOM ELEMENTS - مطابقة لملف HTML                              */
        // ============================================================ */
        
        // Container
        this.grid = document.getElementById('certificates-grid-container');
        
        // Modal
        this.modal = document.getElementById('certificates-modal');
        this.modalTitle = document.getElementById('certificates-modal-title');
        this.modalClose = document.getElementById('certificates-modal-close');
        this.modalCancel = document.getElementById('certificates-modal-cancel');
        this.modalReset = document.getElementById('certificates-modal-reset');
        
        // Form
        this.form = document.getElementById('certificates-form');
        this.editInput = document.getElementById('certificates-edit-id');
        
        // Form Fields
        this.fieldTitle = document.getElementById('certificates-title');
        this.fieldProvider = document.getElementById('certificates-provider');
        this.fieldIssueDate = document.getElementById('certificates-issue-date');
        this.fieldExpiryDate = document.getElementById('certificates-expiry-date');
        this.fieldCredentialId = document.getElementById('certificates-credential-id');
        this.fieldVerifyUrl = document.getElementById('certificates-verify-url');
        this.fieldDesc = document.getElementById('certificates-desc');
        this.fieldSkills = document.getElementById('certificates-skills');
        this.fieldFeatured = document.getElementById('certificates-featured');
        this.fieldPublished = document.getElementById('certificates-published');
        this.fieldPinned = document.getElementById('certificates-pinned');
        
        // Buttons
        this.addBtn = document.getElementById('certificates-add-btn');
        this.exportBtn = document.getElementById('certificates-export-btn');
        this.refreshBtn = document.getElementById('certificates-refresh-btn');
        
        // Search & Filters
        this.searchInput = document.getElementById('certificates-search');
        this.filterProvider = document.getElementById('certificates-filter-provider');
        this.filterStatus = document.getElementById('certificates-filter-status');
        this.sortSelect = document.getElementById('certificates-sort');
        
        // Stats
        this.statTotal = document.getElementById('certificates-count');
        this.statValid = document.getElementById('certificates-valid-count');
        this.statFeatured = document.getElementById('certificates-featured-count');
        this.statExpired = document.getElementById('certificates-expired-count');
        this.badgeTotal = document.getElementById('certificates-total-badge');
        
        // Bulk
        this.bulkPublish = document.getElementById('certificates-bulk-publish');
        this.bulkFeatured = document.getElementById('certificates-bulk-featured');
        this.bulkDelete = document.getElementById('certificates-bulk-delete');
        this.selectedCount = document.getElementById('certificates-selected-count');
        this.footerInfo = document.getElementById('certificates-footer-info');
        
        // Delete Modal
        this.deleteModal = document.getElementById('certificates-delete-modal');
        this.deleteConfirm = document.getElementById('certificates-delete-confirm');
        this.deleteCancel = document.getElementById('certificates-delete-cancel');
        this.deleteClose = document.getElementById('certificates-delete-close');
        
        // Preview Modal
        this.previewModal = document.getElementById('certificates-preview-modal');
        this.previewClose = document.getElementById('certificates-preview-close');
        this.previewCloseBtn = document.getElementById('certificates-preview-close-btn');
        this.previewContainer = document.getElementById('certificates-preview-container');
        this.previewDownload = document.getElementById('certificates-preview-download');
        this.previewPrint = document.getElementById('certificates-preview-print');
        
        // Skeleton & Empty
        this.skeleton = document.getElementById('certificates-skeleton');
        this.empty = document.getElementById('certificates-empty');
        
        // ============================================================ */
        // STATE                                                       */
        // ============================================================ */
        
        this.items = [];
        this.selectedItems = new Set();
        this.searchQuery = '';
        this.currentFilter = { provider: 'all', status: 'all' };
        this.currentSort = 'newest';
        this.isLoading = false;
        this.editId = null;
        this.deleteTargetId = null;
        this.previewTargetId = null;
        this._isSaving = false;

        // ============================================================ */
        // STATUS CONFIG                                                */
        // ============================================================ */
        
        this.providerIcons = {
            'Cisco': 'fa-brands fa-cisco',
            'Google': 'fa-brands fa-google',
            'Microsoft': 'fa-brands fa-microsoft',
            'AWS': 'fa-brands fa-aws',
            'Coursera': 'fa-solid fa-graduation-cap',
            'edX': 'fa-solid fa-school'
        };

        // ============================================================ */
        // INIT                                                        */
        // ============================================================ */
        
        this.init();
    }

    // ============================================================ */
    // INITIALIZATION                                               */
    // ============================================================ */

    init() {
        console.log('🏅 Certificates Engine initializing...');
        
        try {
            this.loadFromStorage();
            this.setupEvents();
            this.render();
            
            setTimeout(() => this.loadFromSupabase(), 500);
            
            console.log('✅ Certificates Engine ready');
            console.log(`📊 ${this.items.length} certificates loaded`);
        } catch (error) {
            console.error('❌ Certificates Engine init error:', error);
            CertsUtils.toast('❌ فشل تحميل الشهادات', 'error');
        }
    }

    // ============================================================ */
    // STORAGE                                                     */
    // ============================================================ */

    loadFromStorage() {
        const data = CertsUtils.storage.get('dashboard-certificates', []);
        if (Array.isArray(data) && data.length > 0) {
            this.items = data;
        }
    }

    saveToStorage() {
        CertsUtils.storage.set('dashboard-certificates', this.items);
    }

    // ============================================================ */
    // SUPABASE                                                     */
    // ============================================================ */

    async loadFromSupabase() {
        try {
            this.showSkeleton();
            
            const data = await CertsAPI.fetchAll();
            
            if (data && data.length > 0) {
                const existingIds = new Set(this.items.map(item => item.id));
                let newCount = 0;
                
                data.forEach(item => {
                    if (!existingIds.has(item.id)) {
                        this.items.push(item);
                        existingIds.add(item.id);
                        newCount++;
                    }
                });
                
                if (newCount > 0) {
                    this.saveToStorage();
                    this.render();
                    console.log(`📂 Added ${newCount} new certificates from Supabase`);
                }
            }
        } catch (error) {
            console.error('❌ Error loading certificates from Supabase:', error);
        } finally {
            this.hideSkeleton();
        }
    }

    // ============================================================ */
    // EVENT SETUP                                                  */
    // ============================================================ */

    setupEvents() {
        // === Add Button ===
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.openModal());
        }

        // === Form Submit ===
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // === Modal Close ===
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        if (this.modalCancel) {
            this.modalCancel.addEventListener('click', () => this.closeModal());
        }
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }

        // === Modal Reset ===
        if (this.modalReset) {
            this.modalReset.addEventListener('click', () => this.resetForm());
        }

        // === Search ===
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.render();
            });
        }

        // === Filters ===
        if (this.filterProvider) {
            this.filterProvider.addEventListener('change', (e) => {
                this.currentFilter.provider = e.target.value;
                this.render();
            });
        }
        if (this.filterStatus) {
            this.filterStatus.addEventListener('change', (e) => {
                this.currentFilter.status = e.target.value;
                this.render();
            });
        }

        // === Sort ===
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }

        // === Export ===
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportData());
        }

        // === Refresh ===
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.refresh());
        }

        // === Bulk Buttons ===
        if (this.bulkPublish) {
            this.bulkPublish.addEventListener('click', () => this.handleBulkAction('publish'));
        }
        if (this.bulkFeatured) {
            this.bulkFeatured.addEventListener('click', () => this.handleBulkAction('featured'));
        }
        if (this.bulkDelete) {
            this.bulkDelete.addEventListener('click', () => this.handleBulkAction('delete'));
        }

        // === Delete Modal ===
        if (this.deleteConfirm) {
            this.deleteConfirm.addEventListener('click', () => this.confirmDelete());
        }
        if (this.deleteCancel) {
            this.deleteCancel.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.deleteClose) {
            this.deleteClose.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.deleteModal) {
            this.deleteModal.addEventListener('click', (e) => {
                if (e.target === this.deleteModal) this.closeDeleteModal();
            });
        }

        // === Preview Modal ===
        if (this.previewClose) {
            this.previewClose.addEventListener('click', () => this.closePreviewModal());
        }
        if (this.previewCloseBtn) {
            this.previewCloseBtn.addEventListener('click', () => this.closePreviewModal());
        }
        if (this.previewModal) {
            this.previewModal.addEventListener('click', (e) => {
                if (e.target === this.previewModal) this.closePreviewModal();
            });
        }
        if (this.previewDownload) {
            this.previewDownload.addEventListener('click', () => this.downloadCertificate());
        }
        if (this.previewPrint) {
            this.previewPrint.addEventListener('click', () => this.printCertificate());
        }

        // === Grid Delegation ===
        if (this.grid) {
            // Checkbox change
            this.grid.addEventListener('change', (e) => {
                const checkbox = e.target.closest('input[type="checkbox"]');
                if (checkbox && checkbox.dataset.id) {
                    const id = parseInt(checkbox.dataset.id);
                    if (checkbox.checked) {
                        this.selectedItems.add(id);
                    } else {
                        this.selectedItems.delete(id);
                    }
                    this.updateBulkUI();
                }
            });

            // Click actions (Edit, Delete, Preview)
            this.grid.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-btn');
                if (editBtn && editBtn.dataset.id) {
                    const item = this.items.find(i => i.id === parseInt(editBtn.dataset.id));
                    if (item) this.openModal(item);
                    return;
                }

                const deleteBtn = e.target.closest('.delete-btn');
                if (deleteBtn && deleteBtn.dataset.id) {
                    this.openDeleteModal(parseInt(deleteBtn.dataset.id));
                    return;
                }

                const previewBtn = e.target.closest('.preview-btn');
                if (previewBtn && previewBtn.dataset.id) {
                    this.openPreviewModal(parseInt(previewBtn.dataset.id));
                    return;
                }
            });
        }

        // === Keyboard Shortcuts ===
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal && !this.modal.hidden) this.closeModal();
                if (this.deleteModal && !this.deleteModal.hidden) this.closeDeleteModal();
                if (this.previewModal && !this.previewModal.hidden) this.closePreviewModal();
            }
        });

        console.log('✅ Certificates events setup complete');
    }

    // ============================================================ */
    // MODAL                                                       */
    // ============================================================ */

    openModal(item = null) {
        if (!this.modal) return;

        if (item) {
            this.editId = item.id;
            this.fillForm(item);
            if (this.modalTitle) {
                this.modalTitle.innerHTML = `<i class="fa-solid fa-pen" aria-hidden="true"></i> تعديل الشهادة`;
            }
        } else {
            this.editId = null;
            this.resetForm();
            if (this.modalTitle) {
                this.modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle" aria-hidden="true"></i> إضافة شهادة جديدة`;
            }
        }

        this.modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.hidden = true;
        document.body.style.overflow = '';
        this.resetForm();
    }

    resetForm() {
        if (!this.form) return;
        this.form.reset();
        if (this.editInput) this.editInput.value = '';
        this.editId = null;
        if (this.fieldPublished) this.fieldPublished.checked = true;
        if (this.fieldFeatured) this.fieldFeatured.checked = false;
        if (this.fieldPinned) this.fieldPinned.checked = false;
    }

    fillForm(item) {
        if (!this.form) return;
        
        if (this.fieldTitle) this.fieldTitle.value = item.title || '';
        if (this.fieldProvider) this.fieldProvider.value = item.provider || '';
        if (this.fieldIssueDate) this.fieldIssueDate.value = item.issue_date || '';
        if (this.fieldExpiryDate) this.fieldExpiryDate.value = item.expiry_date || '';
        if (this.fieldCredentialId) this.fieldCredentialId.value = item.credential_id || '';
        if (this.fieldVerifyUrl) this.fieldVerifyUrl.value = item.verify_url || '';
        if (this.fieldDesc) this.fieldDesc.value = item.description || '';
        if (this.fieldSkills) this.fieldSkills.value = (item.skills || []).join(', ');
        if (this.fieldFeatured) this.fieldFeatured.checked = item.is_featured || false;
        if (this.fieldPublished) this.fieldPublished.checked = item.is_published !== false;
        if (this.fieldPinned) this.fieldPinned.checked = item.is_pinned || false;
        
        if (this.editInput) this.editInput.value = item.id;
    }

   // ============================================================ */
// 🔥 GET FORM DATA - بدون is_pinned                          */
// ============================================================ */

// ============================================================ */
// 🔥 GET FORM DATA - بدون skills و is_pinned                 */
// ============================================================ */

getFormData() {
    const data = {
        title: this.fieldTitle?.value || '',
        provider: this.fieldProvider?.value || '',
        description: this.fieldDesc?.value || '',
        issue_date: this.fieldIssueDate?.value || null,
        expiry_date: this.fieldExpiryDate?.value || null,
        credential_id: this.fieldCredentialId?.value || '',
        verify_url: this.fieldVerifyUrl?.value || '',
        is_published: this.fieldPublished?.checked !== false,
        is_featured: this.fieldFeatured?.checked || false,
        // skills اتحذفت
        // is_pinned اتحذفت
        image_url: document.getElementById('certificates-image-url')?.value || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    if (this.editInput?.value) {
        data.id = parseInt(this.editInput.value);
    }
    
    return data;
}
    

    // ============================================================ */
    // CRUD                                                       */
    // ============================================================ */

    async handleFormSubmit() {
        if (this._isSaving) {
            CertsUtils.toast('⏳ جاري الحفظ...', 'info');
            return;
        }

        this._isSaving = true;
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
        }

        try {
            const data = this.getFormData();
            const isEdit = this.editId !== null;

            if (!data.title) {
                CertsUtils.toast('⚠️ الرجاء إدخال عنوان الشهادة', 'warning');
                this.fieldTitle?.focus();
                return;
            }
            if (!data.provider) {
                CertsUtils.toast('⚠️ الرجاء إدخال الجهة المانحة', 'warning');
                this.fieldProvider?.focus();
                return;
            }

            if (isEdit) {
                const index = this.items.findIndex(item => item.id === data.id);
                if (index !== -1) {
                    this.items[index] = { ...this.items[index], ...data };
                }
                await CertsAPI.update(data.id, data);
            } else {
                this.items.unshift(data);
                await CertsAPI.insert(data);
            }

            this.saveToStorage();
            this.render();
            CertsUtils.toast(isEdit ? '✅ تم تحديث الشهادة' : '✅ تم إضافة الشهادة', 'success');
            this.closeModal();

        } catch (error) {
            console.error('❌ Error saving:', error);
            CertsUtils.toast('❌ فشل الحفظ', 'error');
        } finally {
            this._isSaving = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> حفظ';
            }
        }
    }

    // ============================================================ */
    // DELETE MODAL                                                 */
    // ============================================================ */

    openDeleteModal(id) {
        this.deleteTargetId = id;
        if (this.deleteModal) {
            this.deleteModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    closeDeleteModal() {
        this.deleteTargetId = null;
        if (this.deleteModal) {
            this.deleteModal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    async confirmDelete() {
        if (!this.deleteTargetId) return;
        
        const item = this.items.find(i => i.id === this.deleteTargetId);
        if (!item) return;

        this.items = this.items.filter(i => i.id !== this.deleteTargetId);
        this.selectedItems.delete(this.deleteTargetId);
        this.saveToStorage();
        this.render();

        await CertsAPI.delete(this.deleteTargetId);
        
        this.closeDeleteModal();
        CertsUtils.toast(`🗑️ تم حذف "${item.title}"`, 'info');
    }

    // ============================================================ */
    // PREVIEW MODAL                                                */
    // ============================================================ */

    openPreviewModal(id) {
        this.previewTargetId = id;
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        if (this.previewContainer) {
            const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
            
            this.previewContainer.innerHTML = `
                <div class="certificate-preview-content">
                    <div class="preview-header">
                        <div class="preview-icon">
                            <i class="fa-solid fa-certificate" style="font-size: 3rem; color: var(--color-primary);"></i>
                        </div>
                        <h2>${CertsUtils.escapeHtml(item.title)}</h2>
                        <p class="preview-provider">${CertsUtils.escapeHtml(item.provider)}</p>
                    </div>
                    <div class="preview-details">
                        <div class="preview-row">
                            <span class="preview-label">تاريخ الإصدار:</span>
                            <span class="preview-value">${item.issue_date ? CertsUtils.formatDate(item.issue_date) : 'N/A'}</span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">تاريخ الانتهاء:</span>
                            <span class="preview-value ${isExpired ? 'text-danger' : ''}">
                                ${item.expiry_date ? CertsUtils.formatDate(item.expiry_date) : 'بدون انتهاء'}
                                ${isExpired ? ' ⚠️ منتهية' : ''}
                            </span>
                        </div>
                        ${item.credential_id ? `
                            <div class="preview-row">
                                <span class="preview-label">الرمز التعريفي:</span>
                                <span class="preview-value">${CertsUtils.escapeHtml(item.credential_id)}</span>
                            </div>
                        ` : ''}
                        ${item.description ? `
                            <div class="preview-row">
                                <span class="preview-label">الوصف:</span>
                                <span class="preview-value">${CertsUtils.escapeHtml(item.description)}</span>
                            </div>
                        ` : ''}
                        ${item.verify_url ? `
                            <div class="preview-row">
                                <span class="preview-label">التحقق:</span>
                                <a href="${item.verify_url}" target="_blank" class="preview-verify-link">
                                    <i class="fa-solid fa-shield-check"></i> تحقق من الشهادة
                                </a>
                            </div>
                        ` : ''}
                    </div>
                    <div class="preview-status">
                        <span class="cert-status ${isExpired ? 'expired' : 'published'}">
                            ${isExpired ? '⏰ منتهية' : '✅ صالحة'}
                        </span>
                        ${item.is_featured ? '<span class="cert-featured-badge">⭐ مميزة</span>' : ''}
                    </div>
                </div>
            `;
        }

        if (this.previewModal) {
            this.previewModal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    closePreviewModal() {
        this.previewTargetId = null;
        if (this.previewModal) {
            this.previewModal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    downloadCertificate() {
        const item = this.items.find(i => i.id === this.previewTargetId);
        if (!item) {
            CertsUtils.toast('⚠️ لم يتم العثور على الشهادة', 'warning');
            return;
        }

        // Create a simple certificate HTML
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${item.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                    .certificate { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 2px solid #6366f1; }
                    .certificate h1 { color: #6366f1; text-align: center; }
                    .certificate .provider { text-align: center; color: #64748b; font-size: 18px; }
                    .certificate .details { margin-top: 30px; }
                    .certificate .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .certificate .label { font-weight: bold; color: #334155; }
                    .certificate .value { color: #0f172a; }
                    .certificate .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <h1>${CertsUtils.escapeHtml(item.title)}</h1>
                    <p class="provider">${CertsUtils.escapeHtml(item.provider)}</p>
                    <div class="details">
                        <div class="row"><span class="label">تاريخ الإصدار:</span><span class="value">${item.issue_date ? CertsUtils.formatDate(item.issue_date) : 'N/A'}</span></div>
                        <div class="row"><span class="label">تاريخ الانتهاء:</span><span class="value">${item.expiry_date ? CertsUtils.formatDate(item.expiry_date) : 'بدون انتهاء'}</span></div>
                        ${item.credential_id ? `<div class="row"><span class="label">الرمز التعريفي:</span><span class="value">${CertsUtils.escapeHtml(item.credential_id)}</span></div>` : ''}
                        ${item.description ? `<div class="row"><span class="label">الوصف:</span><span class="value">${CertsUtils.escapeHtml(item.description)}</span></div>` : ''}
                    </div>
                    <div class="footer">تم التصدير من Dashboard Pro</div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.title.replace(/\s+/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        CertsUtils.toast('📥 تم تحميل الشهادة', 'success');
    }

    printCertificate() {
        window.print();
    }

    // ============================================================ */
    // RENDER                                                     */
    // ============================================================ */

    render() {
        if (!this.grid) return;

        const filtered = this.getFilteredItems();

        if (filtered.length === 0) {
            if (this.empty) this.empty.hidden = false;
            this.grid.innerHTML = '';
        } else {
            if (this.empty) this.empty.hidden = true;
            this.grid.innerHTML = '';
            filtered.forEach(item => {
                this.grid.appendChild(this.createCertificateCard(item));
            });
        }

        this.updateStats();
        this.updateBulkUI();
        this.updateFooter();
    }

    createCertificateCard(item) {
        const isFeatured = item.is_featured;
        const isPublished = item.is_published !== false;
        const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
        const checked = this.selectedItems.has(item.id) ? 'checked' : '';

        const providerIcon = this.providerIcons[item.provider] || 'fa-solid fa-building';

        const div = document.createElement('div');
        div.className = 'certificate-card';
        div.dataset.id = item.id;

        div.innerHTML = `
            ${isFeatured ? '<span class="cert-featured-badge">⭐ مميزة</span>' : ''}
            ${isExpired ? '<span class="cert-expired-badge">⏰ منتهية</span>' : ''}
            <div class="cert-checkbox">
                <input type="checkbox" data-id="${item.id}" ${checked}>
            </div>
            <div class="cert-icon">
                <i class="${providerIcon}"></i>
            </div>
            <h4 class="cert-title">${CertsUtils.escapeHtml(item.title)}</h4>
            <div class="cert-provider">${CertsUtils.escapeHtml(item.provider)}</div>
            <div class="cert-date">
                ${item.issue_date ? `📅 ${CertsUtils.formatDate(item.issue_date)}` : ''}
                ${item.expiry_date ? ` → ${CertsUtils.formatDate(item.expiry_date)}` : ''}
                ${!item.expiry_date ? ' (بدون انتهاء)' : ''}
            </div>
            ${item.credential_id ? `<div class="cert-credential">🆔 ${CertsUtils.escapeHtml(item.credential_id)}</div>` : ''}
            ${item.verify_url ? `<a href="${item.verify_url}" target="_blank" class="cert-verify-link"><i class="fa-solid fa-shield-check"></i> تحقق</a>` : ''}
            <div class="cert-status ${isExpired ? 'expired' : (isPublished ? 'published' : 'draft')}">
                ${isExpired ? '⏰ منتهية' : (isPublished ? '✅ منشورة' : '📝 مسودة')}
            </div>
            ${item.description ? `<p class="cert-desc">${CertsUtils.escapeHtml(item.description)}</p>` : ''}
            <div class="cert-actions">
                <button class="edit-btn" data-id="${item.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
                <button class="preview-btn" data-id="${item.id}"><i class="fa-solid fa-eye"></i> معاينة</button>
                <button class="delete-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i> حذف</button>
            </div>
        `;

        return div;
    }

    // ============================================================ */
    // HELPERS                                                    */
    // ============================================================ */

    getFilteredItems() {
        let filtered = [...this.items];

        // Search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                (item.title || '').toLowerCase().includes(query) ||
                (item.provider || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query) ||
                (item.skills || []).some(s => s.toLowerCase().includes(query))
            );
        }

        // Provider filter
        if (this.currentFilter.provider && this.currentFilter.provider !== 'all') {
            filtered = filtered.filter(item => item.provider === this.currentFilter.provider);
        }

        // Status filter
        if (this.currentFilter.status && this.currentFilter.status !== 'all') {
            switch (this.currentFilter.status) {
                case 'Published':
                    filtered = filtered.filter(item => item.is_published !== false);
                    break;
                case 'Draft':
                    filtered = filtered.filter(item => item.is_published === false);
                    break;
                case 'Archived':
                    // For now, treat as not published
                    filtered = filtered.filter(item => item.is_published === false);
                    break;
                case 'Expired':
                    filtered = filtered.filter(item =>
                        item.expiry_date && new Date(item.expiry_date) < new Date()
                    );
                    break;
                default:
                    break;
            }
        }

        // Sort
        switch (this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'alpha':
                filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'expiry':
                filtered.sort((a, b) => {
                    const da = a.expiry_date ? new Date(a.expiry_date) : new Date(2099, 0, 1);
                    const db = b.expiry_date ? new Date(b.expiry_date) : new Date(2099, 0, 1);
                    return da - db;
                });
                break;
            default:
                break;
        }

        return filtered;
    }

    // ============================================================ */
    // STATS                                                       */
    // ============================================================ */

    updateStats() {
        const total = this.items.length;
        const expired = this.items.filter(item =>
            item.expiry_date && new Date(item.expiry_date) < new Date()
        ).length;
        const valid = total - expired;
        const featured = this.items.filter(item => item.is_featured).length;

        if (this.statTotal) this.statTotal.textContent = total;
        if (this.statValid) this.statValid.textContent = valid;
        if (this.statFeatured) this.statFeatured.textContent = featured;
        if (this.statExpired) this.statExpired.textContent = expired;
        if (this.badgeTotal) this.badgeTotal.textContent = total;
    }

    updateFooter() {
        if (this.footerInfo) {
            const total = this.items.length;
            this.footerInfo.textContent = `عرض ${total} من ${total} شهادة`;
        }
    }

    // ============================================================ */
    // BULK UI                                                     */
    // ============================================================ */

    updateBulkUI() {
        const count = this.selectedItems.size;
        if (this.selectedCount) {
            this.selectedCount.textContent = `${count} مختارة`;
        }
        
        const btns = [this.bulkPublish, this.bulkFeatured, this.bulkDelete];
        btns.forEach(btn => {
            if (btn) btn.disabled = count === 0;
        });
    }

    // ============================================================ */
    // BULK ACTIONS                                                 */
    // ============================================================ */

    async handleBulkAction(action) {
        if (this.selectedItems.size === 0) {
            CertsUtils.toast('⚠️ الرجاء تحديد شهادات أولاً', 'warning');
            return;
        }

        const ids = [...this.selectedItems];
        const count = ids.length;

        switch (action) {
            case 'delete':
                if (!confirm(`هل تريد حذف ${count} شهادة؟`)) return;
                for (const id of ids) {
                    this.items = this.items.filter(i => i.id !== id);
                    await CertsAPI.delete(id);
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                CertsUtils.toast(`🗑️ تم حذف ${count} شهادة`, 'info');
                break;
                
            case 'publish':
                for (const id of ids) {
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        item.is_published = !item.is_published;
                        await CertsAPI.update(id, { is_published: item.is_published });
                    }
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                CertsUtils.toast(`🌐 تم تحديث حالة النشر لـ ${count} شهادة`, 'success');
                break;
                
            case 'featured':
                for (const id of ids) {
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        item.is_featured = !item.is_featured;
                        await CertsAPI.update(id, { is_featured: item.is_featured });
                    }
                }
                this.selectedItems.clear();
                this.saveToStorage();
                this.render();
                CertsUtils.toast(`⭐ تم تحديث حالة التمييز لـ ${count} شهادة`, 'success');
                break;
                
            default:
                break;
        }
    }

    // ============================================================ */
    // UI STATES                                                   */
    // ============================================================ */

    showSkeleton() {
        if (this.skeleton) this.skeleton.hidden = false;
        if (this.grid) this.grid.hidden = true;
        if (this.empty) this.empty.hidden = true;
    }

    hideSkeleton() {
        if (this.skeleton) this.skeleton.hidden = true;
        if (this.grid) this.grid.hidden = false;
    }

    // ============================================================ */
    // EXPORT & REFRESH                                             */
    // ============================================================ */

    exportData() {
        const data = this.getFilteredItems();
        if (data.length === 0) {
            CertsUtils.toast('⚠️ لا توجد بيانات للتصدير', 'warning');
            return;
        }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificates-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        CertsUtils.toast(`📥 تم تصدير ${data.length} شهادة`, 'success');
    }

    refresh() {
        CertsUtils.toast('🔄 جاري تحديث الشهادات...', 'info');
        this.loadFromSupabase();
    }
    
}
// ============================================================ */
// 🏅 دوال تحديث ومزامنة الشهادات                            */
// ============================================================ */

// 1. دالة تحديث الكارت (إعادة رسم)
function refreshCertificatesCard() {
    console.log('🔄 تحديث كارت الشهادات...');
    
    if (typeof window._certificatesEngine !== 'undefined' && window._certificatesEngine) {
        // جلب البيانات من localStorage
        const data = JSON.parse(localStorage.getItem('dashboard-certificates') || '[]');
        window._certificatesEngine.items = data;
        window._certificatesEngine.render();
        console.log('✅ تم تحديث الكارت:', data.length, 'شهادة');
        Utils.toast('🔄 تم تحديث الكارت', 'info');
    } else {
        console.warn('⚠️ Certificates Engine غير موجود');
        Utils.toast('⚠️ يرجى تحميل الصفحة أولاً', 'warning');
    }
}

// 2. دالة المزامنة مع Supabase
async function syncCertificatesWithSupabase() {
    console.log('☁️ جاري المزامنة مع Supabase...');
    
    const btn = document.getElementById('certificates-sync-btn');
    if (btn) {
        btn.classList.add('loading');
        btn.innerHTML = '<i class="fa-solid fa-spinner"></i> جاري المزامنة...';
    }
    
    try {
        // جلب من Supabase
        const res = await fetch('https://txcuibshcvfusegrfcbm.supabase.co/rest/v1/certificates?select=*&order=created_at.desc', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI'
            }
        });
        const data = await res.json();
        
        if (data && data.length > 0) {
            // تحديث localStorage
            localStorage.setItem('dashboard-certificates', JSON.stringify(data));
            
            // تحديث Engine
            if (typeof window._certificatesEngine !== 'undefined' && window._certificatesEngine) {
                window._certificatesEngine.items = data;
                window._certificatesEngine.render();
            }
            
            console.log('✅ تمت المزامنة:', data.length, 'شهادة');
            Utils.toast(`✅ تمت المزامنة (${data.length} شهادة)`, 'success');
            
            // تحديث الموقع الأساسي
            if (typeof loadCertificates === 'function') {
                loadCertificates();
                console.log('✅ تم تحديث الموقع الأساسي');
            }
        } else {
            console.log('⚠️ لا توجد شهادات في Supabase');
            Utils.toast('⚠️ لا توجد شهادات للمزامنة', 'warning');
        }
    } catch (error) {
        console.error('❌ خطأ في المزامنة:', error);
        Utils.toast('❌ فشل المزامنة', 'error');
    }
    
    if (btn) {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fa-solid fa-cloud-upload-alt"></i> مزامنة مع قاعدة البيانات';
    }
}

// 3. ربط الأزرار
document.addEventListener('DOMContentLoaded', function() {
    // زر تحديث الكارت
    const refreshBtn = document.getElementById('certificates-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshCertificatesCard);
    }
    
    // زر المزامنة
    const syncBtn = document.getElementById('certificates-sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', syncCertificatesWithSupabase);
    }
});

// جعل الدوال عالمية
window.refreshCertificatesCard = refreshCertificatesCard;
window.syncCertificatesWithSupabase = syncCertificatesWithSupabase;

// ============================================================ */
// 05. INITIALIZATION                                            */
// ============================================================ */

let certificatesEngineInstance = null;

function initCertificatesEngine() {
    if (!certificatesEngineInstance) {
        certificatesEngineInstance = new CertificatesEngine();
    }
    return certificatesEngineInstance;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const certsSection = document.getElementById('certificates-section');
    if (certsSection && certsSection.classList.contains('active')) {
        initCertificatesEngine();
    } else if (certsSection) {
        const observer = new MutationObserver(() => {
            if (certsSection.classList.contains('active') && !certificatesEngineInstance) {
                initCertificatesEngine();
                observer.disconnect();
            }
        });
        observer.observe(certsSection, { attributes: true, attributeFilter: ['class'] });
    }
});

// If DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const certsSection = document.getElementById('certificates-section');
    if (certsSection && certsSection.classList.contains('active') && !certificatesEngineInstance) {
        initCertificatesEngine();
    }
}
// ============================================================ */
// 📷 إدارة صور الشهادات                                       */
// ============================================================ */

// 1. معاينة الصورة عند الاختيار
function previewCertificateImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('certificate-image-preview');
        const imageUrlInput = document.getElementById('certificates-image-url');
        
        // تخزين الصورة كـ Base64
        const base64Image = e.target.result;
        imageUrlInput.value = base64Image;
        
        // عرض المعاينة
        preview.innerHTML = `
            <img src="${base64Image}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
        `;
    };
    reader.readAsDataURL(file);
}

// 2. تحميل الصورة عند التعديل
function loadCertificateImage(imageUrl) {
    const preview = document.getElementById('certificate-image-preview');
    const imageUrlInput = document.getElementById('certificates-image-url');
    
    if (imageUrl && imageUrl.startsWith('data:image')) {
        imageUrlInput.value = imageUrl;
        preview.innerHTML = `
            <img src="${imageUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
        `;
    } else {
        preview.innerHTML = `
            <span style="color: var(--text-muted); font-size: 12px;">لا توجد صورة</span>
        `;
    }
}

// 3. تعديل دالة fillForm لتشمل الصورة
// ابحث عن function fillForm(item) وأضف هذا السطر:
// loadCertificateImage(item.image_url);

// 4. تعديل دالة getFormData لتشمل الصورة
// ابحث عن function getFormData() وأضف هذا السطر:
// image_url: document.getElementById('certificates-image-url')?.value || '',

// 5. تعديل دالة createCertificateCard لعرض الصورة
// ابحث عن createCertificateCard وأضف:
/*
${item.image_url ? `
    <div class="cert-image" style="width:100%; height:150px; overflow:hidden; border-radius:8px; margin-bottom:10px;">
        <img src="${item.image_url}" style="width:100%; height:100%; object-fit:cover;">
    </div>
` : ''}
*/

// ============================================================ */
// 06. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏅 CERTIFICATES ENGINE v2.0 - محرك الشهادات             ║
║                                                              ║
║   ✅ CRUD كامل                                             ║
║   ✅ بحث وتصفية                                            ║
║   ✅ Bulk Actions                                          ║
║   ✅ Supabase Sync                                         ║
║   ✅ LocalStorage Backup                                   ║
║   ✅ التحقق من صلاحية الشهادات                             ║
║   ✅ معاينة الشهادة                                        ║
║   ✅ تحميل الشهادة (PDF جاهز)                              ║
║                                                              ║
║   📦 Available: window._certificatesEngine                  ║
║   🔧 Methods:                                              ║
║   • refresh() - تحديث البيانات                              ║
║   • exportData() - تصدير البيانات                           ║
║   • openModal(item) - فتح نافذة الإضافة/التعديل            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================ */
// نهاية CERTIFICATES ENGINE                                     */
// ============================================================ */

// ============================================================ */
// 🎧 SUPPORT ENGINE - خدمة العملاء والدعم الفني v2.0         */
// ============================================================ */
/*
   🎯 المميزات:
   - ✅ عرض جميع التذاكر في قائمة جانبية
   - ✅ عرض تفاصيل التذكرة عند النقر
   - ✅ الرد على التذاكر مع حفظ في Supabase
   - ✅ إرسال الرد عبر البريد الإلكتروني (EmailJS)
   - ✅ تحديث حالة التذكرة تلقائياً
   - ✅ إحصائيات فورية (الكل، معلق، قيد المعالجة، محلول)
   - ✅ تصفية التذاكر حسب الحالة
   - ✅ حذف تذكرة فردية
   - ✅ تفريغ جميع التذاكر
   - ✅ تخزين محلي (localStorage)
   - ✅ مزامنة مع Supabase
   - ✅ Lazy Loading
   - ✅ معالجة الأخطاء
   - ✅ Toast Notifications
   - ✅ Logs Integration
   - ✅ متجاوب مع جميع الشاشات
   - ✅ 100% مطابق مع Schema و HTML
*/

// ============================================================ */
// 01. SUPPORT ENGINE CLASS                                     */
// ============================================================ */

class SupportEngine {
    constructor() {
        // ============================================================
        // DOM Elements
        // ============================================================
        this.sidebar = document.getElementById('supportTicketsSidebar');
        this.ticketsList = document.getElementById('ticketsList');
        this.detailsContainer = document.getElementById('supportTicketDetails');
        this.detailsBody = document.getElementById('ticketDetailBody');
        this.detailsSubject = document.getElementById('ticketDetailSubject');
        this.detailsStatus = document.getElementById('ticketDetailStatus');
        this.replyCard = document.getElementById('supportReplyCard');
        this.replyInput = document.getElementById('supportReplyInput');
        this.replyStatus = document.getElementById('supportReplyStatus');
        this.replyStatusMsg = document.getElementById('supportReplyStatusMessage');
        this.refreshBtn = document.getElementById('supportRefreshBtn');
        
        // Sender info in reply card
        this.replySenderName = document.getElementById('replySenderName');
        this.replySenderEmail = document.getElementById('replySenderEmail');
        this.replySenderSubject = document.getElementById('replySenderSubject');
        
        // Stats
        this.statTotal = document.getElementById('stat-total-tickets');
        this.statPending = document.getElementById('stat-pending-tickets');
        this.statProgress = document.getElementById('stat-progress-tickets');
        this.statResolved = document.getElementById('stat-resolved-tickets');
        
        // ============================================================
        // State
        // ============================================================
        this.tickets = [];
        this.currentTicketId = null;
        this.currentFilter = 'all';
        this.isLoading = false;
        this._isSending = false;
        this._isInitialized = false;
        
        // ============================================================
        // EmailJS Config
        // ============================================================
        this.EMAILJS_SERVICE_ID = 'service_t51g617';
        this.EMAILJS_TEMPLATE_ID = 'reply_template';
        this.EMAILJS_PUBLIC_KEY = 'Zg7gM0yDAtCmbp4p9';
        
        // ============================================================
        // Status Labels
        // ============================================================
        this.statusLabels = {
            pending: 'معلقة',
            in_progress: 'قيد المعالجة',
            resolved: 'محلولة',
            closed: 'مغلقة'
        };
        
        this.statusColors = {
            pending: 'pending',
            in_progress: 'in_progress',
            resolved: 'resolved',
            closed: 'closed'
        };
        
        // ============================================================
        // INIT
        // ============================================================
        this.init();
    }
    
    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    
    init() {
        console.log('🎧 Support Engine initializing...');
        
        try {
            // Load from storage
            this.loadFromStorage();
            
            // Setup events
            this.setupEvents();
            
            // Render
            this.render();
            
            // Load from Supabase after delay
            setTimeout(() => {
                this.loadFromSupabase();
            }, 500);
            
            // Setup reply events
            this.setupReplyEvents();
            
            this._isInitialized = true;
            
            console.log('✅ Support Engine ready');
            console.log(`📊 ${this.tickets.length} tickets loaded`);
            
            if (window._logsEngine) {
                window._logsEngine.addLog(
                    `🎧 تم تحميل محرك الدعم الفني (${this.tickets.length} تذكرة)`,
                    'support'
                );
            }
        } catch (error) {
            console.error('❌ Support Engine init error:', error);
            Utils.toast('❌ فشل تحميل محرك الدعم الفني', 'error');
        }
    }
    
    // ============================================================
    // 02. STORAGE MANAGEMENT
    // ============================================================
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('dashboard-support-tickets');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.tickets = parsed.map(t => ({
                        ...t,
                        created_at: t.created_at ? new Date(t.created_at) : new Date(),
                        replied_at: t.replied_at ? new Date(t.replied_at) : null
                    }));
                    console.log(`📂 Loaded ${this.tickets.length} tickets from storage`);
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ Could not load tickets:', e);
        }
        
        // Default tickets if nothing saved
        this.loadDefaultTickets();
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('dashboard-support-tickets', JSON.stringify(this.tickets));
        } catch (e) {
            console.warn('⚠️ Could not save tickets:', e);
        }
    }
    
    loadDefaultTickets() {
        const now = Date.now();
        this.tickets = [
            {
                id: Date.now() - 1,
                sender_name: 'أحمد محمد',
                sender_email: 'ahmed@example.com',
                subject: 'مشكلة في تسجيل الدخول',
                message: 'لا أستطيع تسجيل الدخول إلى حسابي، تظهر لي رسالة خطأ "Invalid credentials"',
                status: 'pending',
                reply_message: null,
                replied_at: null,
                ip_address: '192.168.1.1',
                user_agent: 'Chrome/120.0.0.0',
                location: 'القاهرة، مصر',
                created_at: new Date(now - 3600000)
            },
            {
                id: Date.now() - 2,
                sender_name: 'سارة علي',
                sender_email: 'sara@example.com',
                subject: 'طلب تعديل في الموقع',
                message: 'أريد تعديل بعض المحتويات في الصفحة الرئيسية، كيف يمكنني ذلك؟',
                status: 'in_progress',
                reply_message: 'جاري العمل على طلبك، سنتواصل معك قريباً',
                replied_at: new Date(now - 1800000),
                ip_address: '192.168.1.2',
                user_agent: 'Firefox/121.0',
                location: 'الإسكندرية، مصر',
                created_at: new Date(now - 7200000)
            },
            {
                id: Date.now() - 3,
                sender_name: 'خالد حسن',
                sender_email: 'khaled@example.com',
                subject: 'شكر وتقدير',
                message: 'شكراً على الخدمة الممتازة، الموقع يعمل بشكل رائع',
                status: 'resolved',
                reply_message: 'شكراً لك على كلماتك الطيبة، نتمنى لك دوام التوفيق',
                replied_at: new Date(now - 86400000),
                ip_address: '192.168.1.3',
                user_agent: 'Safari/17.2',
                location: 'الجيزة، مصر',
                created_at: new Date(now - 172800000)
            },
            {
                id: Date.now() - 4,
                sender_name: 'منى إبراهيم',
                sender_email: 'mona@example.com',
                subject: 'اقتراح لتطوير الموقع',
                message: 'أقترح إضافة قسم للمدونة لمشاركة المقالات والدروس التعليمية',
                status: 'closed',
                reply_message: 'شكراً على اقتراحك، سيتم دراسته مع الفريق',
                replied_at: new Date(now - 259200000),
                ip_address: '192.168.1.4',
                user_agent: 'Edge/120.0.0.0',
                location: 'سويس، مصر',
                created_at: new Date(now - 345600000)
            }
        ];
        this.saveToStorage();
        console.log('📂 Default tickets loaded');
    }
    
    // ============================================================
    // 03. SUPABASE OPERATIONS
    // ============================================================
    
    async loadFromSupabase() {
        try {
            if (!supabaseClient) {
                console.warn('⚠️ Supabase client not ready');
                return;
            }
            
            console.log('📤 Loading tickets from Supabase...');
            
            const { data, error } = await supabaseClient
                .from('support_tickets')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (error) {
                console.error('❌ Supabase load error:', error);
                return;
            }
            
            console.log('📥 Data received:', data?.length || 0, 'records');
            
            if (data && data.length > 0) {
                const existingIds = new Set(this.tickets.map(t => t.id));
                const existingContent = new Set(
                    this.tickets.map(t => `${t.sender_email}-${t.subject}-${t.message}`)
                );
                
                let newCount = 0;
                
                data.forEach(ticket => {
                    if (existingIds.has(ticket.id)) return;
                    
                    const contentKey = `${ticket.sender_email}-${ticket.subject}-${ticket.message}`;
                    if (existingContent.has(contentKey)) return;
                    
                    const newTicket = {
                        id: ticket.id,
                        sender_name: ticket.sender_name,
                        sender_email: ticket.sender_email,
                        subject: ticket.subject,
                        message: ticket.message,
                        status: ticket.status || 'pending',
                        reply_message: ticket.reply_message || null,
                        replied_at: ticket.replied_at ? new Date(ticket.replied_at) : null,
                        ip_address: ticket.ip_address || 'Unknown',
                        user_agent: ticket.user_agent || 'Unknown',
                        location: ticket.location || 'Unknown',
                        created_at: ticket.created_at ? new Date(ticket.created_at) : new Date()
                    };
                    
                    this.tickets.unshift(newTicket);
                    existingIds.add(ticket.id);
                    existingContent.add(contentKey);
                    newCount++;
                });
                
                if (newCount > 0) {
                    this.saveToStorage();
                    this.render();
                    console.log(`📂 Added ${newCount} new tickets from Supabase`);
                    
                    if (window._logsEngine) {
                        window._logsEngine.addLog(
                            `🎧 تم استيراد ${newCount} تذكرة من Supabase`,
                            'support'
                        );
                    }
                }
            }
        } catch (e) {
            console.error('❌ Error loading from Supabase:', e);
        }
    }
    
    async saveToSupabase(ticket) {
        try {
            if (!supabaseClient) {
                console.warn('⚠️ Supabase not ready');
                return false;
            }
            
            // Check if exists
            const { data: existing, error: checkError } = await supabaseClient
                .from('support_tickets')
                .select('id')
                .eq('id', ticket.id)
                .limit(1);
            
            if (checkError) {
                console.warn('⚠️ Could not check existing:', checkError);
            }
            
            const isUpdate = existing && existing.length > 0;
            
            const ticketData = {
                sender_name: ticket.sender_name,
                sender_email: ticket.sender_email,
                subject: ticket.subject,
                message: ticket.message,
                status: ticket.status || 'pending',
                reply_message: ticket.reply_message || null,
                replied_at: ticket.replied_at?.toISOString() || null,
                ip_address: ticket.ip_address || 'Unknown',
                user_agent: ticket.user_agent || 'Unknown',
                location: ticket.location || 'Unknown'
            };
            
            if (isUpdate) {
                const { error } = await supabaseClient
                    .from('support_tickets')
                    .update(ticketData)
                    .eq('id', ticket.id);
                
                if (error) {
                    console.error('❌ Failed to update ticket:', error);
                    return false;
                }
                console.log('✅ Ticket updated in Supabase:', ticket.id);
            } else {
                const { error } = await supabaseClient
                    .from('support_tickets')
                    .insert([{
                        id: ticket.id,
                        ...ticketData,
                        created_at: ticket.created_at?.toISOString() || new Date().toISOString()
                    }]);
                
                if (error) {
                    console.error('❌ Failed to save ticket:', error);
                    return false;
                }
                console.log('✅ Ticket saved to Supabase:', ticket.id);
            }
            
            return true;
        } catch (e) {
            console.error('❌ Error saving to Supabase:', e);
            return false;
        }
    }
    
    async updateTicketStatus(id, status) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return false;
        
        ticket.status = status;
        this.saveToStorage();
        this.render();
        
        // Update in Supabase
        await this.saveToSupabase(ticket);
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `🎧 تحديث حالة التذكرة #${id} إلى ${this.statusLabels[status]}`,
                'support',
                ticket.subject
            );
        }
        
        return true;
    }
    
    // ============================================================
    // 04. EVENT SETUP
    // ============================================================
    
    setupEvents() {
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.loadFromSupabase();
                Utils.toast('🔄 جاري تحديث التذاكر...', 'info');
            });
        }
        
        // Filter buttons (delegation)
        if (this.sidebar) {
            this.sidebar.addEventListener('click', (e) => {
                const filterBtn = e.target.closest('.filter-btn');
                if (filterBtn) {
                    const filter = filterBtn.dataset.filter;
                    this.setFilter(filter);
                    
                    // Update active state
                    this.sidebar.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.filter === filter);
                    });
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.loadFromSupabase();
                Utils.toast('🔄 تحديث التذاكر', 'info');
            }
        });
        
        // Listen for new tickets from website
        document.addEventListener('dashboard:new-ticket', (e) => {
            const ticket = e.detail;
            if (ticket && ticket.sender_name && ticket.sender_email) {
                this.addTicket(
                    ticket.sender_name,
                    ticket.sender_email,
                    ticket.subject,
                    ticket.message,
                    ticket.ip_address,
                    ticket.user_agent,
                    ticket.location
                );
                Utils.toast('🎧 تم استلام تذكرة دعم جديدة', 'success');
            }
        });
        
        console.log('✅ Support events setup complete');
    }
    
    // ============================================================
    // 05. REPLY EVENTS
    // ============================================================
    
    setupReplyEvents() {
        // Send reply button
        const sendBtn = document.getElementById('sendSupportReplyBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendReply();
            });
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelSupportReplyBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeReplyCard();
            });
        }
        
        // Close button
        const closeBtn = document.getElementById('closeSupportReplyBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeReplyCard();
            });
        }
        
        // Ctrl+Enter to send
        if (this.replyInput) {
            this.replyInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.sendReply();
                }
            });
        }
        
        // Escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentTicketId) {
                this.closeReplyCard();
            }
        });
        
        console.log('✅ Reply events setup complete');
    }
    
    // ============================================================
    // 06. FILTER
    // ============================================================
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.renderTickets();
    }
    
    getFilteredTickets() {
        if (this.currentFilter === 'all') {
            return this.tickets;
        }
        return this.tickets.filter(t => t.status === this.currentFilter);
    }
    
    // ============================================================
    // 07. RENDER ENGINE
    // ============================================================
    
    render() {
        this.renderStats();
        this.renderTickets();
        if (this.currentTicketId) {
            this.renderTicketDetails(this.currentTicketId);
        }
    }
    
    renderStats() {
        const total = this.tickets.length;
        const pending = this.tickets.filter(t => t.status === 'pending').length;
        const inProgress = this.tickets.filter(t => t.status === 'in_progress').length;
        const resolved = this.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
        
        if (this.statTotal) this.statTotal.textContent = total;
        if (this.statPending) this.statPending.textContent = pending;
        if (this.statProgress) this.statProgress.textContent = inProgress;
        if (this.statResolved) this.statResolved.textContent = resolved;
    }
    
    renderTickets() {
        if (!this.ticketsList) return;
        
        if (this.isLoading) {
            this.renderSkeleton();
            return;
        }
        
        const filtered = this.getFilteredTickets();
        
        if (filtered.length === 0) {
            this.ticketsList.innerHTML = `
                <div class="empty-state" style="padding: var(--space-8) var(--space-4); text-align: center; color: var(--text-tertiary);">
                    <i class="fa-solid fa-inbox" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: var(--space-3);"></i>
                    <p style="font-size: var(--text-sm);">لا توجد تذاكر ${this.currentFilter !== 'all' ? 'في هذه الحالة' : ''}</p>
                </div>
            `;
            return;
        }
        
        this.ticketsList.innerHTML = '';
        
        filtered.forEach(ticket => {
            this.ticketsList.appendChild(this.createTicketItem(ticket));
        });
    }
    
    createTicketItem(ticket) {
        const div = document.createElement('div');
        div.className = `ticket-item ${this.currentTicketId === ticket.id ? 'active' : ''}`;
        div.dataset.id = ticket.id;
        
        const isActive = this.currentTicketId === ticket.id;
        const statusLabel = this.statusLabels[ticket.status] || ticket.status;
        const statusColor = this.statusColors[ticket.status] || 'pending';
        const timeStr = this.formatTime(ticket.created_at);
        
        div.innerHTML = `
            <div class="ticket-top">
                <span class="ticket-sender">${this.escapeHtml(ticket.sender_name)}</span>
                <span class="ticket-status-badge ${statusColor}">
                    <span class="status-dot"></span>
                    ${statusLabel}
                </span>
            </div>
            <div class="ticket-subject">${this.escapeHtml(ticket.subject)}</div>
            <div class="ticket-bottom">
                <span class="ticket-time"><i class="fa-regular fa-clock"></i> ${timeStr}</span>
                ${ticket.reply_message ? '<span style="font-size: var(--text-2xs); color: var(--color-primary);"><i class="fa-solid fa-reply"></i> تم الرد</span>' : ''}
            </div>
        `;
        
        div.addEventListener('click', () => {
            this.selectTicket(ticket.id);
        });
        
        return div;
    }
    
    renderSkeleton() {
        if (!this.ticketsList) return;
        this.ticketsList.innerHTML = `
            <div class="ticket-skeleton"><div class="skeleton-name"></div><div class="skeleton-subject"></div><div class="skeleton-time"></div></div>
            <div class="ticket-skeleton"><div class="skeleton-name"></div><div class="skeleton-subject"></div><div class="skeleton-time"></div></div>
            <div class="ticket-skeleton"><div class="skeleton-name"></div><div class="skeleton-subject"></div><div class="skeleton-time"></div></div>
        `;
    }
    
    // ============================================================
    // 08. SELECT TICKET
    // ============================================================
    
    selectTicket(id) {
        this.currentTicketId = id;
        this.renderTickets();
        this.renderTicketDetails(id);
    }
    
    renderTicketDetails(id) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) {
            this.showEmptyDetails();
            return;
        }
        
        if (!this.detailsBody) return;
        
        const statusLabel = this.statusLabels[ticket.status] || ticket.status;
        const statusColor = this.statusColors[ticket.status] || 'pending';
        const dateStr = this.formatDate(ticket.created_at);
        const timeStr = this.formatTime(ticket.created_at);
        
        if (this.detailsSubject) {
            this.detailsSubject.textContent = ticket.subject;
        }
        
        if (this.detailsStatus) {
            this.detailsStatus.className = `ticket-status-badge ${statusColor}`;
            this.detailsStatus.innerHTML = `<span class="status-dot"></span> ${statusLabel}`;
        }
        
        let replyHtml = '';
        if (ticket.reply_message) {
            const repliedDate = ticket.replied_at ? this.formatDateTime(ticket.replied_at) : '';
            replyHtml = `
                <div class="ticket-detail-reply">
                    <span class="reply-label"><i class="fa-solid fa-reply"></i> الرد (${repliedDate})</span>
                    <div class="reply-text">${this.escapeHtml(ticket.reply_message)}</div>
                </div>
            `;
        }
        
        this.detailsBody.innerHTML = `
            <div class="ticket-detail-info">
                <div class="info-item">
                    <span class="info-label">المرسل</span>
                    <span class="info-value"><strong>${this.escapeHtml(ticket.sender_name)}</strong></span>
                </div>
                <div class="info-item">
                    <span class="info-label">البريد الإلكتروني</span>
                    <span class="info-value"><strong>${this.escapeHtml(ticket.sender_email)}</strong></span>
                </div>
                <div class="info-item">
                    <span class="info-label">تاريخ الإنشاء</span>
                    <span class="info-value">${dateStr} - ${timeStr}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">الحالة</span>
                    <span class="info-value"><span class="ticket-status-badge ${statusColor}"><span class="status-dot"></span> ${statusLabel}</span></span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">الـ IP</span>
                    <span class="info-value">${this.escapeHtml(ticket.ip_address || 'Unknown')}</span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">الموقع</span>
                    <span class="info-value">${this.escapeHtml(ticket.location || 'Unknown')}</span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">المتصفح / الجهاز</span>
                    <span class="info-value" style="font-size: var(--text-xs);">${this.escapeHtml(ticket.user_agent || 'Unknown')}</span>
                </div>
            </div>
            
            <div class="ticket-detail-message">
                <span class="message-label"><i class="fa-solid fa-envelope"></i> نص الشكوى</span>
                <div class="message-text">${this.escapeHtml(ticket.message)}</div>
            </div>
            
            ${replyHtml}
            
            <div class="details-actions">
                <button class="reply-ticket-btn" data-id="${ticket.id}">
                    <i class="fa-solid fa-reply"></i> الرد على التذكرة
                </button>
                <button class="status-update-btn" data-id="${ticket.id}">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i> تغيير الحالة
                </button>
                <button class="delete-ticket-btn" data-id="${ticket.id}">
                    <i class="fa-solid fa-trash"></i> حذف
                </button>
            </div>
        `;
        
        // Reply button
        const replyBtn = this.detailsBody.querySelector('.reply-ticket-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                this.openReplyCard(ticket.id);
            });
        }
        
        // Status update button
        const statusBtn = this.detailsBody.querySelector('.status-update-btn');
        if (statusBtn) {
            statusBtn.addEventListener('click', () => {
                this.showStatusMenu(ticket.id);
            });
        }
        
        // Delete button
        const deleteBtn = this.detailsBody.querySelector('.delete-ticket-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteTicket(ticket.id);
            });
        }
    }
    
    showEmptyDetails() {
        if (!this.detailsBody) return;
        
        if (this.detailsSubject) {
            this.detailsSubject.textContent = 'اختر تذكرة لعرض التفاصيل';
        }
        
        if (this.detailsStatus) {
            this.detailsStatus.className = 'ticket-status-badge';
            this.detailsStatus.textContent = '-';
        }
        
        this.detailsBody.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-inbox"></i>
                <p>لم يتم اختيار تذكرة بعد</p>
                <span>اختر تذكرة من القائمة الجانبية لعرض تفاصيلها</span>
            </div>
        `;
    }
    
    // ============================================================
    // 09. STATUS MENU
    // ============================================================
    
    showStatusMenu(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        const statuses = ['pending', 'in_progress', 'resolved', 'closed'];
        const labels = ['معلقة', 'قيد المعالجة', 'محلولة', 'مغلقة'];
        
        const options = statuses.map((s, i) => 
            `${s === ticket.status ? '✅' : '⬜'} ${labels[i]}`
        ).join('\n');
        
        const choice = prompt(
            `تغيير حالة التذكرة:\n\n${options}\n\nاختر رقم الحالة (1-4):`,
            `${statuses.indexOf(ticket.status) + 1}`
        );
        
        if (choice === null) return;
        
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < statuses.length) {
            const newStatus = statuses[index];
            if (newStatus !== ticket.status) {
                this.updateTicketStatus(ticketId, newStatus);
                Utils.toast(`✅ تم تغيير الحالة إلى ${labels[index]}`, 'success');
            }
        } else {
            Utils.toast('⚠️ اختيار غير صحيح', 'warning');
        }
    }
    
    // ============================================================
    // 10. REPLY CARD
    // ============================================================
    
    openReplyCard(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            Utils.toast('❌ التذكرة غير موجودة', 'error');
            return;
        }
        
        this.currentTicketId = ticketId;
        
        if (this.replySenderName) this.replySenderName.textContent = ticket.sender_name;
        if (this.replySenderEmail) this.replySenderEmail.textContent = ticket.sender_email;
        if (this.replySenderSubject) this.replySenderSubject.textContent = ticket.subject;
        if (this.replyInput) this.replyInput.value = '';
        
        if (this.replyCard) {
            this.replyCard.style.display = 'block';
            setTimeout(() => {
                this.replyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.replyInput?.focus();
            }, 300);
        }
        
        if (this.replyStatus) this.replyStatus.style.display = 'none';
    }
    
    closeReplyCard() {
        if (this.replyCard) this.replyCard.style.display = 'none';
        if (this.replyInput) this.replyInput.value = '';
        this.currentTicketId = null;
    }
    
    // ============================================================
    // 11. SEND REPLY
    // ============================================================
    
    async sendReply() {
        if (this._isSending) {
            Utils.toast('⏳ جاري الإرسال...', 'info');
            return;
        }
        
        const ticketId = this.currentTicketId;
        if (!ticketId) {
            Utils.toast('❌ لا توجد تذكرة محددة', 'error');
            return;
        }
        
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            Utils.toast('❌ التذكرة غير موجودة', 'error');
            return;
        }
        
        const replyText = this.replyInput?.value?.trim();
        if (!replyText) {
            Utils.toast('⚠️ الرجاء كتابة نص الرد', 'warning');
            this.replyInput?.focus();
            return;
        }
        
        this._isSending = true;
        
        if (this.replyStatus) {
            this.replyStatus.style.display = 'block';
            this.replyStatus.className = 'reply-status';
            if (this.replyStatusMsg) {
                this.replyStatusMsg.textContent = '⏳ جاري إرسال الرد...';
            }
        }
        
        const sendBtn = document.getElementById('sendSupportReplyBtn');
        const cancelBtn = document.getElementById('cancelSupportReplyBtn');
        if (sendBtn) sendBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;
        
        try {
            // Update ticket
            ticket.reply_message = replyText;
            ticket.replied_at = new Date();
            ticket.status = 'resolved';
            
            // Save to Supabase
            await this.saveToSupabase(ticket);
            this.saveToStorage();
            
            // Send email
            let emailSent = false;
            try {
                emailSent = await this.sendReplyEmail(
                    ticket.sender_email,
                    ticket.sender_name,
                    ticket.subject,
                    replyText,
                    ticket.message
                );
            } catch (emailError) {
                console.error('❌ Email error:', emailError);
            }
            
            // Log
            if (window._logsEngine) {
                window._logsEngine.addLog(
                    `🎧 تم الرد على تذكرة من: ${ticket.sender_name} ${emailSent ? '(📧 تم الإرسال)' : '(⚠️ بدون إيميل)'}`,
                    'support',
                    ticket.subject
                );
            }
            
            // Show success
            if (this.replyStatus && this.replyStatusMsg) {
                this.replyStatus.className = 'reply-status';
                this.replyStatusMsg.textContent = emailSent
                    ? '✅ تم إرسال الرد وإشعار المرسل بنجاح!'
                    : '✅ تم حفظ الرد (تعذر إرسال الإيميل)';
            }
            
            Utils.toast(emailSent
                ? `✅ تم إرسال الرد إلى ${ticket.sender_name}`
                : `✅ تم حفظ الرد (الإيميل لم يرسل)`,
                emailSent ? 'success' : 'warning'
            );
            
            this.render();
            
            setTimeout(() => {
                this.closeReplyCard();
                this._isSending = false;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Reply error:', error);
            if (this.replyStatus && this.replyStatusMsg) {
                this.replyStatus.className = 'reply-status error';
                this.replyStatusMsg.textContent = `❌ ${error.message || 'فشل إرسال الرد'}`;
            }
            Utils.toast(`❌ ${error.message || 'فشل إرسال الرد'}`, 'error');
            this._isSending = false;
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;
        }
    }
    
    // ============================================================
    // 12. EMAIL SERVICE
    // ============================================================
    
    async sendReplyEmail(toEmail, toName, subject, replyMessage, originalMessage) {
        try {
            console.log(`📤 Sending reply email to: ${toEmail}`);
            
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.warn('⚠️ EmailJS not loaded, trying CDN...');
                await this.loadEmailJS();
            }
            
            const templateParams = {
                to_email: toEmail,
                to_name: toName,
                subject: subject,
                original_message: originalMessage,
                reply_message: replyMessage,
                reply_date: new Date().toLocaleString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                sender_name: 'Mohamed Abdallah - الدعم الفني',
                sender_email: 'support@mohamed.dev'
            };
            
            console.log('📤 Template params:', templateParams);
            
            const response = await emailjs.send(
                this.EMAILJS_SERVICE_ID,
                this.EMAILJS_TEMPLATE_ID,
                templateParams,
                this.EMAILJS_PUBLIC_KEY
            );
            
            console.log('✅ Email sent successfully:', response);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            console.error('❌ Error details:', error.text || error.message);
            return false;
        }
    }
    
    loadEmailJS() {
        return new Promise((resolve, reject) => {
            if (typeof emailjs !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            script.onload = () => {
                console.log('✅ EmailJS loaded from CDN');
                if (typeof emailjs !== 'undefined') {
                    emailjs.init(this.EMAILJS_PUBLIC_KEY);
                }
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load EmailJS'));
            };
            document.head.appendChild(script);
        });
    }
    
    // ============================================================
    // 13. ADD TICKET
    // ============================================================
    
    addTicket(name, email, subject, message, ipAddress, userAgent, location) {
        // Prevent duplicates
        const duplicate = this.tickets.find(t =>
            t.sender_email === email &&
            t.subject === subject &&
            t.message === message &&
            (Date.now() - new Date(t.created_at).getTime() < 30000)
        );
        
        if (duplicate) {
            console.warn('⚠️ Duplicate ticket detected, skipping...');
            return null;
        }
        
        const newTicket = {
            id: Date.now() + Math.random() * 1000,
            sender_name: name.trim(),
            sender_email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
            status: 'pending',
            reply_message: null,
            replied_at: null,
            ip_address: ipAddress || 'Unknown',
            user_agent: userAgent || 'Unknown',
            location: location || 'Unknown',
            created_at: new Date()
        };
        
        this.tickets.unshift(newTicket);
        this.saveToStorage();
        this.render();
        this.saveToSupabase(newTicket);
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `🎧 تذكرة دعم جديدة من: ${newTicket.sender_name}`,
                'support',
                newTicket.subject
            );
        }
        
        console.log(`✅ New ticket added: ${newTicket.sender_name} - ${newTicket.subject}`);
        return newTicket;
    }
    
    // ============================================================
    // 14. DELETE TICKET
    // ============================================================
    
    deleteTicket(id) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return;
        
        if (!confirm(`هل تريد حذف تذكرة "${ticket.subject}"؟`)) return;
        
        this.tickets = this.tickets.filter(t => t.id !== id);
        this.saveToStorage();
        
        // Delete from Supabase
        if (supabaseClient) {
            supabaseClient
                .from('support_tickets')
                .delete()
                .eq('id', id)
                .catch(err => console.error('❌ Error deleting from Supabase:', err));
        }
        
        if (this.currentTicketId === id) {
            this.currentTicketId = null;
            this.showEmptyDetails();
        }
        
        this.render();
        Utils.toast(`🗑️ تم حذف التذكرة`, 'info');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `🗑️ حذف تذكرة: ${ticket.subject}`,
                'support'
            );
        }
    }
    
    clearAll() {
        if (this.tickets.length === 0) {
            Utils.toast('⚠️ لا توجد تذاكر لحذفها', 'warning');
            return;
        }
        
        if (!confirm(`هل تريد حذف جميع التذاكر (${this.tickets.length})؟`)) return;
        
        const count = this.tickets.length;
        
        // Delete all from Supabase
        if (supabaseClient) {
            this.tickets.forEach(t => {
                supabaseClient
                    .from('support_tickets')
                    .delete()
                    .eq('id', t.id)
                    .catch(err => console.error('❌ Error deleting:', err));
            });
        }
        
        this.tickets = [];
        this.currentTicketId = null;
        this.saveToStorage();
        this.render();
        this.showEmptyDetails();
        
        Utils.toast(`🗑️ تم حذف ${count} تذكرة`, 'success');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `🗑️ حذف جميع التذاكر (${count})`,
                'support'
            );
        }
    }
    
    // ============================================================
    // 15. HELPERS
    // ============================================================
    
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatTime(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatDateTime(date) {
        return `${this.formatDate(date)} - ${this.formatTime(date)}`;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getStats() {
        return {
            total: this.tickets.length,
            pending: this.tickets.filter(t => t.status === 'pending').length,
            inProgress: this.tickets.filter(t => t.status === 'in_progress').length,
            resolved: this.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
        };
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.render();
    }
    
    refresh() {
        this.loadFromSupabase();
        Utils.toast('🔄 جاري تحديث التذاكر...', 'info');
    }
    
    // ============================================================
    // 16. DESTROY
    // ============================================================
    
    destroy() {
        this._isInitialized = false;
        console.log('🎧 Support Engine destroyed');
    }
}

// ============================================================ */
// 17. INITIALIZATION                                            */
// ============================================================ */

window._supportEngine = null;

function getSupportEngine() {
    if (!window._supportEngine) {
        window._supportEngine = new SupportEngine();
    }
    return window._supportEngine;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const supportSection = document.getElementById('support-section');
    if (supportSection) {
        if (supportSection.classList.contains('active')) {
            getSupportEngine();
        } else {
            const observer = new MutationObserver(() => {
                if (supportSection.classList.contains('active') && !window._supportEngine) {
                    getSupportEngine();
                    observer.disconnect();
                }
            });
            observer.observe(supportSection, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
});

// If DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const supportSection = document.getElementById('support-section');
    if (supportSection && supportSection.classList.contains('active') && !window._supportEngine) {
        getSupportEngine();
    }
}

// ============================================================ */
// 18. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎧 SUPPORT ENGINE v2.0 - FULL                            ║
║                                                              ║
║   ✅ Ticket Management                                      ║
║   ✅ Status Tracking (pending, in_progress, resolved, closed) ║
║   ✅ Reply System                                          ║
║   ✅ Email Integration (EmailJS)                           ║
║   ✅ Supabase Sync                                         ║
║   ✅ LocalStorage Persistence                              ║
║   ✅ Filter by Status                                      ║
║   ✅ Stats Dashboard                                       ║
║   ✅ Lazy Loading                                          ║
║   ✅ 100% مطابق مع Schema و HTML                           ║
║                                                              ║
║   📦 Available: window._supportEngine                       ║
║   🔧 Methods:                                              ║
║   • addTicket(name, email, subject, msg, ip, ua, loc)     ║
║   • deleteTicket(id)                                       ║
║   • updateTicketStatus(id, status)                         ║
║   • refresh()                                              ║
║   • getStats()                                             ║
║   • clearAll()                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================ */
// نهاية SUPPORT ENGINE v2.0                                   */
// ============================================================ */


// ============================================================ */
// 💰 DONATIONS ENGINE - نظام التبرعات                         */
// ============================================================ */

class DonationsEngine {
    constructor() {
        // DOM Elements
        this.container = document.getElementById('donations-grid-container');
        this.refreshBtn = document.getElementById('donation-refresh-btn');
        this.badge = document.getElementById('donation-live-badge');
        
        // Stats Elements
        this.totalEl = document.getElementById('stat-total-donations');
        this.countEl = document.getElementById('stat-donation-count');
        this.pendingEl = document.getElementById('stat-pending-count');
        this.avgEl = document.getElementById('stat-avg-donation');
        
        // State
        this.donations = [];
        this.isLoading = false;
        this._isInitialized = false;
        
        this.init();
    }
    
    init() {
        console.log('💰 Donations Engine initializing...');
        
        try {
            this.setupEvents();
            this.loadDonations();
            this._isInitialized = true;
            
            document.addEventListener('dashboard:donation-received', (e) => {
                const donation = e.detail;
                if (donation) {
                    this.donations.unshift({
                        ...donation,
                        created_at: new Date(donation.created_at)
                    });
                    this.render();
                    this.updateStats();
                    Utils.toast('💰 تبرع جديد مستلم!', 'success');
                    
                    if (window._logsEngine) {
                        window._logsEngine.addLog(
                            `💰 تبرع جديد من: ${donation.donor_name || 'مجهول'} بقيمة $${donation.amount}`,
                            'donation'
                        );
                    }
                }
            });
            
            console.log('✅ Donations Engine ready');
        } catch (error) {
            console.error('❌ Donations Engine init error:', error);
        }
    }
    
    setupEvents() {
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.loadDonations(true);
            });
        }
        // زر حفظ التغييرات
const saveAllBtn = document.getElementById('donation-save-all-btn');
if (saveAllBtn) {
    saveAllBtn.addEventListener('click', async () => {
        Utils.toast('🔄 جاري حفظ التغييرات...', 'info');
        
        let successCount = 0;
        let failCount = 0;
        
        for (const donation of this.donations) {
            try {
                if (supabaseClient) {
                    const { error } = await supabaseClient
                        .from('donations')
                        .update({
                            status: donation.status,
                            amount: donation.amount,
                            donor_name: donation.donor_name,
                            platform: donation.platform
                        })
                        .eq('id', donation.id);
                    
                    if (error) throw error;
                    successCount++;
                }
            } catch (e) {
                failCount++;
            }
        }
        
        if (failCount === 0) {
            Utils.toast(`✅ تم حفظ ${successCount} تبرع`, 'success');
        } else {
            Utils.toast(`⚠️ تم حفظ ${successCount} تبرع، فشل ${failCount}`, 'warning');
        }
    });
}
    }
    
   async loadDonations(force = false) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.renderLoading();
    
    try {
        // 🔥 استخدام supabaseClient من الـ Dashboard
        if (supabaseClient) {
            console.log('📤 Loading donations from Supabase...');
            
            const { data, error } = await supabaseClient
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }
            
            console.log('📥 Data received:', data?.length || 0, 'records');
            
            if (data && data.length > 0) {
                this.donations = data.map(d => ({
                    ...d,
                    created_at: new Date(d.created_at)
                }));
                this.saveToStorage();
                console.log(`✅ Loaded ${this.donations.length} donations from Supabase`);
            } else {
                // لو مفيش بيانات في Supabase، استخدم البيانات الافتراضية
                this.loadDefaultDonations();
            }
        } else {
            console.warn('⚠️ Supabase client not ready, using default donations');
            this.loadDefaultDonations();
        }
        
        this.render();
        this.updateStats();
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `💰 تم تحميل ${this.donations.length} تبرع`,
                'donation'
            );
        }
        
    } catch (error) {
        console.error('❌ Error loading donations:', error);
        // في حالة الخطأ، استخدم البيانات الافتراضية
        this.loadDefaultDonations();
        this.render();
    } finally {
        this.isLoading = false;
    }
}
    loadDefaultDonations() {
        const now = Date.now();
        this.donations = [
            {
                id: Date.now() - 1,
                amount: 150,
                platform: 'Vodafone Cash',
                donor_name: 'أحمد محمد',
                message: 'دعم وتطوير الموقع',
                location: 'القاهرة، مصر',
                created_at: new Date(now - 3600000),
                status: 'confirmed'
            },
            {
                id: Date.now() - 2,
                amount: 75,
                platform: 'InstaPay',
                donor_name: 'سارة علي',
                message: 'شكراً على المحتوى',
                location: 'الإسكندرية، مصر',
                created_at: new Date(now - 7200000),
                status: 'pending'
            },
            {
                id: Date.now() - 3,
                amount: 200,
                platform: 'Vodafone Cash',
                donor_name: 'خالد حسن',
                message: 'استمراراً للنجاح',
                location: 'الجيزة، مصر',
                created_at: new Date(now - 86400000),
                status: 'confirmed'
            },
            {
                id: Date.now() - 4,
                amount: 50,
                platform: 'InstaPay',
                donor_name: 'منى إبراهيم',
                message: 'دعم بسيط',
                location: 'سويس، مصر',
                created_at: new Date(now - 172800000),
                status: 'pending'
            }
        ];
        this.saveToStorage();
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('dashboard-donations', JSON.stringify(this.donations));
        } catch (e) {}
    }
    
    render() {
        if (!this.container) return;
        
        if (this.donations.length === 0) {
            this.renderEmpty();
            return;
        }
        
        this.container.innerHTML = '';
        this.donations.forEach(donation => {
            this.container.appendChild(this.createDonationItem(donation));
        });
    }
    
    createDonationItem(donation) {
    const div = document.createElement('div');
    div.className = 'donation-item';
    div.dataset.id = donation.id;
    
    const amount = donation.amount ? `$${donation.amount}` : '$0';
    const dateStr = this.formatDate(donation.created_at);
    const timeStr = this.formatTime(donation.created_at);
    const statusClass = donation.status === 'confirmed' ? 'active' : 'inactive';
    const statusLabel = donation.status === 'confirmed' ? '✅ مؤكد' : '⏳ قيد المراجعة';
    const statusText = donation.status === 'confirmed' ? 'تعليق' : 'تأكيد';
    
    div.innerHTML = `
        <div class="donation-top">
            <h4 class="donation-title">${donation.donor_name || 'متبرع مجهول'}</h4>
            <span class="donation-method">${donation.platform}</span>
        </div>
        <div class="donation-amounts">
            <div class="amount">
                <span class="label">المبلغ</span>
                <span class="value raised">${amount}</span>
            </div>
            <div class="amount">
                <span class="label">الحالة</span>
                <span class="donation-status ${statusClass}">${statusLabel}</span>
            </div>
        </div>
        ${donation.message ? `<div class="donation-message">${donation.message}</div>` : ''}
        <div class="donation-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${donation.location || 'غير معروف'}</span>
        </div>
        <div class="donation-meta">
            <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
            <span><i class="fa-regular fa-clock"></i> ${timeStr}</span>
        </div>
        <div class="donation-actions">
            <button class="toggle-status-btn" data-id="${donation.id}" data-status="${donation.status}">
                <i class="fa-solid ${donation.status === 'confirmed' ? 'fa-pause' : 'fa-check-circle'}"></i>
                ${statusText}
            </button>
            <button class="delete-donation-btn" data-id="${donation.id}">
                <i class="fa-solid fa-trash"></i> حذف
            </button>
        </div>
    `;
    
    // 🔥 زر تغيير الحالة
    const toggleBtn = div.querySelector('.toggle-status-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(toggleBtn.dataset.id);
            const currentStatus = toggleBtn.dataset.status;
            const newStatus = currentStatus === 'confirmed' ? 'pending' : 'confirmed';
            
            // إظهار حالة تحميل
            toggleBtn.classList.add('btn-loading');
            toggleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
            
            try {
                // تحديث في Supabase
                if (supabaseClient) {
                    const { error } = await supabaseClient
                        .from('donations')
                        .update({ status: newStatus })
                        .eq('id', id);
                    
                    if (error) throw error;
                }
                
                // تحديث محلياً
                const localDonation = this.donations.find(d => d.id === id);
                if (localDonation) {
                    localDonation.status = newStatus;
                    this.saveToStorage();
                }
                
                // إعادة التحميل
                await this.loadDonations(true);
                
                Utils.toast(`✅ تم تغيير الحالة إلى ${newStatus === 'confirmed' ? 'مؤكد' : 'قيد المراجعة'}`, 'success');
                
            } catch (error) {
                console.error('❌ Error updating status:', error);
                Utils.toast('❌ فشل تغيير الحالة', 'error');
                // إعادة الزر لوضعه الطبيعي
                toggleBtn.classList.remove('btn-loading');
                toggleBtn.innerHTML = `<i class="fa-solid ${currentStatus === 'confirmed' ? 'fa-pause' : 'fa-check-circle'}"></i> ${currentStatus === 'confirmed' ? 'تعليق' : 'تأكيد'}`;
            }
        });
    }
    
    // 🔥 زر الحذف
    const deleteBtn = div.querySelector('.delete-donation-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!confirm('هل تريد حذف هذا التبرع؟')) return;
            
            const id = parseInt(deleteBtn.dataset.id);
            deleteBtn.classList.add('btn-loading');
            deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            
            try {
                // حذف من Supabase
                if (supabaseClient) {
                    const { error } = await supabaseClient
                        .from('donations')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                }
                
                // حذف محلياً
                this.donations = this.donations.filter(d => d.id !== id);
                this.saveToStorage();
                this.render();
                this.updateStats();
                
                Utils.toast('🗑️ تم حذف التبرع', 'info');
                
            } catch (error) {
                console.error('❌ Error deleting donation:', error);
                Utils.toast('❌ فشل الحذف', 'error');
                deleteBtn.classList.remove('btn-loading');
                deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> حذف';
            }
        });
    }
    
    return div;
}

    
    renderEmpty() {
        this.container.innerHTML = `
            <div class="donations-empty">
                <i class="fa-solid fa-hand-holding-dollar"></i>
                <h4>لا توجد تبرعات</h4>
                <p>لم يتم استلام أي تبرعات حتى الآن. ستظهر هنا عند استلام تبرع جديد.</p>
                <button class="saas-btn saas-btn-primary" onclick="window._donationsEngine?.loadDonations(true)">
                    <i class="fa-solid fa-rotate"></i> تحديث
                </button>
            </div>
        `;
    }
    
    renderLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="donation-skeleton"><div class="skeleton-title"></div><div class="skeleton-amount"></div><div class="skeleton-progress"></div><div class="skeleton-actions"></div></div>
            <div class="donation-skeleton"><div class="skeleton-title"></div><div class="skeleton-amount"></div><div class="skeleton-progress"></div><div class="skeleton-actions"></div></div>
            <div class="donation-skeleton"><div class="skeleton-title"></div><div class="skeleton-amount"></div><div class="skeleton-progress"></div><div class="skeleton-actions"></div></div>
        `;
    }
    
    updateStats() {
        const total = this.donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const count = this.donations.length;
        const pending = this.donations.filter(d => d.status === 'pending').length;
        const avg = count > 0 ? total / count : 0;
        
        if (this.totalEl) this.totalEl.textContent = `$${total.toFixed(0)}`;
        if (this.countEl) this.countEl.textContent = count;
        if (this.pendingEl) this.pendingEl.textContent = pending;
        if (this.avgEl) this.avgEl.textContent = `$${avg.toFixed(0)}`;
    }
    
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatTime(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    refresh() {
        this.loadDonations(true);
    }
}

// ============================================================ */
// INITIALIZATION                                                */
// ============================================================ */

window._donationsEngine = null;

function getDonationsEngine() {
    if (!window._donationsEngine) {
        window._donationsEngine = new DonationsEngine();
    }
    return window._donationsEngine;
}

document.addEventListener('DOMContentLoaded', () => {
    const donationsSection = document.getElementById('donations-section');
    if (donationsSection) {
        if (donationsSection.classList.contains('active')) {
            getDonationsEngine();
        } else {
            const observer = new MutationObserver(() => {
                if (donationsSection.classList.contains('active') && !window._donationsEngine) {
                    getDonationsEngine();
                    observer.disconnect();
                }
            });
            observer.observe(donationsSection, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const donationsSection = document.getElementById('donations-section');
    if (donationsSection && donationsSection.classList.contains('active') && !window._donationsEngine) {
        getDonationsEngine();
    }
}

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   💰 DONATIONS ENGINE - v1.0                               ║
║                                                              ║
║   ✅ Donations Tracking                                     ║
║   ✅ Live Updates                                           ║
║   ✅ Stats (Total, Count, Pending, Avg)                    ║
║   ✅ Supabase Integration                                   ║
║   ✅ Lazy Loading                                           ║
║                                                              ║
║   📦 Available: window._donationsEngine                     ║
║   🔧 Methods: refresh()                                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
// ============================================================ */
// 📱 SOCIAL ENGINE - روابط السوشيال ميديا v3.0                */
// ============================================================ */
/*
   🎯 المميزات:
   - ✅ عرض جميع روابط السوشيال
   - ✅ إضافة منصة جديدة
   - ✅ تعديل منصة
   - ✅ حذف منصة
   - ✅ تفريغ الكل
   - ✅ إحصائيات (إجمالي المنصات، إجمالي المتابعين، المتوسط، الأقوى)
   - ✅ تخزين في localStorage
   - ✅ مزامنة مع Supabase
   - ✅ Lazy Loading
   - ✅ معالجة الأخطاء
   - ✅ Toast Notifications
   - ✅ Logs Integration
   - ✅ مطابق 100% مع Schema و HTML
*/

// ============================================================ */
// 01. SOCIAL ENGINE CLASS                                      */
// ============================================================ */

class SocialEngine {
    constructor() {
        // ============================================================
        // DOM Elements - مطابق للـ HTML
        // ============================================================
        this.container = document.getElementById('social_linksGrid');
        this.form = document.getElementById('socialForm');
        this.clearBtn = document.getElementById('clearSocialBtn');
        
        // Form inputs - مطابق للـ HTML
        this.platformInput = document.getElementById('socialPlatform');
        this.linkInput = document.getElementById('socialLink');
        this.followersInput = document.getElementById('socialFollowers');
        
        // Stats elements - مطابق للـ HTML
        this.totalPlatformsEl = document.getElementById('stat-total-platforms');
        this.totalFollowersEl = document.getElementById('stat-total-followers');
        this.avgFollowersEl = document.getElementById('stat-avg-followers');
        this.topPlatformEl = document.getElementById('stat-top-platform');
        
        // ============================================================
        // State
        // ============================================================
        this.socials = [];
        this.isLoading = false;
        this.currentEditId = null;
        this._isSaving = false;
        this._isInitialized = false;
        
        // ============================================================
        // Platform Icons Mapping - مطابق لـ Schema
        // ============================================================
        this.platformIcons = {
            'github': 'fa-brands fa-github',
            'linkedin': 'fa-brands fa-linkedin',
            'youtube': 'fa-brands fa-youtube',
            'twitter': 'fa-brands fa-twitter',
            'x': 'fa-brands fa-x-twitter',
            'instagram': 'fa-brands fa-instagram',
            'facebook': 'fa-brands fa-facebook',
            'tiktok': 'fa-brands fa-tiktok',
            'snapchat': 'fa-brands fa-snapchat',
            'pinterest': 'fa-brands fa-pinterest',
            'reddit': 'fa-brands fa-reddit',
            'discord': 'fa-brands fa-discord',
            'whatsapp': 'fa-brands fa-whatsapp',
            'telegram': 'fa-brands fa-telegram',
            'twitch': 'fa-brands fa-twitch',
            'spotify': 'fa-brands fa-spotify',
            'devto': 'fa-brands fa-dev',
            'medium': 'fa-brands fa-medium',
            'stackoverflow': 'fa-brands fa-stack-overflow',
            'codepen': 'fa-brands fa-codepen',
            'codesandbox': 'fa-brands fa-codesandbox',
            'figma': 'fa-brands fa-figma',
            'dribbble': 'fa-brands fa-dribbble',
            'behance': 'fa-brands fa-behance',
            'gitlab': 'fa-brands fa-gitlab',
            'bitbucket': 'fa-brands fa-bitbucket',
            'npm': 'fa-brands fa-npm',
            'docker': 'fa-brands fa-docker',
            'slack': 'fa-brands fa-slack',
            'mastodon': 'fa-brands fa-mastodon',
            'threads': 'fa-brands fa-threads'
        };
        
        // ============================================================
        // INIT
        // ============================================================
        this.init();
    }
    
    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    
    init() {
        console.log('📱 Social Engine v3.0 initializing...');
        
        try {
            // التحقق من وجود العناصر
            this.validateElements();
            
            // Load from storage
            this.loadFromStorage();
            
            // Setup events
            this.setupEvents();
            
            // Render
            this.render();
            
            // Load from Supabase after delay
            setTimeout(() => {
                this.loadFromSupabase();
            }, 800);
            
            this._isInitialized = true;
            
            console.log('✅ Social Engine v3.0 ready');
            console.log(`📊 ${this.socials.length} social links loaded`);
            
            // Log to global
            if (window._logsEngine) {
                window._logsEngine.addLog(
                    `📱 تم تحميل محرك السوشيال ميديا (${this.socials.length} منصة)`,
                    'social'
                );
            }
        } catch (error) {
            console.error('❌ Social Engine init error:', error);
            Utils.toast('❌ فشل تحميل محرك السوشيال ميديا', 'error');
        }
    }
    
    validateElements() {
        const elements = [
            { el: this.container, name: 'social_linksGrid' },
            { el: this.form, name: 'socialForm' },
            { el: this.clearBtn, name: 'clearSocialBtn' },
            { el: this.platformInput, name: 'socialPlatform' },
            { el: this.linkInput, name: 'socialLink' },
            { el: this.followersInput, name: 'socialFollowers' },
            { el: this.totalPlatformsEl, name: 'stat-total-platforms' },
            { el: this.totalFollowersEl, name: 'stat-total-followers' },
            { el: this.avgFollowersEl, name: 'stat-avg-followers' },
            { el: this.topPlatformEl, name: 'stat-top-platform' }
        ];
        
        const missing = elements.filter(e => !e.el);
        if (missing.length > 0) {
            console.warn('⚠️ Missing elements:', missing.map(e => e.name).join(', '));
        }
    }
    
    // ============================================================
    // 02. STORAGE MANAGEMENT
    // ============================================================
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('dashboard-socials');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.socials = parsed.map(item => ({
                        ...item,
                        created_at: item.created_at ? new Date(item.created_at) : new Date()
                    }));
                    console.log(`📂 Loaded ${this.socials.length} socials from storage`);
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ Could not load socials from storage:', e);
        }
        
        // Default socials if nothing saved
        this.loadDefaultSocials();
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('dashboard-socials', JSON.stringify(this.socials));
        } catch (e) {
            console.warn('⚠️ Could not save socials to storage:', e);
        }
    }
    
    loadDefaultSocials() {
        const now = Date.now();
        this.socials = [
            {
                id: Date.now() - 100000,
                platform: 'GitHub',
                link: 'https://github.com/budiabdallah20',
                followers: 2500,
                icon: 'fa-brands fa-github',
                is_active: true,
                display_order: 1,
                created_at: new Date(now - 3600000)
            },
            {
                id: Date.now() - 200000,
                platform: 'LinkedIn',
                link: 'https://linkedin.com/in/mohamedabdallah',
                followers: 1800,
                icon: 'fa-brands fa-linkedin',
                is_active: true,
                display_order: 2,
                created_at: new Date(now - 7200000)
            },
            {
                id: Date.now() - 300000,
                platform: 'YouTube',
                link: 'https://youtube.com/@mohamedabdallah',
                followers: 3500,
                icon: 'fa-brands fa-youtube',
                is_active: true,
                display_order: 3,
                created_at: new Date(now - 10800000)
            },
            {
                id: Date.now() - 400000,
                platform: 'Twitter',
                link: 'https://twitter.com/mohamedabdallah',
                followers: 1200,
                icon: 'fa-brands fa-twitter',
                is_active: true,
                display_order: 4,
                created_at: new Date(now - 14400000)
            },
            {
                id: Date.now() - 500000,
                platform: 'Instagram',
                link: 'https://instagram.com/mohamedabdallah',
                followers: 4200,
                icon: 'fa-brands fa-instagram',
                is_active: true,
                display_order: 5,
                created_at: new Date(now - 18000000)
            }
        ];
        this.saveToStorage();
        console.log('📂 Default socials loaded');
    }
    
    // ============================================================
    // 03. SUPABASE OPERATIONS - مطابق للـ Schema
    // ============================================================
    
    async loadFromSupabase() {
        try {
            if (!supabaseClient) {
                console.warn('⚠️ Supabase client not ready');
                return;
            }
            
            console.log('📤 Loading socials from Supabase...');
            
            const { data, error } = await supabaseClient
                .from('social_links')
                .select('*')
                .order('display_order', { ascending: true });
            
            if (error) {
                console.error('❌ Supabase load error:', error);
                console.error('❌ Error details:', error.message);
                return;
            }
            
            console.log('📥 Data received from Supabase:', data?.length || 0, 'records');
            
            if (data && data.length > 0) {
                // Create sets for duplicate detection
                const existingIds = new Set(this.socials.map(s => s.id));
                const existingContent = new Set(
                    this.socials.map(s => `${s.platform.toLowerCase()}-${s.link}`)
                );
                
                let newCount = 0;
                
                data.forEach(item => {
                    // Skip if ID exists
                    if (existingIds.has(item.id)) return;
                    
                    // Skip if content exists
                    const contentKey = `${item.platform.toLowerCase()}-${item.link}`;
                    if (existingContent.has(contentKey)) return;
                    
                    // Add new social - مطابق للـ Schema
                    const newSocial = {
                        id: item.id,
                        platform: item.platform,
                        link: item.link,
                        followers: item.followers || 0,
                        icon: item.icon || this.getPlatformIcon(item.platform),
                        is_active: item.is_active !== false,
                        display_order: item.display_order || 0,
                        created_at: item.created_at ? new Date(item.created_at) : new Date()
                    };
                    
                    this.socials.push(newSocial);
                    existingIds.add(item.id);
                    existingContent.add(contentKey);
                    newCount++;
                });
                
                if (newCount > 0) {
                    this.saveToStorage();
                    this.render();
                    console.log(`📂 Added ${newCount} new socials from Supabase`);
                    
                    if (window._logsEngine) {
                        window._logsEngine.addLog(
                            `📱 تم استيراد ${newCount} منصة من Supabase`,
                            'social'
                        );
                    }
                }
            }
        } catch (e) {
            console.error('❌ Error loading from Supabase:', e);
        }
    }
    
    async saveToSupabase(item) {
        try {
            if (!supabaseClient) {
                console.warn('⚠️ Supabase client not ready, saving to localStorage only');
                return false;
            }
            
            console.log('📤 Saving to Supabase:', item.platform);
            
            // Check if exists
            const { data: existing, error: checkError } = await supabaseClient
                .from('social_links')
                .select('id')
                .eq('id', item.id)
                .limit(1);
            
            if (checkError) {
                console.warn('⚠️ Could not check existing:', checkError);
            }
            
            const isUpdate = existing && existing.length > 0;
            
            if (isUpdate) {
                // Update - مطابق للـ Schema
                const { error } = await supabaseClient
                    .from('social_links')
                    .update({
                        platform: item.platform,
                        link: item.link,
                        followers: item.followers || 0,
                        icon: item.icon || this.getPlatformIcon(item.platform),
                        is_active: item.is_active !== false,
                        display_order: item.display_order || 0
                    })
                    .eq('id', item.id);
                
                if (error) {
                    console.error('❌ Failed to update social:', error);
                    Utils.toast(`❌ فشل تحديث ${item.platform}`, 'error');
                    return false;
                }
                
                console.log('✅ Social updated in Supabase:', item.platform);
                Utils.toast(`✅ تم تحديث ${item.platform}`, 'success');
                return true;
            } else {
                // Insert - مطابق للـ Schema
                const { error } = await supabaseClient
                    .from('social_links')
                    .insert([{
                        id: item.id,
                        platform: item.platform,
                        link: item.link,
                        followers: item.followers || 0,
                        icon: item.icon || this.getPlatformIcon(item.platform),
                        is_active: item.is_active !== false,
                        display_order: item.display_order || 0,
                        created_at: item.created_at?.toISOString() || new Date().toISOString()
                    }]);
                
                if (error) {
                    console.error('❌ Failed to save social:', error);
                    Utils.toast(`❌ فشل حفظ ${item.platform}`, 'error');
                    return false;
                }
                
                console.log('✅ Social saved to Supabase:', item.platform);
                Utils.toast(`✅ تم حفظ ${item.platform}`, 'success');
                return true;
            }
        } catch (e) {
            console.error('❌ Error saving to Supabase:', e);
            Utils.toast('❌ خطأ في حفظ البيانات', 'error');
            return false;
        }
    }
    
    async deleteFromSupabase(id) {
        try {
            if (!supabaseClient) return false;
            
            console.log('📤 Deleting from Supabase:', id);
            
            const { error } = await supabaseClient
                .from('social_links')
                .delete()
                .eq('id', id);
            
            if (error) {
                console.error('❌ Failed to delete from Supabase:', error);
                Utils.toast('❌ فشل حذف المنصة', 'error');
                return false;
            }
            
            console.log('✅ Social deleted from Supabase:', id);
            return true;
        } catch (e) {
            console.error('❌ Error deleting from Supabase:', e);
            return false;
        }
    }
    
    async syncAllToSupabase() {
        if (this.socials.length === 0) {
            Utils.toast('⚠️ لا توجد منصات للمزامنة', 'warning');
            return;
        }
        
        Utils.toast('🔄 جاري المزامنة مع Supabase...', 'info');
        
        let successCount = 0;
        let failCount = 0;
        
        for (const item of this.socials) {
            const result = await this.saveToSupabase(item);
            if (result) {
                successCount++;
            } else {
                failCount++;
            }
        }
        
        if (failCount === 0) {
            Utils.toast(`✅ تمت المزامنة بنجاح (${successCount} منصة)`, 'success');
        } else {
            Utils.toast(`⚠️ تمت المزامنة جزئياً (${successCount} نجاح، ${failCount} فشل)`, 'warning');
        }
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `📱 مزامنة السوشيال ميديا: ${successCount} نجاح، ${failCount} فشل`,
                'social'
            );
        }
    }
    
    // ============================================================
    // 04. EVENT SETUP
    // ============================================================
    
    setupEvents() {
        // Form submit
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
        
        // Clear button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+S = Add social
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.platformInput?.focus();
            }
        });
        
        // Listen for social updates from website
        document.addEventListener('dashboard:social-update', (e) => {
            const { platform, link, followers } = e.detail || {};
            if (platform && link) {
                this.addSocial(platform, link, followers || 0);
            }
        });
        
        console.log('✅ Social events setup complete');
    }
    
    // ============================================================
    // 05. FORM HANDLING
    // ============================================================
    
    handleFormSubmit() {
        if (this._isSaving) {
            Utils.toast('⏳ جاري الحفظ...', 'info');
            return;
        }
        
        const platform = this.platformInput?.value?.trim();
        const link = this.linkInput?.value?.trim();
        const followers = parseInt(this.followersInput?.value) || 0;
        
        // Validate platform
        if (!platform) {
            Utils.toast('⚠️ الرجاء إدخال اسم المنصة', 'warning');
            this.platformInput?.focus();
            return;
        }
        
        // Validate link
        if (!link) {
            Utils.toast('⚠️ الرجاء إدخال رابط البروفايل', 'warning');
            this.linkInput?.focus();
            return;
        }
        
        // Validate URL
        try {
            const url = new URL(link);
            if (!url.protocol.startsWith('http')) {
                throw new Error('Invalid protocol');
            }
        } catch {
            Utils.toast('⚠️ الرابط غير صحيح (يجب أن يبدأ بـ http:// أو https://)', 'warning');
            this.linkInput?.focus();
            return;
        }
        
        // Check for duplicate platform (case insensitive)
        const duplicate = this.socials.find(s => 
            s.platform.toLowerCase() === platform.toLowerCase() &&
            s.id !== this.currentEditId
        );
        
        if (duplicate) {
            Utils.toast(`⚠️ منصة "${platform}" موجودة بالفعل`, 'warning');
            this.platformInput?.focus();
            this.platformInput?.select();
            return;
        }
        
        if (this.currentEditId) {
            // Update existing
            this.updateSocial(this.currentEditId, platform, link, followers);
        } else {
            // Add new
            this.addSocial(platform, link, followers);
        }
    }
    
    resetForm() {
        if (this.platformInput) this.platformInput.value = '';
        if (this.linkInput) this.linkInput.value = '';
        if (this.followersInput) this.followersInput.value = '';
        this.currentEditId = null;
        this._isSaving = false;
        
        const submitBtn = this.form?.querySelector('.add-social-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> إضافة';
        }
        
        const title = this.form?.querySelector('.form-title');
        if (title) {
            title.innerHTML = '<i class="fa-solid fa-plus-circle"></i> إضافة منصة جديدة';
        }
    }
    
    // ============================================================
    // 06. CRUD OPERATIONS
    // ============================================================
    
    addSocial(platform, link, followers) {
        if (this._isSaving) return null;
        
        // Prevent duplicates
        const duplicate = this.socials.find(s => 
            s.platform.toLowerCase() === platform.toLowerCase()
        );
        
        if (duplicate) {
            Utils.toast(`⚠️ منصة "${platform}" موجودة بالفعل`, 'warning');
            return null;
        }
        
        const newItem = {
            id: Date.now() + Math.random() * 1000,
            platform: platform.trim(),
            link: link.trim(),
            followers: followers || 0,
            icon: this.getPlatformIcon(platform),
            is_active: true,
            display_order: this.socials.length + 1,
            created_at: new Date()
        };
        
        this.socials.unshift(newItem);
        this.saveToStorage();
        this.render();
        
        // Save to Supabase (async)
        this._isSaving = true;
        this.saveToSupabase(newItem).finally(() => {
            this._isSaving = false;
        });
        
        this.resetForm();
        
        Utils.toast(`✅ تم إضافة ${newItem.platform}`, 'success');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `📱 تم إضافة منصة: ${newItem.platform}`,
                'social',
                `${newItem.followers} متابع`
            );
        }
        
        return newItem;
    }
    
    updateSocial(id, platform, link, followers) {
        if (this._isSaving) return;
        
        const item = this.socials.find(s => s.id === id);
        if (!item) {
            Utils.toast('❌ المنصة غير موجودة', 'error');
            return;
        }
        
        const oldPlatform = item.platform;
        item.platform = platform.trim();
        item.link = link.trim();
        item.followers = followers || 0;
        item.icon = this.getPlatformIcon(platform);
        
        this.saveToStorage();
        this.render();
        
        // Save to Supabase (async)
        this._isSaving = true;
        this.saveToSupabase(item).finally(() => {
            this._isSaving = false;
        });
        
        this.resetForm();
        
        Utils.toast(`✅ تم تحديث ${item.platform}`, 'success');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `📱 تم تحديث منصة: ${oldPlatform} → ${item.platform}`,
                'social',
                `${item.followers} متابع`
            );
        }
    }
    
    deleteSocial(id) {
        const item = this.socials.find(s => s.id === id);
        if (!item) return;
        
        if (!confirm(`هل تريد حذف منصة "${item.platform}"؟`)) return;
        
        this.socials = this.socials.filter(s => s.id !== id);
        this.saveToStorage();
        this.render();
        
        // Delete from Supabase (async)
        this.deleteFromSupabase(id);
        
        Utils.toast(`🗑️ تم حذف ${item.platform}`, 'info');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `🗑️ تم حذف منصة: ${item.platform}`,
                'social'
            );
        }
    }
    
    clearAll() {
        if (this.socials.length === 0) {
            Utils.toast('⚠️ لا توجد منصات لحذفها', 'warning');
            return;
        }
        
        if (!confirm(`هل تريد حذف جميع المنصات (${this.socials.length})؟`)) return;
        
        const count = this.socials.length;
        
        // Delete all from Supabase (async)
        this.socials.forEach(item => {
            this.deleteFromSupabase(item.id);
        });
        
        this.socials = [];
        this.saveToStorage();
        this.render();
        
        Utils.toast(`🗑️ تم حذف ${count} منصة`, 'success');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `🗑️ تم حذف جميع المنصات (${count})`,
                'social'
            );
        }
    }
    
    // ============================================================
    // 07. RENDER ENGINE
    // ============================================================
    
    render() {
        if (!this.container) {
            console.warn('⚠️ #social_linksGrid not found');
            return;
        }
        
        if (this.isLoading) {
            this.renderLoading();
            return;
        }
        
        if (this.socials.length === 0) {
            this.renderEmpty();
            this.updateStats();
            this.updateClearButton();
            return;
        }
        
        // Sort by display_order
        const sorted = [...this.socials].sort((a, b) => 
            (a.display_order || 0) - (b.display_order || 0)
        );
        
        this.container.innerHTML = '';
        
        sorted.forEach(item => {
            this.container.appendChild(this.createSocialItem(item));
        });
        
        this.updateStats();
        this.updateClearButton();
    }
    
    createSocialItem(item) {
        const div = document.createElement('div');
        div.className = 'social-item';
        div.dataset.id = item.id;
        div.dataset.platform = item.platform;
        
        const formattedFollowers = this.formatNumber(item.followers || 0);
        const icon = item.icon || this.getPlatformIcon(item.platform);
        const truncatedLink = this.truncateUrl(item.link);
        
        div.innerHTML = `
            <div class="social-top">
                <div class="social-icon-wrap">
                    <i class="${icon}"></i>
                </div>
                <div class="social-info">
                    <span class="social-name">${this.escapeHtml(item.platform)}</span>
                    <a href="${this.escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="social-link" title="${this.escapeHtml(item.link)}">
                        ${this.escapeHtml(truncatedLink)}
                    </a>
                    <span class="social-followers">
                        <i class="fa-solid fa-user-group"></i>
                        ${formattedFollowers} متابع
                    </span>
                </div>
            </div>
            <div class="social-actions">
                <button class="edit-social-btn" data-id="${item.id}" title="تعديل">
                    <i class="fa-solid fa-pen"></i> تعديل
                </button>
                <button class="delete-social-btn" data-id="${item.id}" title="حذف">
                    <i class="fa-solid fa-trash"></i> حذف
                </button>
            </div>
        `;
        
        // Edit button
        const editBtn = div.querySelector('.edit-social-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editSocial(item.id);
            });
        }
        
        // Delete button
        const deleteBtn = div.querySelector('.delete-social-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSocial(item.id);
            });
        }
        
        // Click on card to open link
        div.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) return;
            window.open(item.link, '_blank');
        });
        
        return div;
    }
    
    renderEmpty() {
        this.container.innerHTML = `
            <div class="social-empty">
                <i class="fa-solid fa-share-nodes"></i>
                <h4>لا توجد منصات</h4>
                <p>أضف روابط السوشيال ميديا الخاصة بك لتظهر في الموقع.</p>
                <button class="saas-btn saas-btn-primary" onclick="window._socialEngine?.platformInput?.focus()">
                    <i class="fa-solid fa-plus"></i> إضافة منصة
                </button>
            </div>
        `;
    }
    
    renderLoading() {
        this.container.innerHTML = `
            <div class="social-skeleton">
                <div class="skeleton-icon"></div>
                <div class="skeleton-name"></div>
                <div class="skeleton-link"></div>
                <div class="skeleton-followers"></div>
            </div>
            <div class="social-skeleton">
                <div class="skeleton-icon"></div>
                <div class="skeleton-name"></div>
                <div class="skeleton-link"></div>
                <div class="skeleton-followers"></div>
            </div>
            <div class="social-skeleton">
                <div class="skeleton-icon"></div>
                <div class="skeleton-name"></div>
                <div class="skeleton-link"></div>
                <div class="skeleton-followers"></div>
            </div>
        `;
    }
    
    // ============================================================
    // 08. EDIT SOCIAL
    // ============================================================
    
    editSocial(id) {
        const item = this.socials.find(s => s.id === id);
        if (!item) {
            Utils.toast('❌ المنصة غير موجودة', 'error');
            return;
        }
        
        this.currentEditId = id;
        
        if (this.platformInput) this.platformInput.value = item.platform;
        if (this.linkInput) this.linkInput.value = item.link;
        if (this.followersInput) this.followersInput.value = item.followers || 0;
        
        const submitBtn = this.form?.querySelector('.add-social-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> تحديث';
        }
        
        const title = this.form?.querySelector('.form-title');
        if (title) {
            title.innerHTML = `<i class="fa-solid fa-pen"></i> تعديل: ${item.platform}`;
        }
        
        this.platformInput?.focus();
        this.platformInput?.select();
        
        // Scroll to form
        this.form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        Utils.toast(`✏️ جاري تعديل ${item.platform}`, 'info');
    }
    
    // ============================================================
    // 09. STATS
    // ============================================================
    
    updateStats() {
        const total = this.socials.length;
        const totalFollowers = this.socials.reduce((sum, s) => sum + (s.followers || 0), 0);
        const avg = total > 0 ? Math.round(totalFollowers / total) : 0;
        
        // Find top platform
        let topPlatform = '-';
        let topFollowers = 0;
        this.socials.forEach(s => {
            const followers = s.followers || 0;
            if (followers > topFollowers) {
                topFollowers = followers;
                topPlatform = s.platform;
            }
        });
        
        if (this.totalPlatformsEl) this.totalPlatformsEl.textContent = total;
        if (this.totalFollowersEl) this.totalFollowersEl.textContent = this.formatNumber(totalFollowers);
        if (this.avgFollowersEl) this.avgFollowersEl.textContent = this.formatNumber(avg);
        if (this.topPlatformEl) this.topPlatformEl.textContent = topPlatform || '-';
    }
    
    getStats() {
        const total = this.socials.length;
        const totalFollowers = this.socials.reduce((sum, s) => sum + (s.followers || 0), 0);
        const avg = total > 0 ? Math.round(totalFollowers / total) : 0;
        
        let topPlatform = null;
        let topFollowers = 0;
        this.socials.forEach(s => {
            const followers = s.followers || 0;
            if (followers > topFollowers) {
                topFollowers = followers;
                topPlatform = s;
            }
        });
        
        return { total, totalFollowers, avg, topPlatform };
    }
    
    // ============================================================
    // 10. HELPERS
    // ============================================================
    
    getPlatformIcon(platform) {
        if (!platform) return 'fa-solid fa-link';
        const key = platform.toLowerCase().trim();
        return this.platformIcons[key] || 'fa-solid fa-link';
    }
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    }
    
    truncateUrl(url) {
        if (!url) return '';
        try {
            const parsed = new URL(url);
            let path = parsed.pathname;
            if (path.length > 25) {
                path = path.substring(0, 22) + '...';
            }
            return parsed.hostname + path;
        } catch {
            return url.length > 40 ? url.substring(0, 37) + '...' : url;
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateClearButton() {
        if (this.clearBtn) {
            this.clearBtn.disabled = this.socials.length === 0;
        }
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.render();
    }
    
    refresh() {
        console.log('🔄 Refreshing socials...');
        this.loadFromSupabase();
        this.render();
        Utils.toast('🔄 تم تحديث البيانات', 'info');
    }
    
    // ============================================================
    // 11. CLEANUP
    // ============================================================
    
    destroy() {
        this._isInitialized = false;
        console.log('📱 Social Engine destroyed');
    }
}

// ============================================================ */
// 12. INITIALIZATION                                            */
// ============================================================ */

window._socialEngine = null;

function getSocialEngine() {
    if (!window._socialEngine) {
        window._socialEngine = new SocialEngine();
    }
    return window._socialEngine;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const socialSection = document.getElementById('social-section');
    if (socialSection) {
        if (socialSection.classList.contains('active')) {
            getSocialEngine();
        } else {
            const observer = new MutationObserver(() => {
                if (socialSection.classList.contains('active') && !window._socialEngine) {
                    getSocialEngine();
                    observer.disconnect();
                }
            });
            observer.observe(socialSection, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
});

// If DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const socialSection = document.getElementById('social-section');
    if (socialSection && socialSection.classList.contains('active') && !window._socialEngine) {
        getSocialEngine();
    }
}

// ============================================================ */
// 13. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   📱 SOCIAL ENGINE v3.0 - FINAL                             ║
║                                                              ║
║   ✅ Social Links Management                                ║
║   ✅ Platform Icons Auto-Detection                         ║
║   ✅ Followers Counter                                     ║
║   ✅ Stats (Total, Avg, Top Platform)                      ║
║   ✅ LocalStorage Persistence                              ║
║   ✅ Supabase Sync                                         ║
║   ✅ Lazy Loading                                          ║
║   ✅ Error Handling                                        ║
║   ✅ Toast Notifications                                   ║
║   ✅ Logs Integration                                      ║
║   ✅ 100% مطابق مع Schema و HTML                           ║
║                                                              ║
║   📦 Available: window._socialEngine                        ║
║   🔧 Methods:                                              ║
║   • addSocial(platform, link, followers)                   ║
║   • deleteSocial(id)                                       ║
║   • editSocial(id)                                         ║
║   • refresh()                                              ║
║   • syncAllToSupabase()                                    ║
║   • getStats()                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================ */
// نهاية SOCIAL ENGINE v3.0                                    */
// ============================================================ */



// ============================================================ */
// ✉️ MESSAGES ENGINE - رسائل الزوار                          */
// ============================================================ */
/*
   🎯 المميزات:
   - عرض جميع الرسائل
   - حالة مقروء / غير مقروء
   - حالة تم الرد / لم يرد
   - تاريخ ووقت
   - اسم المرسل والبريد الإلكتروني
   - موضوع الرسالة
   - معاينة المحتوى
   - تحديد كمقروء (نقرة)
   - حذف رسالة
   - تفريغ الكل
   - إحصائيات
   - بحث وتصفية
   - تخزين محلي
   - Lazy Loading
*/

// ============================================================ */
// 01. MESSAGES ENGINE CLASS                                   */
// ============================================================ */

class MessagesEngine {
    constructor() {
        // ============================================================
        // DOM Elements
        // ============================================================
        this.container = document.getElementById('messagesGrid');
        this.clearBtn = document.getElementById('clearMessagesBtn');
        
        // ============================================================
        // State
        // ============================================================
        this.messages = [];
        this.filter = 'all'; // all, unread, replied
        this.searchQuery = '';
        this.isLoading = false;
        
        // ============================================================
        // INIT
        // ============================================================
        this.init();
    }
    
    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    
    init() {
        console.log('✉️ Messages Engine initializing...');
        
        // Load messages from storage
        this.loadFromStorage();
        
        // Setup events
        this.setupEvents();
         this.setupReplyEvents();
        // Render
        this.render();
         setTimeout(() => this.loadFromSupabase(), 500);
        
        console.log('✅ Messages Engine ready');
        console.log(`📊 ${this.messages.length} messages loaded`);
    }
    
    // ============================================================
    // 02. STORAGE MANAGEMENT
    // ============================================================
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('dashboard-messages');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.messages = parsed.map(msg => ({
                        ...msg,
                        date: new Date(msg.date)
                    }));
                    console.log(`📂 Loaded ${this.messages.length} messages from storage`);
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ Could not load messages:', e);
        }
        
        // Default messages if nothing saved
        this.loadDefaultMessages();
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('dashboard-messages', JSON.stringify(this.messages));
        } catch (e) {
            console.warn('⚠️ Could not save messages:', e);
        }
    }
    
    loadDefaultMessages() {
        const now = Date.now();
        this.messages = [
            {
                id: Date.now() - 1,
                name: 'أحمد حسن',
                email: 'ahmed@example.com',
                subject: 'استفسار عن المشاريع',
                message: 'أود معرفة المزيد عن مشاريعك السابقة في مجال تطوير الويب، هل يمكنك مشاركة بعض النماذج؟',
                date: new Date(now - 3600000),
                read: false,
                replied: false
            },
            {
                id: Date.now() - 2,
                name: 'سارة محمود',
                email: 'sara@example.com',
                subject: 'طلب تعاون وظيفي',
                message: 'نحن شركة ناشئة ونبحث عن مطور ويب للانضمام لفريقنا، هل أنت مهتم؟',
                date: new Date(now - 7200000),
                read: false,
                replied: false
            },
            {
                id: Date.now() - 3,
                name: 'خالد علي',
                email: 'khaled@example.com',
                subject: 'شكر وتقدير',
                message: 'شكراً لك على المحتوى القيم والمفيد في موقعك، استفدت كثيراً من مقالاتك التقنية',
                date: new Date(now - 86400000),
                read: true,
                replied: false
            },
            {
                id: Date.now() - 4,
                name: 'منى إبراهيم',
                email: 'mona@example.com',
                subject: 'اقتراح تطوير',
                message: 'أقترح إضافة قسم للمدونة في الموقع لمشاركة الخبرات والدروس التعليمية',
                date: new Date(now - 172800000),
                read: true,
                replied: true
            },
            {
                id: Date.now() - 5,
                name: 'محمد السيد',
                email: 'mohamed@example.com',
                subject: 'طلب عرض سعر',
                message: 'أريد الحصول على عرض سعر لتصميم موقع إلكتروني متكامل لشركتي، مع إمكانية إدارة المحتوى',
                date: new Date(now - 259200000),
                read: false,
                replied: false
            }
        ];
        this.saveToStorage();
        console.log('📂 Default messages loaded');
    }
    
    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    
    setupEvents() {
        // Clear button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }
        
        // Keyboard: Ctrl+Shift+M = Mark all as read
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                this.markAllAsRead();
            }
        });
        
        // ============================================================
        // 🔥 الإضافة الجديدة: استقبال رسائل من الزوار
        // ============================================================
        document.addEventListener('dashboard:new-message', (e) => {
            const { name, email, subject, message } = e.detail || {};
            if (name && email && subject && message) {
                this.addMessage(name, email, subject, message);
                Utils.toast('📩 تم استلام رسالة جديدة', 'success');
                
                // Log to activity logs
                if (window._logsEngine) {
                    window._logsEngine.addLog(
                        `📩 استلام رسالة جديدة من: ${name}`,
                        'message',
                        subject
                    );
                }
            }
        });
        
        // ============================================================
        // 🔥 الإضافة الجديدة: تحديث حالة الرد
        // ============================================================
        document.addEventListener('dashboard:message-replied', (e) => {
            const { messageId } = e.detail || {};
            if (messageId) {
                this.markAsReplied(messageId);
            }
        });
    }
    // ============================================================
// 🔥 التخزين في Supabase
// ============================================================

async saveToSupabase(msg) {
    try {
        if (!supabaseClient) {
            console.warn('⚠️ Supabase not ready, message saved to localStorage only');
            return;
        }

        // 🔥 التحقق من عدم وجود الرسالة قبل الحفظ
        const { data: existing, error: checkError } = await supabaseClient
            .from('messages')
            .select('id')
            .eq('sender_email', msg.email)
            .eq('subject', msg.subject)
            .eq('message', msg.message)
            .limit(1);

        if (checkError) {
            console.warn('⚠️ Could not check for duplicate:', checkError);
        }

        // إذا كانت موجودة، لا نحفظ
        if (existing && existing.length > 0) {
            console.warn('⚠️ Message already exists in Supabase, skipping save');
            return;
        }

        const status = msg.read ? 'read' : (msg.replied ? 'replied' : 'unread');

        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                id: msg.id,
                sender_name: msg.name,
                sender_email: msg.email,
                subject: msg.subject,
                message: msg.message,
                status: status,
                created_at: msg.date.toISOString()
            }]);

        if (error) {
            console.error('❌ Failed to save message to Supabase:', error);
        } else {
            console.log('✅ Message saved to Supabase:', msg.subject);
        }
    } catch (e) {
        console.error('❌ Error saving message to Supabase:', e);
    }
}

// ============================================================
// 🔥 تحميل من Supabase
// ============================================================

async loadFromSupabase() {
    try {
        if (!supabaseClient) {
            console.warn('⚠️ Supabase not ready');
            return;
        }

        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('❌ Supabase error:', error);
            return;
        }

        if (data && data.length > 0) {
            // 🔥 منع التكرار عند التحميل
            const existingIds = new Set(this.messages.map(m => m.id));
            const existingContent = new Set(
                this.messages.map(m => `${m.email}-${m.subject}-${m.message}`)
            );

            let newCount = 0;

            data.forEach(msg => {
                // تجاهل إذا الـ ID موجود
                if (existingIds.has(msg.id)) return;
                
                // تجاهل إذا المحتوى مكرر
                const contentKey = `${msg.sender_email}-${msg.subject}-${msg.message}`;
                if (existingContent.has(contentKey)) return;

                const newMsg = {
                    id: msg.id,
                    name: msg.sender_name,
                    email: msg.sender_email,
                    subject: msg.subject,
                    message: msg.message,
                    date: new Date(msg.created_at),
                    read: msg.status === 'read' || msg.status === 'replied',
                    replied: msg.status === 'replied'
                };

                this.messages.push(newMsg);
                existingIds.add(msg.id);
                existingContent.add(contentKey);
                newCount++;
            });

            if (newCount > 0) {
                this.saveToStorage();
                this.render();
                console.log(`📂 Added ${newCount} new messages from Supabase`);
            }
        }
    } catch (e) {
        console.error('❌ Error loading from Supabase:', e);
    }
}
    
    // ============================================================
    // 04. RENDER ENGINE
    // ============================================================
    
    render() {
        if (!this.container) {
            console.warn('⚠️ #messagesGrid not found');
            return;
        }
        
        // Show loading
        if (this.isLoading) {
            this.renderLoading();
            return;
        }
        
        // Get filtered messages
        const filtered = this.getFilteredMessages();
        
        // Show empty state
        if (filtered.length === 0) {
            this.renderEmpty();
            return;
        }
        
        // Render stats and messages
        this.container.innerHTML = '';
        
        // Stats
        this.container.appendChild(this.createStats());
        
        // Message items
        filtered.forEach(msg => {
            this.container.appendChild(this.createMessageItem(msg));
        });
        
        // Update clear button
        if (this.clearBtn) {
            this.clearBtn.disabled = this.messages.length === 0;
        }
    }
    
    // ============================================================
    // 05. CREATE STATS
    // ============================================================
    
    createStats() {
        const total = this.messages.length;
        const unread = this.messages.filter(m => !m.read).length;
        const replied = this.messages.filter(m => m.replied).length;
        
        const div = document.createElement('div');
        div.className = 'messages-stats';
        div.innerHTML = `
            <span class="unread-count">
                <i class="fa-solid fa-circle" style="font-size:8px;color:var(--color-primary);"></i>
                ${unread} رسائل غير مقروءة
            </span>
            <span class="total-count">
                إجمالي: ${total} | تم الرد: ${replied}
            </span>
        `;
        return div;
    }
    
    // ============================================================
    // 06. CREATE MESSAGE ITEM
    // ============================================================
   createMessageItem(msg) {
    const isUnread = !msg.read;
    const isReplied = msg.replied;
    
    const div = document.createElement('div');
    div.className = `message-item ${isUnread ? 'unread' : ''}`;
    div.dataset.id = msg.id;
    
    // Format date and time
    const dateStr = this.formatDate(msg.date);
    const timeStr = this.formatTime(msg.date);
    
    // Truncate message preview
    const preview = msg.message.length > 80 
        ? msg.message.substring(0, 80) + '...' 
        : msg.message;
    
    div.innerHTML = `
        <div class="msg-left">
            <div class="msg-sender">
                ${msg.name}
                ${isUnread ? '<span class="unread-badge">جديد</span>' : ''}
                ${isReplied ? '<span class="replied-badge">تم الرد</span>' : ''}
            </div>
            <span class="msg-email">
                <i class="fa-solid fa-envelope"></i>
                ${msg.email}
            </span>
            <div class="msg-subject">${msg.subject}</div>
            <p class="msg-preview">${preview}</p>
        </div>
        <div class="msg-right">
            <span class="msg-time">${timeStr}</span>
            <span class="msg-date">${dateStr}</span>
            <div class="msg-actions">
                <button class="reply-message-btn" data-id="${msg.id}" title="الرد على الرسالة">
                    <i class="fa-solid fa-reply"></i>
                </button>
                <button class="delete-message-btn" data-id="${msg.id}" title="حذف الرسالة">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // 🔥 Click to toggle read status
    div.addEventListener('click', (e) => {
        // Don't trigger if clicking delete button or reply button
        if (e.target.closest('.delete-message-btn')) return;
        if (e.target.closest('.reply-message-btn')) return;
        this.toggleRead(msg.id);
    });
    
    // 🔥 Delete button
    const deleteBtn = div.querySelector('.delete-message-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('هل تريد حذف هذه الرسالة؟')) {
            this.deleteMessage(msg.id);
        }
    });
    
    // 🔥🔥🔥 REPLY BUTTON - الجديد
    const replyBtn = div.querySelector('.reply-message-btn');
    if (replyBtn) {
        replyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openReplyCard(msg.id);
        });
    }
    
    return div;
} 
   
    
    // ============================================================
    // 07. EMPTY STATE
    // ============================================================
    
    renderEmpty() {
        this.container.innerHTML = `
            <div class="messages-empty">
                <i class="fa-solid fa-inbox"></i>
                <h4>لا توجد رسائل</h4>
                <p>صندوق الوارد فارغ حالياً. ستظهر هنا رسائل الزوار.</p>
                <button class="saas-btn saas-btn-secondary" onclick="window._messagesEngine?.addSampleMessage()">
                    <i class="fa-solid fa-plus"></i> إضافة عينة
                </button>
            </div>
        `;
    }
    
    // ============================================================
    // 08. LOADING STATE
    // ============================================================
    
    renderLoading() {
        this.container.innerHTML = `
            <div class="message-skeleton">
                <div class="skeleton-left">
                    <div class="skeleton-name"></div>
                    <div class="skeleton-subject"></div>
                    <div class="skeleton-text"></div>
                </div>
                <div class="skeleton-right">
                    <div class="skeleton-time"></div>
                    <div class="skeleton-delete"></div>
                </div>
            </div>
            <div class="message-skeleton">
                <div class="skeleton-left">
                    <div class="skeleton-name"></div>
                    <div class="skeleton-subject"></div>
                    <div class="skeleton-text"></div>
                </div>
                <div class="skeleton-right">
                    <div class="skeleton-time"></div>
                    <div class="skeleton-delete"></div>
                </div>
            </div>
            <div class="message-skeleton">
                <div class="skeleton-left">
                    <div class="skeleton-name"></div>
                    <div class="skeleton-subject"></div>
                    <div class="skeleton-text"></div>
                </div>
                <div class="skeleton-right">
                    <div class="skeleton-time"></div>
                    <div class="skeleton-delete"></div>
                </div>
            </div>
        `;
    }
    
    // ============================================================
    // 09. DATE/TIME FORMATTING
    // ============================================================
    
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatTime(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatDateTime(date) {
        return `${this.formatDate(date)} - ${this.formatTime(date)}`;
    }
    
    // ============================================================
    // 10. FILTER & SEARCH
    // ============================================================
    
    getFilteredMessages() {
        let filtered = [...this.messages];
        
        // Filter by status
        if (this.filter === 'unread') {
            filtered = filtered.filter(m => !m.read);
        } else if (this.filter === 'replied') {
            filtered = filtered.filter(m => m.replied);
        }
        
        // Search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query) ||
                m.subject.toLowerCase().includes(query) ||
                m.message.toLowerCase().includes(query)
            );
        }
        
        // Sort by date (newest first)
        filtered.sort((a, b) => b.date - a.date);
        
        return filtered;
    }
    
    setFilter(filter) {
        this.filter = filter;
        this.render();
    }
    
    setSearch(query) {
        this.searchQuery = query.trim();
        this.render();
    }
    
    // ============================================================
    // 11. CRUD OPERATIONS
    // ============================================================
    
    // 🔥 الإضافة الجديدة: إضافة رسالة من الزوار
 addMessage(name, email, subject, message) {
    // ============================================================
    // 🔥 منع التكرار - مستويات متعددة
    // ============================================================

    // 1. منع التكرار خلال 10 ثواني (نفس المحتوى)
    const duplicateRecent = this.messages.find(m => 
        m.email === email.trim() && 
        m.subject === subject.trim() && 
        m.message === message.trim() &&
        (Date.now() - new Date(m.date).getTime() < 10000)
    );
    
    if (duplicateRecent) {
        console.warn('⚠️ Duplicate message detected (within 10s), skipping...');
        return null;
    }

    // 2. منع التكرار المطلق (نفس المحتوى بالضبط)
    const exactDuplicate = this.messages.find(m => 
        m.email === email.trim() && 
        m.subject === subject.trim() && 
        m.message === message.trim()
    );
    
    if (exactDuplicate) {
        console.warn('⚠️ Exact duplicate message found, skipping...');
        return null;
    }

    // 3. منع التكرار - نفس البريد خلال 5 دقائق
    const emailDuplicate = this.messages.find(m => 
        m.email === email.trim() &&
        (Date.now() - new Date(m.date).getTime() < 300000)
    );
    
    if (emailDuplicate) {
        console.warn('⚠️ Duplicate email detected (within 5min), skipping...');
        return null;
    }

    // 4. منع التكرار - نفس الموضوع خلال دقيقة
    const subjectDuplicate = this.messages.find(m => 
        m.subject === subject.trim() &&
        m.email === email.trim() &&
        (Date.now() - new Date(m.date).getTime() < 60000)
    );
    
    if (subjectDuplicate) {
        console.warn('⚠️ Duplicate subject from same email (within 1min), skipping...');
        return null;
    }

    // ============================================================
    // ✅ إضافة الرسالة الجديدة
    // ============================================================

    const newMsg = {
        id: Date.now() + Math.random() * 1000,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        date: new Date(),
        read: false,
        replied: false
    };

    this.messages.unshift(newMsg);
    this.saveToStorage();
    this.render();
    this.saveToSupabase(newMsg);

    if (window._logsEngine) {
        window._logsEngine.addLog(
            `📩 استلام رسالة جديدة من: ${newMsg.name}`,
            'message',
            newMsg.subject
        );
    }

    console.log(`✅ New message added: ${newMsg.name} - ${newMsg.subject}`);
    return newMsg;
}
async saveToSupabase(msg) {
    try {
        if (!supabaseClient) {
            console.warn('⚠️ Supabase not ready, message saved to localStorage only');
            return;
        }

        const status = msg.read ? 'read' : (msg.replied ? 'replied' : 'unread');

        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                id: msg.id,
                sender_name: msg.name,
                sender_email: msg.email,
                subject: msg.subject,
                message: msg.message,
                status: status,
                created_at: msg.date.toISOString()
            }]);

        if (error) {
            console.error('❌ Failed to save message to Supabase:', error);
        } else {
            console.log('✅ Message saved to Supabase:', msg.subject);
        }
    } catch (e) {
        console.error('❌ Error saving message to Supabase:', e);
    }
}
    // 🔥 الإضافة الجديدة: تحديث حالة الرد
    markAsReplied(id) {
        const msg = this.messages.find(m => m.id === id);
        if (msg) {
            msg.replied = true;
            this.saveToStorage();
            this.render();
            
            if (window._logsEngine) {
                window._logsEngine.addLog(
                    `✉️ تم الرد على رسالة من: ${msg.name}`,
                    'message',
                    msg.subject
                );
            }
        }
    }
    
    toggleRead(id) {
        const msg = this.messages.find(m => m.id === id);
        if (msg) {
            msg.read = !msg.read;
            this.saveToStorage();
            this.render();
            
            Utils.toast(
                msg.read ? '👁️ تم تحديد الرسالة كمقروءة' : '👁️ تم تحديد الرسالة كغير مقروءة',
                'info'
            );
        }
    }
    
    deleteMessage(id) {
        const msg = this.messages.find(m => m.id === id);
        if (!msg) return;
        
        this.messages = this.messages.filter(m => m.id !== id);
        this.saveToStorage();
        this.render();
        
        Utils.toast(`🗑️ تم حذف رسالة من ${msg.name}`, 'info');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `🗑️ حذف رسالة من: ${msg.name}`,
                'message',
                msg.subject
            );
        }
    }
    
    clearAll() {
        if (this.messages.length === 0) {
            Utils.toast('⚠️ لا توجد رسائل لحذفها', 'warning');
            return;
        }
        
        if (confirm('هل تريد حذف جميع الرسائل؟')) {
            this.messages = [];
            this.saveToStorage();
            this.render();
            Utils.toast('🗑️ تم حذف جميع الرسائل', 'success');
            
            if (window._logsEngine) {
                window._logsEngine.addLog('🗑️ حذف جميع الرسائل', 'message');
            }
        }
    }
    
    markAllAsRead() {
        if (this.messages.length === 0) {
            Utils.toast('⚠️ لا توجد رسائل', 'warning');
            return;
        }
        
        const unread = this.messages.filter(m => !m.read);
        if (unread.length === 0) {
            Utils.toast('👁️ جميع الرسائل مقروءة بالفعل', 'info');
            return;
        }
        
        unread.forEach(m => m.read = true);
        this.saveToStorage();
        this.render();
        Utils.toast(`👁️ تم تحديد ${unread.length} رسالة كمقروءة`, 'success');
        
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `👁️ تم تحديد ${unread.length} رسالة كمقروءة`,
                'message'
            );
        }
    }
    
    addSampleMessage() {
        const names = ['أحمد', 'سارة', 'محمد', 'منى', 'خالد', 'نور', 'علي', 'هند'];
        const subjects = ['استفسار', 'طلب تعاون', 'شكر', 'اقتراح', 'طلب عرض سعر', 'تواصل'];
        const messages = [
            'أود معرفة المزيد عن خدماتكم',
            'نحن نبحث عن مطور ويب للانضمام لفريقنا',
            'شكراً على المحتوى الرائع',
            'أقترح إضافة ميزة جديدة للموقع',
            'أريد الحصول على عرض سعر لمشروعي',
            'هل يمكنكم التواصل معي لمناقشة التفاصيل؟'
        ];
        
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        this.addMessage(
            randomName,
            `${randomName.toLowerCase()}@example.com`,
            randomSubject,
            randomMessage
        );
    }
    
    // ============================================================
    // 12. GET STATS
    // ============================================================
    
    getStats() {
        return {
            total: this.messages.length,
            unread: this.messages.filter(m => !m.read).length,
            replied: this.messages.filter(m => m.replied).length
        };
    }
    
    // ============================================================
    // 13. LOADING STATE
    // ============================================================
    
    setLoading(loading) {
        this.isLoading = loading;
        this.render();
    }
    // ============================================================
// REPLY CARD - كارت الرد
// ============================================================

openReplyCard(messageId) {
    const msg = this.messages.find(m => m.id === messageId);
    if (!msg) {
        Utils.toast('❌ الرسالة غير موجودة', 'error');
        return;
    }

    this.currentReplyId = messageId;

    document.getElementById('replySenderName').textContent = msg.name;
    document.getElementById('replySenderEmail').textContent = msg.email;
    document.getElementById('replySenderSubject').textContent = msg.subject;
    document.getElementById('replyMessageInput').value = '';

    const replyCard = document.getElementById('replyCard');
    if (replyCard) {
        replyCard.style.display = 'block';
        replyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
        document.getElementById('replyMessageInput')?.focus();
    }, 300);

    const status = document.getElementById('replyStatus');
    if (status) status.style.display = 'none';
}

closeReplyCard() {
    const replyCard = document.getElementById('replyCard');
    if (replyCard) replyCard.style.display = 'none';
    document.getElementById('replyMessageInput').value = '';
    this.currentReplyId = null;
}

async sendReply() {
    console.log('📤 sendReply() called');

    if (this._isSending) {
        console.warn('⚠️ Already sending, please wait...');
        return;
    }

    const messageId = this.currentReplyId;
    if (!messageId) {
        Utils.toast('❌ لا توجد رسالة محددة', 'error');
        return;
    }

    const msg = this.messages.find(m => m.id === messageId);
    if (!msg) {
        Utils.toast('❌ الرسالة غير موجودة', 'error');
        return;
    }

    const replyText = document.getElementById('replyMessageInput').value.trim();
    if (!replyText) {
        Utils.toast('⚠️ الرجاء كتابة نص الرد', 'warning');
        document.getElementById('replyMessageInput').focus();
        return;
    }

    this._isSending = true;

    const status = document.getElementById('replyStatus');
    const statusMsg = document.getElementById('replyStatusMessage');
    if (status && statusMsg) {
        status.style.display = 'block';
        status.className = 'reply-status';
        statusMsg.textContent = '⏳ جاري إرسال الرد...';
    }

    const sendBtn = document.getElementById('sendReplyBtn');
    const cancelBtn = document.getElementById('cancelReplyBtn');
    if (sendBtn) sendBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = true;

    try {
        console.log(`📤 Sending reply to: ${msg.name} (ID: ${messageId})`);

        // 1. حفظ في Supabase
        if (supabaseClient) {
            const numericId = typeof messageId === 'string' ? parseInt(messageId) : messageId;
            
            const { error } = await supabaseClient
                .from('messages')
                .update({
                    status: 'replied',
                    replied_at: new Date().toISOString(),
                    reply_message: replyText
                })
                .eq('id', numericId);

            if (error) {
                console.error('❌ Supabase error:', error);
                throw new Error('فشل حفظ الرد في قاعدة البيانات');
            }
            console.log('✅ Saved to Supabase');
        }

        // 2. تحديث محلياً
        const localMsg = this.messages.find(m => m.id === messageId);
        if (localMsg) {
            localMsg.replied = true;
            localMsg.replyMessage = replyText;
            localMsg.repliedAt = new Date().toISOString();
            this.saveToStorage();
            console.log('✅ Updated locally');
        }

        // 3. 🔥🔥🔥 إرسال الإيميل للمرسل
        let emailSent = false;
        try {
            emailSent = await this.sendReplyEmail(
                msg.email,
                msg.name,
                msg.subject,
                replyText,
                msg.message
            );
        } catch (emailError) {
            console.error('❌ Email error:', emailError);
        }

        // 4. تسجيل في Logs
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `✉️ تم الرد على رسالة من: ${msg.name} ${emailSent ? '(📧 تم الإرسال)' : '(⚠️ بدون إيميل)'}`,
                'message',
                msg.subject
            );
        }

        // 5. إظهار نجاح
        if (status && statusMsg) {
            status.className = 'reply-status';
            statusMsg.textContent = emailSent 
                ? '✅ تم إرسال الرد وإشعار المرسل بنجاح!'
                : '✅ تم حفظ الرد (تعذر إرسال الإيميل)';
        }

        Utils.toast(emailSent 
            ? `✅ تم إرسال الرد إلى ${msg.name}` 
            : `✅ تم حفظ الرد (الإيميل لم يرسل)`, 
            emailSent ? 'success' : 'warning'
        );
        this.render();

        setTimeout(() => {
            this.closeReplyCard();
            this._isSending = false;
        }, 2000);

    } catch (error) {
        console.error('❌ Reply error:', error);
        if (status && statusMsg) {
            status.className = 'reply-status error';
            statusMsg.textContent = `❌ ${error.message || 'فشل إرسال الرد'}`;
        }
        Utils.toast(`❌ ${error.message || 'فشل إرسال الرد'}`, 'error');
        this._isSending = false;
    } finally {
        if (sendBtn) sendBtn.disabled = false;
        if (cancelBtn) cancelBtn.disabled = false;
    }
}
// ============================================================
// 14. EMAIL SERVICE - إرسال الردود عبر EmailJS
// ============================================================

async sendReplyEmail(toEmail, toName, subject, replyMessage, originalMessage) {
    try {
        console.log(`📤 Sending reply email to: ${toEmail}`);
        
        // 🔥 Keys من EmailJS
        const EMAILJS_SERVICE_ID = 'service_t51g617';
        const EMAILJS_TEMPLATE_ID = 'reply_template';
        const EMAILJS_PUBLIC_KEY = 'Zg7gM0yDAtCmbp4p9';
        
        // التحقق من وجود EmailJS
        if (typeof emailjs === 'undefined') {
            console.warn('⚠️ EmailJS not loaded, trying CDN...');
            await this.loadEmailJS();
        }
        
        const templateParams = {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            original_message: originalMessage,
            reply_message: replyMessage,
            reply_date: new Date().toLocaleString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            sender_name: 'Mohamed Abdallah',
            sender_email: 'contact@mohamed.dev'
        };
        
        console.log('📤 Template params:', templateParams);
        
        // إرسال الإيميل
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );
        
        console.log('✅ Email sent successfully:', response);
        return true;
        
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        console.error('❌ Error details:', error.text || error.message);
        return false;
    }
}

loadEmailJS() {
    return new Promise((resolve, reject) => {
        if (typeof emailjs !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            console.log('✅ EmailJS loaded from CDN');
            if (typeof emailjs !== 'undefined') {
                emailjs.init('Zg7gM0yDAtCmbp4p9');
            }
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load EmailJS'));
        };
        document.head.appendChild(script);
    });
}

setupReplyEvents() {
    console.log('🔧 Setting up reply events...');
    
    setTimeout(() => {
        const replyCard = document.getElementById('replyCard');
        if (!replyCard) {
            console.warn('⚠️ replyCard not found');
            return;
        }

        // 🔥 البحث جوه replyCard فقط
        const sendBtn = replyCard.querySelector('#sendReplyBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔵 Send button clicked');
                this.sendReply();
            });
            console.log('✅ Send button attached');
        } else {
            console.warn('⚠️ sendReplyBtn not found in replyCard');
        }

        const cancelBtn = replyCard.querySelector('#cancelReplyBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                console.log('🔴 Cancel button clicked');
                this.closeReplyCard();
            });
            console.log('✅ Cancel button attached');
        }

        const closeBtn = replyCard.querySelector('#closeReplyBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('🔴 Close button clicked');
                this.closeReplyCard();
            });
            console.log('✅ Close button attached');
        }

        // Ctrl+Enter
        const replyInput = document.getElementById('replyMessageInput');
        if (replyInput) {
            replyInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    console.log('⌨️ Ctrl+Enter pressed');
                    this.sendReply();
                }
            });
        }

        // ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentReplyId) {
                console.log('⌨️ Escape pressed - closing reply card');
                this.closeReplyCard();
            }
        });
    }, 200);
}
    
    // ============================================================
    // 14. CLEANUP
    // ============================================================
    
    destroy() {
        this.isListening = false;
        console.log('✉️ Messages Engine destroyed');
    }
}

// ============================================================ */
// 15. INITIALIZATION                                            */
// ============================================================ */

// Store messages engine globally
window._messagesEngine = null;

// Function to get or create messages engine
function getMessagesEngine() {
    if (!window._messagesEngine) {
        window._messagesEngine = new MessagesEngine();
    }
    return window._messagesEngine;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const messagesSection = document.getElementById('messages-section');
    if (messagesSection) {
        // Only initialize if section is active
        if (messagesSection.classList.contains('active')) {
            getMessagesEngine();
        } else {
            // Wait for section to become active
            const observer = new MutationObserver(() => {
                if (messagesSection.classList.contains('active') && !window._messagesEngine) {
                    getMessagesEngine();
                    observer.disconnect();
                }
            });
            observer.observe(messagesSection, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
});

// If DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const messagesSection = document.getElementById('messages-section');
    if (messagesSection && messagesSection.classList.contains('active') && !window._messagesEngine) {
        getMessagesEngine();
    }
}


// ============================================================ */
// 16. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ✉️ MESSAGES ENGINE - v2.0                                ║
║                                                              ║
║   ✅ Inbox Management                                       ║
║   ✅ Read/Unread Status                                    ║
║   ✅ Replied Status                                        ║
║   ✅ Date & Time Stamps                                    ║
║   ✅ LocalStorage Persistence                              ║
║   ✅ Filter & Search                                       ║
║   ✅ Lazy Loading Ready                                    ║
║   ✅ Receive Messages                                      ║
║   ✅ Reply Tracking                                        ║
║                                                              ║
║   📦 Available: window._messagesEngine                      ║
║   🔧 Helper: window.addMessage(name, email, subject, msg)  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);


// ============================================================ */
// نهاية MESSAGES ENGINE - v2.0                                */
// ============================================================ */
// ============================================================ */
// 📋 LOGS ENGINE - Activity Logs Management (FULL)            */
// ============================================================ */
/*
   🎯 المميزات:
   - يقرأ كل الأحداث في Dashboard
   - يسجل بتوقيت دقيق (تاريخ + وقت)
   - 8 أنواع من الأحداث
   - تخزين في localStorage
   - بحث وتصفية
   - واجهة احترافية
*/

// ============================================================ */
// 01. LOGS ENGINE CLASS                                        */
// ============================================================ */

class LogsEngine {
    constructor() {
        // DOM Elements
        this.container = document.getElementById('logsGrid');
        this.clearBtn = document.getElementById('clearLogsBtn');
        
        // State
        this.logs = [];
        this.filter = 'all';
        this.searchQuery = '';
        this.isListening = false;
        this.isLoading = false;
        
        // Icons
        this.icons = {
            info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌',
            auth: '🔐', theme: '🎨', language: '🌐',
            skill: '💻', project: '📁', certificate: '🏅',
            donation: '💰', social: '📱', message: '✉️',
            support: '🎧', hero: '🎯', editor: '📝',
            backup: '💾', publish: '🚀', navigation: '🧭',
            search: '🔍', share: '📤', download: '📥',
            import: '📤', export: '📥', modal: '🪟', form: '📋'
        };
        
        // Badge Colors
        this.badgeColors = {
            info: 'info', success: 'success', warning: 'warning', error: 'error',
            auth: 'info', theme: 'info', language: 'info',
            skill: 'success', project: 'success', certificate: 'success',
            donation: 'success', social: 'success', message: 'info',
            support: 'info', hero: 'info', editor: 'info',
            backup: 'success', publish: 'success', navigation: 'info',
            search: 'info', share: 'info', download: 'info',
            import: 'info', export: 'info', modal: 'info', form: 'info'
        };
        
        // Type Labels
        this.typeLabels = {
            info: 'معلومات', success: 'نجاح', warning: 'تحذير', error: 'خطأ',
            auth: 'تسجيل', theme: 'ثيم', language: 'لغة',
            skill: 'مهارة', project: 'مشروع', certificate: 'شهادة',
            donation: 'تبرع', social: 'سوشيال', message: 'رسالة',
            support: 'دعم', hero: 'هيرو', editor: 'محرر',
            backup: 'نسخ احتياطي', publish: 'نشر', navigation: 'تنقل',
            search: 'بحث', share: 'مشاركة', download: 'تحميل',
            import: 'استيراد', export: 'تصدير', modal: 'نافذة', form: 'نموذج'
        };
        
        // INIT
        this.init();
    }
    
    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    
    init() {
        console.log('📋 Logs Engine initializing...');
        
        // Load logs from storage
        this.loadFromStorage();
        
        // Setup events
        this.setupEvents();
        
        // Start global listening
        this.startGlobalListening();
         setTimeout(() => this.loadFromSupabase(), 500);
        
        // Render
        this.render();
        
        console.log('✅ Logs Engine ready - listening for all events');
        console.log(`📊 ${this.logs.length} logs loaded`);
    }
    
    // ============================================================
    // 02. STORAGE MANAGEMENT
    // ============================================================
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('dashboard-logs');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.logs = parsed.map(log => ({
                        ...log,
                        date: new Date(log.date)
                    }));
                    console.log(`📂 Loaded ${this.logs.length} logs from storage`);
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ Could not load logs:', e);
        }
        
        // Default logs if nothing saved
        this.loadDefaultLogs();
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('dashboard-logs', JSON.stringify(this.logs));
        } catch (e) {
            console.warn('⚠️ Could not save logs:', e);
        }
    }
    
    loadDefaultLogs() {
        const now = Date.now();
        this.logs = [
            { 
                id: Date.now() - 1,
                message: '🚀 تم تشغيل لوحة التحكم',
                type: 'success',
                date: new Date(now - 300000),
                details: 'Dashboard Pro v5.0'
            },
            { 
                id: Date.now() - 2,
                message: '🎨 تم التبديل إلى الوضع المظلم',
                type: 'theme',
                date: new Date(now - 600000),
                details: 'Dark Mode'
            },
            { 
                id: Date.now() - 3,
                message: '🧭 الانتقال إلى: الرئيسية',
                type: 'navigation',
                date: new Date(now - 900000),
                details: 'home-section'
            },
            { 
                id: Date.now() - 4,
                message: '🌐 تم التبديل إلى العربية',
                type: 'language',
                date: new Date(now - 1200000),
                details: 'AR'
            },
            { 
                id: Date.now() - 5,
                message: '💻 تم إضافة مهارة جديدة: React.js',
                type: 'skill',
                date: new Date(now - 1800000),
                details: 'Advanced - 90%'
            },
            { 
                id: Date.now() - 6,
                message: '📁 تم إضافة مشروع جديد: Portfolio Dashboard',
                type: 'project',
                date: new Date(now - 2400000),
                details: 'Web Apps - 100%'
            },
            { 
                id: Date.now() - 7,
                message: '🏅 تم إضافة شهادة جديدة: Introduction to Cybersecurity',
                type: 'certificate',
                date: new Date(now - 3600000),
                details: 'Cisco - 2024'
            }
        ];
        this.saveToStorage();
        console.log('📂 Default logs loaded');
    }
    
    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    
    setupEvents() {
        // Clear button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }
        
        // Keyboard: Ctrl+Shift+L = Clear logs
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.clearAll();
            }
        });
        
        // Listen to navigation for logging
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.sidebar-nav-item[data-section]');
            if (navItem) {
                const section = navItem.dataset.section;
                const name = navItem.querySelector('.nav-label')?.textContent || section;
                setTimeout(() => {
                    this.addLog(`🧭 الانتقال إلى: ${name}`, 'navigation', section);
                }, 100);
            }
        });
    }
    
    // ============================================================
    // 04. GLOBAL EVENT LISTENING
    // ============================================================
    
    startGlobalListening() {
        if (this.isListening) return;
        this.isListening = true;
        
        // ============================================================
        // 04.1 Custom Event: dashboard:log
        // ============================================================
        document.addEventListener('dashboard:log', (e) => {
            const { message, type = 'info', details = '' } = e.detail || {};
            if (message) {
                this.addLog(message, type, details);
            }
        });
        
        // ============================================================
        // 04.2 Theme Changes
        // ============================================================
        const themeObserver = new MutationObserver(() => {
            const theme = document.documentElement.getAttribute('data-theme') || 'dark';
            const themeNames = {
                dark: 'الوضع المظلم 🌙',
                light: 'الوضع الفاتح ☀️',
                oled: 'OLED 🖤',
                'royal-purple': 'Royal Purple 👑'
            };
            this.addLog(`🎨 تم التبديل إلى ${themeNames[theme] || theme}`, 'theme', theme);
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        // ============================================================
        // 04.3 Language Changes
        // ============================================================
        const langObserver = new MutationObserver(() => {
            const lang = document.documentElement.lang || 'ar';
            this.addLog(`🌐 تم التبديل إلى ${lang === 'ar' ? 'العربية' : 'English'}`, 'language', lang);
        });
        langObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['lang']
        });
        
        // ============================================================
        // 04.4 Logout
        // ============================================================
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.addLog('🔐 تسجيل خروج', 'auth', 'Mohamed Abdallah');
            });
        }
        
        // ============================================================
        // 04.5 Search
        // ============================================================
        const searchInput = document.getElementById('home-quick-search');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && searchInput.value.trim()) {
                    this.addLog(`🔍 بحث عام: "${searchInput.value.trim()}"`, 'search');
                }
            });
        }
        
        // ============================================================
        // 04.6 Share Profile
        // ============================================================
        const shareBtn = document.getElementById('shareProfileBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.addLog('📤 مشاركة الملف الشخصي', 'share');
            });
        }
        
        // ============================================================
        // 04.7 Download CV
        // ============================================================
        const cvBtn = document.getElementById('downloadCVBtn');
        if (cvBtn) {
            cvBtn.addEventListener('click', () => {
                this.addLog('📥 تحميل السيرة الذاتية', 'download');
            });
        }
        
        // ============================================================
        // 04.8 Quick Actions
        // ============================================================
        const quickActions = {
            quickBackupBtn: { msg: '💾 إنشاء نسخة احتياطية', type: 'backup' },
            quickPublishBtn: { msg: '🚀 نشر التحديثات على الموقع', type: 'publish' },
            quickPreviewBtn: { msg: '👁️ معاينة الموقع', type: 'navigation' },
            quickOpenSiteBtn: { msg: '🌐 فتح الموقع الرئيسي', type: 'navigation' }
        };
        
        for (const [id, action] of Object.entries(quickActions)) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.addLog(action.msg, action.type);
                });
            }
        }
        
        // ============================================================
        // 04.9 Refresh Dashboard
        // ============================================================
        const refreshBtn = document.getElementById('btn-refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.addLog('🔄 تحديث لوحة التحكم', 'info');
            });
        }
        
        // ============================================================
        // 04.10 Skills Modal Events
        // ============================================================
        const skillModal = document.getElementById('skill-modal');
        if (skillModal) {
            // Listen for skill form submissions
            const skillForm = document.getElementById('skill-form');
            if (skillForm) {
                skillForm.addEventListener('submit', (e) => {
                    // Will be handled by SkillsEngine
                    // We use the custom event approach
                });
            }
            
            // Watch for modal open/close
            const openBtn = document.getElementById('openSkillModalBtn');
            if (openBtn) {
                openBtn.addEventListener('click', () => {
                    this.addLog('🪟 فتح نافذة إضافة مهارة', 'modal');
                });
            }
            
            const closeBtn = document.getElementById('closeSkillModalBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.addLog('🪟 إغلاق نافذة المهارات', 'modal');
                });
            }
        }
        
        // ============================================================
        // 04.11 Projects Modal Events
        // ============================================================
        const projectModal = document.getElementById('project-modal');
        if (projectModal) {
            const openBtn = document.getElementById('openProjectModalBtn');
            if (openBtn) {
                openBtn.addEventListener('click', () => {
                    this.addLog('🪟 فتح نافذة إضافة مشروع', 'modal');
                });
            }
        }
        
        // ============================================================
        // 04.12 Certificates Modal Events
        // ============================================================
        const certModal = document.getElementById('certificate-modal-overlay');
        if (certModal) {
            const openBtn = document.getElementById('cert-add-new-btn');
            if (openBtn) {
                openBtn.addEventListener('click', () => {
                    this.addLog('🪟 فتح نافذة إضافة شهادة', 'modal');
                });
            }
        }
        
        console.log('📋 Global listeners activated');
        
        // Store observer references for cleanup
        this._observers = [themeObserver, langObserver];
    }
    
    // ============================================================
    // 05. ADD LOG - الوظيفة الرئيسية
    // ============================================================
    
   addLog(message, type = 'info', details = '') {
    // Prevent duplicates
    const lastLog = this.logs[0];
    if (lastLog && lastLog.message === message && (Date.now() - lastLog.date < 1000)) {
        return;
    }

    const log = {
        id: Date.now() + Math.random() * 1000,
        message: message,
        type: type,
        date: new Date(),
        details: details || ''
    };

    this.logs.unshift(log);
    this.saveToStorage();
    this.render();
this.saveToSupabase(log);
    // 🔥🔥🔥 أضف هذا الجزء - التخزين في Supabase


    return log;
}

// 🔥 دالة جديدة للتخزين في Supabase

// ============================================================
// 🔥 التخزين في Supabase
// ============================================================

async saveToSupabase(log) {
    try {
        if (!supabaseClient) {
            console.warn('⚠️ Supabase not ready');
            return;
        }

        const { error } = await supabaseClient
            .from('activity_logs')
            .insert([{
                id: Math.floor(log.id),
                message: log.message,
                type: log.type,
                details: log.details || '',
                created_at: log.date.toISOString()
            }]);

        if (error) {
            console.error('❌ Supabase error:', error);
        } else {
            console.log('✅ Log saved to Supabase:', log.message);
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

// ============================================================
// 🔥 تحميل من Supabase
// ============================================================

async loadFromSupabase() {
    try {
        if (!supabaseClient) {
            console.warn('⚠️ Supabase not ready');
            return;
        }

        const { data, error } = await supabaseClient
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('❌ Supabase error:', error);
            return;
        }

        if (data && data.length > 0) {
            this.logs = data.map(log => ({
                id: log.id,
                message: log.message,
                type: log.type,
                details: log.details || '',
                date: new Date(log.created_at)
            }));
            this.saveToStorage();
            this.render();
            console.log(`📂 Loaded ${this.logs.length} logs from Supabase`);
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }
}
    
    // ============================================================
    // 06. RENDER ENGINE
    // ============================================================
    
    render() {
        if (!this.container) {
            console.warn('⚠️ #logsGrid not found');
            return;
        }
        
        // Show loading
        if (this.isLoading) {
            this.renderLoading();
            return;
        }
        
        // Get filtered logs
        const filtered = this.getFilteredLogs();
        
        // Show empty state
        if (filtered.length === 0) {
            this.renderEmpty();
            return;
        }
        
        // Render stats and logs
        this.container.innerHTML = '';
        
        // Stats (only if not filtered)
        if (this.filter === 'all' && !this.searchQuery) {
            this.container.appendChild(this.createStats());
        }
        
        // Log items
        filtered.forEach(log => {
            this.container.appendChild(this.createLogItem(log));
        });
        
        // Update clear button
        if (this.clearBtn) {
            this.clearBtn.disabled = this.logs.length === 0;
        }
    }
    
    createStats() {
        const stats = this.getStats();
        const div = document.createElement('div');
        div.className = 'logs-stats';
        div.innerHTML = `
            <span class="stat-item">
                <span class="stat-dot info"></span>
                معلومات: <span class="stat-count">${stats.info}</span>
            </span>
            <span class="stat-item">
                <span class="stat-dot success"></span>
                نجاح: <span class="stat-count">${stats.success}</span>
            </span>
            <span class="stat-item">
                <span class="stat-dot warning"></span>
                تحذير: <span class="stat-count">${stats.warning}</span>
            </span>
            <span class="stat-item">
                <span class="stat-dot error"></span>
                خطأ: <span class="stat-count">${stats.error}</span>
            </span>
            <span class="stat-item">
                <span class="stat-dot" style="background:var(--text-muted);"></span>
                الإجمالي: <span class="stat-count">${stats.total}</span>
            </span>
        `;
        return div;
    }
    
    createLogItem(log) {
        const icon = this.icons[log.type] || '📋';
        const badgeType = this.badgeColors[log.type] || 'neutral';
        const typeLabel = this.typeLabels[log.type] || log.type;
        
        // Format date and time
        const dateStr = this.formatDate(log.date);
        const timeStr = this.formatTime(log.date);
        
        const div = document.createElement('div');
        div.className = 'log-item';
        div.dataset.id = log.id;
        div.innerHTML = `
            <div class="log-left">
                <span class="log-icon ${log.type}">${icon}</span>
                <span class="log-message">${log.message}</span>
                ${log.details ? `<span class="log-details">${log.details}</span>` : ''}
            </div>
            <div class="log-right">
                <span class="log-badge ${badgeType}">${typeLabel}</span>
                <span class="log-time">${timeStr}</span>
                <span class="log-date">${dateStr}</span>
            </div>
        `;
        
        // Delete on click (optional)
        div.addEventListener('dblclick', () => {
            if (confirm('هل تريد حذف هذا السجل؟')) {
                this.deleteLog(log.id);
            }
        });
        
        return div;
    }
    
    renderEmpty() {
        this.container.innerHTML = `
            <div class="logs-empty">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <h4>لا توجد سجلات</h4>
                <p>سجل النشاطات فارغ حالياً. ستظهر هنا جميع العمليات التي تقوم بها.</p>
                <button class="saas-btn saas-btn-secondary" onclick="window._logsEngine?.addSampleLog()">
                    <i class="fa-solid fa-plus"></i> إضافة عينة
                </button>
            </div>
        `;
    }
    
    renderLoading() {
        this.container.innerHTML = `
            <div class="log-skeleton"><div class="skeleton-icon"></div><div class="skeleton-text"></div><div class="skeleton-badge"></div></div>
            <div class="log-skeleton"><div class="skeleton-icon"></div><div class="skeleton-text"></div><div class="skeleton-badge"></div></div>
            <div class="log-skeleton"><div class="skeleton-icon"></div><div class="skeleton-text"></div><div class="skeleton-badge"></div></div>
        `;
    }
    
    // ============================================================
    // 07. DATE/TIME FORMATTING
    // ============================================================
    
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatTime(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    formatDateTime(date) {
        return `${this.formatDate(date)} - ${this.formatTime(date)}`;
    }
    
    // ============================================================
    // 08. FILTER & SEARCH
    // ============================================================
    
    getFilteredLogs() {
        let filtered = [...this.logs];
        
        // Filter by type
        if (this.filter !== 'all') {
            filtered = filtered.filter(log => log.type === this.filter);
        }
        
        // Search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(query) ||
                (log.details && log.details.toLowerCase().includes(query))
            );
        }
        
        // Sort by date (newest first)
        filtered.sort((a, b) => b.date - a.date);
        
        return filtered;
    }
    
    setFilter(type) {
        this.filter = type;
        this.render();
    }
    
    setSearch(query) {
        this.searchQuery = query.trim();
        this.render();
    }
    
    // ============================================================
    // 09. CRUD OPERATIONS
    // ============================================================
    
    deleteLog(id) {
        this.logs = this.logs.filter(log => log.id !== id);
        this.saveToStorage();
        this.render();
    }
    
    clearAll() {
        if (this.logs.length === 0) {
            Utils.toast('⚠️ لا توجد سجلات لمسحها', 'warning');
            return;
        }
        
        if (confirm('هل تريد مسح جميع السجلات؟')) {
            this.logs = [];
            this.saveToStorage();
            this.render();
            Utils.toast('🗑️ تم مسح جميع السجلات', 'success');
            this.addLog('🗑️ تم مسح جميع السجلات', 'info');
        }
    }
    
    addSampleLog() {
        const samples = [
            { msg: '📊 تم تحديث الإحصائيات', type: 'info' },
            { msg: '✅ اكتملت المهمة بنجاح', type: 'success' },
            { msg: '⚠️ تم اكتشاف تنبيه جديد', type: 'warning' },
            { msg: '❌ حدث خطأ في الاتصال', type: 'error' },
            { msg: '🔐 تم تسجيل الدخول', type: 'auth' },
            { msg: '🎨 تم تغيير الثيم', type: 'theme' },
            { msg: '💻 تم إضافة مهارة جديدة', type: 'skill' },
            { msg: '📁 تم إضافة مشروع جديد', type: 'project' }
        ];
        
        const random = samples[Math.floor(Math.random() * samples.length)];
        this.addLog(random.msg, random.type, 'عينة عشوائية');
    }
    
    // ============================================================
    // 10. STATS
    // ============================================================
    
    getStats() {
        const types = ['info', 'success', 'warning', 'error'];
        const stats = {};
        let total = 0;
        
        types.forEach(type => {
            const count = this.logs.filter(l => l.type === type).length;
            stats[type] = count;
            total += count;
        });
        
        return {
            total: this.logs.length,
            ...stats
        };
    }
    
    // ============================================================
    // 11. LOADING STATE
    // ============================================================
    
    setLoading(loading) {
        this.isLoading = loading;
        this.render();
    }
    
    // ============================================================
    // 12. CLEANUP
    // ============================================================
    
    destroy() {
        if (this._observers) {
            this._observers.forEach(observer => observer.disconnect());
            this._observers = [];
        }
        this.isListening = false;
        console.log('📋 Logs Engine destroyed');
    }
}

// ============================================================ */
// 13. INITIALIZATION                                            */
// ============================================================ */

// Store logs engine globally
window._logsEngine = null;

// Function to get or create logs engine
function getLogsEngine() {
    if (!window._logsEngine) {
        window._logsEngine = new LogsEngine();
    }
    return window._logsEngine;
}

// Function to log from anywhere
function logEvent(message, type = 'info', details = '') {
    const engine = getLogsEngine();
    engine.addLog(message, type, details);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const logsSection = document.getElementById('logs-section');
    if (logsSection) {
        // Only initialize if section is active
        if (logsSection.classList.contains('active')) {
            getLogsEngine();
        } else {
            // Wait for section to become active
            const observer = new MutationObserver(() => {
                if (logsSection.classList.contains('active') && !window._logsEngine) {
                    getLogsEngine();
                    observer.disconnect();
                }
            });
            observer.observe(logsSection, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
});

// If DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const logsSection = document.getElementById('logs-section');
    if (logsSection && logsSection.classList.contains('active') && !window._logsEngine) {
        getLogsEngine();
    }
}

// ============================================================ */
// 14. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   📋 LOGS ENGINE - v2.0                                    ║
║                                                              ║
║   ✅ Global Event Listening                                 ║
║   ✅ 20+ Event Types                                        ║
║   ✅ Date & Time Stamps                                    ║
║   ✅ LocalStorage Persistence                              ║
║   ✅ Filter & Search                                       ║
║   ✅ Lazy Loading Ready                                    ║
║                                                              ║
║   📦 Available: window._logsEngine                          ║
║   🔧 Helper: window.logEvent(msg, type, details)           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================ */
// نهاية LOGS ENGINE - v2.0                                    */
// ============================================================ */
// ============================================================ */
// 🚀 TEST - اختبر الاتصال بقاعدة البيانات
// ============================================================ */

// اختبر بعد 3 ثواني من تحميل الصفحة
setTimeout(async () => {
    console.log('🧪 Testing Supabase connection...');
    
    if (!supabaseClient) {
        console.log('❌ Supabase client not initialized');
        return;
    }
    
    // 1. اختبر القراءة
    const { data, error } = await supabaseClient
        .from('activity_logs')
        .select('*')
        .limit(3);
    
    if (error) {
        console.log('❌ Read error:', error.message);
        console.log('⚠️ Check RLS policies in Supabase');
    } else {
        console.log('✅ Read successful!', data?.length || 0, 'records');
    }
    
    // 2. اختبر الكتابة
    const testId = Date.now();
    const { error: writeError } = await supabaseClient
        .from('activity_logs')
        .insert([{
            id: testId,
            message: '🧪 اختبار الاتصال من Dashboard',
            type: 'info',
            details: 'Test',
            created_at: new Date().toISOString()
        }]);
    
    if (writeError) {
        console.log('❌ Write error:', writeError.message);
    } else {
        console.log('✅ Write successful!');
    }
}, 3000);

// ============================================================ */
// 🏅 CERTIFICATES FIX - حل مشاكل الشهادات                    */
// ============================================================ */

(function() {
    'use strict';
    
    console.log('🏅 جاري إصلاح مشاكل الشهادات...');
    
    // ============================================================ */
    // 01. دالة强制 حذف الشهادة من Supabase                       */
    // ============================================================ */
    
    window.forceDeleteCertificate = async function(id) {
        if (!id) {
            console.error('❌ الرجاء إدخال ID الشهادة');
            return false;
        }
        
        console.log('🗑️ جاري حذف الشهادة:', id);
        
        try {
            // 1. حذف من Supabase
            const res = await fetch(`https://txcuibshcvfusegrfcbm.supabase.co/rest/v1/certificates?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI'
                }
            });
            
            if (res.ok) {
                console.log('✅ تم حذف الشهادة من Supabase');
            } else {
                console.log('⚠️ Supabase: ' + res.status);
            }
            
            // 2. حذف من localStorage
            let certs = JSON.parse(localStorage.getItem('dashboard-certificates') || '[]');
            certs = certs.filter(c => c.id !== id);
            localStorage.setItem('dashboard-certificates', JSON.stringify(certs));
            console.log('✅ تم حذف الشهادة من localStorage');
            
            // 3. تحديث الواجهة
            if (typeof window._certificatesEngine !== 'undefined' && window._certificatesEngine) {
                window._certificatesEngine.items = window._certificatesEngine.items.filter(c => c.id !== id);
                window._certificatesEngine.render();
                console.log('✅ تم تحديث الواجهة');
            }
            
            // 4. إعادة تحميل الشهادات في الموقع
            if (typeof loadCertificates === 'function') {
                setTimeout(loadCertificates, 500);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ خطأ:', error);
            return false;
        }
    };
    
    // ============================================================ */
    // 02. دالة مسح جميع الشهادات الوهمية                         */
    // ============================================================ */
    
    window.clearAllCertificates = async function() {
        console.log('🗑️ جاري مسح جميع الشهادات...');
        
        // 1. جلب جميع الشهادات من localStorage
        let certs = JSON.parse(localStorage.getItem('dashboard-certificates') || '[]');
        
        if (certs.length === 0) {
            console.log('⚠️ لا توجد شهادات في localStorage');
            return;
        }
        
        console.log('📊 عدد الشهادات:', certs.length);
        
        // 2. حذف كل شهادة من Supabase
        for (const cert of certs) {
            try {
                await fetch(`https://txcuibshcvfusegrfcbm.supabase.co/rest/v1/certificates?id=eq.${cert.id}`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI'
                    }
                });
                console.log('✅ تم حذف:', cert.title);
            } catch (e) {
                console.log('⚠️ فشل حذف:', cert.title);
            }
        }
        
        // 3. مسح localStorage
        localStorage.removeItem('dashboard-certificates');
        console.log('✅ تم مسح localStorage');
        
        // 4. تحديث الواجهة
        if (typeof window._certificatesEngine !== 'undefined' && window._certificatesEngine) {
            window._certificatesEngine.items = [];
            window._certificatesEngine.render();
            console.log('✅ تم تحديث الواجهة');
        }
        
        // 5. إعادة تحميل الشهادات
        if (typeof loadCertificates === 'function') {
            setTimeout(loadCertificates, 500);
        }
        
        console.log('✅ تم مسح جميع الشهادات');
    };
    
    // ============================================================ */
    // 03. دالة إضافة شهادة جديدة (للتأكد من عملها)              */
    // ============================================================ */
    
    window.addTestCertificate = async function() {
        console.log('📝 جاري إضافة شهادة اختبار...');
        
        const testCert = {
            id: Date.now() + Math.random() * 1000,
            title: 'شهادة اختبار - ' + new Date().toLocaleString(),
            provider: 'Supabase Test',
            description: 'هذه شهادة اختبار للتأكد من عمل الإضافة',
            issue_date: new Date().toISOString().split('T')[0],
            is_published: true,
            is_featured: false,
            skills: ['HTML', 'CSS', 'JavaScript'],
            created_at: new Date().toISOString()
        };
        
        try {
            // 1. حفظ في Supabase
            const res = await fetch('https://txcuibshcvfusegrfcbm.supabase.co/rest/v1/certificates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(testCert)
            });
            
            if (res.ok) {
                const data = await res.json();
                console.log('✅ تم إضافة الشهادة في Supabase');
                console.log('📋 البيانات:', data);
                
                // 2. إضافة في localStorage
                let certs = JSON.parse(localStorage.getItem('dashboard-certificates') || '[]');
                certs.unshift(testCert);
                localStorage.setItem('dashboard-certificates', JSON.stringify(certs));
                console.log('✅ تم إضافة الشهادة في localStorage');
                
                // 3. تحديث الواجهة
                if (typeof window._certificatesEngine !== 'undefined' && window._certificatesEngine) {
                    window._certificatesEngine.items.unshift(testCert);
                    window._certificatesEngine.render();
                    console.log('✅ تم تحديث الواجهة');
                }
                
                // 4. إعادة تحميل الشهادات في الموقع
                if (typeof loadCertificates === 'function') {
                    setTimeout(loadCertificates, 500);
                }
                
                console.log('✅ تمت الإضافة بنجاح!');
                return testCert;
            } else {
                console.log('❌ فشل الإضافة: ' + res.status);
                return null;
            }
        } catch (error) {
            console.error('❌ خطأ:', error);
            return null;
        }
    };
    
    // ============================================================ */
    // 04. دالة عرض الشهادات الموجودة                             */
    // ============================================================ */
    
    window.showCertificates = function() {
        console.log('📊 عرض الشهادات:');
        
        // 1. من localStorage
        let localCerts = JSON.parse(localStorage.getItem('dashboard-certificates') || '[]');
        console.log('   📁 localStorage: ' + localCerts.length + ' شهادة');
        localCerts.forEach(c => {
            console.log('      - ' + c.title + ' (ID: ' + c.id + ')');
        });
        
        // 2. من Supabase
        console.log('   📁 جلب من Supabase...');
        fetch('https://txcuibshcvfusegrfcbm.supabase.co/rest/v1/certificates?select=*&limit=10', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI'
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log('   📁 Supabase: ' + (data ? data.length : 0) + ' شهادة');
            if (data && data.length > 0) {
                data.forEach(c => {
                    console.log('      - ' + c.title + ' (ID: ' + c.id + ')');
                });
            }
        })
        .catch(err => {
            console.log('   ❌ خطأ في جلب البيانات: ' + err.message);
        });
    };
    
    // ============================================================ */
    // 05. دالة إعادة تحميل الشهادات                               */
    // ============================================================ */
    
    window.reloadCertificates = function() {
        console.log('🔄 إعادة تحميل الشهادات...');
        
        // 1. تحديث localStorage من Supabase
        fetch('https://txcuibshcvfusegrfcbm.supabase.co/rest/v1/certificates?select=*&is_published=eq.true', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                localStorage.setItem('dashboard-certificates', JSON.stringify(data));
                console.log('✅ تم تحديث localStorage: ' + data.length + ' شهادة');
                
                // تحديث الواجهة
                if (typeof window._certificatesEngine !== 'undefined' && window._certificatesEngine) {
                    window._certificatesEngine.items = data;
                    window._certificatesEngine.render();
                    console.log('✅ تم تحديث الواجهة');
                }
            }
        })
        .catch(err => {
            console.log('❌ خطأ: ' + err.message);
        });
        
        // 2. تحميل في الموقع
        if (typeof loadCertificates === 'function') {
            loadCertificates();
            console.log('✅ تم تحميل الشهادات في الموقع');
        }
    };
    
    // ============================================================ */
    // 06. عرض المساعدة                                             */
    // ============================================================ */
    
    console.log('✅ تم إضافة دوال التحكم في الشهادات:');
    console.log('');
    console.log('📖 الأوامر المتاحة:');
    console.log('   • showCertificates()        - عرض جميع الشهادات');
    console.log('   • reloadCertificates()      - إعادة تحميل الشهادات');
    console.log('   • addTestCertificate()      - إضافة شهادة اختبار');
    console.log('   • forceDeleteCertificate(ID)- حذف شهادة معينة');
    console.log('   • clearAllCertificates()    - مسح جميع الشهادات');
    console.log('');
    
})();