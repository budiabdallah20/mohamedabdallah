  // ============================================================
// DASHBOARD.JS - Premium Dashboard Architecture
// Version: 3.0.0 - Production Ready
// ============================================================

// ============================================================
// 1. CONNECTION CODE (KEPT FROM ORIGINAL)
// ============================================================
const SUPABASE_URL = "https://txcuibshcvfusegrfcbm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI";

let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase client initialized");
    }
} catch (e) {
    console.warn("⚠️ Supabase not available:", e.message);
}

// ============================================================
// 2. UTILITIES MODULE
// ============================================================
const Utils = {
    // DOM Helpers
    get: (id) => document.getElementById(id),
    getVal: (id) => document.getElementById(id)?.value || "",
    setVal: (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    },
    setText: (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },
    setHTML: (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    },
    show: (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "block";
    },
    hide: (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    },
    addClass: (id, cls) => {
        const el = document.getElementById(id);
        if (el) el.classList.add(cls);
    },
    removeClass: (id, cls) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove(cls);
    },

    // Date/Time Helpers
    formatDate: (date, locale = "ar-EG") => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    },
    formatTime: (date, locale = "ar-EG") => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit"
        });
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
        const icons = {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "ℹ️"
        };
        toast.innerHTML = `${icons[type] || "📢"} ${message}`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));

        setTimeout(() => {
            toast.classList.remove("show");
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

// ============================================================
// 3. STATE MANAGER
// ============================================================
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
        this.init();
    }

    init() {
        console.log("📊 State Manager initialized");
    }

    get(key) {
        return this.state[key];
    }

    set(key, value, silent = false) {
        const oldValue = this.state[key];
        this.state[key] = value;

        if (!silent) {
            this.notifyListeners(key, value, oldValue);
        }

        // Auto-save specific keys
        const autoSaveKeys = ['theme', 'language', 'direction'];
        if (autoSaveKeys.includes(key)) {
            Utils.storage.set(`dashboard-${key}`, value);
        }
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    unsubscribe(key, callback) {
        if (this.listeners.has(key)) {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
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

// ============================================================
// 4. EVENT MANAGER
// ============================================================
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

        if (!this.events.has(key)) {
            this.events.set(key, []);
        }

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
        // Remove direct event listeners
        this.events.forEach((listeners) => {
            listeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.events.clear();

        // Remove delegated events
        this.delegations.forEach(({ event, handler, options }) => {
            document.removeEventListener(event, handler, options);
        });
        this.delegations.clear();
    }
}

// ============================================================
// 5. THEME ENGINE
// ============================================================
class ThemeEngine {
    constructor(stateManager, eventManager) {
        this.state = stateManager;
        this.events = eventManager;
        this.themes = ['dark', 'light', 'oled', 'royal-purple'];
        this.currentTheme = this.state.get('theme') || 'dark';

        // Subscribe to theme changes
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
        const themeToggle = document.getElementById('themeToggleBtn');
        if (themeToggle) {
            this.events.on(themeToggle, 'click', () => {
                this.toggleTheme();
            });
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

        // Update theme indicator in home section
        const indicator = document.getElementById('home-theme-indicator');
        if (indicator) {
            const themeNames = {
                dark: 'الوضع المظلم 🌙',
                light: 'الوضع الفاتح ☀️',
                oled: 'OLED 🖤',
                'royal-purple': 'Royal Purple 👑'
            };
            indicator.textContent = themeNames[theme] || themeNames.dark;
        }

        // Update theme toggle icon
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
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
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        const newTheme = this.themes[nextIndex];
        this.applyTheme(newTheme);

        const themeNames = {
            dark: '🌙 الوضع المظلم',
            light: '☀️ الوضع الفاتح',
            oled: '🖤 OLED',
            'royal-purple': '👑 Royal Purple'
        };
        Utils.toast(`تم التبديل إلى ${themeNames[newTheme] || newTheme}`, 'info');
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// ============================================================
// 6. LANGUAGE ENGINE
// ============================================================
class LanguageEngine {
    constructor(stateManager, eventManager) {
        this.state = stateManager;
        this.events = eventManager;
        this.languages = ['ar', 'en'];
        this.directions = {
            ar: 'rtl',
            en: 'ltr'
        };
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
        const langToggle = document.getElementById('toggleLangBtn');
        if (langToggle) {
            this.events.on(langToggle, 'click', () => {
                this.toggleLanguage();
            });
        }
    }

    applyLanguage(lang) {
        if (!this.languages.includes(lang)) {
            console.warn(`⚠️ Unknown language: ${lang}, falling back to ar`);
            lang = 'ar';
        }

        this.currentLang = lang;
        this.state.set('language', lang, true);

        // Update language indicator in home section
        const indicator = document.getElementById('home-lang-indicator');
        if (indicator) {
            indicator.textContent = lang === 'ar' ? 'العربية (RTL)' : 'English (LTR)';
        }

        // Update language label in sidebar
        const label = document.getElementById('langLabel');
        if (label) {
            label.textContent = lang === 'ar' ? 'AR / EN' : 'EN / AR';
        }

        // Update document language
        document.documentElement.lang = lang;

        // Apply direction
        this.applyDirection(this.directions[lang] || 'rtl');
    }

    applyDirection(dir) {
        this.currentDir = dir;
        this.state.set('direction', dir, true);
        document.documentElement.dir = dir;
    }

    toggleLanguage() {
        const currentIndex = this.languages.indexOf(this.currentLang);
        const nextIndex = (currentIndex + 1) % this.languages.length;
        const newLang = this.languages[nextIndex];
        this.applyLanguage(newLang);
        Utils.toast(
            newLang === 'ar' ? '🌐 تم التبديل إلى العربية' : '🌐 Switched to English',
            'info'
        );
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getCurrentDirection() {
        return this.currentDir;
    }
}

// ============================================================
// 7. NAVIGATION ENGINE
// ============================================================
class NavigationEngine {
    constructor(stateManager, eventManager) {
        this.state = stateManager;
        this.events = eventManager;
        this.sections = {};
        this.currentSection = this.state.get('currentSection') || 'home-section';
        this.navItems = [];
        this.init();
    }

    init() {
        this.findNavItems();
        this.setupNavigation();
        this.setupQuickActions();
        this.setupHashRouting();
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
                if (sectionId) {
                    this.navigateTo(sectionId, item);
                }
            });
        });
    }

    setupQuickActions() {
        document.querySelectorAll('.quick-action-card[data-section]').forEach((btn) => {
            this.events.on(btn, 'click', () => {
                const sectionId = btn.dataset.section;
                if (sectionId) {
                    this.navigateTo(sectionId);
                }
            });
        });
    }

    setupHashRouting() {
        this.events.on(window, 'hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && document.getElementById(hash)) {
                this.navigateTo(hash);
            }
        });

        const initialHash = window.location.hash.replace('#', '');
        if (initialHash && document.getElementById(initialHash)) {
            this.navigateTo(initialHash);
        }
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

        // Show target section
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
        this.navItems.forEach((btn) => {
            btn.classList.remove('active');
        });

        if (activeBtn) {
            activeBtn.classList.add('active');
        } else {
            this.navItems.forEach((btn) => {
                if (btn.dataset.section === sectionId) {
                    btn.classList.add('active');
                }
            });
        }

        // Call section load if available
        if (this.sections[sectionId] && typeof this.sections[sectionId].load === 'function') {
            this.sections[sectionId].load();
        }

        // Update URL hash
        window.location.hash = sectionId;
        console.log(`📱 Navigated to: ${sectionId}`);
    }

    registerSection(sectionId, instance) {
        this.sections[sectionId] = instance;
    }

    getCurrentSection() {
        return this.currentSection;
    }
}

// ============================================================
// 8. HOME ENGINE
// ============================================================
class HomeEngine {
    constructor(stateManager, eventManager) {
        this.state = stateManager;
        this.events = eventManager;
        this.clockInterval = null;
        this.init();
    }

    init() {
        this.setupEvents();
        this.load();
        console.log("🏠 Home Engine ready");
    }

    setupEvents() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshHomeBtn');
        if (refreshBtn) {
            this.events.on(refreshBtn, 'click', () => {
                this.load();
                Utils.toast("✅ تم تحديث البيانات", "success");
            });
        }

        // Global search
        const searchBtn = document.getElementById('globalSearchBtn');
        if (searchBtn) {
            this.events.on(searchBtn, 'click', () => this.openGlobalSearch());
        }

        // Share profile
        const shareBtn = document.getElementById('shareProfileBtn');
        if (shareBtn) {
            this.events.on(shareBtn, 'click', () => this.shareProfile());
        }

        // Download CV
        const cvBtn = document.getElementById('downloadCVBtn');
        if (cvBtn) {
            this.events.on(cvBtn, 'click', (e) => {
                e.preventDefault();
                this.downloadCV();
            });
        }

        // Quick search input
        const searchInput = document.getElementById('home-quick-search');
        if (searchInput) {
            this.events.on(searchInput, 'keydown', (e) => {
                if (e.key === 'Enter') {
                    this.doQuickSearch(searchInput.value);
                }
            });
        }

        // Quick launch actions
        const quickActions = {
            quickOpenSiteBtn: () => window.open("../index.html", "_blank"),
            quickPreviewBtn: () => this.togglePreview(),
            quickBackupBtn: () => this.doBackup(),
            quickPublishBtn: () => this.doPublish(),
            quickMediaBtn: () => this.openMediaManager()
        };

        for (const [id, fn] of Object.entries(quickActions)) {
            const btn = document.getElementById(id);
            if (btn) {
                this.events.on(btn, 'click', fn);
            }
        }

        // Chart refresh buttons
        document.querySelectorAll('.chart-refresh-btn').forEach((btn) => {
            this.events.on(btn, 'click', () => {
                const chartType = btn.dataset.chart;
                this.refreshChart(chartType);
            });
        });

        // Refresh dashboard
        const refreshDash = document.getElementById('btn-refresh-dashboard');
        if (refreshDash) {
            this.events.on(refreshDash, 'click', () => this.load());
        }

        // Preview & Open Site
        const previewBtn = document.getElementById('btn-preview-website');
        if (previewBtn) {
            this.events.on(previewBtn, 'click', (e) => {
                e.preventDefault();
                this.togglePreview();
            });
        }

        const openSiteBtn = document.getElementById('btn-open-website');
        if (openSiteBtn) {
            this.events.on(openSiteBtn, 'click', (e) => {
                e.preventDefault();
                window.open("../index.html", "_blank");
            });
        }
    }

    load() {
        console.log("🔄 Loading Home Section...");
        this.updateClock();
        this.loadStats();
        this.loadKPIs();
        this.initCharts();
        this.loadGoalsAndAchievements();
        this.loadInsights();
        this.loadUserStats();
        this.updateWeather();

        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        this.clockInterval = setInterval(() => this.updateClock(), 60000);
    }

    updateClock() {
        const now = new Date();
        Utils.setText('home-live-date', Utils.formatDate(now));
        Utils.setText('home-live-time', Utils.formatTime(now));
        Utils.setText('home-dynamic-greeting', Utils.getGreeting());
        Utils.setText('home-last-login', Utils.formatDateTime(now));

        const statusText = document.getElementById('connection-status-text');
        if (statusText) statusText.textContent = "متصل 🟢";

        const lastActive = document.getElementById('last-active-time');
        if (lastActive) lastActive.textContent = "نشط الآن";
    }

    loadStats() {
        const stats = {
            projects: 12,
            skills: 8,
            certificates: 5,
            messages: 3,
            featuredProjects: 4,
            featuredSkills: 3,
            featuredCerts: 2,
            unreadMessages: 1,
            drafts: 2
        };

        const counters = {
            'counter-projects': stats.projects,
            'counter-skills': stats.skills,
            'counter-certificates': stats.certificates,
            'counter-messages': stats.messages,
            'kpi-featured-projects-count': `${stats.featuredProjects} مميز`,
            'kpi-featured-skills-count': `${stats.featuredSkills} مميزة`,
            'kpi-featured-certs-count': `${stats.featuredCerts} مميزة`,
            'kpi-unread-messages-count': `${stats.unreadMessages} غير مقروءة`,
            'sub-draft-projects': `${stats.drafts} مسودة`,
            'sub-unread-messages': `${stats.unreadMessages} بحاجة لإجراء`
        };

        for (const [id, val] of Object.entries(counters)) {
            Utils.setText(id, val);
        }

        // Progress bars
        const projectProgress = Math.round((stats.featuredProjects / stats.projects) * 100) || 0;
        const skillProgress = Math.round((stats.featuredSkills / stats.skills) * 100) || 0;
        const certProgress = Math.round((stats.featuredCerts / stats.certificates) * 100) || 0;
        const msgProgress = Math.min(Math.round((stats.unreadMessages / stats.messages) * 100) || 0, 100);

        const bars = {
            'bar-projects': projectProgress,
            'bar-skills': skillProgress,
            'bar-certificates': certProgress,
            'bar-messages': msgProgress
        };

        for (const [id, val] of Object.entries(bars)) {
            const el = document.getElementById(id);
            if (el) el.style.width = `${val}%`;
        }
    }

    loadKPIs() {
        const completion = 75;
        const score = 82;

        // Portfolio Completion Ring
        const circle = document.getElementById('completion-progress-circle');
        if (circle) {
            const circumference = 326.72;
            const offset = circumference - (completion / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }

        Utils.setText('completion-percentage-val', `${completion}%`);
        Utils.setText('completion-items-done', `12/16`);
        Utils.setText('completion-items-pending', '4');
        Utils.setText('completion-top-suggestion', 'أضف مشروعين آخرين لتحسين المحفظة');

        const statusBadge = document.getElementById('completion-status-badge');
        if (statusBadge) {
            statusBadge.textContent = "🟢 نشط";
            statusBadge.className = "status-badge badge-success";
        }

        // Dashboard Score
        Utils.setText('dashboard-score-val', score);
        Utils.setText('content-quality-pct', '85%');
        Utils.setText('website-health-pct', '78%');

        const contentBar = document.getElementById('content-quality-bar');
        const healthBar = document.getElementById('website-health-bar');
        if (contentBar) contentBar.style.width = '85%';
        if (healthBar) healthBar.style.width = '78%';

        const rating = score >= 80 ? 'ممتاز 🌟' : score >= 60 ? 'جيد 👍' : 'يحتاج تحسين 📈';
        Utils.setText('score-rating-label', rating);
        Utils.setText('score-audit-summary', `التقييم: ${rating} - تم التحديث تلقائياً`);

        const trendIndicator = document.getElementById('score-trend-indicator');
        if (trendIndicator) {
            trendIndicator.className = 'trend-indicator positive';
        }
        Utils.setText('score-trend-val', '+2 pts');
    }

    initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn("⚠️ Chart.js not loaded");
            return;
        }

        // Visitors Chart
        const visitorsCtx = document.getElementById('visitorsChart');
        if (visitorsCtx) {
            let existingChart = Chart.getChart(visitorsCtx);
            if (existingChart) existingChart.destroy();

            new Chart(visitorsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['زيارات', 'مشاريع', 'مهارات'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: ['#6366f1', '#38bdf8', '#a855f7'],
                        borderColor: 'transparent'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#94a3b8', font: { size: 11 } }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // Growth Chart
        const growthCtx = document.getElementById('growthChart');
        if (growthCtx) {
            let existingChart = Chart.getChart(growthCtx);
            if (existingChart) existingChart.destroy();

            new Chart(growthCtx, {
                type: 'bar',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'المشاريع',
                        data: [2, 4, 6, 8, 10, 12],
                        backgroundColor: 'rgba(56, 189, 248, 0.7)',
                        borderRadius: 4
                    }, {
                        label: 'المهارات',
                        data: [1, 3, 4, 6, 7, 8],
                        backgroundColor: 'rgba(168, 85, 247, 0.7)',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#94a3b8', font: { size: 11 } }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#94a3b8' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#94a3b8' }
                        }
                    }
                }
            });
        }
    }

    loadGoalsAndAchievements() {
        // Goals
        const goals = [
            { title: 'إنجاز 15 مشروع', progress: 80 },
            { title: 'إضافة 10 مهارات', progress: 70 },
            { title: 'الحصول على 5 شهادات', progress: 60 },
            { title: 'نشر الموقع', progress: 100 }
        ];

        const goalsContainer = document.getElementById('goalsListContainer');
        if (goalsContainer) {
            goalsContainer.innerHTML = goals.map(goal => `
                <div class="goal-item-row">
                    <div class="goal-info-top">
                        <span>${goal.title}</span>
                        <span>${goal.progress}%</span>
                    </div>
                    <div class="goal-progress-bar-bg">
                        <div class="goal-progress-fill" style="width: ${goal.progress}%;"></div>
                    </div>
                </div>
            `).join('');

            const avg = Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length);
            const overallText = document.getElementById('overallGoalsProgressText');
            if (overallText) {
                overallText.textContent = `${avg}%`;
                overallText.className = 'badge';
            }
        }

        // Achievements
        const achievements = [
            { icon: '🚀', title: 'أول مشروع منشور' },
            { icon: '⭐', title: '5 نجوم على المشروع' },
            { icon: '🏆', title: 'مطور معتمد' },
            { icon: '💪', title: '10 مشاريع مكتملة' }
        ];

        const achievementsContainer = document.getElementById('achievementsContainer');
        if (achievementsContainer) {
            achievementsContainer.innerHTML = achievements.map(a => `
                <div class="achievement-badge-card">
                    <i class="fa-solid fa-trophy" style="font-size: 20px; color: #fbbf24;"></i>
                    <span>${a.title}</span>
                    <small>${a.icon}</small>
                </div>
            `).join('');

            const countEl = document.getElementById('achievements-count');
            if (countEl) {
                countEl.textContent = achievements.length;
                countEl.className = 'status-badge badge-neutral';
            }
        }
    }

    loadInsights() {
        const insights = [
            '📊 لديك 4 مشاريع مميزة تظهر في الواجهة',
            '🎯 نسبة إكمال البورتفوليو 75%، أضف مشروعين للوصول إلى 100%',
            '💡 مهاراتك الأكثر تقدماً: React.js, JavaScript, UI/UX',
            '🚀 يمكنك نشر التغييرات الجديدة بنقرة واحدة'
        ];

        const insightsList = document.getElementById('insightsList');
        if (insightsList) {
            insightsList.innerHTML = insights.map(insight => `
                <div class="insight-item">
                    ${insight}
                    <span class="insight-badge">توصية</span>
                </div>
            `).join('');
        }

        const statusBadge = document.getElementById('insights-status');
        if (statusBadge) {
            statusBadge.innerHTML = `<i class="fa-solid fa-circle"></i> Live`;
            statusBadge.className = 'status-badge badge-success';
        }
    }

    loadUserStats() {
        Utils.setText('user-projects-count', '12');
        Utils.setText('user-experience-years', '3+');
        Utils.setText('user-completed-projects', '8');

        const avatar = document.getElementById('home-user-avatar');
        if (avatar && !avatar.src) {
            avatar.src = './about.jpg';
        }

        const userName = document.getElementById('home-user-name');
        if (userName) userName.textContent = 'Mohamed Abdallah';

        const location = document.getElementById('user-location');
        if (location) location.textContent = 'سويس، مصر';

        const timezone = document.getElementById('user-timezone');
        if (timezone) timezone.textContent = 'UTC +2';
    }

    updateWeather() {
        const weatherData = {
            temp: Math.floor(Math.random() * 10) + 20,
            condition: ['مشمس', 'غائم', 'معتدل', 'ممطر'][Math.floor(Math.random() * 4)],
            location: 'سويس، مصر'
        };

        Utils.setText('weather-temp', `${weatherData.temp}°C`);
        Utils.setText('weather-condition', weatherData.condition);
        Utils.setText('weather-location', `🇪🇬 ${weatherData.location}`);

        const iconMap = {
            'مشمس': 'fa-cloud-sun',
            'غائم': 'fa-cloud',
            'معتدل': 'fa-cloud-sun-rain',
            'ممطر': 'fa-cloud-rain'
        };
        const iconEl = document.querySelector('#weather-widget i');
        if (iconEl) {
            const iconClass = iconMap[weatherData.condition] || 'fa-cloud-sun';
            iconEl.className = `fa-solid ${iconClass}`;
        }
    }

    openGlobalSearch() {
        const search = document.getElementById('home-quick-search');
        if (search) {
            search.focus();
            search.select();
            Utils.toast('🔍 ابحث عن أي شيء في الداش بورد', 'info');
        }
    }

    doQuickSearch(query) {
        if (!query.trim()) {
            Utils.toast('🔍 اكتب كلمة للبحث', 'info');
            return;
        }
        Utils.toast(`🔍 تم البحث عن: "${query}"`, 'info');
    }

    shareProfile() {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'Mohamed Abdallah - Portfolio',
                text: '👋 تعرف على ملفي الشخصي',
                url: url
            }).catch(() => {});
        } else {
            Utils.copy(url);
            Utils.toast('📋 تم نسخ رابط الملف الشخصي', 'success');
        }
    }

    downloadCV() {
        Utils.toast('📄 جاري تحضير السيرة الذاتية...', 'info');
        setTimeout(() => {
            Utils.toast('✅ تم تنزيل السيرة الذاتية', 'success');
        }, 1500);
    }

    refreshChart(chartType) {
        Utils.toast(`🔄 جاري تحديث المخطط: ${chartType === 'visitors' ? 'الزوار' : 'النمو'}`, 'info');
        setTimeout(() => {
            this.initCharts();
            Utils.toast('✅ تم تحديث المخطط', 'success');
        }, 1000);
    }

    togglePreview() {
        window.open('../index.html', '_blank');
    }

    doBackup() {
        Utils.toast('💾 جاري إنشاء نسخة احتياطية...', 'info');
        setTimeout(() => {
            const data = {
                timestamp: new Date().toISOString(),
                config: {
                    theme: this.state.get('theme'),
                    language: this.state.get('language')
                }
            };
            Utils.download(JSON.stringify(data, null, 2), `dashboard-backup-${Date.now()}.json`, 'application/json');
            Utils.toast('✅ تم إنشاء النسخة الاحتياطية', 'success');
        }, 1500);
    }

    doPublish() {
        if (confirm('هل أنت متأكد من نشر التغييرات؟')) {
            Utils.toast('🚀 جاري النشر...', 'info');
            setTimeout(() => {
                Utils.toast('✅ تم النشر بنجاح', 'success');
            }, 2000);
        }
    }

    openMediaManager() {
        Utils.toast('🖼️ فتح مكتبة الوسائط', 'info');
    }
}

// ============================================================
// 9. EDITOR ENGINE
// ============================================================
class EditorEngine {
    constructor(stateManager, eventManager) {
        this.state = stateManager;
        this.events = eventManager;
        this.currentLanguage = 'html';
        this.init();
    }

    init() {
        this.setupEvents();
        this.loadContent();
        console.log("📝 Editor Engine ready");
    }

    setupEvents() {
        // Prompt Editor
        const promptEditor = document.getElementById('promptEditor');
        if (promptEditor) {
            this.events.on(promptEditor, 'input', () => {
                Utils.storage.set('updater-prompt', promptEditor.value);
            });
        }

        // Copy Prompt
        const copyPrompt = document.getElementById('copyPromptBtn');
        if (copyPrompt) {
            this.events.on(copyPrompt, 'click', () => {
                const content = document.getElementById('promptEditor')?.value;
                if (content) Utils.copy(content);
                else Utils.toast('لا يوجد نص لنسخه', 'warning');
            });
        }

        // Clear Prompt
        const clearPrompt = document.getElementById('clearPromptBtn');
        if (clearPrompt) {
            this.events.on(clearPrompt, 'click', () => {
                const editor = document.getElementById('promptEditor');
                if (editor && confirm('هل تريد مسح المحرر؟')) {
                    editor.value = '';
                    Utils.storage.set('updater-prompt', '');
                    Utils.toast('تم مسح المحرر', 'info');
                }
            });
        }

        // Prompt Templates
        const templates = document.getElementById('promptTemplates');
        if (templates) {
            this.events.on(templates, 'change', (e) => {
                const template = e.target.value;
                if (template && template !== 'Select Template...') {
                    this.applyTemplate(template);
                }
            });
        }

        // Code Editor Actions
        const editorActions = {
            formatCodeBtn: () => this.formatCode(),
            beautifyCodeBtn: () => this.beautifyCode(),
            minifyCodeBtn: () => this.minifyCode(),
            copyCodeBtn: () => {
                const content = document.getElementById('codeEditorContent')?.textContent;
                if (content) Utils.copy(content);
            },
            downloadCodeBtn: () => this.downloadCode(),
            clearCodeBtn: () => {
                if (confirm('هل تريد مسح الكود؟')) {
                    const editor = document.getElementById('codeEditorContent');
                    if (editor) {
                        editor.textContent = '';
                        this.updateStats();
                        Utils.toast('تم مسح الكود', 'info');
                    }
                }
            }
        };

        for (const [id, fn] of Object.entries(editorActions)) {
            const btn = document.getElementById(id);
            if (btn) {
                this.events.on(btn, 'click', fn);
            }
        }

        // Language Select
        const langSelect = document.getElementById('codeLanguageSelect');
        if (langSelect) {
            this.events.on(langSelect, 'change', (e) => {
                this.currentLanguage = e.target.value;
                Utils.storage.set('updater-language', this.currentLanguage);
            });
        }

        // AI Actions
        const aiActions = {
            aiGenerateBtn: 'Generating code...',
            aiFixBtn: 'Fixing code...',
            aiOptimizeBtn: 'Optimizing code...',
            aiExplainBtn: 'Explaining code...'
        };

        for (const [id, message] of Object.entries(aiActions)) {
            const btn = document.getElementById(id);
            if (btn) {
                this.events.on(btn, 'click', () => {
                    Utils.toast(`🤖 ${message}`, 'info');
                    setTimeout(() => {
                        Utils.toast('✅ تم التنفيذ', 'success');
                        this.setConsoleOutput(`[AI] ${message} completed.`);
                    }, 1500);
                });
            }
        }

        // Snippet Copy
        const snippetBtn = document.getElementById('snippetCopyBtn');
        if (snippetBtn) {
            this.events.on(snippetBtn, 'click', () => {
                const snippet = `/* Glassmorphism Card */
.glass-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 24px;
}`;
                Utils.copy(snippet);
                this.setEditorContent(snippet);
            });
        }

        // Keyboard Shortcuts
        this.events.on(document, 'keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentCode();
            }
        });
    }

    loadContent() {
        const saved = Utils.storage.get('updater-content', null);
        if (saved) {
            const editor = document.getElementById('codeEditorContent');
            if (editor) {
                editor.textContent = saved;
                this.updateStats();
            }
        }

        const savedPrompt = Utils.storage.get('updater-prompt', '');
        const promptEditor = document.getElementById('promptEditor');
        if (promptEditor) promptEditor.value = savedPrompt;

        const savedLang = Utils.storage.get('updater-language', 'HTML');
        const langSelect = document.getElementById('codeLanguageSelect');
        if (langSelect) {
            langSelect.value = savedLang;
            this.currentLanguage = savedLang;
        }
    }

    saveCurrentCode() {
        const editor = document.getElementById('codeEditorContent');
        if (editor) {
            Utils.storage.set('updater-content', editor.textContent);
            Utils.storage.set('updater-language', this.currentLanguage);
            Utils.toast('💾 تم حفظ الكود', 'success');
            this.setConsoleOutput('[SAVE] Code saved.');
        }
    }

    applyTemplate(template) {
        const templates = {
            'Hero Section': `<section class="hero">
    <div class="container">
        <h1>Welcome to My Portfolio</h1>
        <p>Full Stack Developer</p>
        <a href="#contact" class="btn-primary">Get in Touch</a>
    </div>
</section>`,
            'Navbar & Menu': `<nav class="navbar">
    <div class="logo">MyBrand</div>
    <ul class="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
    </ul>
</nav>`,
            'Footer Layout': `<footer class="footer">
    <div class="container">
        <div class="footer-content">
            <p>&copy; 2024 All Rights Reserved</p>
            <div class="social-links">
                <a href="#"><i class="fab fa-github"></i></a>
                <a href="#"><i class="fab fa-linkedin"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
            </div>
        </div>
    </div>
</footer>`,
            'Contact Form': `<form class="contact-form">
    <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" placeholder="Your Name">
    </div>
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="your@email.com">
    </div>
    <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" rows="4" placeholder="Your Message"></textarea>
    </div>
    <button type="submit" class="btn-primary">Send Message</button>
</form>`,
            'Modern Card': `<div class="modern-card">
    <div class="card-image">
        <img src="https://via.placeholder.com/400x200" alt="Card Image">
    </div>
    <div class="card-body">
        <h3>Card Title</h3>
        <p>This is a modern card design with glassmorphism effect.</p>
        <a href="#" class="card-link">Learn More →</a>
    </div>
</div>`
        };

        const content = templates[template];
        if (content) {
            this.setEditorContent(content);
            Utils.toast(`📄 تم تطبيق قالب: ${template}`, 'success');
            this.setConsoleOutput(`[TEMPLATE] Applied: ${template}`);
        }
    }

    setEditorContent(content) {
        const editor = document.getElementById('codeEditorContent');
        if (editor) {
            editor.textContent = content;
            this.updateStats();
            this.saveCurrentCode();
        }
    }

    formatCode() {
        const editor = document.getElementById('codeEditorContent');
        if (editor) {
            let content = editor.textContent;
            content = content.replace(/\s+/g, ' ').trim();
            content = content.replace(/>\s+</g, '><');
            const lines = content.split('>').filter(line => line.trim());
            let formatted = '';
            let indent = 0;
            lines.forEach(line => {
                const trimmed = line.trim() + '>';
                if (trimmed.includes('</')) indent--;
                formatted += '  '.repeat(Math.max(0, indent)) + trimmed + '\n';
                if (trimmed.includes('<') && !trimmed.includes('</') && !trimmed.includes('/>')) indent++;
            });
            editor.textContent = formatted;
            this.updateStats();
            Utils.toast('✅ تم تنسيق الكود', 'success');
            this.setConsoleOutput('[FORMAT] Code formatted.');
        }
    }

    beautifyCode() {
        const editor = document.getElementById('codeEditorContent');
        if (editor) {
            let content = editor.textContent;
            content = content.replace(/>/g, '>\n');
            content = content.replace(/</g, '\n<');
            const lines = content.split('\n').filter(line => line.trim());
            let formatted = '';
            let indent = 0;
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.includes('</') && !trimmed.includes('</>')) indent--;
                formatted += '  '.repeat(Math.max(0, indent)) + trimmed + '\n';
                if (trimmed.includes('<') && !trimmed.includes('</') && !trimmed.includes('/>')) indent++;
            });
            editor.textContent = formatted;
            this.updateStats();
            Utils.toast('✨ تم تجميل الكود', 'success');
            this.setConsoleOutput('[BEAUTIFY] Code beautified.');
        }
    }

    minifyCode() {
        const editor = document.getElementById('codeEditorContent');
        if (editor) {
            let content = editor.textContent;
            content = content.replace(/\s+/g, ' ');
            content = content.replace(/>\s+</g, '><');
            content = content.trim();
            editor.textContent = content;
            this.updateStats();
            Utils.toast('📦 تم تصغير الكود', 'success');
            this.setConsoleOutput('[MINIFY] Code minified.');
        }
    }

    downloadCode() {
        const editor = document.getElementById('codeEditorContent');
        if (editor) {
            const content = editor.textContent;
            const ext = this.currentLanguage.toLowerCase();
            const filename = `code.${ext === 'javascript' ? 'js' : ext === 'html' ? 'html' : ext === 'css' ? 'css' : 'txt'}`;
            Utils.download(content, filename);
            Utils.toast('📥 تم تحميل الملف', 'success');
            this.setConsoleOutput(`[DOWNLOAD] Downloaded: ${filename}`);
        }
    }

    updateStats() {
        const editor = document.getElementById('codeEditorContent');
        if (editor) {
            const content = editor.textContent;
            const lines = content.split('\n').length;
            const words = content.split(/\s+/).filter(w => w).length;
            const chars = content.length;

            const statsEl = document.getElementById('codeStats');
            if (statsEl) {
                statsEl.innerHTML = `
                    <span>Lines: ${lines}</span>
                    <span>Words: ${words}</span>
                    <span>Chars: ${chars}</span>
                `;
            }
        }
    }

    setConsoleOutput(message) {
        const consoleEl = document.getElementById('devConsoleOutput');
        if (consoleEl) {
            const timestamp = new Date().toLocaleTimeString();
            consoleEl.textContent = `[${timestamp}] ${message}`;
        }
    }
}

// ============================================================
// 10. LOGOUT ENGINE
// ============================================================

// ============================================================
// LOGOUT ENGINE - Premium Logout Management
// ============================================================

class LogoutEngine {
    constructor(stateManager, eventManager) {
        this.state = stateManager;
        this.events = eventManager;
        this.SESSION_KEY = 'empire_admin_session_token_v40';
        this.init();
    }

    init() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            // Remove any existing listeners to prevent duplicates
            const newBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
            
            this.events.on(newBtn, 'click', () => {
                this.handleLogout();
            });
        }
        console.log("🚪 Logout Engine ready");
    }

    handleLogout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            Utils.toast('👋 جاري تسجيل الخروج...', 'info');

            // ============================================================
            // 1. CLEAR ALL AUTHENTICATION DATA
            // ============================================================
            
            // Remove main session token (matches login.html SESSION_KEY)
            localStorage.removeItem(this.SESSION_KEY);
            
            // Remove any backup/session keys
            localStorage.removeItem('empire_admin_session_token');
            localStorage.removeItem('admin_session');
            localStorage.removeItem('session_token');
            localStorage.removeItem('auth_token');
            
            // Clear all Supabase-related auth data
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('sb-');
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') || key.includes('supabase')) {
                    localStorage.removeItem(key);
                }
            });

            // ============================================================
            // 2. CLEAR USER PREFERENCES (but keep theme/language for UX)
            // ============================================================
            
            // Save preferences before clearing (optional - for better UX)
            const theme = this.state?.get('theme') || 'dark';
            const language = this.state?.get('language') || 'ar';
            const direction = this.state?.get('direction') || 'rtl';
            
            // Remove all user data except preferences
            const preferences = {
                theme: theme,
                language: language,
                direction: direction,
                lastLogout: new Date().toISOString()
            };
            
            // Clear ALL localStorage except our preferences
            const keysToKeep = ['dashboard-theme', 'dashboard-language', 'dashboard-direction'];
            Object.keys(localStorage).forEach(key => {
                if (!keysToKeep.includes(key) && key !== this.SESSION_KEY) {
                    localStorage.removeItem(key);
                }
            });
            
            // Save preferences back
            Utils.storage.set('user-preferences', preferences);
            Utils.storage.set('dashboard-theme', theme);
            Utils.storage.set('dashboard-language', language);
            Utils.storage.set('dashboard-direction', direction);

            // ============================================================
            // 3. CLEAR SESSION STORAGE
            // ============================================================
            
            sessionStorage.clear();

            // ============================================================
            // 4. CLEAR COOKIES (if any)
            // ============================================================
            
            document.cookie.split(';').forEach(cookie => {
                document.cookie = cookie
                    .replace(/^ +/, '')
                    .replace(/=.*/, `=; expires=${new Date(0).toUTCString()}; path=/`);
            });

            // ============================================================
            // 5. DISCONNECT SUPABASE (if available)
            // ============================================================
            
            if (typeof supabase !== 'undefined' && supabase.auth) {
                try {
                    supabase.auth.signOut().then(() => {
                        console.log('✅ Supabase signOut successful');
                    }).catch(err => {
                        console.warn('⚠️ Supabase signOut warning:', err);
                    });
                } catch (e) {
                    console.warn('⚠️ Supabase signOut error:', e);
                }
            }

            // ============================================================
            // 6. REDIRECT TO LOGIN PAGE (PREVENT BACK BUTTON)
            // ============================================================
            
            Utils.toast('✅ تم تسجيل الخروج بنجاح', 'success');
            
            // Small delay to show toast
            setTimeout(() => {
                // Use replace() to prevent back button from returning to dashboard
                window.location.replace('login.html');
            }, 600);
        }
    }

    // ============================================================
    // 7. CHECK AUTHENTICATION STATUS
    // ============================================================
    
    isAuthenticated() {
        const token = localStorage.getItem(this.SESSION_KEY);
        return token !== null && token.startsWith('token_');
    }

    // ============================================================
    // 8. AUTO-REDIRECT TO LOGIN IF NOT AUTHENTICATED
    // ============================================================
    
    checkAuthAndRedirect() {
        if (!this.isAuthenticated()) {
            const currentPage = window.location.pathname;
            // Don't redirect if already on login page
            if (!currentPage.includes('login.html')) {
                window.location.replace('login.html');
                return false;
            }
        }
        return true;
    }

    // ============================================================
    // 9. GET CURRENT USER INFO (from login)
    // ============================================================
    
    getCurrentUser() {
        return {
            name: 'Mohamed Abdallah',
            email: 'budiabdallah922@gmail.com',
            username: 'mohamed'
        };
    }
}

// ============================================================
// 10. AUTO-INITIALIZE ON PAGE LOAD
// ============================================================

// Check authentication on every page load
document.addEventListener('DOMContentLoaded', () => {
    // If LogoutEngine is available globally
    if (window.LogoutEngine && window.logoutEngine) {
        window.logoutEngine.checkAuthAndRedirect();
    }
});

// If page is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (window.LogoutEngine && window.logoutEngine) {
        window.logoutEngine.checkAuthAndRedirect();
    }
}
// ============================================================
// 11. MAIN APPLICATION
// ============================================================
class DashboardApp {
    constructor() {
        console.log('🚀 Initializing Dashboard Application...');

        // Initialize core systems
        this.stateManager = new StateManager();
        this.eventManager = new EventManager();

        // Initialize engines
        this.theme = new ThemeEngine(this.stateManager, this.eventManager);
        this.language = new LanguageEngine(this.stateManager, this.eventManager);
        this.navigation = new NavigationEngine(this.stateManager, this.eventManager);

        // Initialize section engines
        this.home = new HomeEngine(this.stateManager, this.eventManager);
        this.editor = new EditorEngine(this.stateManager, this.eventManager);

        // Initialize logout
        this.logout = new LogoutEngine(this.stateManager, this.eventManager);

        // Register sections with navigation
        this.navigation.registerSection('home-section', this.home);
        this.navigation.registerSection('updater-section', this.editor);

        // Setup global error handling
        this.setupErrorHandling();

        console.log('✅ Dashboard Application ready!');
        Utils.toast('🚀 Dashboard جاهز بالكامل', 'success');
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

// ============================================================
// 12. BOOTSTRAP
// ============================================================

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

// ============================================================
// 13. CONSOLE HELPERS
// ============================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 DASHBOARD PRO - v3.0.0                                 ║
║                                                              ║
║   📦 Available at: window.Dashboard                          ║
║                                                              ║
║   🔧 Modules:                                                ║
║   • Dashboard.stateManager - State Management               ║
║   • Dashboard.eventManager - Event Management               ║
║   • Dashboard.theme - Theme Engine                          ║
║   • Dashboard.language - Language Engine                    ║
║   • Dashboard.navigation - Navigation Engine                ║
║   • Dashboard.home - Home Engine                            ║
║   • Dashboard.editor - Editor Engine                        ║
║                                                              ║
║   ⌨️  Shortcuts:                                             ║
║   • Ctrl+K - Quick Search                                   ║
║   • Ctrl+S - Save Code (in Editor)                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

console.log('✅ Error handlers registered');
// ============================================================
// HERO ENGINE - Premium Hero Editor JavaScript
// ============================================================

class HeroEngine {
    constructor() {
        this.currentTab = 'hero-tab-content';
        this.previewDevice = 'desktop';
        this.previewTheme = 'dark';
        this.buttons = [];
        this.socials = [];
        this.stats = [];
        this.isAutoSave = true;
        this.saveTimeout = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 30;
        
        this.init();
    }

    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    init() {
        console.log('🎯 Hero Engine initializing...');
        this.setupTabs();
        this.setupButtons();
        this.setupInputs();
        this.setupPreview();
        this.setupAutoSave();
        this.loadData();
        this.updatePreview();
        console.log('✅ Hero Engine ready');
    }

    // ============================================================
    // 02. TAB SYSTEM
    // ============================================================
    setupTabs() {
        const tabs = document.querySelectorAll('#hero-section .tab-btn');
        tabs.forEach((btn) => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                if (tabId) {
                    this.switchTab(tabId, btn);
                }
            });
        });
    }

    switchTab(tabId, activeBtn) {
        // Hide all panes
        document.querySelectorAll('.hero-tab-pane').forEach(el => {
            el.style.display = 'none';
        });

        // Show target pane
        const target = document.getElementById(tabId);
        if (target) {
            target.style.display = 'block';
            target.style.animation = 'none';
            requestAnimationFrame(() => {
                target.style.animation = 'heroPaneFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        }

        // Update tab buttons
        document.querySelectorAll('#hero-section .tab-btn').forEach(btn => {
            btn.className = 'saas-btn saas-btn-secondary tab-btn';
        });
        if (activeBtn) {
            activeBtn.className = 'saas-btn saas-btn-primary tab-btn active-tab';
        }

        this.currentTab = tabId;
        this.saveHistory();
    }

    // ============================================================
    // 03. BUTTONS SETUP
    // ============================================================
    setupButtons() {
        // Save Draft
        const saveBtn = document.getElementById('hero-save-draft-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDraft());
        }

        // Publish
        const publishBtn = document.getElementById('hero-publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publish());
        }

        // Undo
        const undoBtn = document.getElementById('hero-undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        // Redo
        const redoBtn = document.getElementById('hero-redo-btn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }

        // Reset
        const resetBtn = document.getElementById('hero-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('هل تريد استعادة الإعدادات الافتراضية؟')) {
                    this.resetDefaults();
                }
            });
        }

        // Add Button
        const addBtn = document.getElementById('hero-add-button-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addButton());
        }

        // Add Social
        const socialBtn = document.getElementById('hero-add-social-btn');
        if (socialBtn) {
            socialBtn.addEventListener('click', () => this.addSocial());
        }

        // Add Stat
        const statBtn = document.getElementById('hero-add-stat-btn');
        if (statBtn) {
            statBtn.addEventListener('click', () => this.addStat());
        }

        // Upload Image
        const uploadBtn = document.getElementById('hero-upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                document.getElementById('hero-image-upload-input')?.click();
            });
        }

        const fileInput = document.getElementById('hero-image-upload-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Open Website
        const openBtn = document.getElementById('hero-open-website-btn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                window.open('../index.html', '_blank');
            });
        }
    }

    // ============================================================
    // 04. INPUTS SETUP
    // ============================================================
    setupInputs() {
        // Text inputs
        const inputs = [
            'hero-main-heading', 'hero-sub-heading', 'hero-typing-text',
            'hero-description', 'hero-full-name', 'hero-location',
            'hero-email', 'hero-custom-badge'
        ];

        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    this.updatePreview();
                    this.autoSave();
                });
                el.addEventListener('change', () => this.saveHistory());
            }
        });

        // Selects
        const selects = ['hero-availability-status', 'hero-layout-style'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    this.updatePreview();
                    this.autoSave();
                    this.saveHistory();
                });
            }
        });

        // Checkboxes
        const checks = [
            'hero-enable-typing', 'hero-badge-available',
            'hero-badge-verified', 'hero-effect-glow', 'hero-effect-float'
        ];
        checks.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    this.updatePreview();
                    this.autoSave();
                    this.saveHistory();
                });
            }
        });

        // Color picker
        const color = document.getElementById('hero-bg-color');
        if (color) {
            color.addEventListener('input', () => {
                this.updatePreview();
                this.autoSave();
            });
            color.addEventListener('change', () => this.saveHistory());
        }

        // Search
        const search = document.getElementById('hero-settings-search');
        if (search) {
            search.addEventListener('input', () => {
                this.filterSettings(search.value);
            });
        }
    }

    // ============================================================
    // 05. PREVIEW SYSTEM
    // ============================================================
    setupPreview() {
        // Device preview buttons
        const devices = ['desktop', 'tablet', 'mobile'];
        devices.forEach(device => {
            const btn = document.getElementById(`hero-preview-${device}-btn`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.previewDevice = device;
                    this.updatePreviewDevice(device);
                    // Update active state
                    devices.forEach(d => {
                        const b = document.getElementById(`hero-preview-${d}-btn`);
                        if (b) {
                            b.className = d === device ? 
                                'saas-btn saas-btn-primary' : 
                                'saas-btn saas-btn-secondary';
                        }
                    });
                });
            }
        });

        // Theme toggle
        const themeBtn = document.getElementById('hero-preview-theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.togglePreviewTheme());
        }

        // Refresh preview
        const refreshBtn = document.getElementById('hero-preview-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updatePreview();
                Utils.toast('🔄 تم تحديث المعاينة', 'info');
            });
        }
    }

    updatePreviewDevice(device) {
        const box = document.getElementById('hero-live-canvas-box');
        if (box) {
            const widths = { desktop: '780px', tablet: '580px', mobile: '380px' };
            box.style.maxWidth = widths[device] || '780px';
            box.style.transition = 'max-width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            Utils.toast(
                `📱 جهاز: ${device === 'desktop' ? 'حاسوب' : device === 'tablet' ? 'تابلت' : 'موبايل'}`,
                'info'
            );
        }
    }

    togglePreviewTheme() {
        const box = document.getElementById('hero-live-canvas-box');
        if (box) {
            const isLight = box.style.background === '#ffffff' || 
                           box.style.background === 'white' ||
                           box.style.background === 'rgb(255, 255, 255)';
            
            box.style.background = isLight ? 'rgba(18, 24, 43, 0.95)' : '#ffffff';
            box.style.color = isLight ? '#fff' : '#000';
            box.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

            // Update text colors
            const headings = box.querySelectorAll('h1, h3, h4');
            headings.forEach(el => {
                el.style.color = isLight ? '#fff' : '#000';
            });

            const desc = box.querySelectorAll('p, span');
            desc.forEach(el => {
                if (!el.closest('.saas-badge') && !el.closest('.saas-btn')) {
                    el.style.color = isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
                }
            });

            // Update badges
            const badge = document.getElementById('canvas-badge-view');
            if (badge) {
                badge.style.color = isLight ? '#10b981' : '#059669';
                badge.style.background = isLight ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)';
            }

            const customBadge = document.getElementById('canvas-custom-badge-view');
            if (customBadge) {
                customBadge.style.color = isLight ? '#fbbf24' : '#d97706';
                customBadge.style.background = isLight ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.08)';
            }

            // Update stats border
            const statsView = document.getElementById('canvas-stats-view');
            if (statsView) {
                statsView.style.borderTopColor = isLight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
            }

            this.previewTheme = isLight ? 'dark' : 'light';
            Utils.toast(isLight ? '🌙 الوضع المظلم' : '☀️ الوضع الفاتح', 'info');
        }
    }

    // ============================================================
    // 06. AUTO SAVE SYSTEM
    // ============================================================
    setupAutoSave() {
        // Auto save every 3 seconds if there are changes
        setInterval(() => {
            if (this.isAutoSave) {
                this.autoSave();
            }
        }, 3000);
    }

    autoSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveData();
            const now = new Date();
            Utils.setText('hero-last-saved-time', `تم الحفظ تلقائياً ${Utils.formatTime(now)}`);
        }, 500);
    }

    // ============================================================
    // 07. DATA MANAGEMENT
    // ============================================================
    loadData() {
        const saved = Utils.storage.get('hero-data', null);
        if (saved) {
            // Restore fields
            const fields = {
                'hero-main-heading': saved.heading,
                'hero-sub-heading': saved.subHeading,
                'hero-typing-text': saved.typingText,
                'hero-description': saved.description,
                'hero-full-name': saved.fullName,
                'hero-location': saved.location,
                'hero-email': saved.email,
                'hero-custom-badge': saved.customBadge,
                'hero-availability-status': saved.availability,
                'hero-layout-style': saved.layout,
                'hero-bg-color': saved.bgColor || '#0f172a',
            };

            for (const [id, val] of Object.entries(fields)) {
                Utils.setVal(id, val);
            }

            // Restore checkboxes
            const checks = {
                'hero-enable-typing': saved.enableTyping,
                'hero-badge-available': saved.badgeAvailable,
                'hero-badge-verified': saved.badgeVerified,
                'hero-effect-glow': saved.effectGlow,
                'hero-effect-float': saved.effectFloat,
            };

            for (const [id, val] of Object.entries(checks)) {
                const el = document.getElementById(id);
                if (el) {
                    el.checked = val !== undefined ? val : true;
                }
            }

            // Restore buttons
            if (saved.buttons && Array.isArray(saved.buttons)) {
                this.buttons = saved.buttons;
                this.renderButtons();
            }

            // Restore socials
            if (saved.socials && Array.isArray(saved.socials)) {
                this.socials = saved.socials;
                this.renderSocials();
            }

            // Restore stats
            if (saved.stats && Array.isArray(saved.stats)) {
                this.stats = saved.stats;
                this.renderStats();
            }

            // Restore image
            if (saved.profileImage) {
                const imgWrap = document.getElementById('canvas-profile-img-wrap');
                if (imgWrap) {
                    imgWrap.innerHTML = `<img src="${saved.profileImage}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                }
            }

            // Restore preview theme
            if (saved.previewTheme) {
                this.previewTheme = saved.previewTheme;
            }

            // Restore preview device
            if (saved.previewDevice) {
                this.previewDevice = saved.previewDevice;
                this.updatePreviewDevice(saved.previewDevice);
            }

            console.log('📂 Data loaded from storage');
        }
    }

    saveData() {
        const data = this.getFormData();
        Utils.storage.set('hero-data', data);
    }

    getFormData() {
        return {
            heading: Utils.getVal('hero-main-heading'),
            subHeading: Utils.getVal('hero-sub-heading'),
            typingText: Utils.getVal('hero-typing-text'),
            description: Utils.getVal('hero-description'),
            fullName: Utils.getVal('hero-full-name'),
            location: Utils.getVal('hero-location'),
            email: Utils.getVal('hero-email'),
            customBadge: Utils.getVal('hero-custom-badge'),
            availability: Utils.getVal('hero-availability-status'),
            layout: Utils.getVal('hero-layout-style'),
            bgColor: Utils.getVal('hero-bg-color'),
            enableTyping: document.getElementById('hero-enable-typing')?.checked || false,
            badgeAvailable: document.getElementById('hero-badge-available')?.checked || false,
            badgeVerified: document.getElementById('hero-badge-verified')?.checked || false,
            effectGlow: document.getElementById('hero-effect-glow')?.checked || false,
            effectFloat: document.getElementById('hero-effect-float')?.checked || false,
            buttons: this.buttons,
            socials: this.socials,
            stats: this.stats,
            profileImage: this.getProfileImage(),
            previewTheme: this.previewTheme,
            previewDevice: this.previewDevice,
            lastUpdated: new Date().toISOString()
        };
    }

    getProfileImage() {
        const imgWrap = document.getElementById('canvas-profile-img-wrap');
        if (imgWrap) {
            const img = imgWrap.querySelector('img');
            if (img) return img.src;
        }
        return null;
    }

    // ============================================================
    // 08. PREVIEW UPDATE
    // ============================================================
    updatePreview() {
        const data = this.getFormData();

        // Update main content
        Utils.setText('canvas-main-heading-view', data.heading || 'Hi, I\'m Mohamed Abdallah');
        Utils.setText('canvas-sub-heading-view', data.subHeading || 'Frontend Web Developer');
        Utils.setText('canvas-desc-view', data.description || 'Passionate frontend web developer...');

        // Update badges
        const badgeView = document.getElementById('canvas-badge-view');
        if (badgeView) {
            if (data.badgeAvailable) {
                badgeView.style.display = 'inline-flex';
                const dot = badgeView.querySelector('.fa-circle');
                if (dot) {
                    dot.style.color = '#10b981';
                }
                const text = badgeView.textContent.trim();
                badgeView.innerHTML = `<i class="fa-solid fa-circle" style="font-size:7px;color:#10b981;"></i> ${data.availability || 'Available For Work'}`;
            } else {
                badgeView.style.display = 'none';
            }
        }

        const customBadge = document.getElementById('canvas-custom-badge-view');
        if (customBadge) {
            if (data.badgeVerified && data.customBadge) {
                customBadge.style.display = 'inline-flex';
                customBadge.textContent = data.customBadge;
            } else {
                customBadge.style.display = 'none';
            }
        }

        // Update name in home section preview
        const nameEl = document.getElementById('home-user-name');
        if (nameEl) {
            nameEl.textContent = data.fullName || 'Mohamed Abdallah';
        }

        // Update layout
        const layoutFlex = document.getElementById('canvas-layout-flex');
        if (layoutFlex) {
            if (data.layout === 'center') {
                layoutFlex.style.justifyContent = 'center';
                layoutFlex.style.textAlign = 'center';
                layoutFlex.style.flexDirection = 'column';
            } else if (data.layout === 'image-left') {
                layoutFlex.style.flexDirection = 'row-reverse';
                layoutFlex.style.textAlign = 'left';
                layoutFlex.style.justifyContent = 'flex-start';
            } else {
                layoutFlex.style.flexDirection = 'row';
                layoutFlex.style.textAlign = 'left';
                layoutFlex.style.justifyContent = 'flex-start';
            }
        }

        // Update background color
        const canvasBox = document.getElementById('hero-live-canvas-box');
        if (canvasBox && data.bgColor) {
            const isLight = canvasBox.style.background === '#ffffff' || 
                           canvasBox.style.background === 'white';
            if (!isLight) {
                canvasBox.style.background = data.bgColor;
            }
        }

        // Update effects
        const imgWrap = document.getElementById('canvas-profile-img-wrap');
        if (imgWrap) {
            const parent = imgWrap.parentElement;
            if (data.effectGlow) {
                parent.style.boxShadow = '0 0 40px rgba(56,189,248,0.4)';
                parent.style.transition = 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            } else {
                parent.style.boxShadow = '0 0 25px rgba(56,189,248,0.2)';
            }

            if (data.effectFloat) {
                parent.style.animation = 'heroFloat 3s ease-in-out infinite';
            } else {
                parent.style.animation = 'none';
            }
        }

        // Update buttons
        this.renderButtons();
        this.renderSocials();
        this.renderStats();

        // Update time
        const now = new Date();
        const timeEl = document.getElementById('hero-last-saved-time');
        if (timeEl) {
            const savedData = Utils.storage.get('hero-data', null);
            if (savedData && savedData.lastUpdated) {
                timeEl.textContent = `آخر تحديث: ${Utils.formatTime(savedData.lastUpdated)}`;
            } else {
                timeEl.textContent = `آخر تحديث: ${Utils.formatTime(now)}`;
            }
        }
    }

    // ============================================================
    // 09. BUTTONS MANAGEMENT
    // ============================================================
    addButton() {
        const container = document.getElementById('hero-buttons-container');
        if (container) {
            const id = Utils.genId();
            const div = document.createElement('div');
            div.className = 'hero-button-row';
            div.dataset.id = id;
            div.innerHTML = `
                <input type="text" placeholder="نص الزر" value="زر جديد" class="btn-label">
                <input type="url" placeholder="رابط" value="#" class="btn-link">
                <select class="btn-style">
                    <option value="primary">رئيسي</option>
                    <option value="secondary">ثانوي</option>
                </select>
                <button class="delete-btn" title="حذف الزر">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            // Add delete functionality
            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('هل تريد حذف هذا الزر؟')) {
                    div.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                    div.style.transform = 'scale(0.9)';
                    div.style.opacity = '0';
                    setTimeout(() => {
                        div.remove();
                        this.saveButtons();
                        this.updatePreview();
                        Utils.toast('🗑️ تم حذف الزر', 'info');
                    }, 300);
                }
            });

            // Add input listeners
            div.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('change', () => {
                    this.saveButtons();
                    this.updatePreview();
                });
                el.addEventListener('input', () => {
                    this.updatePreview();
                });
            });

            container.appendChild(div);
            this.saveButtons();
            this.updatePreview();
            Utils.toast('➕ تم إضافة زر جديد', 'success');
            
            // Scroll to new button
            div.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    saveButtons() {
        const container = document.getElementById('hero-buttons-container');
        if (container) {
            const rows = container.querySelectorAll('.hero-button-row');
            this.buttons = Array.from(rows).map(row => ({
                id: row.dataset.id || Utils.genId(),
                label: row.querySelector('.btn-label')?.value || 'زر',
                link: row.querySelector('.btn-link')?.value || '#',
                style: row.querySelector('.btn-style')?.value || 'primary'
            }));
        }
    }

    renderButtons() {
        const container = document.getElementById('hero-buttons-container');
        if (!container) return;

        // Clear but preserve structure
        container.innerHTML = '';

        // If no buttons, show empty state
        if (!this.buttons || this.buttons.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:var(--text-sm);">
                    <i class="fa-solid fa-plus-circle" style="font-size:24px;color:var(--color-primary);opacity:0.3;"></i>
                    <p style="margin-top:8px;">لا توجد أزرار مضافة</p>
                    <p style="font-size:var(--text-xs);">اضغط على "إضافة زر جديد" لإضافة زر</p>
                </div>
            `;
            return;
        }

        this.buttons.forEach(btn => {
            const div = document.createElement('div');
            div.className = 'hero-button-row';
            div.dataset.id = btn.id;
            div.innerHTML = `
                <input type="text" placeholder="نص الزر" value="${btn.label || 'زر'}" class="btn-label">
                <input type="url" placeholder="رابط" value="${btn.link || '#'}" class="btn-link">
                <select class="btn-style">
                    <option value="primary" ${btn.style === 'primary' ? 'selected' : ''}>رئيسي</option>
                    <option value="secondary" ${btn.style === 'secondary' ? 'selected' : ''}>ثانوي</option>
                </select>
                <button class="delete-btn" title="حذف الزر">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('هل تريد حذف هذا الزر؟')) {
                    div.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                    div.style.transform = 'scale(0.9)';
                    div.style.opacity = '0';
                    setTimeout(() => {
                        div.remove();
                        this.saveButtons();
                        this.updatePreview();
                        Utils.toast('🗑️ تم حذف الزر', 'info');
                    }, 300);
                }
            });

            div.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('change', () => {
                    this.saveButtons();
                    this.updatePreview();
                });
                el.addEventListener('input', () => {
                    this.updatePreview();
                });
            });

            container.appendChild(div);
        });
    }

    // ============================================================
    // 10. SOCIALS MANAGEMENT
    // ============================================================
    addSocial() {
        const container = document.getElementById('hero-socials-container');
        if (container) {
            const div = document.createElement('div');
            div.className = 'hero-social-row';
            div.innerHTML = `
                <input type="text" placeholder="المنصة" value="منصة جديدة" class="social-platform">
                <input type="url" placeholder="الرابط" value="#" class="social-link">
                <button class="delete-btn" title="حذف المنصة">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('هل تريد حذف هذه المنصة؟')) {
                    div.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                    div.style.transform = 'scale(0.9)';
                    div.style.opacity = '0';
                    setTimeout(() => {
                        div.remove();
                        this.saveSocials();
                        this.updatePreview();
                        Utils.toast('🗑️ تم حذف المنصة', 'info');
                    }, 300);
                }
            });

            div.querySelectorAll('input').forEach(el => {
                el.addEventListener('change', () => {
                    this.saveSocials();
                    this.updatePreview();
                });
                el.addEventListener('input', () => this.updatePreview());
            });

            container.appendChild(div);
            this.saveSocials();
            this.updatePreview();
            Utils.toast('➕ تم إضافة منصة جديدة', 'success');
        }
    }

    saveSocials() {
        const container = document.getElementById('hero-socials-container');
        if (container) {
            const rows = container.querySelectorAll('.hero-social-row');
            this.socials = Array.from(rows).map(row => ({
                platform: row.querySelector('.social-platform')?.value || 'منصة',
                link: row.querySelector('.social-link')?.value || '#'
            }));
        }
    }

    renderSocials() {
        const container = document.getElementById('hero-socials-container');
        if (!container) return;

        container.innerHTML = '';

        if (!this.socials || this.socials.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:15px;color:var(--text-muted);font-size:var(--text-sm);">
                    <i class="fa-solid fa-share-nodes" style="font-size:20px;color:var(--color-primary);opacity:0.3;"></i>
                    <p style="margin-top:6px;">لا توجد منصات تواصل مضافة</p>
                </div>
            `;
            return;
        }

        this.socials.forEach(social => {
            const div = document.createElement('div');
            div.className = 'hero-social-row';
            div.innerHTML = `
                <input type="text" placeholder="المنصة" value="${social.platform || 'منصة'}" class="social-platform">
                <input type="url" placeholder="الرابط" value="${social.link || '#'}" class="social-link">
                <button class="delete-btn" title="حذف المنصة">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('هل تريد حذف هذه المنصة؟')) {
                    div.remove();
                    this.saveSocials();
                    this.updatePreview();
                    Utils.toast('🗑️ تم حذف المنصة', 'info');
                }
            });

            div.querySelectorAll('input').forEach(el => {
                el.addEventListener('change', () => {
                    this.saveSocials();
                    this.updatePreview();
                });
                el.addEventListener('input', () => this.updatePreview());
            });

            container.appendChild(div);
        });
    }

    // ============================================================
    // 11. STATS MANAGEMENT
    // ============================================================
    addStat() {
        const container = document.getElementById('hero-stats-container');
        if (container) {
            const div = document.createElement('div');
            div.className = 'hero-stat-row';
            div.innerHTML = `
                <div class="stat-row-inner">
                    <input type="text" placeholder="القيمة" value="100+" class="stat-value">
                    <input type="text" placeholder="الوصف" value="مشروع" class="stat-label-text">
                    <button class="delete-btn" title="حذف العداد">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('هل تريد حذف هذا العداد؟')) {
                    div.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                    div.style.transform = 'scale(0.9)';
                    div.style.opacity = '0';
                    setTimeout(() => {
                        div.remove();
                        this.saveStats();
                        this.updatePreview();
                        Utils.toast('🗑️ تم حذف العداد', 'info');
                    }, 300);
                }
            });

            div.querySelectorAll('input').forEach(el => {
                el.addEventListener('change', () => {
                    this.saveStats();
                    this.updatePreview();
                });
                el.addEventListener('input', () => this.updatePreview());
            });

            container.appendChild(div);
            this.saveStats();
            this.updatePreview();
            Utils.toast('➕ تم إضافة عداد جديد', 'success');
        }
    }

    saveStats() {
        const container = document.getElementById('hero-stats-container');
        if (container) {
            const rows = container.querySelectorAll('.hero-stat-row');
            this.stats = Array.from(rows).map(row => ({
                value: row.querySelector('.stat-value')?.value || '0',
                label: row.querySelector('.stat-label-text')?.value || 'عنصر'
            }));
        }
    }

    renderStats() {
        const container = document.getElementById('hero-stats-container');
        if (!container) return;

        container.innerHTML = '';

        if (!this.stats || this.stats.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:15px;color:var(--text-muted);font-size:var(--text-sm);">
                    <i class="fa-solid fa-chart-simple" style="font-size:20px;color:var(--color-primary);opacity:0.3;"></i>
                    <p style="margin-top:6px;">لا توجد إحصائيات مضافة</p>
                </div>
            `;
            return;
        }

        this.stats.forEach(stat => {
            const div = document.createElement('div');
            div.className = 'hero-stat-row';
            div.innerHTML = `
                <div class="stat-row-inner">
                    <input type="text" placeholder="القيمة" value="${stat.value || '0'}" class="stat-value">
                    <input type="text" placeholder="الوصف" value="${stat.label || 'عنصر'}" class="stat-label-text">
                    <button class="delete-btn" title="حذف العداد">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('هل تريد حذف هذا العداد؟')) {
                    div.remove();
                    this.saveStats();
                    this.updatePreview();
                    Utils.toast('🗑️ تم حذف العداد', 'info');
                }
            });

            div.querySelectorAll('input').forEach(el => {
                el.addEventListener('change', () => {
                    this.saveStats();
                    this.updatePreview();
                });
                el.addEventListener('input', () => this.updatePreview());
            });

            container.appendChild(div);
        });
    }

    // ============================================================
    // 12. IMAGE UPLOAD
    // ============================================================
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                Utils.toast('⚠️ الرجاء اختيار ملف صورة صالح', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Utils.toast('⚠️ حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target.result;
                const imgWrap = document.getElementById('canvas-profile-img-wrap');
                if (imgWrap) {
                    imgWrap.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    Utils.toast('🖼️ تم رفع الصورة بنجاح', 'success');
                    this.autoSave();
                    this.saveData();
                }
            };
            reader.onerror = () => {
                Utils.toast('❌ فشل في قراءة الصورة', 'error');
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = '';
    }

    // ============================================================
    // 13. UNDO / REDO
    // ============================================================
    saveHistory() {
        const data = this.getFormData();
        const snapshot = JSON.stringify(data);
        
        // Don't save if same as last
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snapshot) {
            return;
        }

        this.undoStack.push(snapshot);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length <= 1) {
            Utils.toast('⚠️ لا يوجد تراجع متاح', 'warning');
            return;
        }

        const current = this.undoStack.pop();
        this.redoStack.push(current);

        const previous = this.undoStack[this.undoStack.length - 1];
        if (previous) {
            this.restoreFromSnapshot(previous);
            Utils.toast('↩️ تم التراجع', 'info');
        }
    }

    redo() {
        if (this.redoStack.length === 0) {
            Utils.toast('⚠️ لا يوجد إعادة متاحة', 'warning');
            return;
        }

        const next = this.redoStack.pop();
        if (next) {
            this.undoStack.push(next);
            this.restoreFromSnapshot(next);
            Utils.toast('↪️ تم الإعادة', 'info');
        }
    }

    restoreFromSnapshot(snapshot) {
        try {
            const data = JSON.parse(snapshot);
            
            // Restore fields
            const fields = {
                'hero-main-heading': data.heading,
                'hero-sub-heading': data.subHeading,
                'hero-typing-text': data.typingText,
                'hero-description': data.description,
                'hero-full-name': data.fullName,
                'hero-location': data.location,
                'hero-email': data.email,
                'hero-custom-badge': data.customBadge,
                'hero-availability-status': data.availability,
                'hero-layout-style': data.layout,
                'hero-bg-color': data.bgColor || '#0f172a',
            };

            for (const [id, val] of Object.entries(fields)) {
                Utils.setVal(id, val);
            }

            const checks = {
                'hero-enable-typing': data.enableTyping,
                'hero-badge-available': data.badgeAvailable,
                'hero-badge-verified': data.badgeVerified,
                'hero-effect-glow': data.effectGlow,
                'hero-effect-float': data.effectFloat,
            };

            for (const [id, val] of Object.entries(checks)) {
                const el = document.getElementById(id);
                if (el) el.checked = val !== undefined ? val : true;
            }

            if (data.buttons) this.buttons = data.buttons;
            if (data.socials) this.socials = data.socials;
            if (data.stats) this.stats = data.stats;

            if (data.profileImage) {
                const imgWrap = document.getElementById('canvas-profile-img-wrap');
                if (imgWrap) {
                    imgWrap.innerHTML = `<img src="${data.profileImage}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                }
            }

            this.renderButtons();
            this.renderSocials();
            this.renderStats();
            this.updatePreview();
            this.saveData();

        } catch (e) {
            console.error('Error restoring snapshot:', e);
            Utils.toast('❌ خطأ في استعادة الحالة', 'error');
        }
    }

    // ============================================================
    // 14. SAVE & PUBLISH
    // ============================================================
    saveDraft() {
        this.updatePreview();
        this.saveData();
        Utils.toast('💾 تم حفظ المسودة بنجاح', 'success');
        const now = new Date();
        Utils.setText('hero-last-saved-time', `تم الحفظ ${Utils.formatTime(now)}`);
    }

    publish() {
        if (confirm('هل أنت متأكد من نشر التغييرات؟')) {
            this.updatePreview();
            this.saveData();
            Utils.toast('🚀 تم نشر التغييرات بنجاح', 'success');
            
            // Add to logs
            if (window.Dashboard && window.Dashboard.logs) {
                window.Dashboard.logs.addLog('📝 تم نشر تحديثات الهيرو');
            }
        }
    }

    // ============================================================
    // 15. RESET DEFAULTS
    // ============================================================
    resetDefaults() {
        const defaults = {
            'hero-main-heading': "Hi, I'm Mohamed Abdallah",
            'hero-sub-heading': 'Frontend Web Developer',
            'hero-typing-text': 'Frontend Developer, UI/UX Enthusiast, Supermarket Pro',
            'hero-description': 'Passionate frontend web developer specializing in building exceptional digital experiences with modern web technologies.',
            'hero-full-name': 'Mohamed Abdallah',
            'hero-location': 'Egypt',
            'hero-email': 'contact@mohamed.dev',
            'hero-custom-badge': '🔥 Available for Hire',
            'hero-availability-status': 'Available For Work',
            'hero-layout-style': 'image-right',
            'hero-bg-color': '#0f172a',
        };

        for (const [id, val] of Object.entries(defaults)) {
            Utils.setVal(id, val);
        }

        const checks = {
            'hero-enable-typing': true,
            'hero-badge-available': true,
            'hero-badge-verified': true,
            'hero-effect-glow': true,
            'hero-effect-float': true,
        };

        for (const [id, val] of Object.entries(checks)) {
            const el = document.getElementById(id);
            if (el) el.checked = val;
        }

        // Reset buttons, socials, stats
        this.buttons = [];
        this.socials = [];
        this.stats = [];
        this.renderButtons();
        this.renderSocials();
        this.renderStats();

        // Reset image
        const imgWrap = document.getElementById('canvas-profile-img-wrap');
        if (imgWrap) {
            imgWrap.innerHTML = `<i class="fa-solid fa-user"></i>`;
        }

        // Reset preview device
        this.previewDevice = 'desktop';
        this.updatePreviewDevice('desktop');
        
        // Reset theme
        this.previewTheme = 'dark';
        const box = document.getElementById('hero-live-canvas-box');
        if (box) {
            box.style.background = 'rgba(15, 23, 42, 0.95)';
            box.style.color = '#fff';
        }

        // Update active device buttons
        ['desktop', 'tablet', 'mobile'].forEach(device => {
            const btn = document.getElementById(`hero-preview-${device}-btn`);
            if (btn) {
                btn.className = device === 'desktop' ? 
                    'saas-btn saas-btn-primary' : 
                    'saas-btn saas-btn-secondary';
            }
        });

        this.updatePreview();
        this.saveData();
        this.undoStack = [];
        this.redoStack = [];
        Utils.toast('✅ تم استعادة الإعدادات الافتراضية', 'success');
    }

    // ============================================================
    // 16. FILTER SETTINGS
    // ============================================================
    filterSettings(query) {
        const tabs = document.querySelectorAll('#hero-section .tab-btn');
        const hasQuery = query && query.trim().length > 0;
        
        if (!hasQuery) {
            tabs.forEach(btn => {
                btn.style.display = 'inline-flex';
            });
            return;
        }

        const searchTerm = query.toLowerCase().trim();
        tabs.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            const match = text.includes(searchTerm);
            btn.style.display = match ? 'inline-flex' : 'none';
        });
    }

    // ============================================================
    // 17. KEYBOARD SHORTCUTS
    // ============================================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S = Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveDraft();
            }
            
            // Ctrl+Z = Undo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            
            // Ctrl+Y = Redo
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        });
    }
}

// ============================================================
// 18. ANIMATIONS (CSS for JavaScript animations)
// ============================================================

// Add floating animation style if not exists
const heroFloatStyles = `
@keyframes heroFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
`;
if (!document.querySelector('#hero-float-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'hero-float-styles';
    styleEl.textContent = heroFloatStyles;
    document.head.appendChild(styleEl);
}

// ============================================================
// 19. INITIALIZE
// ============================================================

// Initialize HeroEngine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if hero section exists
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
        window.HeroEngine = new HeroEngine();
        console.log('🎯 Hero Engine initialized');
    }
});

// If DOM already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const heroSection = document.getElementById('hero-section');
    if (heroSection && !window.HeroEngine) {
        window.HeroEngine = new HeroEngine();
        console.log('🎯 Hero Engine initialized (immediate)');
    }
}// ============================================================
// SKILLS ENGINE - Premium Skills Management JavaScript
// ============================================================

class SkillsEngine {
    constructor() {
        this.skills = [];
        this.categories = [
            'Web Development',
            'Programming',
            'Software Skills',
            'Tools'
        ];
        this.selectedSkills = new Set();
        this.currentFilter = {
            search: '',
            category: '',
            level: '',
            sort: 'order'
        };
        this.isModalOpen = false;
        this.editingId = null;
        this.isLoading = false;
        
        // Category colors for badges
        this.categoryColors = {
            'Web Development': '#6366f1',
            'Programming': '#8b5cf6',
            'Software Skills': '#a855f7',
            'Tools': '#d946ef'
        };
        
        // Level colors
        this.levelColors = {
            'Beginner': '#10b981',
            'Intermediate': '#fbbf24',
            'Advanced': '#f59e0b',
            'Expert': '#ef4444'
        };
        
        this.init();
    }

    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    init() {
        console.log('💻 Skills Engine initializing...');
        this.loadData();
        this.setupEvents();
        this.renderCategories();
        this.updateStats();
        this.setupModal();
        console.log('✅ Skills Engine ready');
    }

    // ============================================================
    // 02. DATA MANAGEMENT
    // ============================================================
    loadData() {
        const saved = Utils.storage.get('skills-data', null);
        if (saved && saved.length > 0) {
            this.skills = saved;
        } else {
            this.skills = this.getDefaultSkills();
        }
    }

    getDefaultSkills() {
        return [
            {
                id: Utils.genId(),
                name: 'React.js',
                category: 'Web Development',
                level: 'Advanced',
                progress: 90,
                icon: 'fa-brands fa-react',
                experience: '3 Years',
                desc: 'Building modern UI components with React and hooks',
                featured: true,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'JavaScript',
                category: 'Programming',
                level: 'Expert',
                progress: 95,
                icon: 'fa-brands fa-js',
                experience: '5 Years',
                desc: 'Advanced JavaScript with ES6+, async/await, and closures',
                featured: true,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'HTML & CSS',
                category: 'Web Development',
                level: 'Expert',
                progress: 98,
                icon: 'fa-brands fa-html5',
                experience: '5 Years',
                desc: 'Semantic HTML, CSS3 animations, flexbox, and grid',
                featured: true,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'Node.js',
                category: 'Programming',
                level: 'Advanced',
                progress: 80,
                icon: 'fa-brands fa-node',
                experience: '2 Years',
                desc: 'Building REST APIs and backend services with Node.js',
                featured: false,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'Git & GitHub',
                category: 'Tools',
                level: 'Advanced',
                progress: 85,
                icon: 'fa-brands fa-github',
                experience: '4 Years',
                desc: 'Version control, branching strategies, and CI/CD',
                featured: false,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'UI/UX Design',
                category: 'Software Skills',
                level: 'Intermediate',
                progress: 70,
                icon: 'fa-solid fa-palette',
                experience: '2 Years',
                desc: 'User interface design, prototyping, and user research',
                featured: false,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'TypeScript',
                category: 'Programming',
                level: 'Intermediate',
                progress: 65,
                icon: 'fa-brands fa-ts',
                experience: '1 Year',
                desc: 'Type-safe JavaScript with interfaces and generics',
                featured: false,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'Tailwind CSS',
                category: 'Web Development',
                level: 'Advanced',
                progress: 88,
                icon: 'fa-brands fa-tailwind',
                experience: '2 Years',
                desc: 'Utility-first CSS framework for rapid UI development',
                featured: false,
                hidden: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveData() {
        Utils.storage.set('skills-data', this.skills);
    }

    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    setupEvents() {
        // Add Skill Button
        const addBtn = document.getElementById('openSkillModalBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Close Modal Buttons
        const closeBtns = ['closeSkillModalBtn', 'cancelSkillBtn'];
        closeBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.closeModal());
            }
        });

        // Search Input
        const searchInput = document.getElementById('skill-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilter.search = e.target.value.toLowerCase();
                this.filterSkills();
            });
        }

        // Filter Dropdowns
        const filters = ['filter-category', 'filter-level', 'sort-skills-select'];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', (e) => {
                    const key = id.replace('filter-', '').replace('sort-', '');
                    if (id === 'sort-skills-select') {
                        this.currentFilter.sort = e.target.value;
                    } else {
                        this.currentFilter[key] = e.target.value;
                    }
                    this.filterSkills();
                });
            }
        });

        // Bulk Action Buttons
        const bulkBtns = ['bulkShowBtn', 'bulkHideBtn', 'bulkDeleteBtn'];
        bulkBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const action = id.replace('bulk', '').replace('Btn', '').toLowerCase();
                    this.bulkAction(action);
                });
            }
        });

        // Export Button
        const exportBtn = document.getElementById('exportSkillsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSkills());
        }

        // Form Submit
        const form = document.getElementById('skill-form');
        if (form) {
            form.addEventListener('submit', (e) => this.saveSkill(e));
        }

        // Live Preview
        const previewInputs = ['skill-name', 'skill-level', 'skill-progress', 'skill-icon'];
        previewInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updatePreview());
                el.addEventListener('change', () => this.updatePreview());
            }
        });

        // Close modal on overlay click
        const modal = document.getElementById('skill-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape closes modal
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeModal();
            }
            // Ctrl+F focuses search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const search = document.getElementById('skill-search-input');
                if (search) {
                    search.focus();
                    search.select();
                }
            }
        });
    }

    // ============================================================
    // 04. RENDER CATEGORIES
    // ============================================================
    renderCategories() {
        const container = document.getElementById('categories-container');
        if (!container) return;

        const filteredSkills = this.getFilteredSkills();
        const grouped = this.groupByCategory(filteredSkills);

        let html = '';
        let hasSkills = false;

        for (const [category, skills] of Object.entries(grouped)) {
            if (skills.length === 0) continue;
            hasSkills = true;

            const color = this.categoryColors[category] || '#6366f1';

            html += `
                <div class="category-card" data-category="${category}">
                    <div class="category-header">
                        <h3>
                            <i class="fa-solid fa-folder-open" style="color:${color};"></i>
                            ${category}
                        </h3>
                        <span class="category-count">${skills.length} مهارة</span>
                    </div>
                    <div class="skills-grid">
                        ${skills.map(skill => this.renderSkillCard(skill)).join('')}
                    </div>
                </div>
            `;
        }

        if (!hasSkills) {
            html = `
                <div class="skills-empty-state">
                    <i class="fa-solid fa-code"></i>
                    <h4>لا توجد مهارات مطابقة</h4>
                    <p>حاول تغيير معايير البحث أو الفلترة</p>
                    <button class="saas-btn saas-btn-primary" onclick="document.getElementById('openSkillModalBtn')?.click()" style="margin-top:16px;">
                        <i class="fa-solid fa-plus"></i> إضافة مهارة جديدة
                    </button>
                </div>
            `;
        }

        container.innerHTML = html;

        // Attach events to skill cards
        this.attachSkillEvents(container);
        this.animateProgressBars();
    }

    renderSkillCard(skill) {
        const isFeatured = skill.featured ? 'featured' : '';
        const levelColor = this.levelColors[skill.level] || '#94a3b8';
        const levelClass = skill.level.toLowerCase();

        return `
            <div class="skill-card ${isFeatured}" data-skill-id="${skill.id}" data-hidden="${skill.hidden}">
                <div class="skill-top">
                    <input type="checkbox" class="skill-checkbox" data-id="${skill.id}">
                    <div class="skill-icon-box">
                        <i class="${skill.icon || 'fa-solid fa-code'}"></i>
                    </div>
                    <span class="skill-name">${skill.name}</span>
                    ${skill.featured ? '<span class="skill-featured-badge">⭐</span>' : ''}
                </div>
                <div class="skill-meta">
                    <span class="skill-level-badge ${levelClass}" style="color:${levelColor};">
                        ${skill.level}
                    </span>
                    ${skill.experience ? `<span>• ${skill.experience}</span>` : ''}
                    <span>• ${skill.progress}%</span>
                </div>
                ${skill.desc ? `<p class="skill-desc">${Utils.truncate(skill.desc, 80)}</p>` : ''}
                <div class="skill-progress-track">
                    <div class="skill-progress-fill" style="width: ${skill.progress}%;"></div>
                </div>
                <div class="skill-progress-label">
                    <span>${skill.progress}%</span>
                    <span>${skill.hidden ? '🔒 مخفية' : '✅ مرئية'}</span>
                </div>
                <div class="skill-actions">
                    <button class="edit-btn" data-id="${skill.id}" title="تعديل">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="toggle-btn" data-id="${skill.id}" title="${skill.hidden ? 'إظهار' : 'إخفاء'}">
                        <i class="fa-solid fa-${skill.hidden ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button class="delete-btn" data-id="${skill.id}" title="حذف">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // 05. ATTACH SKILL EVENTS
    // ============================================================
    attachSkillEvents(container) {
        // Edit buttons
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.editSkill(id);
            });
        });

        // Toggle buttons
        container.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.toggleSkillVisibility(id);
            });
        });

        // Delete buttons
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id && confirm('هل تريد حذف هذه المهارة؟')) {
                    this.deleteSkill(id);
                }
            });
        });

        // Checkbox selection
        container.querySelectorAll('.skill-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBulkBar();
            });
        });

        // Select all in category (optional feature)
        const selectAllCheckboxes = container.querySelectorAll('.category-select-all');
        selectAllCheckboxes.forEach(selectAll => {
            selectAll.addEventListener('change', (e) => {
                const categoryCard = e.target.closest('.category-card');
                if (categoryCard) {
                    const checkboxes = categoryCard.querySelectorAll('.skill-checkbox');
                    checkboxes.forEach(cb => cb.checked = e.target.checked);
                    this.updateBulkBar();
                }
            });
        });
    }

    // ============================================================
    // 06. FILTER & SORT
    // ============================================================
    getFilteredSkills() {
        let filtered = [...this.skills];

        // Filter by search
        if (this.currentFilter.search) {
            const search = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(skill =>
                skill.name.toLowerCase().includes(search) ||
                (skill.desc && skill.desc.toLowerCase().includes(search)) ||
                skill.category.toLowerCase().includes(search)
            );
        }

        // Filter by category
        if (this.currentFilter.category) {
            filtered = filtered.filter(skill =>
                skill.category === this.currentFilter.category
            );
        }

        // Filter by level
        if (this.currentFilter.level) {
            filtered = filtered.filter(skill =>
                skill.level === this.currentFilter.level
            );
        }

        // Sort
        const sort = this.currentFilter.sort;
        if (sort === 'alpha') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'progress-desc') {
            filtered.sort((a, b) => b.progress - a.progress);
        } else if (sort === 'order') {
            // Keep original order (featured first, then by name)
            filtered.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.name.localeCompare(b.name);
            });
        }

        return filtered;
    }

    groupByCategory(skills) {
        const grouped = {};
        this.categories.forEach(cat => {
            grouped[cat] = skills.filter(skill => skill.category === cat && !skill.hidden);
        });
        return grouped;
    }

    filterSkills() {
        this.renderCategories();
        this.updateStats();
    }

    // ============================================================
    // 07. PROGRESS BAR ANIMATION
    // ============================================================
    animateProgressBars() {
        const fills = document.querySelectorAll('.skill-progress-fill');
        fills.forEach((fill, index) => {
            const targetWidth = parseFloat(fill.style.width) || 0;
            fill.style.width = '0%';
            
            setTimeout(() => {
                fill.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                fill.style.width = targetWidth + '%';
            }, 50 + (index * 50));
        });
    }

    // ============================================================
    // 08. BULK ACTIONS
    // ============================================================
    updateBulkBar() {
        const checkboxes = document.querySelectorAll('.skill-checkbox:checked');
        const count = checkboxes.length;
        const bar = document.getElementById('bulk-actions-bar');
        const label = document.getElementById('selected-count-label');

        if (bar) {
            bar.style.display = count > 0 ? 'flex' : 'none';
        }
        if (label) {
            label.textContent = `تم تحديد ${count} ${count === 1 ? 'عنصر' : 'عناصر'}`;
        }
    }

    getSelectedIds() {
        const checkboxes = document.querySelectorAll('.skill-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.dataset.id);
    }

    bulkAction(action) {
        const ids = this.getSelectedIds();
        if (ids.length === 0) {
            Utils.toast('⚠️ لم يتم تحديد أي مهارة', 'warning');
            return;
        }

        if (action === 'delete' && !confirm(`هل تريد حذف ${ids.length} مهارة؟`)) {
            return;
        }

        ids.forEach(id => {
            const skill = this.skills.find(s => s.id === id);
            if (skill) {
                if (action === 'show') skill.hidden = false;
                else if (action === 'hide') skill.hidden = true;
                else if (action === 'delete') {
                    this.skills = this.skills.filter(s => s.id !== id);
                }
            }
        });

        this.saveData();
        this.renderCategories();
        this.updateStats();
        this.updateBulkBar();

        const messages = {
            show: '👁️ تم إظهار المهارات المحددة',
            hide: '👁️ تم إخفاء المهارات المحددة',
            delete: '🗑️ تم حذف المهارات المحددة'
        };
        Utils.toast(messages[action] || '✅ تم تنفيذ الإجراء', 'success');

        // Add to logs if available
        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`📝 ${messages[action]}`);
        }
    }

    // ============================================================
    // 09. CRUD OPERATIONS
    // ============================================================
    openModal(skillId = null) {
        const modal = document.getElementById('skill-modal');
        if (!modal) return;

        const title = document.getElementById('skill-modal-title');
        if (title) {
            title.innerHTML = skillId
                ? '<i class="fa-solid fa-edit" style="color:var(--color-primary);"></i> تعديل المهارة'
                : '<i class="fa-solid fa-circle-plus" style="color:var(--color-primary);"></i> إضافة مهارة جديدة';
        }

        if (skillId) {
            const skill = this.skills.find(s => s.id === skillId);
            if (skill) {
                this.editingId = skillId;
                Utils.setVal('edit-skill-id', skill.id);
                Utils.setVal('skill-name', skill.name);
                Utils.setVal('skill-category', skill.category);
                Utils.setVal('skill-level', skill.level);
                Utils.setVal('skill-experience', skill.experience || '');
                Utils.setVal('skill-progress', skill.progress);
                Utils.setVal('skill-icon', skill.icon || 'fa-solid fa-code');
                Utils.setVal('skill-desc', skill.desc || '');
                
                const featured = document.getElementById('skill-featured');
                if (featured) featured.checked = skill.featured || false;

                const hidden = document.getElementById('skill-hidden');
                if (hidden) hidden.checked = skill.hidden || false;
            }
        } else {
            this.editingId = null;
            document.getElementById('skill-form')?.reset();
            Utils.setVal('edit-skill-id', '');
            Utils.setVal('skill-progress', 85);
            Utils.setVal('skill-icon', 'fa-solid fa-code');
            const featured = document.getElementById('skill-featured');
            if (featured) featured.checked = false;
            const hidden = document.getElementById('skill-hidden');
            if (hidden) hidden.checked = false;
        }

        modal.style.display = 'flex';
        this.isModalOpen = true;
        this.updatePreview();
        
        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('skill-name');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('skill-modal');
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
            this.editingId = null;
        }
    }

    saveSkill(e) {
        e.preventDefault();

        const id = Utils.getVal('edit-skill-id');
        const data = {
            name: Utils.getVal('skill-name').trim(),
            category: Utils.getVal('skill-category'),
            level: Utils.getVal('skill-level'),
            experience: Utils.getVal('skill-experience'),
            progress: parseInt(Utils.getVal('skill-progress')) || 0,
            icon: Utils.getVal('skill-icon') || 'fa-solid fa-code',
            desc: Utils.getVal('skill-desc'),
            featured: document.getElementById('skill-featured')?.checked || false,
            hidden: document.getElementById('skill-hidden')?.checked || false,
        };

        // Validation
        if (!data.name) {
            Utils.toast('⚠️ اسم المهارة مطلوب', 'warning');
            document.getElementById('skill-name')?.focus();
            return;
        }

        if (data.progress < 0 || data.progress > 100) {
            Utils.toast('⚠️ نسبة الإتقان يجب أن تكون بين 0 و 100', 'warning');
            document.getElementById('skill-progress')?.focus();
            return;
        }

        if (id) {
            // Edit existing
            const index = this.skills.findIndex(s => s.id === id);
            if (index !== -1) {
                this.skills[index] = { ...this.skills[index], ...data };
                Utils.toast('✅ تم تحديث المهارة', 'success');
                if (window.Dashboard && window.Dashboard.logs) {
                    window.Dashboard.logs.addLog(`📝 تعديل مهارة: ${data.name}`);
                }
            }
        } else {
            // Add new
            data.id = Utils.genId();
            data.createdAt = new Date().toISOString();
            this.skills.push(data);
            Utils.toast('✅ تم إضافة المهارة', 'success');
            if (window.Dashboard && window.Dashboard.logs) {
                window.Dashboard.logs.addLog(`📝 إضافة مهارة جديدة: ${data.name}`);
            }
        }

        this.closeModal();
        this.saveData();
        this.renderCategories();
        this.updateStats();
    }

    editSkill(id) {
        this.openModal(id);
    }

    deleteSkill(id) {
        const skill = this.skills.find(s => s.id === id);
        if (!skill) return;

        this.skills = this.skills.filter(s => s.id !== id);
        this.saveData();
        this.renderCategories();
        this.updateStats();
        Utils.toast(`🗑️ تم حذف المهارة: ${skill.name}`, 'info');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`🗑️ حذف مهارة: ${skill.name}`);
        }
    }

    toggleSkillVisibility(id) {
        const skill = this.skills.find(s => s.id === id);
        if (skill) {
            skill.hidden = !skill.hidden;
            this.saveData();
            this.renderCategories();
            this.updateStats();
            Utils.toast(
                skill.hidden ? `👁️ تم إخفاء المهارة: ${skill.name}` : `👁️ تم إظهار المهارة: ${skill.name}`,
                'info'
            );
        }
    }

    // ============================================================
    // 10. LIVE PREVIEW
    // ============================================================
    updatePreview() {
        const name = Utils.getVal('skill-name') || 'اسم المهارة';
        const level = Utils.getVal('skill-level') || 'Advanced';
        const progress = parseInt(Utils.getVal('skill-progress')) || 85;
        const icon = Utils.getVal('skill-icon') || 'fa-solid fa-code';

        Utils.setText('preview-title', name);
        Utils.setText('preview-badge', level);

        const progressFill = document.getElementById('preview-progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }

        const iconBox = document.getElementById('preview-icon-box');
        if (iconBox) {
            iconBox.innerHTML = `<i class="${icon}"></i>`;
        }

        // Update badge color
        const badge = document.getElementById('preview-badge');
        if (badge) {
            const colors = {
                'Beginner': '#10b981',
                'Intermediate': '#fbbf24',
                'Advanced': '#f59e0b',
                'Expert': '#ef4444'
            };
            badge.style.color = colors[level] || '#94a3b8';
        }
    }

    // ============================================================
    // 11. EXPORT SKILLS
    // ============================================================
    exportSkills() {
        const ids = this.getSelectedIds();
        let dataToExport;

        if (ids.length > 0) {
            dataToExport = this.skills.filter(s => ids.includes(s.id));
        } else {
            dataToExport = this.skills;
        }

        if (dataToExport.length === 0) {
            Utils.toast('⚠️ لا توجد مهارات للتصدير', 'warning');
            return;
        }

        const exportData = dataToExport.map(skill => ({
            name: skill.name,
            category: skill.category,
            level: skill.level,
            progress: skill.progress,
            icon: skill.icon,
            experience: skill.experience,
            desc: skill.desc,
            featured: skill.featured,
            hidden: skill.hidden
        }));

        Utils.download(
            JSON.stringify(exportData, null, 2),
            `skills-export-${Date.now()}.json`,
            'application/json'
        );

        Utils.toast(`📥 تم تصدير ${exportData.length} مهارة`, 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`📥 تصدير ${exportData.length} مهارة`);
        }
    }

    // ============================================================
    // 12. STATS UPDATE
    // ============================================================
    updateStats() {
        const total = this.skills.length;
        const visible = this.skills.filter(s => !s.hidden);
        const featured = this.skills.filter(s => s.featured && !s.hidden);
        const visibleSkills = this.skills.filter(s => !s.hidden);
        
        const avgProgress = visibleSkills.length > 0
            ? Math.round(visibleSkills.reduce((sum, s) => sum + s.progress, 0) / visibleSkills.length)
            : 0;

        const categoriesWithSkills = this.categories.filter(cat => {
            return this.skills.some(s => s.category === cat && !s.hidden);
        });

        Utils.setText('stat-total-categories', categoriesWithSkills.length);
        Utils.setText('stat-total-skills', total);
        Utils.setText('stat-visible-trend', `${visible.length} مرئية`);
        Utils.setText('stat-featured-skills', featured.length);
        Utils.setText('stat-avg-level', `${avgProgress}%`);

        // Update stat trends
        const trend = document.querySelector('.stat-trend.positive');
        if (trend) {
            if (avgProgress >= 70) {
                trend.textContent = 'ممتاز 🚀';
            } else if (avgProgress >= 50) {
                trend.textContent = 'جيد 📈';
            } else {
                trend.textContent = 'يحتاج تحسين 💪';
            }
        }
    }

    // ============================================================
    // 13. MODAL SETUP
    // ============================================================
    setupModal() {
        // Close modal with Escape key is handled in setupEvents
        
        // Trap focus inside modal when open
        document.addEventListener('focusin', (e) => {
            if (this.isModalOpen) {
                const modal = document.getElementById('skill-modal');
                if (modal && !modal.contains(e.target)) {
                    const focusable = modal.querySelectorAll(
                        'button, input, select, textarea'
                    );
                    if (focusable.length > 0) {
                        focusable[0].focus();
                    }
                }
            }
        });
    }

    // ============================================================
    // 14. IMPORT SKILLS (Future feature)
    // ============================================================
    importSkillsFromJSON(data) {
        if (!Array.isArray(data) || data.length === 0) {
            Utils.toast('⚠️ بيانات غير صالحة', 'error');
            return;
        }

        let imported = 0;
        data.forEach(item => {
            if (item.name && item.category) {
                const newSkill = {
                    id: Utils.genId(),
                    name: item.name,
                    category: item.category,
                    level: item.level || 'Intermediate',
                    progress: item.progress || 50,
                    icon: item.icon || 'fa-solid fa-code',
                    experience: item.experience || '',
                    desc: item.desc || '',
                    featured: item.featured || false,
                    hidden: item.hidden || false,
                    createdAt: new Date().toISOString()
                };
                this.skills.push(newSkill);
                imported++;
            }
        });

        if (imported > 0) {
            this.saveData();
            this.renderCategories();
            this.updateStats();
            Utils.toast(`📥 تم استيراد ${imported} مهارة`, 'success');
            if (window.Dashboard && window.Dashboard.logs) {
                window.Dashboard.logs.addLog(`📥 استيراد ${imported} مهارة`);
            }
        } else {
            Utils.toast('⚠️ لم يتم استيراد أي مهارة', 'warning');
        }
    }

    // ============================================================
    // 15. LOADING STATE
    // ============================================================
    setLoading(loading) {
        this.isLoading = loading;
        const container = document.getElementById('categories-container');
        if (container) {
            if (loading) {
                container.innerHTML = `
                    <div style="text-align:center;padding:60px;color:var(--text-muted);">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size:32px;color:var(--color-primary);"></i>
                        <p style="margin-top:16px;">جاري تحميل المهارات...</p>
                    </div>
                `;
            } else {
                this.renderCategories();
            }
        }
    }

    // ============================================================
    // 16. KEYBOARD SHORTCUTS
    // ============================================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+N = New Skill
            if (e.ctrlKey && e.key === 'n' && !this.isModalOpen) {
                e.preventDefault();
                this.openModal();
            }
            
            // Ctrl+F = Focus Search
            if (e.ctrlKey && e.key === 'f') {
                const search = document.getElementById('skill-search-input');
                if (search && !this.isModalOpen) {
                    e.preventDefault();
                    search.focus();
                    search.select();
                }
            }
        });
    }
}

// ============================================================
// 17. INITIALIZE
// ============================================================

// Initialize SkillsEngine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const skillsSection = document.getElementById('skills-section');
    if (skillsSection) {
        window.SkillsEngine = new SkillsEngine();
        console.log('💻 Skills Engine initialized');
    }
});

// If DOM already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const skillsSection = document.getElementById('skills-section');
    if (skillsSection && !window.SkillsEngine) {
        window.SkillsEngine = new SkillsEngine();
        console.log('💻 Skills Engine initialized (immediate)');
    }
}
// ============================================================
// PROJECTS ENGINE - Premium Projects Management JavaScript
// ============================================================

class ProjectsEngine {
    constructor() {
        this.projects = [];
        this.selectedProjects = new Set();
        this.currentFilter = {
            search: '',
            category: '',
            status: '',
            priority: '',
            sort: 'newest'
        };
        this.currentTab = 'tab-general';
        this.isModalOpen = false;
        this.editingId = null;
        this.isLoading = false;
        this.previewDevice = 'desktop';
        this.previewTheme = 'dark';
        
        // Status colors
        this.statusColors = {
            'Published': '#10b981',
            'Draft': '#94a3b8',
            'In Progress': '#fbbf24',
            'Completed': '#38bdf8',
            'Archived': '#64748b'
        };
        
        // Priority icons
        this.priorityIcons = {
            'High': '🔴',
            'Medium': '🟡',
            'Low': '🟢'
        };
        
        // Category colors
        this.categoryColors = {
            'Web Apps': '#6366f1',
            'Frontend': '#8b5cf6',
            'Tools & Dashboards': '#a855f7',
            'Landing Pages': '#d946ef'
        };
        
        this.init();
    }

    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    init() {
        console.log('📁 Projects Engine initializing...');
        this.loadData();
        this.setupEvents();
        this.renderProjects();
        this.updateStats();
        this.setupModal();
        this.setupPreview();
        console.log('✅ Projects Engine ready');
    }

    // ============================================================
    // 02. DATA MANAGEMENT
    // ============================================================
    loadData() {
        const saved = Utils.storage.get('projects-data', null);
        if (saved && saved.length > 0) {
            this.projects = saved;
        } else {
            this.projects = this.getDefaultProjects();
        }
    }

    getDefaultProjects() {
        return [
            {
                id: Utils.genId(),
                name: 'Portfolio Dashboard Pro',
                category: 'Web Apps',
                status: 'Published',
                priority: 'High',
                completion: 100,
                client: 'Personal Project',
                startDate: '2024-01-15',
                endDate: '2024-03-20',
                tech: 'HTML, CSS, JavaScript, Supabase',
                desc: 'لوحة تحكم احترافية لإدارة البورتفوليو مع نظام ذكاء اصطناعي',
                fullDesc: 'نظام متكامل لإدارة المحتوى مع لوحة تحكم ذكية ومحركات تحليل البيانات',
                thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
                liveUrl: 'https://dashboard.example.com',
                githubUrl: 'https://github.com/username/dashboard',
                featured: true,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'E-Commerce Platform',
                category: 'Web Apps',
                status: 'In Progress',
                priority: 'High',
                completion: 65,
                client: 'Startup Company',
                startDate: '2024-02-01',
                endDate: '',
                tech: 'React, Node.js, MongoDB',
                desc: 'منصة تجارة إلكترونية متكاملة مع نظام دفع آمن',
                fullDesc: 'منصة متطورة للتجارة الإلكترونية مع نظام إدارة متكامل ولوحة تحكم للبائعين',
                thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
                liveUrl: '',
                githubUrl: 'https://github.com/username/ecommerce',
                featured: false,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'Task Management System',
                category: 'Tools & Dashboards',
                status: 'Completed',
                priority: 'Medium',
                completion: 100,
                client: 'Freelance',
                startDate: '2023-11-10',
                endDate: '2024-01-05',
                tech: 'Vue.js, Firebase',
                desc: 'نظام إدارة المهام والمشاريع مع لوحة تحكم تفاعلية',
                fullDesc: 'أداة متكاملة لإدارة المهام مع لوحة تحكم تفاعلية وتقارير تحليلية',
                thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600',
                liveUrl: 'https://tasks.example.com',
                githubUrl: 'https://github.com/username/tasks',
                featured: false,
                hidden: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.genId(),
                name: 'SaaS Landing Page',
                category: 'Landing Pages',
                status: 'Published',
                priority: 'Low',
                completion: 100,
                client: 'SaaS Company',
                startDate: '2024-02-15',
                endDate: '2024-02-28',
                tech: 'HTML, CSS, JavaScript',
                desc: 'صفحة هبوط احترافية لمنتج SaaS مع تصميم جذاب',
                fullDesc: 'صفحة هبوط احترافية مع تصميم جذاب وتجربة مستخدم مميزة وتحويلات عالية',
                thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600',
                liveUrl: 'https://saas-landing.example.com',
                githubUrl: '',
                featured: true,
                hidden: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveData() {
        Utils.storage.set('projects-data', this.projects);
    }

    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    setupEvents() {
        // Add Project Button
        const addBtn = document.getElementById('openProjectModalBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Close Modal Buttons
        const closeBtns = ['closeProjectModalBtn', 'closeProjectModalBtn2'];
        closeBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.closeModal());
            }
        });

        // Reset Form
        const resetBtn = document.getElementById('resetProjectFormBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }

        // Modal Tabs
        document.querySelectorAll('#project-modal .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                if (tabId) this.switchModalTab(tabId, btn);
            });
        });

        // Search Input
        const searchInput = document.getElementById('project-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilter.search = e.target.value.toLowerCase();
                this.filterProjects();
            });
        }

        // Filter Dropdowns
        const filters = [
            'filter-project-category',
            'filter-project-status',
            'filter-project-priority',
            'sort-projects-select'
        ];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', (e) => {
                    const key = id.replace('filter-project-', '').replace('sort-projects-', '');
                    if (id === 'sort-projects-select') {
                        this.currentFilter.sort = e.target.value;
                    } else {
                        this.currentFilter[key] = e.target.value;
                    }
                    this.filterProjects();
                });
            }
        });

        // Bulk Action Buttons
        const bulkBtns = [
            'projectBulkPublish',
            'projectBulkUnpublish',
            'projectBulkFeature',
            'projectBulkArchive',
            'projectBulkDelete'
        ];
        bulkBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const action = id.replace('projectBulk', '').toLowerCase();
                    this.bulkAction(action);
                });
            }
        });

        // Export Button
        const exportBtn = document.getElementById('exportProjectsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportProjects());
        }

        // Import Button
        const importBtn = document.getElementById('importProjectsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('project-file-import-input')?.click();
            });
        }

        // Import File Input
        const fileInput = document.getElementById('project-file-import-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.importProjects(e));
        }

        // Form Submit
        const form = document.getElementById('project-form');
        if (form) {
            form.addEventListener('submit', (e) => this.saveProject(e));
        }

        // Image Upload
        const uploadBtn = document.getElementById('projImageUploadBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                document.getElementById('proj-image-file')?.click();
            });
        }

        const fileUpload = document.getElementById('proj-image-file');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Preview Device Buttons
        const previewDevices = ['previewDesktopBtn', 'previewTabletBtn', 'previewMobileBtn'];
        previewDevices.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const device = btn.dataset.device || 'desktop';
                    this.updatePreviewDevice(device);
                    // Update active state
                    previewDevices.forEach(d => {
                        const b = document.getElementById(d);
                        if (b) {
                            b.className = d === id ? 
                                'saas-btn saas-btn-primary' : 
                                'saas-btn saas-btn-secondary';
                        }
                    });
                });
            }
        });

        // Preview Theme
        const themeBtn = document.getElementById('previewThemeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.togglePreviewTheme());
        }

        // Preview Refresh
        const refreshBtn = document.getElementById('previewRefreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateProjectPreview());
        }

        // Close modal on overlay click
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeModal();
            }
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const search = document.getElementById('project-search-input');
                if (search) {
                    search.focus();
                    search.select();
                }
            }
            if (e.ctrlKey && e.key === 'n' && !this.isModalOpen) {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    // ============================================================
    // 04. RENDER PROJECTS
    // ============================================================
    renderProjects() {
        const container = document.getElementById('projects-grid-container');
        if (!container) return;

        const filteredProjects = this.getFilteredProjects();

        if (filteredProjects.length === 0) {
            container.innerHTML = `
                <div class="projects-empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <h4>لا توجد مشاريع مطابقة</h4>
                    <p>حاول تغيير معايير البحث أو الفلترة</p>
                    <button class="saas-btn saas-btn-primary" onclick="document.getElementById('openProjectModalBtn')?.click()">
                        <i class="fa-solid fa-plus"></i> إضافة مشروع جديد
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredProjects
            .map(project => this.renderProjectCard(project))
            .join('');

        this.attachProjectEvents(container);
        this.animateProgressBars();
    }

    renderProjectCard(project) {
        const isFeatured = project.featured ? 'featured' : '';
        const statusColor = this.statusColors[project.status] || '#94a3b8';
        const priorityIcon = this.priorityIcons[project.priority] || '🟡';
        const priorityClass = project.priority.toLowerCase();
        const statusClass = project.status.toLowerCase().replace(' ', '-');

        return `
            <div class="project-card ${isFeatured}" data-project-id="${project.id}" data-hidden="${project.hidden}">
                <!-- Thumbnail -->
                <div class="project-thumbnail">
                    <img src="${project.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'}" 
                         alt="${project.name}" 
                         loading="lazy">
                    <span class="status-badge-top ${statusClass}">${project.status}</span>
                    <div class="thumbnail-overlay">
                        ${project.liveUrl ? `
                            <a href="${project.liveUrl}" target="_blank" class="overlay-btn overlay-btn-primary">
                                <i class="fa-solid fa-globe"></i> معاينة
                            </a>
                        ` : ''}
                        ${project.githubUrl ? `
                            <a href="${project.githubUrl}" target="_blank" class="overlay-btn overlay-btn-secondary">
                                <i class="fa-brands fa-github"></i> كود
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Body -->
                <div class="project-body">
                    <div class="project-top">
                        <div class="project-title-area">
                            <input type="checkbox" class="project-checkbox" data-id="${project.id}">
                            <h4 class="project-name">${project.name}</h4>
                        </div>
                        <span class="project-priority ${priorityClass}">${priorityIcon} ${project.priority}</span>
                    </div>
                    
                    <div class="project-meta">
                        <span class="meta-item">
                            <i class="fa-solid fa-folder"></i> ${project.category}
                        </span>
                        <span class="meta-item">
                            <i class="fa-solid fa-user"></i> ${project.client || 'N/A'}
                        </span>
                        ${project.startDate ? `
                            <span class="meta-item">
                                <i class="fa-solid fa-calendar"></i> ${Utils.formatDate(project.startDate)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <p class="project-desc">${Utils.truncate(project.desc || '', 100)}</p>
                    
                    <div class="project-tech">
                        ${(project.tech || '').split(',').filter(t => t.trim()).slice(0, 4).map(t => `
                            <span class="tech-tag">${t.trim()}</span>
                        `).join('')}
                        ${(project.tech || '').split(',').filter(t => t.trim()).length > 4 ? 
                            `<span class="tech-tag">+${(project.tech || '').split(',').filter(t => t.trim()).length - 4}</span>` : ''}
                    </div>
                    
                    <div class="project-progress">
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${project.completion}%;"></div>
                        </div>
                        <div class="progress-label">
                            <span>${project.completion}% مكتمل</span>
                            <span>${project.featured ? '⭐ مميز' : ''}</span>
                        </div>
                    </div>
                    
                    <div class="project-actions">
                        <button class="edit-btn" data-id="${project.id}">
                            <i class="fa-solid fa-edit"></i> تعديل
                        </button>
                        <button class="toggle-btn" data-id="${project.id}">
                            <i class="fa-solid fa-${project.hidden ? 'eye' : 'eye-slash'}"></i>
                        </button>
                        <button class="delete-btn" data-id="${project.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        ${project.liveUrl ? `
                            <a href="${project.liveUrl}" target="_blank" class="live-link">
                                <i class="fa-solid fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // 05. ATTACH PROJECT EVENTS
    // ============================================================
    attachProjectEvents(container) {
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.editProject(id);
            });
        });

        container.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.toggleProjectVisibility(id);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id && confirm('هل تريد حذف هذا المشروع؟')) {
                    this.deleteProject(id);
                }
            });
        });

        container.querySelectorAll('.project-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBulkBar();
            });
        });
    }

    // ============================================================
    // 06. FILTER & SORT
    // ============================================================
    getFilteredProjects() {
        let filtered = [...this.projects];

        // Filter by search
        if (this.currentFilter.search) {
            const search = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(search) ||
                (project.desc && project.desc.toLowerCase().includes(search)) ||
                (project.tech && project.tech.toLowerCase().includes(search)) ||
                (project.client && project.client.toLowerCase().includes(search))
            );
        }

        // Filter by category
        if (this.currentFilter.category) {
            filtered = filtered.filter(project =>
                project.category === this.currentFilter.category
            );
        }

        // Filter by status
        if (this.currentFilter.status) {
            filtered = filtered.filter(project =>
                project.status === this.currentFilter.status
            );
        }

        // Filter by priority
        if (this.currentFilter.priority) {
            filtered = filtered.filter(project =>
                project.priority === this.currentFilter.priority
            );
        }

        // Sort
        const sort = this.currentFilter.sort;
        if (sort === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sort === 'oldest') {
            filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sort === 'alpha') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'priority') {
            const order = { High: 0, Medium: 1, Low: 2 };
            filtered.sort((a, b) => (order[a.priority] || 1) - (order[b.priority] || 1));
        } else if (sort === 'completion') {
            filtered.sort((a, b) => b.completion - a.completion);
        }

        return filtered;
    }

    filterProjects() {
        this.renderProjects();
        this.updateStats();
    }

    // ============================================================
    // 07. PROGRESS BAR ANIMATION
    // ============================================================
    animateProgressBars() {
        const fills = document.querySelectorAll('.progress-fill');
        fills.forEach((fill, index) => {
            const targetWidth = parseFloat(fill.style.width) || 0;
            fill.style.width = '0%';
            
            setTimeout(() => {
                fill.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                fill.style.width = targetWidth + '%';
            }, 50 + (index * 50));
        });
    }

    // ============================================================
    // 08. BULK ACTIONS
    // ============================================================
    updateBulkBar() {
        const checkboxes = document.querySelectorAll('.project-checkbox:checked');
        const count = checkboxes.length;
        const bar = document.getElementById('project-bulk-bar');
        const label = document.getElementById('project-selected-count');

        if (bar) {
            bar.style.display = count > 0 ? 'flex' : 'none';
        }
        if (label) {
            label.textContent = `تم تحديد ${count} ${count === 1 ? 'مشروع' : 'مشاريع'}`;
        }
    }

    getSelectedIds() {
        const checkboxes = document.querySelectorAll('.project-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.dataset.id);
    }

    bulkAction(action) {
        const ids = this.getSelectedIds();
        if (ids.length === 0) {
            Utils.toast('⚠️ لم يتم تحديد أي مشروع', 'warning');
            return;
        }

        if (action === 'delete' && !confirm(`هل تريد حذف ${ids.length} مشروع؟`)) {
            return;
        }

        ids.forEach(id => {
            const project = this.projects.find(p => p.id === id);
            if (project) {
                switch(action) {
                    case 'publish':
                        project.status = 'Published';
                        break;
                    case 'unpublish':
                        project.status = 'Draft';
                        break;
                    case 'feature':
                        project.featured = !project.featured;
                        break;
                    case 'archive':
                        project.hidden = true;
                        break;
                    case 'delete':
                        this.projects = this.projects.filter(p => p.id !== id);
                        break;
                }
            }
        });

        this.saveData();
        this.renderProjects();
        this.updateStats();
        this.updateBulkBar();

        const messages = {
            publish: '📢 تم نشر المشاريع المحددة',
            unpublish: '👁️ تم إلغاء نشر المشاريع المحددة',
            feature: '⭐ تم تمييز المشاريع المحددة',
            archive: '📦 تم أرشفة المشاريع المحددة',
            delete: '🗑️ تم حذف المشاريع المحددة'
        };
        Utils.toast(messages[action] || '✅ تم تنفيذ الإجراء', 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`📁 ${messages[action]}`);
        }
    }

    // ============================================================
    // 09. CRUD OPERATIONS
    // ============================================================
    openModal(projectId = null) {
        const modal = document.getElementById('project-modal');
        if (!modal) return;

        const title = document.getElementById('project-modal-title');
        if (title) {
            title.innerHTML = projectId
                ? '<i class="fa-solid fa-edit" style="color:var(--color-primary);"></i> تعديل المشروع'
                : '<i class="fa-solid fa-circle-plus" style="color:var(--color-primary);"></i> إضافة مشروع جديد';
        }

        if (projectId) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                this.editingId = projectId;
                Utils.setVal('edit-project-id', project.id);
                Utils.setVal('proj-name', project.name);
                Utils.setVal('proj-category', project.category);
                Utils.setVal('proj-status', project.status);
                Utils.setVal('proj-priority', project.priority);
                Utils.setVal('proj-completion', project.completion);
                Utils.setVal('proj-client', project.client || '');
                Utils.setVal('proj-start-date', project.startDate || '');
                Utils.setVal('proj-end-date', project.endDate || '');
                Utils.setVal('proj-tech', project.tech || '');
                Utils.setVal('proj-desc', project.desc || '');
                Utils.setVal('proj-full-desc', project.fullDesc || '');
                Utils.setVal('proj-thumbnail', project.thumbnail || '');
                Utils.setVal('proj-video-url', project.videoUrl || '');
                Utils.setVal('proj-gallery', project.gallery || '');
                Utils.setVal('proj-live-url', project.liveUrl || '');
                Utils.setVal('proj-github-url', project.githubUrl || '');
                Utils.setVal('proj-docs-url', project.docsUrl || '');
                Utils.setVal('proj-case-url', project.caseUrl || '');
                Utils.setVal('proj-meta-title', project.metaTitle || '');
                Utils.setVal('proj-slug', project.slug || '');
                Utils.setVal('proj-keywords', project.keywords || '');
                
                const featured = document.getElementById('proj-featured');
                if (featured) featured.checked = project.featured || false;

                const hidden = document.getElementById('proj-hidden');
                if (hidden) hidden.checked = project.hidden || false;
            }
        } else {
            this.editingId = null;
            document.getElementById('project-form')?.reset();
            Utils.setVal('edit-project-id', '');
            Utils.setVal('proj-completion', 100);
            Utils.setVal('proj-status', 'Draft');
            Utils.setVal('proj-priority', 'Medium');
            const featured = document.getElementById('proj-featured');
            if (featured) featured.checked = false;
            const hidden = document.getElementById('proj-hidden');
            if (hidden) hidden.checked = false;
        }

        modal.style.display = 'flex';
        this.isModalOpen = true;
        this.switchModalTab('tab-general');
        this.updateProjectPreview();
        
        setTimeout(() => {
            const firstInput = document.getElementById('proj-name');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
            this.editingId = null;
        }
    }

    saveProject(e) {
        e.preventDefault();

        const id = Utils.getVal('edit-project-id');
        const data = {
            name: Utils.getVal('proj-name').trim(),
            category: Utils.getVal('proj-category'),
            status: Utils.getVal('proj-status'),
            priority: Utils.getVal('proj-priority'),
            completion: parseInt(Utils.getVal('proj-completion')) || 0,
            client: Utils.getVal('proj-client'),
            startDate: Utils.getVal('proj-start-date'),
            endDate: Utils.getVal('proj-end-date'),
            tech: Utils.getVal('proj-tech'),
            desc: Utils.getVal('proj-desc'),
            fullDesc: Utils.getVal('proj-full-desc'),
            thumbnail: Utils.getVal('proj-thumbnail'),
            videoUrl: Utils.getVal('proj-video-url'),
            gallery: Utils.getVal('proj-gallery'),
            liveUrl: Utils.getVal('proj-live-url'),
            githubUrl: Utils.getVal('proj-github-url'),
            docsUrl: Utils.getVal('proj-docs-url'),
            caseUrl: Utils.getVal('proj-case-url'),
            metaTitle: Utils.getVal('proj-meta-title'),
            slug: Utils.getVal('proj-slug'),
            keywords: Utils.getVal('proj-keywords'),
            featured: document.getElementById('proj-featured')?.checked || false,
            hidden: document.getElementById('proj-hidden')?.checked || false,
        };

        // Validation
        if (!data.name) {
            Utils.toast('⚠️ اسم المشروع مطلوب', 'warning');
            document.getElementById('proj-name')?.focus();
            return;
        }

        if (data.completion < 0 || data.completion > 100) {
            Utils.toast('⚠️ نسبة الإنجاز يجب أن تكون بين 0 و 100', 'warning');
            document.getElementById('proj-completion')?.focus();
            return;
        }

        if (id) {
            // Edit existing
            const index = this.projects.findIndex(p => p.id === id);
            if (index !== -1) {
                this.projects[index] = { ...this.projects[index], ...data };
                Utils.toast('✅ تم تحديث المشروع', 'success');
                if (window.Dashboard && window.Dashboard.logs) {
                    window.Dashboard.logs.addLog(`📁 تعديل مشروع: ${data.name}`);
                }
            }
        } else {
            // Add new
            data.id = Utils.genId();
            data.createdAt = new Date().toISOString();
            this.projects.push(data);
            Utils.toast('✅ تم إضافة المشروع', 'success');
            if (window.Dashboard && window.Dashboard.logs) {
                window.Dashboard.logs.addLog(`📁 إضافة مشروع جديد: ${data.name}`);
            }
        }

        this.closeModal();
        this.saveData();
        this.renderProjects();
        this.updateStats();
    }

    editProject(id) {
        this.openModal(id);
    }

    deleteProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;

        this.projects = this.projects.filter(p => p.id !== id);
        this.saveData();
        this.renderProjects();
        this.updateStats();
        Utils.toast(`🗑️ تم حذف المشروع: ${project.name}`, 'info');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`🗑️ حذف مشروع: ${project.name}`);
        }
    }

    toggleProjectVisibility(id) {
        const project = this.projects.find(p => p.id === id);
        if (project) {
            project.hidden = !project.hidden;
            this.saveData();
            this.renderProjects();
            this.updateStats();
            Utils.toast(
                project.hidden ? `👁️ تم إخفاء المشروع: ${project.name}` : `👁️ تم إظهار المشروع: ${project.name}`,
                'info'
            );
        }
    }

    // ============================================================
    // 10. MODAL TABS
    // ============================================================
    switchModalTab(tabId, activeBtn = null) {
        // Hide all tabs
        document.querySelectorAll('.project-tab-content').forEach(el => {
            el.style.display = 'none';
        });

        // Show target tab
        const target = document.getElementById(tabId);
        if (target) {
            target.style.display = 'block';
            target.style.animation = 'none';
            requestAnimationFrame(() => {
                target.style.animation = 'tabContentFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        }

        // Update tab buttons
        document.querySelectorAll('#project-modal .tab-btn').forEach(btn => {
            btn.className = 'saas-btn saas-btn-secondary tab-btn';
        });
        if (activeBtn) {
            activeBtn.className = 'saas-btn saas-btn-primary tab-btn active-tab';
        } else {
            document.querySelectorAll('#project-modal .tab-btn').forEach(btn => {
                if (btn.dataset.tab === tabId) {
                    btn.className = 'saas-btn saas-btn-primary tab-btn active-tab';
                }
            });
        }

        this.currentTab = tabId;
    }

    // ============================================================
    // 11. PROJECT PREVIEW
    // ============================================================
    setupPreview() {
        // Initialize preview
        this.updateProjectPreview();
    }

    updateProjectPreview() {
        const name = Utils.getVal('proj-name') || 'اسم المشروع';
        const category = Utils.getVal('proj-category') || 'Web Apps';
        const status = Utils.getVal('proj-status') || 'Draft';
        const desc = Utils.getVal('proj-desc') || 'وصف موجز للمشروع...';
        const tech = Utils.getVal('proj-tech') || '';

        Utils.setText('prev-proj-title', name);
        Utils.setText('prev-proj-category', category);
        Utils.setText('prev-proj-badge', status);

        const descEl = document.getElementById('prev-proj-desc');
        if (descEl) descEl.textContent = desc || 'وصف موجز للمشروع...';

        const techContainer = document.getElementById('prev-proj-tech');
        if (techContainer) {
            const techs = tech.split(',').filter(t => t.trim());
            if (techs.length > 0) {
                techContainer.innerHTML = techs.slice(0, 4).map(t => 
                    `<span class="tech-tag">${t.trim()}</span>`
                ).join('');
            } else {
                techContainer.innerHTML = '<span style="font-size:var(--text-xs);color:var(--text-muted);">لا توجد تقنيات</span>';
            }
        }

        // Update badge color
        const badge = document.getElementById('prev-proj-badge');
        if (badge) {
            const colors = {
                'Published': '#10b981',
                'Draft': '#94a3b8',
                'In Progress': '#fbbf24',
                'Completed': '#38bdf8',
                'Archived': '#64748b'
            };
            badge.style.color = colors[status] || '#94a3b8';
            badge.style.borderColor = colors[status] ? `${colors[status]}44` : 'var(--border-color)';
            badge.style.background = colors[status] ? `${colors[status]}22` : 'var(--glass-bg)';
        }
    }

    updatePreviewDevice(device) {
        const wrapper = document.getElementById('preview-device-wrapper');
        const box = document.getElementById('live-preview-card-box');
        if (wrapper && box) {
            const widths = { desktop: '420px', tablet: '320px', mobile: '240px' };
            box.style.maxWidth = widths[device] || '420px';
            box.style.transition = 'max-width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            Utils.toast(
                `📱 جهاز: ${device === 'desktop' ? 'حاسوب' : device === 'tablet' ? 'تابلت' : 'موبايل'}`,
                'info'
            );
        }
    }

    togglePreviewTheme() {
        const box = document.getElementById('live-preview-card-box');
        if (box) {
            const isLight = box.style.background === '#ffffff' || 
                           box.style.background === 'white' ||
                           box.style.background === 'rgb(255, 255, 255)';
            
            box.style.background = isLight ? 'rgba(18, 24, 43, 0.95)' : '#ffffff';
            box.style.color = isLight ? '#fff' : '#000';
            box.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

            const headings = box.querySelectorAll('h4');
            headings.forEach(el => el.style.color = isLight ? '#fff' : '#000');

            const desc = box.querySelectorAll('p, span');
            desc.forEach(el => {
                if (!el.closest('.saas-badge') && !el.closest('.link-btn')) {
                    el.style.color = isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
                }
            });

            this.previewTheme = isLight ? 'dark' : 'light';
            Utils.toast(isLight ? '🌙 الوضع المظلم' : '☀️ الوضع الفاتح', 'info');
        }
    }

    // ============================================================
    // 12. IMAGE UPLOAD
    // ============================================================
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Utils.toast('⚠️ الرجاء اختيار ملف صورة صالح', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Utils.toast('⚠️ حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target.result;
                Utils.setVal('proj-thumbnail', url);
                Utils.toast('🖼️ تم رفع الصورة بنجاح', 'success');
                this.updateProjectPreview();
            };
            reader.onerror = () => {
                Utils.toast('❌ فشل في قراءة الصورة', 'error');
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    }

    // ============================================================
    // 13. RESET FORM
    // ============================================================
    resetForm() {
        if (confirm('هل تريد إعادة تعيين النموذج؟')) {
            document.getElementById('project-form')?.reset();
            Utils.setVal('edit-project-id', '');
            Utils.setVal('proj-completion', 100);
            Utils.setVal('proj-status', 'Draft');
            Utils.setVal('proj-priority', 'Medium');
            const featured = document.getElementById('proj-featured');
            if (featured) featured.checked = false;
            const hidden = document.getElementById('proj-hidden');
            if (hidden) hidden.checked = false;
            this.updateProjectPreview();
            Utils.toast('🔄 تم إعادة تعيين النموذج', 'info');
        }
    }

    // ============================================================
    // 14. EXPORT / IMPORT
    // ============================================================
    exportProjects() {
        const ids = this.getSelectedIds();
        let dataToExport;

        if (ids.length > 0) {
            dataToExport = this.projects.filter(p => ids.includes(p.id));
        } else {
            dataToExport = this.projects;
        }

        if (dataToExport.length === 0) {
            Utils.toast('⚠️ لا توجد مشاريع للتصدير', 'warning');
            return;
        }

        const exportData = dataToExport.map(project => ({
            name: project.name,
            category: project.category,
            status: project.status,
            priority: project.priority,
            completion: project.completion,
            client: project.client,
            startDate: project.startDate,
            endDate: project.endDate,
            tech: project.tech,
            desc: project.desc,
            fullDesc: project.fullDesc,
            thumbnail: project.thumbnail,
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
            featured: project.featured,
            hidden: project.hidden
        }));

        Utils.download(
            JSON.stringify(exportData, null, 2),
            `projects-export-${Date.now()}.json`,
            'application/json'
        );

        Utils.toast(`📥 تم تصدير ${exportData.length} مشروع`, 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`📥 تصدير ${exportData.length} مشروع`);
        }
    }

    importProjects(e) {
        const file = e.target.files[0];
        if (!file) return;

        Utils.importJSON(file)
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    Utils.toast('⚠️ بيانات غير صالحة', 'error');
                    return;
                }

                let imported = 0;
                data.forEach(item => {
                    if (item.name) {
                        const newProject = {
                            id: Utils.genId(),
                            name: item.name,
                            category: item.category || 'Web Apps',
                            status: item.status || 'Draft',
                            priority: item.priority || 'Medium',
                            completion: item.completion || 0,
                            client: item.client || '',
                            startDate: item.startDate || '',
                            endDate: item.endDate || '',
                            tech: item.tech || '',
                            desc: item.desc || '',
                            fullDesc: item.fullDesc || '',
                            thumbnail: item.thumbnail || '',
                            liveUrl: item.liveUrl || '',
                            githubUrl: item.githubUrl || '',
                            featured: item.featured || false,
                            hidden: item.hidden || false,
                            createdAt: new Date().toISOString()
                        };
                        this.projects.push(newProject);
                        imported++;
                    }
                });

                if (imported > 0) {
                    this.saveData();
                    this.renderProjects();
                    this.updateStats();
                    Utils.toast(`📥 تم استيراد ${imported} مشروع`, 'success');
                    if (window.Dashboard && window.Dashboard.logs) {
                        window.Dashboard.logs.addLog(`📥 استيراد ${imported} مشروع`);
                    }
                } else {
                    Utils.toast('⚠️ لم يتم استيراد أي مشروع', 'warning');
                }
            })
            .catch(err => {
                Utils.toast('❌ خطأ في استيراد الملف', 'error');
                console.error('Import error:', err);
            });

        e.target.value = '';
    }

    // ============================================================
    // 15. STATS UPDATE
    // ============================================================
    updateStats() {
        const total = this.projects.length;
        const visible = this.projects.filter(p => !p.hidden);
        const completed = this.projects.filter(p => p.status === 'Completed' && !p.hidden);
        const published = this.projects.filter(p => p.status === 'Published' && !p.hidden);
        const inProgress = this.projects.filter(p => p.status === 'In Progress' && !p.hidden);
        const featured = this.projects.filter(p => p.featured && !p.hidden);
        const archived = this.projects.filter(p => p.status === 'Archived' || p.hidden);

        Utils.setText('stat-total-projects', total);
        Utils.setText('stat-visible-projects-trend', `${visible.length} مرئية`);
        Utils.setText('stat-completed-projects', completed.length);
        Utils.setText('stat-published-projects', published.length);
        Utils.setText('stat-progress-projects', inProgress.length);
        Utils.setText('stat-featured-projects', featured.length);
        Utils.setText('stat-archived-projects', archived.length);
        Utils.setText('stat-hidden-projects', `${archived.length} مخفية`);

        // Update trends
        const trends = document.querySelectorAll('.stat-trend');
        trends.forEach(trend => {
            if (trend.classList.contains('positive')) {
                const value = parseInt(trend.closest('.stat-card').querySelector('.stat-value')?.textContent || 0);
                if (value > 0) {
                    trend.textContent = 'نشط ✅';
                } else {
                    trend.textContent = 'انتظار ⏳';
                }
            }
        });
    }

    // ============================================================
    // 16. LOADING STATE
    // ============================================================
    setLoading(loading) {
        this.isLoading = loading;
        const container = document.getElementById('projects-grid-container');
        if (container) {
            if (loading) {
                container.innerHTML = `
                    <div style="text-align:center;padding:60px;color:var(--text-muted);grid-column:1/-1;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size:32px;color:var(--color-primary);"></i>
                        <p style="margin-top:16px;">جاري تحميل المشاريع...</p>
                    </div>
                `;
            } else {
                this.renderProjects();
            }
        }
    }

    // ============================================================
    // 17. KEYBOARD SHORTCUTS
    // ============================================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+N = New Project
            if (e.ctrlKey && e.key === 'n' && !this.isModalOpen) {
                e.preventDefault();
                this.openModal();
            }
            
            // Ctrl+F = Focus Search
            if (e.ctrlKey && e.key === 'f') {
                const search = document.getElementById('project-search-input');
                if (search && !this.isModalOpen) {
                    e.preventDefault();
                    search.focus();
                    search.select();
                }
            }

            // Ctrl+S = Save (in modal)
            if (e.ctrlKey && e.key === 's' && this.isModalOpen) {
                e.preventDefault();
                document.getElementById('project-form')?.dispatchEvent(new Event('submit'));
            }
        });
    }
}

// ============================================================
// 18. INITIALIZE
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection) {
        window.ProjectsEngine = new ProjectsEngine();
        console.log('📁 Projects Engine initialized');
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection && !window.ProjectsEngine) {
        window.ProjectsEngine = new ProjectsEngine();
        console.log('📁 Projects Engine initialized (immediate)');
    }
}// ============================================================
// CERTIFICATES ENGINE - Premium Certificates Management JavaScript
// ============================================================
// ============================================================
// CERTIFICATES ENGINE - Premium Certificates Management
// Version: 2.0.0 - Fully Fixed
// ============================================================

// ============================================================
// 01. UTILITIES - الأدوات المساعدة
// ============================================================

window.Utils = window.Utils || {
    // DOM Helpers
    get: (id) => document.getElementById(id),
    getVal: (id) => document.getElementById(id)?.value || "",
    setVal: (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    },
    setText: (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },
    setHTML: (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    },
    show: (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "block";
    },
    hide: (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    },
    addClass: (id, cls) => {
        const el = document.getElementById(id);
        if (el) el.classList.add(cls);
    },
    removeClass: (id, cls) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove(cls);
    },

    // Date/Time Helpers
    formatDate: (date, locale = "ar-EG") => {
        if (!date) return "N/A";
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return "N/A";
            return d.toLocaleDateString(locale, {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch {
            return "N/A";
        }
    },
    formatTime: (date, locale = "ar-EG") => {
        if (!date) return "N/A";
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return "N/A";
            return d.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return "N/A";
        }
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
        // Remove existing toast
        const old = document.querySelector(".toast-custom");
        if (old) old.remove();

        const toast = document.createElement("div");
        toast.className = `toast-custom toast-${type}`;
        
        const icons = {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "ℹ️"
        };
        
        toast.innerHTML = `${icons[type] || "📢"} ${message}`;
        
        // Style the toast
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
            z-index: 10000;
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
        
        // Type-specific colors
        const typeColors = {
            success: 'rgba(16, 185, 129, 0.15)',
            error: 'rgba(239, 68, 68, 0.15)',
            warning: 'rgba(251, 191, 36, 0.15)',
            info: 'rgba(56, 189, 248, 0.15)'
        };
        toast.style.borderColor = typeColors[type] || 'rgba(56, 189, 248, 0.2)';
        
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px) scale(0.95)';
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
    download: (content, filename, type = "application/json") => {
        try {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            return true;
        } catch (e) {
            console.error("Download error:", e);
            Utils.toast("❌ فشل في تحميل الملف", "error");
            return false;
        }
    },

    // Import JSON from file
    importJSON: (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("No file provided"));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (err) {
                    reject(new Error("Invalid JSON format"));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
        });
    },

    // ID Generator
    genId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // Truncate
    truncate: (text, max = 100) => {
        if (!text) return "";
        if (typeof text !== "string") text = String(text);
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






// ============================================================
// SUPPORT ENGINE - Premium Support Management JavaScript
// ============================================================

class SupportEngine {
    constructor() {
        this.tickets = [];
        this.activeTicketId = null;
        this.isLoading = false;
        this.init();
    }

    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    init() {
        console.log('🎧 Support Engine initializing...');
        this.loadData();
        this.setupEvents();
        this.renderTickets();
        console.log('✅ Support Engine ready');
    }

    // ============================================================
    // 02. DATA MANAGEMENT
    // ============================================================
    loadData() {
        const saved = Utils.storage.get('support-tickets', null);
        if (saved && saved.length > 0) {
            this.tickets = saved;
        } else {
            this.tickets = this.getDefaultTickets();
        }
    }

    getDefaultTickets() {
        return [
            {
                id: Utils.genId(),
                title: 'مشكلة في تحميل الموقع',
                status: 'open',
                priority: 'high',
                customer: 'Ahmed Mohamed',
                email: 'ahmed@example.com',
                message: 'الموقع لا يتم تحميله بشكل صحيح على متصفح Chrome، تظهر لي صفحة بيضاء عند محاولة الدخول',
                device: 'Desktop',
                browser: 'Chrome 120',
                ip: '192.168.1.1',
                location: 'Cairo, Egypt',
                date: new Date(Date.now() - 3600000).toISOString(),
                replies: []
            },
            {
                id: Utils.genId(),
                title: 'استفسار عن الأسعار والخدمات',
                status: 'open',
                priority: 'medium',
                customer: 'Sara Ali',
                email: 'sara@example.com',
                message: 'أود معرفة تفاصيل الأسعار للخدمات المقدمة وباقات التطوير المتاحة',
                device: 'Mobile',
                browser: 'Safari 17',
                ip: '192.168.1.2',
                location: 'Alexandria, Egypt',
                date: new Date(Date.now() - 7200000).toISOString(),
                replies: []
            },
            {
                id: Utils.genId(),
                title: 'طلب تعديلات على المشروع',
                status: 'open',
                priority: 'low',
                customer: 'Khaled Hassan',
                email: 'khaled@example.com',
                message: 'أريد إضافة بعض التعديلات على المشروع المطلوب، هل يمكن التواصل لمناقشة التفاصيل؟',
                device: 'Desktop',
                browser: 'Firefox 121',
                ip: '192.168.1.3',
                location: 'Giza, Egypt',
                date: new Date(Date.now() - 10800000).toISOString(),
                replies: []
            },
            {
                id: Utils.genId(),
                title: 'شكراً على الخدمة الممتازة',
                status: 'closed',
                priority: 'low',
                customer: 'Mona Ibrahim',
                email: 'mona@example.com',
                message: 'أود أن أشكركم على الخدمة الممتازة والدعم السريع والمهني من فريقكم',
                device: 'Mobile',
                browser: 'Chrome 120',
                ip: '192.168.1.4',
                location: 'Dubai, UAE',
                date: new Date(Date.now() - 86400000).toISOString(),
                replies: [
                    {
                        id: Utils.genId(),
                        message: 'شكراً لك Mona على كلماتك الجميلة، نحن سعداء بخدمتك دائماً',
                        date: new Date(Date.now() - 80000000).toISOString()
                    }
                ]
            }
        ];
    }

    saveData() {
        Utils.storage.set('support-tickets', this.tickets);
    }

    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    setupEvents() {
        // Reply button
        const replyBtn = document.getElementById('sendReplyBtn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => this.sendReply());
        }

        // Reply input - Enter key
        const replyInput = document.getElementById('adminReplyInput');
        if (replyInput) {
            replyInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendReply();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to clear selection
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }

    // ============================================================
    // 04. RENDER TICKETS
    // ============================================================
    renderTickets() {
        const sidebar = document.getElementById('supportTicketsSidebar');
        if (!sidebar) return;

        const openTickets = this.tickets.filter(t => t.status === 'open');

        if (openTickets.length === 0) {
            sidebar.innerHTML = `
                <div class="tickets-empty">
                    <i class="fa-solid fa-ticket"></i>
                    <p>لا توجد تذاكر مفتوحة</p>
                    <p style="font-size:var(--text-2xs);color:var(--text-muted);">جميع التذاكر مغلقة</p>
                </div>
            `;
            return;
        }

        sidebar.innerHTML = openTickets
            .map(ticket => this.renderTicketItem(ticket))
            .join('');

        // Attach click events
        sidebar.querySelectorAll('.ticket-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.ticketId;
                if (id) this.selectTicket(id);
            });
        });

        // Select first ticket if no active ticket
        if (!this.activeTicketId && openTickets.length > 0) {
            this.selectTicket(openTickets[0].id);
        } else if (this.activeTicketId) {
            // Highlight active ticket
            const activeItem = sidebar.querySelector(`.ticket-item[data-ticket-id="${this.activeTicketId}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            } else if (openTickets.length > 0) {
                this.selectTicket(openTickets[0].id);
            }
        }
    }

    renderTicketItem(ticket) {
        const priorityLabels = {
            high: 'عاجل',
            medium: 'متوسط',
            low: 'عادي'
        };
        const priorityClass = ticket.priority;

        return `
            <div class="ticket-item" data-ticket-id="${ticket.id}">
                <div class="ticket-top">
                    <span class="ticket-title">${Utils.truncate(ticket.title, 30)}</span>
                    <span class="ticket-priority ${priorityClass}">${priorityLabels[ticket.priority] || ticket.priority}</span>
                </div>
                <div class="ticket-meta">
                    <span class="ticket-customer">
                        <i class="fa-solid fa-user"></i>
                        ${ticket.customer}
                    </span>
                    <span class="ticket-time">${Utils.formatTime(ticket.date)}</span>
                </div>
                <div class="ticket-device-info">
                    <span class="device-tag">💻 ${ticket.device}</span>
                    <span class="device-tag">🌐 ${ticket.browser}</span>
                    ${ticket.replies && ticket.replies.length > 0 ? 
                        `<span class="device-tag" style="color:var(--color-success);">${ticket.replies.length} ردود</span>` : 
                        ''
                    }
                </div>
            </div>
        `;
    }

    // ============================================================
    // 05. SELECT TICKET
    // ============================================================
    selectTicket(id) {
        this.activeTicketId = id;
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return;

        // Update sidebar highlighting
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.classList.toggle('active', item.dataset.ticketId === id);
        });

        // Update chat header
        this.updateChatHeader(ticket);

        // Update chat body
        this.updateChatBody(ticket);

        // Enable reply input
        this.enableReplyInput(true);

        // Scroll to bottom
        this.scrollToBottom();

        // Add to logs if available
        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`👁️ عرض تذكرة: ${ticket.title}`);
        }
    }

    // ============================================================
    // 06. UPDATE CHAT HEADER
    // ============================================================
    updateChatHeader(ticket) {
        const titleEl = document.getElementById('activeTicketTitle');
        const statusEl = document.getElementById('activeTicketStatus');

        if (titleEl) {
            titleEl.textContent = ticket.title;
        }

        if (statusEl) {
            const statusLabels = {
                open: '🟢 مفتوحة',
                closed: '⚪ مغلقة',
                pending: '🟡 معلقة'
            };
            statusEl.textContent = statusLabels[ticket.status] || ticket.status;
            statusEl.className = `status-badge status-${ticket.status}`;
        }
    }

    // ============================================================
    // 07. UPDATE CHAT BODY
    // ============================================================
    updateChatBody(ticket) {
        const body = document.getElementById('activeTicketMessages');
        if (!body) return;

        let html = '';

        // Customer message
        html += `
            <div class="message-bubble customer">
                <div class="msg-header">
                    <span class="msg-sender">👤 ${ticket.customer}</span>
                    <span class="msg-time">${Utils.formatDateTime(ticket.date)}</span>
                </div>
                <div class="msg-content">${ticket.message}</div>
                <div class="msg-device-info">
                    <span>💻 ${ticket.device}</span>
                    <span>🌐 ${ticket.browser}</span>
                    <span>📍 ${ticket.location}</span>
                    <span>🆔 ${ticket.ip}</span>
                </div>
            </div>
        `;

        // Admin replies
        if (ticket.replies && ticket.replies.length > 0) {
            ticket.replies.forEach(reply => {
                html += `
                    <div class="message-bubble admin">
                        <div class="msg-header">
                            <span class="msg-sender">🛡️ Admin</span>
                            <span class="msg-time">${Utils.formatDateTime(reply.date)}</span>
                        </div>
                        <div class="msg-content">${reply.message}</div>
                    </div>
                `;
            });
        }

        // Empty state if no messages
        if (!html) {
            html = `
                <div class="empty-state">
                    <i class="fa-solid fa-comment-dots"></i>
                    <p>لا توجد رسائل في هذه التذكرة</p>
                </div>
            `;
        }

        body.innerHTML = html;
        this.scrollToBottom();
    }

    // ============================================================
    // 08. SEND REPLY
    // ============================================================
    sendReply() {
        const input = document.getElementById('adminReplyInput');
        if (!input || !input.value.trim()) {
            Utils.toast('⚠️ الرجاء كتابة الرد', 'warning');
            input?.focus();
            return;
        }

        const ticket = this.tickets.find(t => t.id === this.activeTicketId);
        if (!ticket) {
            Utils.toast('❌ لم يتم العثور على التذكرة', 'error');
            return;
        }

        const reply = {
            id: Utils.genId(),
            message: input.value.trim(),
            date: new Date().toISOString()
        };

        if (!ticket.replies) ticket.replies = [];
        ticket.replies.push(reply);

        // Update ticket status if needed
        if (ticket.status === 'open') {
            // Keep open
        }

        this.saveData();
        this.updateChatBody(ticket);
        input.value = '';

        Utils.toast('✅ تم إرسال الرد بنجاح', 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`💬 رد على تذكرة: ${ticket.title}`);
        }

        // Focus input for next reply
        input.focus();
    }

    // ============================================================
    // 09. ENABLE REPLY INPUT
    // ============================================================
    enableReplyInput(enabled) {
        const input = document.getElementById('adminReplyInput');
        const btn = document.getElementById('sendReplyBtn');

        if (input) {
            input.disabled = !enabled;
            if (enabled) {
                input.placeholder = 'اكتب ردك للعميل...';
            } else {
                input.placeholder = 'اختر تذكرة لبدء المحادثة...';
            }
        }

        if (btn) {
            btn.disabled = !enabled;
        }
    }

    // ============================================================
    // 10. SCROLL TO BOTTOM
    // ============================================================
    scrollToBottom() {
        const body = document.getElementById('activeTicketMessages');
        if (body) {
            setTimeout(() => {
                body.scrollTop = body.scrollHeight;
            }, 100);
        }
    }

    // ============================================================
    // 11. CLEAR SELECTION
    // ============================================================
    clearSelection() {
        this.activeTicketId = null;
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.classList.remove('active');
        });
        this.enableReplyInput(false);

        const titleEl = document.getElementById('activeTicketTitle');
        if (titleEl) {
            titleEl.textContent = 'اختر شكوى لعرض التفاصيل الكاملة';
        }

        const body = document.getElementById('activeTicketMessages');
        if (body) {
            body.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <p>اختر تذكرة لعرض تفاصيل العميل، الجهاز، المتصفح، الـ IP والموقع</p>
                </div>
            `;
        }

        const statusEl = document.getElementById('activeTicketStatus');
        if (statusEl) {
            statusEl.textContent = 'اختر تذكرة';
            statusEl.className = 'status-badge status-offline';
        }
    }

    // ============================================================
    // 12. ADD TICKET (For future use)
    // ============================================================
    addTicket(ticketData) {
        const newTicket = {
            id: Utils.genId(),
            title: ticketData.title || 'تذكرة جديدة',
            status: 'open',
            priority: ticketData.priority || 'medium',
            customer: ticketData.customer || 'زائر',
            email: ticketData.email || '',
            message: ticketData.message || '',
            device: ticketData.device || 'Unknown',
            browser: ticketData.browser || 'Unknown',
            ip: ticketData.ip || '0.0.0.0',
            location: ticketData.location || 'Unknown',
            date: new Date().toISOString(),
            replies: []
        };

        this.tickets.push(newTicket);
        this.saveData();
        this.renderTickets();
        this.selectTicket(newTicket.id);

        Utils.toast('✅ تم إضافة التذكرة بنجاح', 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`📝 إضافة تذكرة جديدة: ${newTicket.title}`);
        }

        return newTicket;
    }

    // ============================================================
    // 13. CLOSE TICKET
    // ============================================================
    closeTicket(id) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return;

        ticket.status = 'closed';
        this.saveData();
        this.renderTickets();

        // If this was the active ticket, select the next one
        if (this.activeTicketId === id) {
            const openTickets = this.tickets.filter(t => t.status === 'open');
            if (openTickets.length > 0) {
                this.selectTicket(openTickets[0].id);
            } else {
                this.clearSelection();
            }
        }

        Utils.toast(`🔒 تم إغلاق التذكرة: ${ticket.title}`, 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`🔒 إغلاق تذكرة: ${ticket.title}`);
        }
    }

    // ============================================================
    // 14. DELETE TICKET
    // ============================================================
    deleteTicket(id) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return;

        if (!confirm(`هل تريد حذف التذكرة: ${ticket.title}؟`)) return;

        this.tickets = this.tickets.filter(t => t.id !== id);
        this.saveData();
        this.renderTickets();

        if (this.activeTicketId === id) {
            const openTickets = this.tickets.filter(t => t.status === 'open');
            if (openTickets.length > 0) {
                this.selectTicket(openTickets[0].id);
            } else {
                this.clearSelection();
            }
        }

        Utils.toast(`🗑️ تم حذف التذكرة: ${ticket.title}`, 'info');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`🗑️ حذف تذكرة: ${ticket.title}`);
        }
    }

    // ============================================================
    // 15. GET TICKET STATS
    // ============================================================
    getStats() {
        const total = this.tickets.length;
        const open = this.tickets.filter(t => t.status === 'open').length;
        const closed = this.tickets.filter(t => t.status === 'closed').length;
        const highPriority = this.tickets.filter(t => t.priority === 'high' && t.status === 'open').length;

        return {
            total,
            open,
            closed,
            highPriority
        };
    }

    // ============================================================
    // 16. LOADING STATE
    // ============================================================
    setLoading(loading) {
        this.isLoading = loading;
        const sidebar = document.getElementById('supportTicketsSidebar');
        const body = document.getElementById('activeTicketMessages');

        if (loading) {
            if (sidebar) {
                sidebar.innerHTML = `
                    <div style="text-align:center;padding:40px;color:var(--text-muted);">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--color-primary);"></i>
                        <p style="margin-top:12px;">جاري تحميل التذاكر...</p>
                    </div>
                `;
            }
            if (body) {
                body.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--color-primary);"></i>
                        <p>جاري التحميل...</p>
                    </div>
                `;
            }
        } else {
            this.renderTickets();
        }
    }

    // ============================================================
    // 17. KEYBOARD SHORTCUTS
    // ============================================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+C = Close ticket
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                if (this.activeTicketId) {
                    this.closeTicket(this.activeTicketId);
                }
            }

            // Ctrl+Shift+D = Delete ticket
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                if (this.activeTicketId) {
                    this.deleteTicket(this.activeTicketId);
                }
            }

            // Arrow keys to navigate tickets
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const items = document.querySelectorAll('.ticket-item');
                if (items.length === 0) return;

                let currentIndex = -1;
                items.forEach((item, index) => {
                    if (item.classList.contains('active')) {
                        currentIndex = index;
                    }
                });

                let newIndex;
                if (e.key === 'ArrowDown') {
                    newIndex = Math.min(currentIndex + 1, items.length - 1);
                } else {
                    newIndex = Math.max(currentIndex - 1, 0);
                }

                if (newIndex !== currentIndex) {
                    e.preventDefault();
                    const id = items[newIndex].dataset.ticketId;
                    if (id) this.selectTicket(id);
                }
            }
        });
    }
}

// ============================================================
// 18. INITIALIZE
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const supportSection = document.getElementById('support-section');
    if (supportSection) {
        window.SupportEngine = new SupportEngine();
        console.log('🎧 Support Engine initialized');
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const supportSection = document.getElementById('support-section');
    if (supportSection && !window.SupportEngine) {
        window.SupportEngine = new SupportEngine();
        console.log('🎧 Support Engine initialized (immediate)');
    }
}
// ============================================================
// SOCIAL ENGINE - Premium Social Management JavaScript
// ============================================================

class SocialEngine {
    constructor() {
        this.socialLinks = [];
        this.init();
    }

    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    init() {
        console.log('📱 Social Engine initializing...');
        this.loadData();
        this.setupEvents();
        this.renderSocialLinks();
        console.log('✅ Social Engine ready');
    }

    // ============================================================
    // 02. DATA MANAGEMENT
    // ============================================================
    loadData() {
        const saved = Utils.storage.get('social-links', null);
        if (saved && saved.length > 0) {
            this.socialLinks = saved;
        } else {
            this.socialLinks = this.getDefaultLinks();
        }
    }

    getDefaultLinks() {
        return [
            {
                id: Utils.genId(),
                platform: 'GitHub',
                link: 'https://github.com/username',
                followers: 2500
            },
            {
                id: Utils.genId(),
                platform: 'LinkedIn',
                link: 'https://linkedin.com/in/username',
                followers: 1800
            },
            {
                id: Utils.genId(),
                platform: 'Instagram',
                link: 'https://instagram.com/username',
                followers: 1200
            },
            {
                id: Utils.genId(),
                platform: 'Twitter/X',
                link: 'https://twitter.com/username',
                followers: 800
            }
        ];
    }

    saveData() {
        Utils.storage.set('social-links', this.socialLinks);
    }

    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    setupEvents() {
        // Form Submit
        const form = document.getElementById('socialForm');
        if (form) {
            form.addEventListener('submit', (e) => this.addSocialLink(e));
        }

        // Clear All Button
        const clearBtn = document.getElementById('clearSocialBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('هل تريد تفريغ جميع روابط السوشيال؟')) {
                    this.clearAll();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                document.getElementById('socialPlatform')?.focus();
            }
        });
    }

    // ============================================================
    // 04. RENDER SOCIAL LINKS
    // ============================================================
    renderSocialLinks() {
        const grid = document.getElementById('social_linksGrid');
        if (!grid) return;

        if (this.socialLinks.length === 0) {
            grid.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--text-muted);">
                    <i class="fa-solid fa-share-nodes" style="font-size:24px;color:var(--color-primary);opacity:0.3;"></i>
                    <p style="font-size:12px;margin-top:8px;">لا توجد روابط سوشيال مضافة</p>
                </div>
            `;
            return;
        }

        const totalFollowers = this.socialLinks.reduce((sum, s) => sum + s.followers, 0);

        grid.innerHTML = this.socialLinks
            .map(link => this.renderSocialItem(link))
            .join('') + this.renderTotalItem(totalFollowers);

        this.attachEvents(grid);
    }

    renderSocialItem(link) {
        const platformColors = {
            'GitHub': '#6e5494',
            'LinkedIn': '#0a66c2',
            'Instagram': '#e4405f',
            'Twitter': '#1da1f2',
            'Facebook': '#1877f2',
            'YouTube': '#ff0000',
            'TikTok': '#000000',
            'Snapchat': '#fffc00',
            'Pinterest': '#e60023',
            'Reddit': '#ff4500'
        };

        const color = platformColors[link.platform] || '#6366f1';

        return `
            <div class="social-item" data-id="${link.id}">
                <div class="social-info">
                    <span class="platform-name" style="color:${color};">${link.platform}</span>
                    <a href="${link.link}" target="_blank" class="platform-link">${link.link}</a>
                </div>
                <div class="social-stats">
                    <span class="followers-count">👥 ${link.followers.toLocaleString()}</span>
                    <button class="delete-social-btn" data-id="${link.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderTotalItem(totalFollowers) {
        return `
            <div class="social-total">
                👥 إجمالي المتابعين: ${totalFollowers.toLocaleString()}
            </div>
        `;
    }

    // ============================================================
    // 05. ATTACH EVENTS
    // ============================================================
    attachEvents(grid) {
        grid.querySelectorAll('.delete-social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id && confirm('هل تريد حذف هذا الرابط؟')) {
                    this.deleteSocialLink(id);
                }
            });
        });
    }

    // ============================================================
    // 06. CRUD OPERATIONS
    // ============================================================
    addSocialLink(e) {
        e.preventDefault();

        const platform = document.getElementById('socialPlatform')?.value.trim();
        const link = document.getElementById('socialLink')?.value.trim();
        const followers = parseInt(document.getElementById('socialFollowers')?.value) || 0;

        if (!platform) {
            Utils.toast('⚠️ اسم المنصة مطلوب', 'warning');
            document.getElementById('socialPlatform')?.focus();
            return;
        }

        if (!link) {
            Utils.toast('⚠️ رابط البروفايل مطلوب', 'warning');
            document.getElementById('socialLink')?.focus();
            return;
        }

        // Validate URL format
        try {
            new URL(link);
        } catch {
            Utils.toast('⚠️ الرابط غير صالح', 'warning');
            document.getElementById('socialLink')?.focus();
            return;
        }

        const newLink = {
            id: Utils.genId(),
            platform,
            link,
            followers: Math.max(0, followers)
        };

        this.socialLinks.push(newLink);
        this.saveData();
        this.renderSocialLinks();

        // Reset form
        document.getElementById('socialForm')?.reset();
        document.getElementById('socialPlatform')?.focus();

        Utils.toast(`✅ تم إضافة ${platform}`, 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`📱 إضافة منصة سوشيال: ${platform}`);
        }
    }

    deleteSocialLink(id) {
        const link = this.socialLinks.find(s => s.id === id);
        if (!link) return;

        this.socialLinks = this.socialLinks.filter(s => s.id !== id);
        this.saveData();
        this.renderSocialLinks();

        Utils.toast(`🗑️ تم حذف ${link.platform}`, 'info');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`🗑️ حذف منصة سوشيال: ${link.platform}`);
        }
    }

    clearAll() {
        this.socialLinks = [];
        this.saveData();
        this.renderSocialLinks();
        Utils.toast('🗑️ تم تفريغ جميع الروابط', 'info');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog('🗑️ تفريغ جميع روابط السوشيال');
        }
    }

    // ============================================================
    // 07. GET STATS
    // ============================================================
    getStats() {
        return {
            total: this.socialLinks.length,
            totalFollowers: this.socialLinks.reduce((sum, s) => sum + s.followers, 0),
            platforms: this.socialLinks.map(s => s.platform)
        };
    }
}

// ============================================================
// 08. INITIALIZE SOCIAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const socialSection = document.getElementById('social-section');
    if (socialSection) {
        window.SocialEngine = new SocialEngine();
        console.log('📱 Social Engine initialized');
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const socialSection = document.getElementById('social-section');
    if (socialSection && !window.SocialEngine) {
        window.SocialEngine = new SocialEngine();
        console.log('📱 Social Engine initialized (immediate)');
    }
}// ============================================================
// MESSAGES ENGINE - Premium Inbox Management JavaScript
// ============================================================

class MessagesEngine {
    constructor() {
        this.messages = [];
        this.filter = 'all'; // all, unread, replied
        this.searchQuery = '';
        this.init();
    }

    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    init() {
        console.log('✉️ Messages Engine initializing...');
        this.loadData();
        this.setupEvents();
        this.renderMessages();
        console.log('✅ Messages Engine ready');
    }

    // ============================================================
    // 02. DATA MANAGEMENT
    // ============================================================
    loadData() {
        const saved = Utils.storage.get('messages-data', null);
        if (saved && saved.length > 0) {
            this.messages = saved;
        } else {
            this.messages = this.getDefaultMessages();
        }
    }

    getDefaultMessages() {
        return [
            {
                id: Utils.genId(),
                name: 'Ahmed Hassan',
                email: 'ahmed@example.com',
                subject: 'استفسار عن المشاريع',
                message: 'أود معرفة المزيد عن مشاريعك السابقة في مجال تطوير الويب، هل يمكنك مشاركة بعض النماذج؟',
                date: new Date(Date.now() - 3600000).toISOString(),
                read: false,
                replied: false
            },
            {
                id: Utils.genId(),
                name: 'Sara Mahmoud',
                email: 'sara@example.com',
                subject: 'طلب تعاون وظيفي',
                message: 'نحن شركة ناشئة ونبحث عن مطور ويب للانضمام لفريقنا، هل أنت مهتم؟',
                date: new Date(Date.now() - 7200000).toISOString(),
                read: false,
                replied: false
            },
            {
                id: Utils.genId(),
                name: 'Khaled Ali',
                email: 'khaled@example.com',
                subject: 'شكر وتقدير',
                message: 'شكراً لك على المحتوى القيم والمفيد في موقعك، استفدت كثيراً من مقالاتك التقنية',
                date: new Date(Date.now() - 86400000).toISOString(),
                read: true,
                replied: false
            },
            {
                id: Utils.genId(),
                name: 'Mona Ibrahim',
                email: 'mona@example.com',
                subject: 'اقتراح تطوير',
                message: 'أقترح إضافة قسم للمدونة في الموقع لمشاركة الخبرات والدروس التعليمية',
                date: new Date(Date.now() - 172800000).toISOString(),
                read: true,
                replied: true
            }
        ];
    }

    saveData() {
        Utils.storage.set('messages-data', this.messages);
    }

    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    setupEvents() {
        // Clear All Button
        const clearBtn = document.getElementById('clearMessagesBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('هل تريد تفريغ جميع الرسائل؟')) {
                    this.clearAll();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.markAllAsRead();
            }
        });
    }

    // ============================================================
    // 04. RENDER MESSAGES
    // ============================================================
    renderMessages() {
        const grid = document.getElementById('messagesGrid');
        if (!grid) return;

        const filtered = this.getFilteredMessages();

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="messages-empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <h4>لا توجد رسائل</h4>
                    <p>صندوق الوارد فارغ حالياً</p>
                </div>
            `;
            return;
        }

        const unreadCount = this.messages.filter(m => !m.read).length;

        grid.innerHTML = `
            <div class="messages-stats">
                <span class="unread-count">
                    <i class="fa-solid fa-circle" style="font-size:8px;"></i>
                    ${unreadCount} رسائل غير مقروءة
                </span>
                <span class="total-count">إجمالي: ${this.messages.length}</span>
            </div>
            ${filtered.map(msg => this.renderMessageItem(msg)).join('')}
        `;

        this.attachEvents(grid);
    }

    renderMessageItem(msg) {
        const isUnread = !msg.read;
        const isReplied = msg.replied;

        return `
            <div class="message-item ${isUnread ? 'unread' : ''}" data-id="${msg.id}">
                <div class="msg-left">
                    <div class="msg-sender">
                        ${msg.name}
                        ${isUnread ? '<span class="unread-badge">جديد</span>' : ''}
                        ${isReplied ? '<span class="replied-badge">تم الرد</span>' : ''}
                    </div>
                    <span class="msg-email">${msg.email}</span>
                    <div class="msg-subject">${msg.subject}</div>
                    <p class="msg-preview">${Utils.truncate(msg.message, 80)}</p>
                </div>
                <div class="msg-right">
                    <span class="msg-time">${Utils.formatTime(msg.date)}</span>
                    <span class="msg-date">${Utils.formatDate(msg.date)}</span>
                    <button class="delete-message-btn" data-id="${msg.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // 05. ATTACH EVENTS
    // ============================================================
    attachEvents(grid) {
        // Click to toggle read status
        grid.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking delete button
                if (e.target.closest('.delete-message-btn')) return;

                const id = item.dataset.id;
                if (id) this.toggleRead(id);
            });
        });

        // Delete buttons
        grid.querySelectorAll('.delete-message-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id && confirm('هل تريد حذف هذه الرسالة؟')) {
                    this.deleteMessage(id);
                }
            });
        });
    }

    // ============================================================
    // 06. FILTER & SEARCH
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
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        return filtered;
    }

    // ============================================================
    // 07. CRUD OPERATIONS
    // ============================================================
    toggleRead(id) {
        const msg = this.messages.find(m => m.id === id);
        if (msg) {
            msg.read = !msg.read;
            this.saveData();
            this.renderMessages();

            if (msg.read) {
                Utils.toast('👁️ تم تحديد الرسالة كمقروءة', 'info');
            } else {
                Utils.toast('👁️ تم تحديد الرسالة كغير مقروءة', 'info');
            }
        }
    }

    deleteMessage(id) {
        const msg = this.messages.find(m => m.id === id);
        if (!msg) return;

        this.messages = this.messages.filter(m => m.id !== id);
        this.saveData();
        this.renderMessages();

        Utils.toast(`🗑️ تم حذف رسالة من ${msg.name}`, 'info');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`🗑️ حذف رسالة من ${msg.name}`);
        }
    }

    clearAll() {
        this.messages = [];
        this.saveData();
        this.renderMessages();
        Utils.toast('🗑️ تم تفريغ جميع الرسائل', 'info');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog('🗑️ تفريغ جميع رسائل الزوار');
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
        this.saveData();
        this.renderMessages();
        Utils.toast(`👁️ تم تحديد ${unread.length} رسالة كمقروءة`, 'success');

        if (window.Dashboard && window.Dashboard.logs) {
            window.Dashboard.logs.addLog(`👁️ تم تحديد ${unread.length} رسالة كمقروءة`);
        }
    }

    // ============================================================
    // 08. GET STATS
    // ============================================================
    getStats() {
        return {
            total: this.messages.length,
            unread: this.messages.filter(m => !m.read).length,
            replied: this.messages.filter(m => m.replied).length
        };
    }
}

// ============================================================
// 09. INITIALIZE MESSAGES
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const messagesSection = document.getElementById('messages-section');
    if (messagesSection) {
        window.MessagesEngine = new MessagesEngine();
        console.log('✉️ Messages Engine initialized');
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const messagesSection = document.getElementById('messages-section');
    if (messagesSection && !window.MessagesEngine) {
        window.MessagesEngine = new MessagesEngine();
        console.log('✉️ Messages Engine initialized (immediate)');
    }
}// ============================================================
// LOGS ENGINE - Premium Activity Logs JavaScript
// ============================================================

class LogsEngine {
    constructor() {
        this.logs = [];
        this.filter = 'all'; // all, info, success, warning, error
        this.searchQuery = '';
        this.init();
    }

    // ============================================================
    // 01. INITIALIZATION
    // ============================================================
    init() {
        console.log('📋 Logs Engine initializing...');
        this.loadData();
        this.setupEvents();
        this.renderLogs();
        console.log('✅ Logs Engine ready');
    }

    // ============================================================
    // 02. DATA MANAGEMENT
    // ============================================================
    loadData() {
        const saved = Utils.storage.get('logs-data', null);
        if (saved && saved.length > 0) {
            this.logs = saved;
        } else {
            this.logs = this.getDefaultLogs();
        }
    }

    getDefaultLogs() {
        const now = Date.now();
        return [
            {
                id: Utils.genId(),
                message: '🚀 تم تشغيل لوحة التحكم',
                type: 'info',
                date: new Date(now - 300000).toISOString()
            },
            {
                id: Utils.genId(),
                message: '📊 تم تحديث بيانات الرئيسية',
                type: 'success',
                date: new Date(now - 600000).toISOString()
            },
            {
                id: Utils.genId(),
                message: '📝 تم حفظ مسودة الهيرو',
                type: 'info',
                date: new Date(now - 900000).toISOString()
            },
            {
                id: Utils.genId(),
                message: '✅ تم إضافة مهارة جديدة: React.js',
                type: 'success',
                date: new Date(now - 1200000).toISOString()
            },
            {
                id: Utils.genId(),
                message: '⚠️ محاولة تسجيل دخول فاشلة من IP غير معروف',
                type: 'warning',
                date: new Date(now - 1800000).toISOString()
            },
            {
                id: Utils.genId(),
                message: '📁 تم حذف مشروع: E-Commerce Platform',
                type: 'error',
                date: new Date(now - 2400000).toISOString()
            },
            {
                id: Utils.genId(),
                message: '🚀 تم نشر التغييرات على الموقع',
                type: 'success',
                date: new Date(now - 3600000).toISOString()
            },
            {
                id: Utils.genId(),
                message: '💾 تم إنشاء نسخة احتياطية للقاعدة',
                type: 'info',
                date: new Date(now - 7200000).toISOString()
            }
        ];
    }

    saveData() {
        Utils.storage.set('logs-data', this.logs);
    }

    // ============================================================
    // 03. EVENT SETUP
    // ============================================================
    setupEvents() {
        // Clear All Button
        const clearBtn = document.getElementById('clearLogsBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('هل تريد مسح جميع السجلات؟')) {
                    this.clearAll();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+L = Clear logs
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                if (confirm('هل تريد مسح جميع السجلات؟')) {
                    this.clearAll();
                }
            }
        });
    }

    // ============================================================
    // 04. RENDER LOGS
    // ============================================================
    renderLogs() {
        const grid = document.getElementById('logsGrid');
        if (!grid) return;

        const filtered = this.getFilteredLogs();

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="logs-empty-state">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <h4>لا توجد سجلات</h4>
                    <p>سجل النشاطات فارغ حالياً</p>
                </div>
            `;
            return;
        }

        const stats = this.getStats();

        grid.innerHTML = `
            <div class="logs-stats">
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
                    الإجمالي: <span class="stat-count">${this.logs.length}</span>
                </span>
            </div>
            ${filtered.slice(0, 50).map(log => this.renderLogItem(log)).join('')}
            ${filtered.length > 50 ? `
                <div class="logs-extra-count">
                    + ${filtered.length - 50} سجل إضافي
                </div>
            ` : ''}
        `;
    }

    renderLogItem(log) {
        const typeIcons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        return `
            <div class="log-item" data-id="${log.id}">
                <div class="log-left">
                    <span class="log-icon ${log.type}">${typeIcons[log.type] || '📋'}</span>
                    <span class="log-message">${log.message}</span>
                </div>
                <div class="log-right">
                    <span class="log-badge ${log.type}">${log.type}</span>
                    <span class="log-time">${Utils.formatTime(log.date)}</span>
                    <span class="log-date">${Utils.formatDate(log.date)}</span>
                </div>
            </div>
        `;
    }

    // ============================================================
    // 05. FILTER & SEARCH
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
                log.message.toLowerCase().includes(query)
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        return filtered;
    }

    // ============================================================
    // 06. CRUD OPERATIONS
    // ============================================================
    addLog(message, type = 'info') {
        const log = {
            id: Utils.genId(),
            message,
            type,
            date: new Date().toISOString()
        };

        this.logs.unshift(log);

        // Limit logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(0, 1000);
        }

        this.saveData();
        this.renderLogs();
    }

    clearAll() {
        this.logs = [];
        this.saveData();
        this.renderLogs();
        Utils.toast('🗑️ تم مسح جميع السجلات', 'info');

        // Add a new log entry
        this.addLog('🗑️ تم مسح جميع السجلات', 'info');
    }

    deleteLog(id) {
        const log = this.logs.find(l => l.id === id);
        if (!log) return;

        this.logs = this.logs.filter(l => l.id !== id);
        this.saveData();
        this.renderLogs();

        Utils.toast(`🗑️ تم حذف السجل`, 'info');
    }

    // ============================================================
    // 07. GET STATS
    // ============================================================
    getStats() {
        return {
            info: this.logs.filter(l => l.type === 'info').length,
            success: this.logs.filter(l => l.type === 'success').length,
            warning: this.logs.filter(l => l.type === 'warning').length,
            error: this.logs.filter(l => l.type === 'error').length
        };
    }

    // ============================================================
    // 08. SET FILTER
    // ============================================================
    setFilter(type) {
        this.filter = type;
        this.renderLogs();
    }

    // ============================================================
    // 09. SET SEARCH
    // ============================================================
    setSearch(query) {
        this.searchQuery = query;
        this.renderLogs();
    }
}

// ============================================================
// 10. INITIALIZE LOGS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const logsSection = document.getElementById('logs-section');
    if (logsSection) {
        window.LogsEngine = new LogsEngine();
        console.log('📋 Logs Engine initialized');
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const logsSection = document.getElementById('logs-section');
    if (logsSection && !window.LogsEngine) {
        window.LogsEngine = new LogsEngine();
        console.log('📋 Logs Engine initialized (immediate)');
    }
}