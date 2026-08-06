
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
            console.warn('⚠️ Supabase not ready');
            return;
        }

        const status = msg.read ? 'read' : (msg.replied ? 'replied' : 'unread');

        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                id: Math.floor(msg.id),
                sender_name: msg.name,
                sender_email: msg.email,
                subject: msg.subject,
                message: msg.message,
                created_at: msg.date.toISOString()
            }]);

        if (error) {
            console.error('❌ Supabase error:', error);
        } else {
            console.log('✅ Message saved to Supabase:', msg.subject);
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
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('❌ Supabase error:', error);
            return;
        }

        if (data && data.length > 0) {
            this.messages = data.map(msg => ({
                id: msg.id,
                name: msg.sender_name,
                email: msg.sender_email,
                subject: msg.subject,
                message: msg.message,
                date: new Date(msg.created_at),
                read: msg.status === 'read' || msg.status === 'replied',
                replied: msg.status === 'replied'
            }));
            this.saveToStorage();
            this.render();
            console.log(`📂 Loaded ${this.messages.length} messages from Supabase`);
        }
    } catch (e) {
        console.error('❌ Error:', e);
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
    // منع التكرار - التحقق من وجود رسالة مشابهة خلال 5 ثواني
    const duplicate = this.messages.find(m => 
        m.email === email.trim() && 
        m.subject === subject.trim() && 
        m.message === message.trim() &&
        (Date.now() - new Date(m.date).getTime() < 5000)
    );
    
    if (duplicate) {
        console.warn('⚠️ Duplicate message detected, skipping...');
        return null;
    }

    // منع التكرار - التحقق من نفس المحتوى بالضبط (بدون وقت)
    const exactDuplicate = this.messages.find(m => 
        m.email === email.trim() && 
        m.subject === subject.trim() && 
        m.message === message.trim()
    );
    
    if (exactDuplicate) {
        console.warn('⚠️ Exact duplicate message found, skipping...');
        return null;
    }

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

    return newMsg;
}
// 🔥 دالة جديدة للتخزين في Supabase
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

    // منع التكرار
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

    // تعيين حالة الإرسال
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

        // 1. حفظ في Supabase (إذا كان متاحاً)
        if (supabaseClient) {
            console.log('📤 Saving to Supabase...');
            
            // تحويل الـ ID إلى رقم إذا كان نصياً
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
        } else {
            console.warn('⚠️ Supabase not available, saving locally only');
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

        // 3. تسجيل في Logs
        if (window._logsEngine) {
            window._logsEngine.addLog(
                `✉️ تم الرد على رسالة من: ${msg.name}`,
                'message',
                msg.subject
            );
        }

        // 4. إظهار نجاح
        if (status && statusMsg) {
            status.className = 'reply-status';
            statusMsg.textContent = '✅ تم إرسال الرد بنجاح!';
        }

        Utils.toast(`✅ تم إرسال الرد إلى ${msg.name}`, 'success');
        this.render();

        // إغلاق الكارت بعد 2 ثانية
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