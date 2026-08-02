// الاتصال بقاعدة بيانات Supabase الخاصة بك
const SUPABASE_URL = "https://txcuibshcvfusegrfcbm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI";
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
/**
 * ============================================================
 * DASHBOARD.JS - المرحلة الأولى
 * التهيئة | نظام التنقل | قسم الهوم
 * ============================================================
 */

// ============================================================
// 1. APPLICATION STATE (الحالة المركزية للتطبيق)
// ============================================================
const AppState = {
  // الإعدادات العامة
  config: {
    theme: localStorage.getItem("dashboard-theme") || "dark",
    language: localStorage.getItem("dashboard-language") || "ar",
    direction: localStorage.getItem("dashboard-direction") || "rtl",
  },

  // الحالة الحالية
  current: {
    section: "home-section",
    tab: null,
    modal: null,
    previewDevice: "desktop",
    previewTheme: "dark",
  },

  // البيانات (مؤقتة - سيتم ربطها بـ Supabase لاحقاً)
  data: {
    projects: [],
    skills: [],
    certificates: [],
    donations: [],
    messages: [],
    socialLinks: [],
    logs: [],
    supportTickets: [],
    goals: [],
    achievements: [],
    stats: {
      projects: 0,
      skills: 0,
      certificates: 0,
      messages: 0,
      donations: 0,
    },
  },

  // التاريخ للتراجع والإعادة
  history: {
    past: [],
    future: [],
    maxLength: 50,
  },

  // حالة التحميل
  loading: {
    home: false,
    hero: false,
    skills: false,
    projects: false,
    certificates: false,
    support: false,
    donations: false,
    social: false,
    messages: false,
    logs: false,
  },
};

// ============================================================
// 2. UTILITIES (الدواسات المساعدة)
// ============================================================
const Utils = {
  // ========================
  // DOM Helpers
  // ========================
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
  toggle: (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === "none" ? "block" : "none";
  },
  addClass: (id, cls) => {
    const el = document.getElementById(id);
    if (el) el.classList.add(cls);
  },
  removeClass: (id, cls) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove(cls);
  },
  hasClass: (id, cls) => {
    const el = document.getElementById(id);
    return el ? el.classList.contains(cls) : false;
  },

  // ========================
  // Date / Time
  // ========================
  formatDate: (date, locale = "ar-EG") => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // ========================
  // Toast Notifications
  // ========================
  toast: (message, type = "success", duration = 3000) => {
    const old = document.querySelector(".toast-custom");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.className = `toast-custom toast-${type}`;
    const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    toast.innerHTML = `${icons[type] || "📢"} ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // ========================
  // Clipboard
  // ========================
  copy: (text) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          Utils.toast("تم النسخ ✅", "success");
        })
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

  // ========================
  // Download / Upload
  // ========================
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
  exportJSON: (data, filename = "data.json") => {
    Utils.download(JSON.stringify(data, null, 2), filename, "application/json");
  },
  importJSON: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          resolve(JSON.parse(e.target.result));
        } catch (err) {
          reject("Invalid JSON format");
        }
      };
      reader.onerror = () => reject("Failed to read file");
      reader.readAsText(file);
    });
  },

  // ========================
  // IDs & Strings
  // ========================
  genId: () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
  slugify: (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  truncate: (text, max = 100) =>
    !text ? "" : text.length > max ? text.substr(0, max) + "..." : text,

  // ========================
  // Debounce / Throttle
  // ========================
  debounce: (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
  throttle: (fn, limit = 300) => {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // ========================
  // Storage
  // ========================
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
    },
    clear: () => {
      try {
        localStorage.clear();
      } catch (e) {}
    },
  },
};

// ============================================================
// 3. EVENT MANAGER (مدير الأحداث المركزي)
// ============================================================
class EventManager {
  constructor() {
    this.listeners = new Map();
    this.delegations = new Map();
  }

  // إضافة مستمع
  on(element, event, handler, options = {}) {
    const el =
      typeof element === "string" ? document.querySelector(element) : element;
    if (!el) return;

    const key = `${event}-${el.id || el.className || "unknown"}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push({ el, event, handler, options });
    el.addEventListener(event, handler, options);
  }

  // إزالة مستمع
  off(element, event, handler) {
    const el =
      typeof element === "string" ? document.querySelector(element) : element;
    if (!el) return;

    el.removeEventListener(event, handler);

    const key = `${event}-${el.id || el.className || "unknown"}`;
    if (this.listeners.has(key)) {
      const handlers = this.listeners
        .get(key)
        .filter((h) => h.handler !== handler);
      this.listeners.set(key, handlers);
    }
  }

  // تفويض الأحداث (Event Delegation)
  delegate(selector, event, handler) {
    if (!this.delegations.has(selector)) {
      this.delegations.set(selector, []);
    }
    this.delegations.get(selector).push({ event, handler });

    document.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler(e, target);
      }
    });
  }

  // تنظيف كل المستمعين
  clear() {
    this.listeners.forEach((listeners) => {
      listeners.forEach(({ el, event, handler, options }) => {
        el.removeEventListener(event, handler, options);
      });
    });
    this.listeners.clear();
    this.delegations.clear();
  }
}

// ============================================================
// 4. LANGUAGE ENGINE (محرك الترجمة)
// ============================================================
class LanguageEngine {
  constructor() {
    this.currentLang = AppState.config.language || "ar";
    this.direction = AppState.config.direction || "rtl";
    this.translations = {
      ar: {
        sidebar_brand: "لوحة التحكم برو",
        nav_home: "الرئيسية والكونترات",
        nav_updater: "محرر الكود والبرومت",
        nav_hero: "قسم الهيرو",
        nav_skills: "فئات المهارات",
        nav_projects: "إدارة المشاريع",
        nav_certificates: "الشهادات",
        nav_support: "صندوق خدمة العملاء",
        nav_donations: "التبرعات والدعم",
        nav_social: "روابط السوشيال",
        nav_messages: "رسائل الزوار",
        nav_logs: "سجل النشاطات",
        nav_preview: "معاينة الموقع لايف",
        ctrl_lang: "AR / EN",
        ctrl_logout: "خروج",
        home_title: "مركز ذكاء لوحة التحكم",
        btn_refresh: "تحديث",
        btn_global_search: "بحث عام",
        hero_welcome: "مرحباً بك",
        hero_subtitle: "مركز التحكم والذكاء",
        theme_dark: "الوضع المظلم",
        lang_indicator: "العربية",
        last_login_just_now: "الآن",
        loading_date: "جاري تحميل التاريخ...",
        search_placeholder: "ابحث عن المقاييس، المشاريع، المهارات...",
        btn_refresh_text: "تحديث",
        btn_preview: "معاينة",
        btn_open_site: "فتح الموقع",
        completion_title: "اكتمال البورتفوليو",
        completion_subtitle: "مؤشر الجاهزية",
        badge_calculating: "جاري الحساب",
        ring_complete: "مكتمل",
        stat_completed_items: "العناصر المكتملة",
        stat_pending_action: "في انتظار الإجراء",
        top_recommendation: "أفضل توصية",
        analyzing_cms: "جاري تحليل سجلات CMS...",
        score_title: "جودة لوحة التحكم",
        score_subtitle: "معيار البورتفوليو 100 نقطة",
        evaluating: "جاري التقييم...",
        last_update: "آخر تحديث",
      },
      en: {
        sidebar_brand: "Dashboard Pro",
        nav_home: "Home & Counters",
        nav_updater: "Code & Prompt Editor",
        nav_hero: "Hero Section",
        nav_skills: "Skills Categories",
        nav_projects: "Projects Management",
        nav_certificates: "Certificates",
        nav_support: "Customer Support",
        nav_donations: "Donations & Support",
        nav_social: "Social Links",
        nav_messages: "Visitor Messages",
        nav_logs: "Activity Logs",
        nav_preview: "Live Preview",
        ctrl_lang: "AR / EN",
        ctrl_logout: "Logout",
        home_title: "Dashboard Intelligence Center",
        btn_refresh: "Refresh",
        btn_global_search: "Global Search",
        hero_welcome: "Welcome back",
        hero_subtitle: "Portfolio CMS Intelligence & Command Center",
        theme_dark: "Dark Mode",
        lang_indicator: "English",
        last_login_just_now: "Just Now",
        loading_date: "Loading date...",
        search_placeholder: "Quick search metrics, projects, skills...",
        btn_refresh_text: "Refresh",
        btn_preview: "Preview",
        btn_open_site: "Open Site",
        completion_title: "Portfolio Completion",
        completion_subtitle: "Setup & Readiness Gauge",
        badge_calculating: "Calculating",
        ring_complete: "Complete",
        stat_completed_items: "Completed Items",
        stat_pending_action: "Pending Action",
        top_recommendation: "Top Recommendation",
        analyzing_cms: "Analyzing CMS records...",
        score_title: "Dashboard Quality Score",
        score_subtitle: "100-Point Portfolio Standard",
        evaluating: "Evaluating...",
        last_update: "Last Update",
      },
    };

    this.init();
  }

  init() {
    this.applyLanguage(this.currentLang);
    this.applyDirection(this.direction);
  }

  applyLanguage(lang) {
    this.currentLang = lang;
    const dict = this.translations[lang] || this.translations.ar;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key] !== undefined) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // تحديث مؤشر اللغة
    const indicator = document.getElementById("home-lang-indicator");
    if (indicator) {
      indicator.textContent = lang === "ar" ? "العربية (RTL)" : "English (LTR)";
    }

    localStorage.setItem("dashboard-language", lang);
    AppState.config.language = lang;
  }

  applyDirection(dir) {
    this.direction = dir;
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === "rtl" ? "ar" : "en";
    localStorage.setItem("dashboard-direction", dir);
    AppState.config.direction = dir;

    // تحديث زر اللغة
    const label = document.getElementById("langLabel");
    if (label) {
      label.textContent = dir === "rtl" ? "AR / EN" : "EN / AR";
    }
  }

  toggle() {
    const newLang = this.currentLang === "ar" ? "en" : "ar";
    const newDir = this.direction === "rtl" ? "ltr" : "rtl";
    this.applyLanguage(newLang);
    this.applyDirection(newDir);
    Utils.toast(
      newLang === "ar" ? "🌐 تم التبديل إلى العربية" : "🌐 Switched to English",
      "info",
    );
  }

  translate(key) {
    const dict = this.translations[this.currentLang] || this.translations.ar;
    return dict[key] || key;
  }
}

// ============================================================
// 5. THEME ENGINE (محرك الثيم)
// ============================================================
class ThemeEngine {
  constructor() {
    this.currentTheme = AppState.config.theme || "dark";
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dashboard-theme", theme);
    AppState.config.theme = theme;

    // تحديث مؤشر الثيم
    const indicator = document.getElementById("home-theme-indicator");
    if (indicator) {
      indicator.textContent =
        theme === "dark" ? "الوضع المظلم 🌙" : "الوضع الفاتح ☀️";
    }
  }

  toggle() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
    Utils.toast(
      newTheme === "dark"
        ? "🌙 تم التبديل إلى الوضع المظلم"
        : "☀️ تم التبديل إلى الوضع الفاتح",
      "info",
    );
  }
}

// ============================================================
// 6. NAVIGATION ENGINE (محرك التنقل بين الأقسام)
// ============================================================
class NavigationEngine {
  constructor() {
    this.currentSection = "home-section";
    this.sections = {};
    this.init();
  }

  init() {
    this.setupNavButtons();
    this.setupQuickActions();
    this.setupHashRouting();
    this.setupKeyboardShortcuts();
    console.log("✅ Navigation Engine ready");
  }

  setupNavButtons() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sectionId = btn.dataset.section;
        if (sectionId) {
          this.navigateTo(sectionId, btn);
        }
      });
    });
  }

  setupQuickActions() {
    document
      .querySelectorAll(".quick-action-card[data-section]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const sectionId = btn.dataset.section;
          if (sectionId) {
            this.navigateTo(sectionId);
          }
        });
      });
  }

  setupHashRouting() {
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && document.getElementById(hash)) {
        this.navigateTo(hash);
      }
    });

    const initialHash = window.location.hash.replace("#", "");
    if (initialHash && document.getElementById(initialHash)) {
      this.navigateTo(initialHash);
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+K = بحث سريع
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        const search = document.getElementById("home-quick-search");
        if (search) {
          search.focus();
          search.select();
        }
      }
      // Escape = إلغاء التركيز
      if (e.key === "Escape") {
        document.activeElement?.blur();
      }
    });
  }

  navigateTo(sectionId, activeBtn = null) {
    // إخفاء كل الأقسام
    document.querySelectorAll(".section-view").forEach((section) => {
      section.classList.remove("active");
    });

    // إظهار القسم المطلوب
    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.add("active");
      this.currentSection = sectionId;
    }

    // تحديث أزرار التنقل
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    if (activeBtn) {
      activeBtn.classList.add("active");
    } else {
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        if (btn.dataset.section === sectionId) {
          btn.classList.add("active");
        }
      });
    }

    // استدعاء load للقسم لو موجود
    if (
      this.sections[sectionId] &&
      typeof this.sections[sectionId].load === "function"
    ) {
      this.sections[sectionId].load();
    }

    // تحديث الـ URL hash
    window.location.hash = sectionId;

    console.log(`📱 Navigated to: ${sectionId}`);
  }

  registerSection(sectionId, instance) {
    this.sections[sectionId] = instance;
  }
}

// ============================================================
// 7. HOME ENGINE (محرك قسم الرئيسية)
// ============================================================
class HomeEngine {
  constructor(app) {
    this.app = app;
    this.clockInterval = null;
    this.init();
  }

  init() {
    this.setupEvents();
    this.load();
    console.log("🏠 Home Engine ready");
  }

  setupEvents() {
    // زر تحديث الرئيسية
    const refreshBtn = document.getElementById("refreshHomeBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.load();
        Utils.toast("تم تحديث البيانات ✅", "success");
      });
    }

    // زر البحث العام
    const searchBtn = document.getElementById("globalSearchBtn");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.openGlobalSearch());
    }

    // حقل البحث السريع
    const searchInput = document.getElementById("home-quick-search");
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.doQuickSearch(searchInput.value);
        }
      });
    }

    // أزرار التشغيل السريع
    const quickActions = {
      quickOpenSiteBtn: () => window.open("../index.html", "_blank"),
      quickPreviewBtn: () => this.togglePreview(true),
      quickBackupBtn: () => this.doBackup(),
      quickPublishBtn: () => this.doPublish(),
      quickMediaBtn: () => this.openMediaManager(),
    };

    for (const [id, fn] of Object.entries(quickActions)) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", fn);
      }
    }

    // أزرار المعاينة في الهوم
    const previewBtns = ["btn-preview-website", "btn-open-website"];
    previewBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", (e) => {
          // الروابط شغالة طبيعي
        });
      }
    });

    // زر تحديث الداش بورد
    const refreshDashBtn = document.getElementById("btn-refresh-dashboard");
    if (refreshDashBtn) {
      refreshDashBtn.addEventListener("click", () => this.load());
    }
  }

  async load() {
    console.log("🔄 Loading Home Section...");
    AppState.loading.home = true;

    try {
      // تحميل الإحصائيات
      await this.loadStats();
      // تحميل مؤشرات الأداء
      await this.loadKPIs();
      // تحديث الساعة
      this.updateClock();
      // تحميل الرسوم البيانية
      this.initCharts();
      // تحميل الأهداف والإنجازات
      this.loadGoalsAndAchievements();
      // تحميل التوصيات الذكية
      this.loadInsights();

      // تشغيل الساعة كل دقيقة
      if (this.clockInterval) {
        clearInterval(this.clockInterval);
      }
      this.clockInterval = setInterval(() => this.updateClock(), 60000);
    } catch (error) {
      console.error("❌ Home load error:", error);
      Utils.toast("فشل تحميل البيانات ❌", "error");
    }

    AppState.loading.home = false;
  }

  async loadStats() {
    // محاكاة بيانات - ستأتي من Supabase لاحقاً
    const stats = {
      projects: 12,
      skills: 8,
      certificates: 5,
      messages: 3,
      featuredProjects: 4,
      featuredSkills: 3,
      featuredCerts: 2,
      unreadMessages: 1,
      drafts: 2,
    };

    // تحديث العداد
    const counters = {
      "counter-projects": stats.projects,
      "counter-skills": stats.skills,
      "counter-certificates": stats.certificates,
      "counter-messages": stats.messages,
      "kpi-featured-projects-count": `${stats.featuredProjects} Featured`,
      "kpi-featured-skills-count": `${stats.featuredSkills} Featured`,
      "kpi-featured-certs-count": `${stats.featuredCerts} Featured`,
      "kpi-unread-messages-count": `${stats.unreadMessages} Unread`,
      "sub-draft-projects": `${stats.drafts} Drafts`,
      "sub-unread-messages": `${stats.unreadMessages} Action required`,
    };

    for (const [id, val] of Object.entries(counters)) {
      Utils.setText(id, val);
    }

    // تحديث أشرطة التقدم
    const projectProgress =
      Math.round((stats.featuredProjects / stats.projects) * 100) || 0;
    const skillProgress =
      Math.round((stats.featuredSkills / stats.skills) * 100) || 0;
    const certProgress =
      Math.round((stats.featuredCerts / stats.certificates) * 100) || 0;
    const msgProgress = Math.min(
      Math.round((stats.unreadMessages / stats.messages) * 100) || 0,
      100,
    );

    const bars = {
      "bar-projects": projectProgress,
      "bar-skills": skillProgress,
      "bar-certificates": certProgress,
      "bar-messages": msgProgress,
    };

    for (const [id, val] of Object.entries(bars)) {
      const el = document.getElementById(id);
      if (el) el.style.width = `${val}%`;
    }

    // تحديث الاتجاهات
    const trends = {
      "trend-projects": "مستقر",
      "trend-skills": "نشط",
      "trend-messages": "إجمالي",
    };

    for (const [id, val] of Object.entries(trends)) {
      Utils.setText(id, val);
    }

    // تحديث الوصف
    const descs = {
      "desc-projects": `إجمالي المشاريع: ${stats.projects}`,
      "desc-skills": `المهارات التقنية: ${stats.skills}`,
      "desc-certificates": `الشهادات المعتمدة: ${stats.certificates}`,
      "desc-messages": `رسائل من النموذج: ${stats.messages}`,
    };

    for (const [id, val] of Object.entries(descs)) {
      Utils.setText(id, val);
    }

    // تخزين في الحالة
    AppState.data.stats = stats;
  }

  async loadKPIs() {
    // محاكاة مؤشرات الأداء
    const completion = 75;
    const score = 82;

    // اكتمال البورتفوليو
    const circle = document.getElementById("completion-progress-circle");
    if (circle) {
      const circumference = 326.72;
      const offset = circumference - (completion / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    Utils.setText("completion-percentage-val", `${completion}%`);
    Utils.setText("completion-items-done", `12/16`);
    Utils.setText("completion-items-pending", "4");
    Utils.setText(
      "completion-top-suggestion",
      "أضف مشروعين آخرين لتحسين المحفظة",
    );

    // درجة الجودة
    Utils.setText("dashboard-score-val", score);
    Utils.setText("content-quality-pct", "85%");
    Utils.setText("website-health-pct", "78%");

    const contentBar = document.getElementById("content-quality-bar");
    const healthBar = document.getElementById("website-health-bar");
    if (contentBar) contentBar.style.width = "85%";
    if (healthBar) healthBar.style.width = "78%";

    const rating =
      score >= 80 ? "ممتاز 🌟" : score >= 60 ? "جيد 👍" : "يحتاج تحسين 📈";
    Utils.setText("score-rating-label", rating);
    Utils.setText(
      "score-audit-summary",
      `التقييم: ${rating} - تم التحديث تلقائياً`,
    );
  }

  updateClock() {
    const now = new Date();
    Utils.setText("home-live-date", Utils.formatDate(now));
    Utils.setText("home-live-time", Utils.formatTime(now));

    // تحية
    Utils.setText("home-dynamic-greeting", Utils.getGreeting());

    // آخر تسجيل دخول
    Utils.setText("home-last-login", Utils.formatDateTime(now));
  }

    initCharts() {
    // تهيئة الرسوم البيانية - سيتم تفعيلها عند تحميل Chart.js
    if (typeof Chart !== "undefined") {
      // مخطط الزوار
      const visitorsCtx = document.getElementById("visitorsChart");
      if (visitorsCtx) {
        // **إيديت مهم:** لازم نمسح الرسمة القديمة لو موجودة قبل ما نرسم جديدة
        let existingChart = Chart.getChart(visitorsCtx);
        if (existingChart) {
            existingChart.destroy();
        }

        new Chart(visitorsCtx, {
          type: "doughnut",
          data: {
            labels: ["زيارات", "مشاريع", "مهارات"],
            datasets: [
              {
                data: [65, 25, 10],
                backgroundColor: ["#6366f1", "#38bdf8", "#a855f7"],
                borderColor: "transparent",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "bottom", labels: { color: "#94a3b8" } },
            },
          },
        });
      }

      // مخطط النمو
      const growthCtx = document.getElementById("growthChart");
      if (growthCtx) {
        // **إيديت مهم:** نفس الكلام للمخطط الثاني
        let existingChart = Chart.getChart(growthCtx);
        if (existingChart) {
            existingChart.destroy();
        }

        new Chart(growthCtx, {
          type: "bar",
          data: {
            labels: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"],
            datasets: [
              {
                label: "المشاريع",
                data: [2, 4, 6, 8, 10, 12],
                backgroundColor: "#38bdf8",
              },
              {
                label: "المهارات",
                data: [1, 3, 4, 6, 7, 8],
                backgroundColor: "#a855f7",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "bottom", labels: { color: "#94a3b8" } },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: "rgba(255,255,255,0.05)" },
              },
              x: { grid: { color: "rgba(255,255,255,0.05)" } },
            },
          },
        });
      }
    }
  }

  loadGoalsAndAchievements() {
    // محاكاة الأهداف
    const goals = [
      { title: "إنجاز 15 مشروع", progress: 80 },
      { title: "إضافة 10 مهارات", progress: 70 },
      { title: "الحصول على 5 شهادات", progress: 60 },
      { title: "نشر الموقع", progress: 100 },
    ];

    const goalsContainer = document.getElementById("goalsListContainer");
    if (goalsContainer) {
      goalsContainer.innerHTML = goals
        .map(
          (goal) => `
                <div class="goal-item" style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;margin-bottom:4px;">
                        <span>${goal.title}</span>
                        <span>${goal.progress}%</span>
                    </div>
                    <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
                        <div style="height:100%;width:${goal.progress}%;background:linear-gradient(90deg,#6366f1,#a855f7);border-radius:4px;transition:width 0.6s;"></div>
                    </div>
                </div>
            `,
        )
        .join("");

      // تحديث النسبة الإجمالية
      const avg = Math.round(
        goals.reduce((sum, g) => sum + g.progress, 0) / goals.length,
      );
      Utils.setText("overallGoalsProgressText", `${avg}%`);
    }

    // محاكاة الإنجازات
    const achievements = [
      { icon: "🚀", title: "أول مشروع منشور" },
      { icon: "⭐", title: "5 نجوم على المشروع" },
      { icon: "🏆", title: "مطور معتمد" },
      { icon: "💪", title: "10 مشاريع مكتملة" },
    ];

    const achievementsContainer = document.getElementById(
      "achievementsContainer",
    );
    if (achievementsContainer) {
      achievementsContainer.innerHTML = achievements
        .map(
          (a) => `
                <div style="text-align:center;padding:12px;background:rgba(255,255,255,0.05);border-radius:10px;">
                    <div style="font-size:24px;">${a.icon}</div>
                    <div style="font-size:10px;color:#94a3b8;margin-top:4px;">${a.title}</div>
                </div>
            `,
        )
        .join("");
    }
  }

  loadInsights() {
    const insights = [
      "📊 لديك 4 مشاريع مميزة تظهر في الواجهة",
      "🎯 نسبة إكمال البورتفوليو 75%، أضف مشروعين للوصول إلى 100%",
      "💡 مهاراتك الأكثر تقدماً: React.js, JavaScript, UI/UX",
      "🚀 يمكنك نشر التغييرات الجديدة بنقرة واحدة",
    ];

    const insightsList = document.getElementById("insightsList");
    if (insightsList) {
      insightsList.innerHTML = insights
        .map(
          (insight) => `
                <div class="insight-item" style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:6px;font-size:12px;color:#cbd5e1;border-right:3px solid #a855f7;">
                    ${insight}
                </div>
            `,
        )
        .join("");
    }
  }

  // ========================
  // Actions
  // ========================
  openGlobalSearch() {
    const search = document.getElementById("home-quick-search");
    if (search) {
      search.focus();
      search.select();
      Utils.toast("🔍 ابحث عن أي شيء في الداش بورد", "info");
    }
  }

  doQuickSearch(query) {
    if (query.trim()) {
      Utils.toast(`🔍 جاري البحث عن: "${query}"`, "info");
      // هنا سيتم تنفيذ البحث الفعلي
      console.log("Searching for:", query);
    }
  }

  togglePreview(show) {
    window.open("../index.html", "_blank");
  }

  doBackup() {
    Utils.toast("💾 جاري إنشاء نسخة احتياطية...", "info");
    setTimeout(() => {
      const data = {
        timestamp: new Date().toISOString(),
        stats: AppState.data.stats,
        config: AppState.config,
      };
      Utils.exportJSON(data, `dashboard-backup-${Date.now()}.json`);
      Utils.toast("✅ تم إنشاء النسخة الاحتياطية", "success");
    }, 1500);
  }

  doPublish() {
    if (confirm("هل أنت متأكد من نشر التغييرات؟")) {
      Utils.toast("🚀 جاري النشر...", "info");
      setTimeout(() => {
        Utils.toast("✅ تم النشر بنجاح", "success");
        // إضافة سجل للنشاط
        this.addLog("تم نشر التغييرات على الموقع");
      }, 2000);
    }
  }

  openMediaManager() {
    Utils.toast("🖼️ فتح مكتبة الوسائط", "info");
    // هنا سيتم فتح مدير الوسائط
  }

  addLog(message) {
    const logs = AppState.data.logs;
    logs.unshift({
      id: Utils.genId(),
      message: message,
      time: new Date().toISOString(),
    });

    // تحديث واجهة السجلات
    this.updateLogsDisplay();
  }

  updateLogsDisplay() {
    const logsGrid = document.getElementById("logsGrid");
    if (logsGrid) {
      const logs = AppState.data.logs.slice(0, 20);
      logsGrid.innerHTML = logs
        .map(
          (log) => `
                <div style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;font-size:12px;">
                    <span style="color:#cbd5e1;">${log.message}</span>
                    <span style="color:#94a3b8;">${Utils.formatTime(log.time)}</span>
                </div>
            `,
        )
        .join("");
    }
  }
}

// ============================================================
// 8. MAIN APPLICATION (التطبيق الرئيسي)
// ============================================================

// ============================================================
// 9. RUN APPLICATION (تشغيل التطبيق)


// دعم الصفحة بعد التحميل

  // لو الصفحة محملة بالفعل
// ============================================================
// 9. UPDATER ENGINE (محرر الكود والبرومت)
// ============================================================
class UpdaterEngine {
  constructor(app) {
    this.app = app;
    this.currentLanguage = "html";
    this.editorContent = "";
    this.promptHistory = [];
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadContent();
    console.log("📝 Updater Engine ready");
  }

  setupEvents() {
    // ========================
    // Prompt Editor
    // ========================
    const promptEditor = document.getElementById("promptEditor");
    if (promptEditor) {
      promptEditor.addEventListener("input", () => {
        // Auto-save prompt
        this.savePromptDraft(promptEditor.value);
      });
    }

    // Copy Prompt
    const copyPromptBtn = document.getElementById("copyPromptBtn");
    if (copyPromptBtn) {
      copyPromptBtn.addEventListener("click", () => {
        const content = document.getElementById("promptEditor")?.value;
        if (content) {
          Utils.copy(content);
        } else {
          Utils.toast("لا يوجد نص لنسخه", "warning");
        }
      });
    }

    // Clear Prompt
    const clearPromptBtn = document.getElementById("clearPromptBtn");
    if (clearPromptBtn) {
      clearPromptBtn.addEventListener("click", () => {
        const editor = document.getElementById("promptEditor");
        if (editor && confirm("هل تريد مسح المحرر؟")) {
          editor.value = "";
          Utils.toast("تم مسح المحرر", "info");
        }
      });
    }

    // Prompt Templates
    const templates = document.getElementById("promptTemplates");
    if (templates) {
      templates.addEventListener("change", (e) => {
        const template = e.target.value;
        if (template && template !== "Select Template...") {
          this.applyTemplate(template);
        }
      });
    }

    // ========================
    // Code Editor
    // ========================
    // Format
    const formatBtn = document.getElementById("formatCodeBtn");
    if (formatBtn) {
      formatBtn.addEventListener("click", () => this.formatCode());
    }

    // Beautify
    const beautifyBtn = document.getElementById("beautifyCodeBtn");
    if (beautifyBtn) {
      beautifyBtn.addEventListener("click", () => this.beautifyCode());
    }

    // Minify
    const minifyBtn = document.getElementById("minifyCodeBtn");
    if (minifyBtn) {
      minifyBtn.addEventListener("click", () => this.minifyCode());
    }

    // Copy Code
    const copyCodeBtn = document.getElementById("copyCodeBtn");
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener("click", () => {
        const content =
          document.getElementById("codeEditorContent")?.textContent;
        if (content) {
          Utils.copy(content);
        }
      });
    }

    // Download Code
    const downloadBtn = document.getElementById("downloadCodeBtn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => this.downloadCode());
    }

    // Clear Code
    const clearCodeBtn = document.getElementById("clearCodeBtn");
    if (clearCodeBtn) {
      clearCodeBtn.addEventListener("click", () => {
        if (confirm("هل تريد مسح الكود؟")) {
          const editor = document.getElementById("codeEditorContent");
          if (editor) {
            editor.textContent = "";
            this.updateStats();
            Utils.toast("تم مسح الكود", "info");
          }
        }
      });
    }

    // Language Select
    const langSelect = document.getElementById("codeLanguageSelect");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        this.currentLanguage = e.target.value;
        this.updateSyntaxHighlighting();
      });
    }

    // ========================
    // AI Actions
    // ========================
    const aiActions = {
      aiGenerateBtn: "Generating code...",
      aiFixBtn: "Fixing code...",
      aiOptimizeBtn: "Optimizing code...",
      aiExplainBtn: "Explaining code...",
    };

    for (const [id, message] of Object.entries(aiActions)) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          Utils.toast(`🤖 ${message}`, "info");
          setTimeout(() => {
            Utils.toast("✅ تم التنفيذ", "success");
            this.setConsoleOutput(`[AI] ${message} completed successfully.`);
          }, 1500);
        });
      }
    }

    // ========================
    // Snippet Copy
    // ========================
    const snippetBtn = document.getElementById("snippetCopyBtn");
    if (snippetBtn) {
      snippetBtn.addEventListener("click", () => {
        const snippet =
          "/* Glassmorphism Card */\n.glass-card {\n  background: rgba(255,255,255,0.1);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255,255,255,0.2);\n  border-radius: 16px;\n  padding: 24px;\n}";
        Utils.copy(snippet);
        this.setEditorContent(snippet);
      });
    }

    // ========================
    // Keyboard Shortcuts
    // ========================
    document.addEventListener("keydown", (e) => {
      // Ctrl+S = Save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        this.saveCurrentCode();
      }
    });
  }

  loadContent() {
    // تحميل المحتوى المحفوظ
    const saved = Utils.storage.get("updater-content", null);
    if (saved) {
      const editor = document.getElementById("codeEditorContent");
      if (editor) {
        editor.textContent = saved;
        this.updateStats();
      }
    }

    // تحميل البرومبت المحفوظ
    const savedPrompt = Utils.storage.get("updater-prompt", "");
    const promptEditor = document.getElementById("promptEditor");
    if (promptEditor) {
      promptEditor.value = savedPrompt;
    }

    // تحميل اللغة المحفوظة
    const savedLang = Utils.storage.get("updater-language", "HTML");
    const langSelect = document.getElementById("codeLanguageSelect");
    if (langSelect) {
      langSelect.value = savedLang;
      this.currentLanguage = savedLang;
    }
  }

  savePromptDraft(content) {
    Utils.storage.set("updater-prompt", content);
  }

  saveCurrentCode() {
    const editor = document.getElementById("codeEditorContent");
    if (editor) {
      Utils.storage.set("updater-content", editor.textContent);
      Utils.storage.set("updater-language", this.currentLanguage);
      Utils.toast("💾 تم حفظ الكود", "success");
      this.setConsoleOutput("[SAVE] Code saved successfully.");
    }
  }

  applyTemplate(template) {
    const templates = {
      "Hero Section": `<section class="hero">
    <div class="container">
        <h1>Welcome to My Portfolio</h1>
        <p>Full Stack Developer</p>
        <a href="#contact" class="btn-primary">Get in Touch</a>
    </div>
</section>`,
      "Navbar & Menu": `<nav class="navbar">
    <div class="logo">MyBrand</div>
    <ul class="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
    </ul>
</nav>`,
      "Footer Layout": `<footer class="footer">
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
      "Contact Form": `<form class="contact-form">
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
      "Modern Card": `<div class="modern-card">
    <div class="card-image">
        <img src="https://via.placeholder.com/400x200" alt="Card Image">
    </div>
    <div class="card-body">
        <h3>Card Title</h3>
        <p>This is a modern card design with glassmorphism effect.</p>
        <a href="#" class="card-link">Learn More →</a>
    </div>
</div>`,
    };

    const content = templates[template];
    if (content) {
      this.setEditorContent(content);
      Utils.toast(`📄 تم تطبيق قالب: ${template}`, "success");
      this.setConsoleOutput(`[TEMPLATE] Applied: ${template}`);
    }
  }

  setEditorContent(content) {
    const editor = document.getElementById("codeEditorContent");
    if (editor) {
      editor.textContent = content;
      this.updateStats();
      this.saveCurrentCode();
    }
  }

  formatCode() {
    const editor = document.getElementById("codeEditorContent");
    if (editor) {
      let content = editor.textContent;
      // تنسيق بسيط - يمكن توسيعه لاحقاً
      content = content.replace(/\s+/g, " ").trim();
      content = content.replace(/>\s+</g, "><");
      // إعادة تنسيق السطور
      const lines = content.split(">").filter((line) => line.trim());
      let formatted = "";
      let indent = 0;
      lines.forEach((line) => {
        const trimmed = line.trim() + ">";
        if (trimmed.includes("</")) indent--;
        formatted += "  ".repeat(Math.max(0, indent)) + trimmed + "\n";
        if (
          trimmed.includes("<") &&
          !trimmed.includes("</") &&
          !trimmed.includes("/>")
        )
          indent++;
      });
      editor.textContent = formatted;
      this.updateStats();
      Utils.toast("✅ تم تنسيق الكود", "success");
      this.setConsoleOutput("[FORMAT] Code formatted successfully.");
    }
  }

  beautifyCode() {
    const editor = document.getElementById("codeEditorContent");
    if (editor) {
      let content = editor.textContent;
      // إضافة مسافات وسطور جميلة
      content = content.replace(/>/g, ">\n");
      content = content.replace(/</g, "\n<");
      const lines = content.split("\n").filter((line) => line.trim());
      let formatted = "";
      let indent = 0;
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.includes("</") && !trimmed.includes("</>")) indent--;
        formatted += "  ".repeat(Math.max(0, indent)) + trimmed + "\n";
        if (
          trimmed.includes("<") &&
          !trimmed.includes("</") &&
          !trimmed.includes("/>")
        )
          indent++;
      });
      editor.textContent = formatted;
      this.updateStats();
      Utils.toast("✨ تم تجميل الكود", "success");
      this.setConsoleOutput("[BEAUTIFY] Code beautified.");
    }
  }

  minifyCode() {
    const editor = document.getElementById("codeEditorContent");
    if (editor) {
      let content = editor.textContent;
      content = content.replace(/\s+/g, " ");
      content = content.replace(/>\s+</g, "><");
      content = content.trim();
      editor.textContent = content;
      this.updateStats();
      Utils.toast("📦 تم تصغير الكود", "success");
      this.setConsoleOutput("[MINIFY] Code minified.");
    }
  }

  downloadCode() {
    const editor = document.getElementById("codeEditorContent");
    if (editor) {
      const content = editor.textContent;
      const ext = this.currentLanguage.toLowerCase();
      const filename = `code.${ext === "javascript" ? "js" : ext === "html" ? "html" : ext === "css" ? "css" : "txt"}`;
      Utils.download(content, filename);
      Utils.toast("📥 تم تحميل الملف", "success");
      this.setConsoleOutput(`[DOWNLOAD] Downloaded: ${filename}`);
    }
  }

  updateStats() {
    const editor = document.getElementById("codeEditorContent");
    if (editor) {
      const content = editor.textContent;
      const lines = content.split("\n").length;
      const words = content.split(/\s+/).filter((w) => w).length;
      const chars = content.length;

      const statsEl = document.getElementById("codeStats");
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
    const consoleEl = document.getElementById("devConsoleOutput");
    if (consoleEl) {
      const timestamp = new Date().toLocaleTimeString();
      consoleEl.textContent = `[${timestamp}] ${message}`;
    }
  }

  updateSyntaxHighlighting() {
    // محاكاة تغيير لغة التظليل
    const langMap = {
      HTML: "HTML",
      CSS: "CSS",
      JavaScript: "JavaScript",
      JSON: "JSON",
    };
    this.setConsoleOutput(
      `[LANG] Switched to: ${langMap[this.currentLanguage] || this.currentLanguage}`,
    );
  }
}

// ============================================================
// 10. HERO ENGINE (محرك قسم الهيرو)
// ============================================================
class HeroEngine {
  constructor(app) {
    this.app = app;
    this.currentTab = "hero-tab-content";
    this.previewDevice = "desktop";
    this.previewTheme = "dark";
    this.buttons = [];
    this.socials = [];
    this.stats = [];
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupButtons();
    this.setupInputs();
    this.setupPreview();
    this.loadData();
    console.log("🎯 Hero Engine ready");
  }

  setupTabs() {
    document.querySelectorAll("#hero-section .tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        if (tabId) {
          this.switchTab(tabId, btn);
        }
      });
    });
  }

  switchTab(tabId, activeBtn) {
    // إخفاء الكل
    document.querySelectorAll(".hero-tab-pane").forEach((el) => {
      el.style.display = "none";
    });

    // إظهار المطلوب
    const target = document.getElementById(tabId);
    if (target) target.style.display = "block";

    // تحديث الأزرار
    document.querySelectorAll("#hero-section .tab-btn").forEach((btn) => {
      btn.className = "saas-btn saas-btn-secondary tab-btn";
    });
    if (activeBtn) {
      activeBtn.className = "saas-btn saas-btn-primary tab-btn active-tab";
    }

    this.currentTab = tabId;
  }

  setupButtons() {
    // حفظ مسودة
    const saveBtn = document.getElementById("hero-save-draft-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveDraft());
    }

    // نشر
    const publishBtn = document.getElementById("hero-publish-btn");
    if (publishBtn) {
      publishBtn.addEventListener("click", () => this.publish());
    }

    // تراجع
    const undoBtn = document.getElementById("hero-undo-btn");
    if (undoBtn) {
      undoBtn.addEventListener("click", () => this.undo());
    }

    // إعادة
    const redoBtn = document.getElementById("hero-redo-btn");
    if (redoBtn) {
      redoBtn.addEventListener("click", () => this.redo());
    }

    // إعادة تعيين
    const resetBtn = document.getElementById("hero-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("هل تريد استعادة الإعدادات الافتراضية؟")) {
          this.resetDefaults();
        }
      });
    }

    // إضافة زر
    const addBtn = document.getElementById("hero-add-button-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.addButton());
    }

    // إضافة منصة
    const socialBtn = document.getElementById("hero-add-social-btn");
    if (socialBtn) {
      socialBtn.addEventListener("click", () => this.addSocial());
    }

    // إضافة عداد
    const statBtn = document.getElementById("hero-add-stat-btn");
    if (statBtn) {
      statBtn.addEventListener("click", () => this.addStat());
    }

    // رفع الصورة
    const uploadBtn = document.getElementById("hero-upload-btn");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        document.getElementById("hero-image-upload-input")?.click();
      });
    }

    const fileInput = document.getElementById("hero-image-upload-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleImageUpload(e));
    }

    // فتح الموقع
    const openBtn = document.getElementById("hero-open-website-btn");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        window.open("../index.html", "_blank");
      });
    }
  }

  setupInputs() {
    // كل الحقول اللي تحديثها يغير المعاينة
    const inputs = [
      "hero-main-heading",
      "hero-sub-heading",
      "hero-typing-text",
      "hero-description",
      "hero-full-name",
      "hero-location",
      "hero-email",
      "hero-custom-badge",
    ];

    inputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this.updatePreview());
      }
    });

    // السليكتات
    const selects = ["hero-availability-status", "hero-layout-style"];

    selects.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => this.updatePreview());
      }
    });

    // التشيك بوكسات
    const checks = [
      "hero-enable-typing",
      "hero-badge-available",
      "hero-badge-verified",
      "hero-effect-glow",
      "hero-effect-float",
    ];

    checks.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => this.updatePreview());
      }
    });

    // اللون
    const color = document.getElementById("hero-bg-color");
    if (color) {
      color.addEventListener("input", () => this.updatePreview());
    }

    // بحث الإعدادات
    const search = document.getElementById("hero-settings-search");
    if (search) {
      search.addEventListener("input", () => this.filterSettings(search.value));
    }
  }

  setupPreview() {
    // أزرار الجهاز
    const devices = ["desktop", "tablet", "mobile"];
    devices.forEach((device) => {
      const btn = document.getElementById(`hero-preview-${device}-btn`);
      if (btn) {
        btn.addEventListener("click", () => {
          this.previewDevice = device;
          this.updatePreviewDevice(device);
        });
      }
    });

    // تبديل الثيم
    const themeBtn = document.getElementById("hero-preview-theme-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.togglePreviewTheme());
    }

    // تحديث المعاينة
    const refreshBtn = document.getElementById("hero-preview-refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.updatePreview();
        Utils.toast("🔄 تم تحديث المعاينة", "info");
      });
    }
  }

  loadData() {
    // تحميل البيانات المحفوظة
    const saved = Utils.storage.get("hero-data", null);
    if (saved) {
      // استعادة القيم
      const fields = {
        "hero-main-heading": saved.heading,
        "hero-sub-heading": saved.subHeading,
        "hero-typing-text": saved.typingText,
        "hero-description": saved.description,
        "hero-full-name": saved.fullName,
        "hero-location": saved.location,
        "hero-email": saved.email,
        "hero-custom-badge": saved.customBadge,
        "hero-availability-status": saved.availability,
        "hero-layout-style": saved.layout,
        "hero-bg-color": saved.bgColor || "#0f172a",
      };

      for (const [id, val] of Object.entries(fields)) {
        Utils.setVal(id, val);
      }

      // التشيك بوكسات
      const checks = {
        "hero-enable-typing": saved.enableTyping,
        "hero-badge-available": saved.badgeAvailable,
        "hero-badge-verified": saved.badgeVerified,
        "hero-effect-glow": saved.effectGlow,
        "hero-effect-float": saved.effectFloat,
      };

      for (const [id, val] of Object.entries(checks)) {
        const el = document.getElementById(id);
        if (el) el.checked = val !== undefined ? val : true;
      }
    }

    // تحديث المعاينة
    this.updatePreview();
  }

  updatePreview() {
    // جلب القيم
    const data = {
      heading: Utils.getVal("hero-main-heading"),
      subHeading: Utils.getVal("hero-sub-heading"),
      typingText: Utils.getVal("hero-typing-text"),
      description: Utils.getVal("hero-description"),
      fullName: Utils.getVal("hero-full-name"),
      location: Utils.getVal("hero-location"),
      email: Utils.getVal("hero-email"),
      customBadge: Utils.getVal("hero-custom-badge"),
      availability: Utils.getVal("hero-availability-status"),
      layout: Utils.getVal("hero-layout-style"),
      bgColor: Utils.getVal("hero-bg-color"),
      enableTyping:
        document.getElementById("hero-enable-typing")?.checked || false,
      badgeAvailable:
        document.getElementById("hero-badge-available")?.checked || false,
      badgeVerified:
        document.getElementById("hero-badge-verified")?.checked || false,
      effectGlow: document.getElementById("hero-effect-glow")?.checked || false,
      effectFloat:
        document.getElementById("hero-effect-float")?.checked || false,
    };

    // تحديث المعاينة
    Utils.setText("canvas-main-heading-view", data.heading);
    Utils.setText("canvas-sub-heading-view", data.subHeading);
    Utils.setText("canvas-desc-view", data.description);

    // الشارات
    const badgeView = document.getElementById("canvas-badge-view");
    if (badgeView) {
      badgeView.style.display = data.badgeAvailable ? "inline" : "none";
      if (data.badgeAvailable) {
        badgeView.innerHTML = `<i class="fa-solid fa-circle" style="font-size:7px;color:#10b981;"></i> ${data.availability || "Available"}`;
      }
    }

    const customBadge = document.getElementById("canvas-custom-badge-view");
    if (customBadge) {
      customBadge.style.display = data.badgeVerified ? "inline" : "none";
      if (data.badgeVerified) {
        customBadge.textContent = data.customBadge || "✅ Verified";
      }
    }

    // الاسم في المعاينة
    const nameEl = document.getElementById("home-user-name");
    if (nameEl) nameEl.textContent = data.fullName || "Mohamed Abdallah";

    // التخطيط
    const layoutFlex = document.getElementById("canvas-layout-flex");
    if (layoutFlex) {
      if (data.layout === "center") {
        layoutFlex.style.justifyContent = "center";
        layoutFlex.style.textAlign = "center";
      } else if (data.layout === "image-left") {
        layoutFlex.style.flexDirection = "row-reverse";
      } else {
        layoutFlex.style.flexDirection = "row";
      }
    }

    // الخلفية
    const canvasBox = document.getElementById("hero-live-canvas-box");
    if (canvasBox && data.bgColor) {
      canvasBox.style.background = data.bgColor;
    }

    // التأثيرات
    const imgWrap = document.getElementById("canvas-profile-img-wrap");
    if (imgWrap) {
      const parent = imgWrap.parentElement;
      if (data.effectGlow) {
        parent.style.boxShadow = "0 0 30px rgba(56,189,248,0.5)";
      } else {
        parent.style.boxShadow = "0 0 25px rgba(56,189,248,0.3)";
      }
    }

    // تحديث وقت الحفظ
    const now = new Date();
    Utils.setText(
      "hero-last-saved-time",
      `آخر تحديث: ${Utils.formatTime(now)}`,
    );

    // حفظ البيانات
    this.saveToStorage(data);
  }

  updatePreviewDevice(device) {
    const wrapper = document.getElementById("hero-canvas-wrapper");
    const box = document.getElementById("hero-live-canvas-box");
    if (wrapper && box) {
      const widths = { desktop: "780px", tablet: "580px", mobile: "380px" };
      box.style.maxWidth = widths[device] || "780px";
      Utils.toast(
        `📱 جهاز: ${device === "desktop" ? "حاسوب" : device === "tablet" ? "تابلت" : "موبايل"}`,
        "info",
      );
    }
  }

  togglePreviewTheme() {
    const box = document.getElementById("hero-live-canvas-box");
    if (box) {
      const isLight =
        box.style.background === "#ffffff" || box.style.background === "white";
      box.style.background = isLight ? "rgba(18,24,43,0.95)" : "#ffffff";
      box.style.color = isLight ? "#fff" : "#000";

      // تحديث النصوص
      const headings = box.querySelectorAll("h1, h3, h4");
      headings.forEach((el) => {
        el.style.color = isLight ? "#fff" : "#000";
      });

      const desc = box.querySelectorAll("p, span");
      desc.forEach((el) => {
        if (!el.closest(".saas-badge")) {
          el.style.color = isLight ? "#94a3b8" : "#475569";
        }
      });

      this.previewTheme = isLight ? "dark" : "light";
      Utils.toast(isLight ? "🌙 الوضع المظلم" : "☀️ الوضع الفاتح", "info");
    }
  }

  saveToStorage(data) {
    Utils.storage.set("hero-data", data);
  }

  saveDraft() {
    this.updatePreview();
    Utils.toast("💾 تم حفظ المسودة", "success");
    Utils.setText(
      "hero-last-saved-time",
      `تم الحفظ ${Utils.formatTime(new Date())}`,
    );
  }

  publish() {
    if (confirm("هل أنت متأكد من نشر التغييرات؟")) {
      this.updatePreview();
      Utils.toast("🚀 تم نشر التغييرات بنجاح", "success");
      // إضافة سجل
      if (this.app.home) {
        this.app.home.addLog("📝 تم نشر تحديثات الهيرو");
      }
    }
  }

  undo() {
    Utils.toast("↩️ تراجع", "info");
  }

  redo() {
    Utils.toast("↪️ إعادة", "info");
  }

  resetDefaults() {
    const defaults = {
      "hero-main-heading": "Hi, I'm Mohamed Abdallah",
      "hero-sub-heading": "Frontend Web Developer",
      "hero-typing-text":
        "Frontend Developer, UI/UX Enthusiast, Supermarket Pro",
      "hero-description":
        "Passionate frontend web developer specializing in building exceptional digital experiences with modern web technologies.",
      "hero-full-name": "Mohamed Abdallah",
      "hero-location": "Egypt",
      "hero-email": "contact@mohamed.dev",
      "hero-custom-badge": "🔥 Available for Hire",
      "hero-availability-status": "Available For Work",
      "hero-layout-style": "image-right",
      "hero-bg-color": "#0f172a",
    };

    for (const [id, val] of Object.entries(defaults)) {
      Utils.setVal(id, val);
    }

    // التشيك بوكسات
    const checks = {
      "hero-enable-typing": true,
      "hero-badge-available": true,
      "hero-badge-verified": true,
      "hero-effect-glow": true,
      "hero-effect-float": true,
    };

    for (const [id, val] of Object.entries(checks)) {
      const el = document.getElementById(id);
      if (el) el.checked = val;
    }

    this.updatePreview();
    Utils.toast("✅ تم استعادة الإعدادات الافتراضية", "success");
  }

  addButton() {
    const container = document.getElementById("hero-buttons-container");
    if (container) {
      const id = Utils.genId();
      const div = document.createElement("div");
      div.className = "hero-button-row";
      div.style.cssText =
        "display:flex;gap:10px;align-items:center;background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;";
      div.innerHTML = `
                <input type="text" placeholder="نص الزر" value="زر جديد" style="flex:1;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;">
                <input type="url" placeholder="رابط" value="#" style="flex:1;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;">
                <select style="padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;">
                    <option value="primary">رئيسي</option>
                    <option value="secondary">ثانوي</option>
                </select>
                <button onclick="this.parentElement.remove()" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:6px 12px;cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
      container.appendChild(div);

      // ربط الأحداث
      div.querySelectorAll("input, select").forEach((el) => {
        el.addEventListener("change", () => this.updatePreview());
        el.addEventListener("input", () => this.updatePreview());
      });

      this.updatePreview();
      Utils.toast("➕ تم إضافة زر جديد", "success");
    }
  }

  addSocial() {
    const container = document.getElementById("hero-socials-container");
    if (container) {
      const id = Utils.genId();
      const div = document.createElement("div");
      div.className = "hero-social-row";
      div.style.cssText =
        "display:flex;gap:10px;align-items:center;background:rgba(255,255,255,0.05);padding:8px;border-radius:6px;";
      div.innerHTML = `
                <input type="text" placeholder="المنصة" value="منصة جديدة" style="flex:1;padding:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;">
                <input type="url" placeholder="الرابط" value="#" style="flex:2;padding:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;">
                <button onclick="this.parentElement.remove()" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);border-radius:4px;padding:4px 10px;cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
      container.appendChild(div);

      div.querySelectorAll("input").forEach((el) => {
        el.addEventListener("change", () => this.updatePreview());
        el.addEventListener("input", () => this.updatePreview());
      });

      this.updatePreview();
      Utils.toast("➕ تم إضافة منصة جديدة", "success");
    }
  }

  addStat() {
    const container = document.getElementById("hero-stats-container");
    if (container) {
      const div = document.createElement("div");
      div.className = "hero-stat-row";
      div.style.cssText =
        "background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;";
      div.innerHTML = `
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="text" placeholder="القيمة" value="100+" style="flex:1;padding:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;">
                    <input type="text" placeholder="الوصف" value="مشروع" style="flex:2;padding:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;">
                    <button onclick="this.closest('.hero-stat-row').remove()" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);border-radius:4px;padding:4px 10px;cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
      container.appendChild(div);

      div.querySelectorAll("input").forEach((el) => {
        el.addEventListener("change", () => this.updatePreview());
        el.addEventListener("input", () => this.updatePreview());
      });

      this.updatePreview();
      Utils.toast("➕ تم إضافة عداد جديد", "success");
    }
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target.result;
        const imgWrap = document.getElementById("canvas-profile-img-wrap");
        if (imgWrap) {
          imgWrap.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
          Utils.toast("🖼️ تم رفع الصورة بنجاح", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  filterSettings(query) {
    const tabs = document.querySelectorAll("#hero-section .tab-btn");
    tabs.forEach((btn) => {
      const text = btn.textContent.toLowerCase();
      const match = text.includes(query.toLowerCase());
      btn.style.display = match || !query ? "inline-flex" : "none";
    });
  }
}

// ============================================================
// 11. SKILLS ENGINE (محرك قسم المهارات)
// ============================================================
class SkillsEngine {
  constructor(app) {
    this.app = app;
    this.skills = [];
    this.categories = [
      "Web Development",
      "Programming",
      "Software Skills",
      "Tools",
    ];
    this.selectedSkills = new Set();
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderCategories();
    this.updateStats();
    console.log("💻 Skills Engine ready");
  }

  setupEvents() {
    // إضافة مهارة
    const addBtn = document.getElementById("openSkillModalBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    // إغلاق المودال
    const closeBtns = ["closeSkillModalBtn", "cancelSkillBtn"];
    closeBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => this.closeModal());
      }
    });

    // بحث
    const search = document.getElementById("skill-search-input");
    if (search) {
      search.addEventListener("input", () => this.filterSkills());
    }

    // الفلترة
    const filters = ["filter-category", "filter-level", "sort-skills-select"];
    filters.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => this.filterSkills());
      }
    });

    // أزرار Bulk
    const bulkBtns = ["bulkShowBtn", "bulkHideBtn", "bulkDeleteBtn"];
    bulkBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = id
            .replace("bulk", "")
            .replace("Btn", "")
            .toLowerCase();
          this.bulkAction(action);
        });
      }
    });

    // حفظ النموذج
    const form = document.getElementById("skill-form");
    if (form) {
      form.addEventListener("submit", (e) => this.saveSkill(e));
    }

    // معاينة حية في النموذج
    const previewInputs = [
      "skill-name",
      "skill-level",
      "skill-progress",
      "skill-icon",
    ];
    previewInputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this.updatePreview());
        el.addEventListener("change", () => this.updatePreview());
      }
    });
  }

  loadData() {
    // تحميل المهارات المحفوظة
    const saved = Utils.storage.get("skills-data", []);
    if (saved.length > 0) {
      this.skills = saved;
    } else {
      // بيانات افتراضية
      this.skills = [
        {
          id: Utils.genId(),
          name: "React.js",
          category: "Web Development",
          level: "Advanced",
          progress: 90,
          icon: "fa-brands fa-react",
          experience: "3 Years",
          featured: true,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "JavaScript",
          category: "Programming",
          level: "Expert",
          progress: 95,
          icon: "fa-brands fa-js",
          experience: "5 Years",
          featured: true,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "HTML & CSS",
          category: "Web Development",
          level: "Expert",
          progress: 98,
          icon: "fa-brands fa-html5",
          experience: "5 Years",
          featured: true,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "Node.js",
          category: "Programming",
          level: "Advanced",
          progress: 80,
          icon: "fa-brands fa-node",
          experience: "2 Years",
          featured: false,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "Git & GitHub",
          category: "Tools",
          level: "Advanced",
          progress: 85,
          icon: "fa-brands fa-github",
          experience: "4 Years",
          featured: false,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "UI/UX Design",
          category: "Software Skills",
          level: "Intermediate",
          progress: 70,
          icon: "fa-solid fa-palette",
          experience: "2 Years",
          featured: false,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "TypeScript",
          category: "Programming",
          level: "Intermediate",
          progress: 65,
          icon: "fa-brands fa-ts",
          experience: "1 Year",
          featured: false,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "Tailwind CSS",
          category: "Web Development",
          level: "Advanced",
          progress: 88,
          icon: "fa-brands fa-tailwind",
          experience: "2 Years",
          featured: false,
          hidden: false,
        },
      ];
    }
  }

  renderCategories() {
    const container = document.getElementById("categories-container");
    if (!container) return;

    // تجميع المهارات حسب الفئة
    const grouped = {};
    this.categories.forEach((cat) => {
      grouped[cat] = this.skills.filter((s) => s.category === cat && !s.hidden);
    });

    let html = "";
    for (const [category, skills] of Object.entries(grouped)) {
      const visibleSkills = skills.filter((s) => !s.hidden);
      if (visibleSkills.length === 0) continue;

      html += `
                <div class="category-card" style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <h3 style="color:#60a5fa;font-size:14px;margin:0;">
                            <i class="fa-solid fa-folder-open"></i> ${category}
                        </h3>
                        <span style="font-size:11px;color:#94a3b8;">${visibleSkills.length} مهارة</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;">
                        ${visibleSkills.map((skill) => this.renderSkillCard(skill)).join("")}
                    </div>
                </div>
            `;
    }

    container.innerHTML =
      html ||
      '<p style="color:#94a3b8;text-align:center;padding:40px;">لا توجد مهارات مضافة</p>';

    // ربط الأحداث للكروت
    container.querySelectorAll(".skill-card").forEach((card) => {
      const checkbox = card.querySelector(".skill-select");
      if (checkbox) {
        checkbox.addEventListener("change", () => this.updateBulkBar());
      }

      const editBtn = card.querySelector(".edit-skill-btn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          const id = card.dataset.skillId;
          if (id) this.editSkill(id);
        });
      }

      const deleteBtn = card.querySelector(".delete-skill-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const id = card.dataset.skillId;
          if (id && confirm("هل تريد حذف هذه المهارة؟")) {
            this.deleteSkill(id);
          }
        });
      }

      const toggleBtn = card.querySelector(".toggle-skill-btn");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          const id = card.dataset.skillId;
          if (id) this.toggleSkillVisibility(id);
        });
      }
    });
  }

  renderSkillCard(skill) {
    const isFeatured = skill.featured ? "⭐" : "";
    const levelColors = {
      Beginner: "#10b981",
      Intermediate: "#fbbf24",
      Advanced: "#f59e0b",
      Expert: "#ef4444",
    };

    return `
            <div class="skill-card" data-skill-id="${skill.id}" style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;border:1px solid ${skill.featured ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.06)"};">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <input type="checkbox" class="skill-select" style="accent-color:#a855f7;width:14px;height:14px;">
                    <div style="width:28px;height:28px;background:rgba(168,85,247,0.15);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#a855f7;">
                        <i class="${skill.icon || "fa-solid fa-code"}"></i>
                    </div>
                    <span style="font-size:13px;font-weight:600;color:#fff;flex:1;">${skill.name}</span>
                    <span style="font-size:9px;background:rgba(168,85,247,0.2);color:#a855f7;padding:2px 6px;border-radius:4px;">${isFeatured}</span>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:#94a3b8;">
                    <span>${skill.level}</span>
                    <span>•</span>
                    <span>${skill.experience || "N/A"}</span>
                    <span>•</span>
                    <span style="color:${levelColors[skill.level] || "#94a3b8"};">${skill.progress}%</span>
                </div>
                <div style="width:100%;height:3px;background:rgba(255,255,255,0.1);border-radius:4px;margin-top:6px;overflow:hidden;">
                    <div style="width:${skill.progress}%;height:100%;background:linear-gradient(90deg,#6366f1,#a855f7);border-radius:4px;"></div>
                </div>
                <div style="display:flex;gap:4px;margin-top:8px;">
                    <button class="edit-skill-btn" style="background:rgba(56,189,248,0.2);color:#38bdf8;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="toggle-skill-btn" style="background:rgba(251,191,36,0.2);color:#fbbf24;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-${skill.hidden ? "eye-slash" : "eye"}"></i>
                    </button>
                    <button class="delete-skill-btn" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
  }

  openModal(skillId = null) {
    const modal = document.getElementById("skill-modal");
    if (!modal) return;

    const title = document.getElementById("skill-modal-title");
    if (title) {
      title.innerHTML = skillId
        ? '<i class="fa-solid fa-edit" style="color:#a855f7;"></i> تعديل المهارة'
        : '<i class="fa-solid fa-circle-plus" style="color:#a855f7;"></i> إضافة مهارة جديدة';
    }

    if (skillId) {
      const skill = this.skills.find((s) => s.id === skillId);
      if (skill) {
        Utils.setVal("edit-skill-id", skill.id);
        Utils.setVal("skill-name", skill.name);
        Utils.setVal("skill-category", skill.category);
        Utils.setVal("skill-level", skill.level);
        Utils.setVal("skill-experience", skill.experience || "");
        Utils.setVal("skill-progress", skill.progress);
        Utils.setVal("skill-icon", skill.icon || "");
        Utils.setVal("skill-desc", skill.desc || "");

        const featured = document.getElementById("skill-featured");
        if (featured) featured.checked = skill.featured || false;

        const hidden = document.getElementById("skill-hidden");
        if (hidden) hidden.checked = skill.hidden || false;
      }
    } else {
      // إعادة تعيين النموذج
      document.getElementById("skill-form")?.reset();
      Utils.setVal("edit-skill-id", "");
      Utils.setVal("skill-progress", 85);
    }

    modal.style.display = "flex";
    this.updatePreview();
  }

  closeModal() {
    const modal = document.getElementById("skill-modal");
    if (modal) modal.style.display = "none";
  }

  saveSkill(e) {
    e.preventDefault();

    const id = Utils.getVal("edit-skill-id");
    const data = {
      name: Utils.getVal("skill-name"),
      category: Utils.getVal("skill-category"),
      level: Utils.getVal("skill-level"),
      experience: Utils.getVal("skill-experience"),
      progress: parseInt(Utils.getVal("skill-progress")) || 0,
      icon: Utils.getVal("skill-icon"),
      desc: Utils.getVal("skill-desc"),
      featured: document.getElementById("skill-featured")?.checked || false,
      hidden: document.getElementById("skill-hidden")?.checked || false,
    };

    if (!data.name) {
      Utils.toast("⚠️ اسم المهارة مطلوب", "warning");
      return;
    }

    if (id) {
      // تعديل
      const index = this.skills.findIndex((s) => s.id === id);
      if (index !== -1) {
        this.skills[index] = { ...this.skills[index], ...data };
        Utils.toast("✅ تم تحديث المهارة", "success");
      }
    } else {
      // إضافة جديدة
      data.id = Utils.genId();
      this.skills.push(data);
      Utils.toast("✅ تم إضافة المهارة", "success");
    }

    this.closeModal();
    this.saveToStorage();
    this.renderCategories();
    this.updateStats();

    // إضافة سجل
    if (this.app.home) {
      this.app.home.addLog(`📝 ${id ? "تعديل" : "إضافة"} مهارة: ${data.name}`);
    }
  }

  editSkill(id) {
    this.openModal(id);
  }

  deleteSkill(id) {
    this.skills = this.skills.filter((s) => s.id !== id);
    this.saveToStorage();
    this.renderCategories();
    this.updateStats();
    Utils.toast("🗑️ تم حذف المهارة", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم حذف مهارة");
    }
  }

  toggleSkillVisibility(id) {
    const skill = this.skills.find((s) => s.id === id);
    if (skill) {
      skill.hidden = !skill.hidden;
      this.saveToStorage();
      this.renderCategories();
      this.updateStats();
      Utils.toast(
        skill.hidden ? "👁️ تم إخفاء المهارة" : "👁️ تم إظهار المهارة",
        "info",
      );
    }
  }

  filterSkills() {
    const query = Utils.getVal("skill-search-input").toLowerCase();
    const category = Utils.getVal("filter-category");
    const level = Utils.getVal("filter-level");
    const sort = Utils.getVal("sort-skills-select");

    let filtered = this.skills.filter((s) => !s.hidden);

    if (query) {
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(query));
    }
    if (category) {
      filtered = filtered.filter((s) => s.category === category);
    }
    if (level) {
      filtered = filtered.filter((s) => s.level === level);
    }

    // ترتيب
    if (sort === "alpha") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "progress-desc") {
      filtered.sort((a, b) => b.progress - a.progress);
    }

    // تحديث العرض
    const container = document.getElementById("categories-container");
    if (container) {
      // إعادة التجميع حسب الفئة
      const grouped = {};
      this.categories.forEach((cat) => {
        grouped[cat] = filtered.filter((s) => s.category === cat);
      });

      let html = "";
      for (const [category, skills] of Object.entries(grouped)) {
        if (skills.length === 0) continue;
        html += `
                    <div class="category-card" style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.06);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h3 style="color:#60a5fa;font-size:14px;margin:0;">
                                <i class="fa-solid fa-folder-open"></i> ${category}
                            </h3>
                            <span style="font-size:11px;color:#94a3b8;">${skills.length} مهارة</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;">
                            ${skills.map((s) => this.renderSkillCard(s)).join("")}
                        </div>
                    </div>
                `;
      }
      container.innerHTML =
        html ||
        '<p style="color:#94a3b8;text-align:center;padding:40px;">لا توجد مهارات مطابقة</p>';
    }
  }

  updateStats() {
    const visible = this.skills.filter((s) => !s.hidden);
    const featured = this.skills.filter((s) => s.featured && !s.hidden);
    const avgProgress =
      visible.length > 0
        ? Math.round(
            visible.reduce((sum, s) => sum + s.progress, 0) / visible.length,
          )
        : 0;

    Utils.setText("stat-total-skills", this.skills.length);
    Utils.setText("stat-visible-trend", `${visible.length} مرئية`);
    Utils.setText("stat-featured-skills", featured.length);
    Utils.setText("stat-avg-level", `${avgProgress}%`);
  }

  updateBulkBar() {
    const checked = document.querySelectorAll(".skill-select:checked");
    const count = checked.length;
    const bar = document.getElementById("bulk-actions-bar");
    const label = document.getElementById("selected-count-label");

    if (bar) {
      bar.style.display = count > 0 ? "flex" : "none";
    }
    if (label) {
      label.textContent = `تم تحديد ${count} عناصر`;
    }
  }

  bulkAction(action) {
    const checked = document.querySelectorAll(".skill-select:checked");
    const ids = Array.from(checked)
      .map((el) => {
        const card = el.closest(".skill-card");
        return card ? card.dataset.skillId : null;
      })
      .filter(Boolean);

    if (ids.length === 0) {
      Utils.toast("⚠️ لم يتم تحديد أي مهارة", "warning");
      return;
    }

    if (action === "delete" && !confirm(`هل تريد حذف ${ids.length} مهارة؟`)) {
      return;
    }

    ids.forEach((id) => {
      const skill = this.skills.find((s) => s.id === id);
      if (skill) {
        if (action === "show") skill.hidden = false;
        else if (action === "hide") skill.hidden = true;
        else if (action === "delete") {
          this.skills = this.skills.filter((s) => s.id !== id);
        }
      }
    });

    this.saveToStorage();
    this.renderCategories();
    this.updateStats();
    this.updateBulkBar();

    const messages = {
      show: "👁️ تم إظهار المهارات المحددة",
      hide: "👁️ تم إخفاء المهارات المحددة",
      delete: "🗑️ تم حذف المهارات المحددة",
    };
    Utils.toast(messages[action] || "✅ تم التنفيذ", "success");

    if (this.app.home) {
      this.app.home.addLog(`📝 ${messages[action]}`);
    }
  }

  updatePreview() {
    const name = Utils.getVal("skill-name") || "اسم المهارة";
    const level = Utils.getVal("skill-level") || "Advanced";
    const progress = parseInt(Utils.getVal("skill-progress")) || 85;
    const icon = Utils.getVal("skill-icon") || "fa-solid fa-code";

    Utils.setText("preview-title", name);
    Utils.setText("preview-badge", level);

    const progressFill = document.getElementById("preview-progress-fill");
    if (progressFill) progressFill.style.width = `${progress}%`;

    const iconBox = document.getElementById("preview-icon-box");
    if (iconBox) {
      iconBox.innerHTML = `<i class="${icon}"></i>`;
    }
  }

  saveToStorage() {
    Utils.storage.set("skills-data", this.skills);
  }
}

// ============================================================
// 12. PROJECTS ENGINE (محرك قسم المشاريع)
// ============================================================
class ProjectsEngine {
  constructor(app) {
    this.app = app;
    this.projects = [];
    this.selectedProjects = new Set();
    this.currentTab = "tab-general";
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderProjects();
    this.updateStats();
    console.log("📁 Projects Engine ready");
  }

  setupEvents() {
    // إضافة مشروع
    const addBtn = document.getElementById("openProjectModalBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    // إغلاق المودال
    const closeBtns = ["closeProjectModalBtn", "closeProjectModalBtn2"];
    closeBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => this.closeModal());
      }
    });

    // إعادة تعيين النموذج
    const resetBtn = document.getElementById("resetProjectFormBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetForm());
    }

    // تبويبات المودال
    document.querySelectorAll("#project-modal .tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        if (tabId) this.switchModalTab(tabId, btn);
      });
    });

    // بحث
    const search = document.getElementById("project-search-input");
    if (search) {
      search.addEventListener("input", () => this.filterProjects());
    }

    // فلترة
    const filters = [
      "filter-project-category",
      "filter-project-status",
      "filter-project-priority",
      "sort-projects-select",
    ];
    filters.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => this.filterProjects());
      }
    });

    // أزرار Bulk
    const bulkBtns = [
      "projectBulkPublish",
      "projectBulkUnpublish",
      "projectBulkFeature",
      "projectBulkArchive",
      "projectBulkDelete",
    ];
    bulkBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = id.replace("projectBulk", "").toLowerCase();
          this.bulkAction(action);
        });
      }
    });

    // حفظ النموذج
    const form = document.getElementById("project-form");
    if (form) {
      form.addEventListener("submit", (e) => this.saveProject(e));
    }

    // رفع الصورة
    const uploadBtn = document.getElementById("projImageUploadBtn");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        document.getElementById("proj-image-file")?.click();
      });
    }

    const fileInput = document.getElementById("proj-image-file");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleImageUpload(e));
    }

    // أزرار المعاينة
    const previewDevices = [
      "previewDesktopBtn",
      "previewTabletBtn",
      "previewMobileBtn",
    ];
    previewDevices.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          const device = btn.dataset.device || "desktop";
          this.updatePreviewDevice(device);
        });
      }
    });

    const themeBtn = document.getElementById("previewThemeBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.togglePreviewTheme());
    }

    const refreshBtn = document.getElementById("previewRefreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.updateProjectPreview());
    }

    // تصدير
    const exportBtn = document.getElementById("exportProjectsBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportProjects());
    }

    // استيراد
    const importBtn = document.getElementById("importProjectsBtn");
    if (importBtn) {
      importBtn.addEventListener("click", () => {
        document.getElementById("project-file-import-input")?.click();
      });
    }

    const importInput = document.getElementById("project-file-import-input");
    if (importInput) {
      importInput.addEventListener("change", (e) => this.importProjects(e));
    }
  }

  loadData() {
    const saved = Utils.storage.get("projects-data", []);
    if (saved.length > 0) {
      this.projects = saved;
    } else {
      // بيانات افتراضية
      this.projects = [
        {
          id: Utils.genId(),
          name: "Portfolio Dashboard Pro",
          category: "Web Apps",
          status: "Published",
          priority: "High",
          completion: 100,
          client: "Personal Project",
          startDate: "2024-01-15",
          endDate: "2024-03-20",
          tech: "HTML, CSS, JavaScript, Supabase",
          desc: "لوحة تحكم احترافية لإدارة البورتفوليو",
          fullDesc: "نظام متكامل لإدارة المحتوى مع لوحة تحكم ذكية",
          thumbnail: "",
          liveUrl: "https://dashboard.example.com",
          githubUrl: "https://github.com/username/dashboard",
          featured: true,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "E-Commerce Platform",
          category: "Web Apps",
          status: "In Progress",
          priority: "High",
          completion: 65,
          client: "Startup Company",
          startDate: "2024-02-01",
          endDate: "",
          tech: "React, Node.js, MongoDB",
          desc: "منصة تجارة إلكترونية متكاملة",
          fullDesc: "منصة متطورة للتجارة الإلكترونية مع نظام إدارة متكامل",
          thumbnail: "",
          liveUrl: "",
          githubUrl: "https://github.com/username/ecommerce",
          featured: false,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "Task Management System",
          category: "Tools & Dashboards",
          status: "Completed",
          priority: "Medium",
          completion: 100,
          client: "Freelance",
          startDate: "2023-11-10",
          endDate: "2024-01-05",
          tech: "Vue.js, Firebase",
          desc: "نظام إدارة المهام والمشاريع",
          fullDesc: "أداة متكاملة لإدارة المهام مع لوحة تحكم تفاعلية",
          thumbnail: "",
          liveUrl: "https://tasks.example.com",
          githubUrl: "https://github.com/username/tasks",
          featured: false,
          hidden: false,
        },
        {
          id: Utils.genId(),
          name: "Landing Page - SaaS Product",
          category: "Landing Pages",
          status: "Published",
          priority: "Low",
          completion: 100,
          client: "SaaS Company",
          startDate: "2024-02-15",
          endDate: "2024-02-28",
          tech: "HTML, CSS, JavaScript",
          desc: "صفحة هبوط لمنتج SaaS",
          fullDesc: "صفحة هبوط احترافية مع تصميم جذاب",
          thumbnail: "",
          liveUrl: "https://saas-landing.example.com",
          githubUrl: "",
          featured: true,
          hidden: false,
        },
      ];
    }
  }

  renderProjects() {
    const container = document.getElementById("projects-grid-container");
    if (!container) return;

    const visible = this.projects.filter((p) => !p.hidden);

    if (visible.length === 0) {
      container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px;color:#94a3b8;">
                    <i class="fa-solid fa-folder-open" style="font-size:48px;color:#38bdf8;opacity:0.3;"></i>
                    <p style="margin-top:16px;">لا توجد مشاريع مضافة</p>
                    <button class="saas-btn saas-btn-primary" onclick="document.getElementById('openProjectModalBtn')?.click()" style="margin-top:12px;">
                        <i class="fa-solid fa-plus"></i> إضافة مشروع جديد
                    </button>
                </div>
            `;
      return;
    }

    container.innerHTML = visible
      .map((project) => this.renderProjectCard(project))
      .join("");

    // ربط الأحداث
    container.querySelectorAll(".project-card").forEach((card) => {
      const checkbox = card.querySelector(".project-select");
      if (checkbox) {
        checkbox.addEventListener("change", () => this.updateProjectBulkBar());
      }

      const editBtn = card.querySelector(".edit-project-btn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          const id = card.dataset.projectId;
          if (id) this.editProject(id);
        });
      }

      const deleteBtn = card.querySelector(".delete-project-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const id = card.dataset.projectId;
          if (id && confirm("هل تريد حذف هذا المشروع؟")) {
            this.deleteProject(id);
          }
        });
      }

      const toggleBtn = card.querySelector(".toggle-project-btn");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          const id = card.dataset.projectId;
          if (id) this.toggleProjectVisibility(id);
        });
      }
    });
  }

  renderProjectCard(project) {
    const statusColors = {
      Published: "#10b981",
      Draft: "#94a3b8",
      "In Progress": "#fbbf24",
      Completed: "#38bdf8",
      Archived: "#64748b",
    };

    const priorityIcons = {
      High: "🔴",
      Medium: "🟡",
      Low: "🟢",
    };

    return `
            <div class="project-card" data-project-id="${project.id}" style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;border:1px solid ${project.featured ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.06)"};">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <input type="checkbox" class="project-select" style="accent-color:#38bdf8;width:14px;height:14px;">
                        <span style="font-size:13px;font-weight:600;color:#fff;">${project.name}</span>
                        ${project.featured ? '<span style="font-size:9px;background:rgba(56,189,248,0.2);color:#38bdf8;padding:2px 6px;border-radius:4px;">⭐ مميز</span>' : ""}
                    </div>
                    <span style="font-size:10px;color:${statusColors[project.status] || "#94a3b8"};background:rgba(255,255,255,0.05);padding:2px 8px;border-radius:4px;">
                        ${project.status}
                    </span>
                </div>
                <div style="display:flex;gap:8px;font-size:11px;color:#94a3b8;flex-wrap:wrap;">
                    <span>${project.category}</span>
                    <span>•</span>
                    <span>${priorityIcons[project.priority] || "🟡"} ${project.priority}</span>
                    <span>•</span>
                    <span>${project.completion}% مكتمل</span>
                </div>
                <p style="font-size:11px;color:#cbd5e1;margin:6px 0;">${Utils.truncate(project.desc || "", 60)}</p>
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin:6px 0;">
                    ${(project.tech || "")
                      .split(",")
                      .slice(0, 3)
                      .map(
                        (t) =>
                          `<span style="font-size:9px;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;color:#94a3b8;">${t.trim()}</span>`,
                      )
                      .join("")}
                </div>
                <div style="width:100%;height:3px;background:rgba(255,255,255,0.1);border-radius:4px;margin:6px 0;overflow:hidden;">
                    <div style="width:${project.completion}%;height:100%;background:linear-gradient(90deg,#38bdf8,#6366f1);border-radius:4px;"></div>
                </div>
                <div style="display:flex;gap:4px;margin-top:6px;">
                    <button class="edit-project-btn" style="background:rgba(56,189,248,0.2);color:#38bdf8;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="toggle-project-btn" style="background:rgba(251,191,36,0.2);color:#fbbf24;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-${project.hidden ? "eye-slash" : "eye"}"></i>
                    </button>
                    <button class="delete-project-btn" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    ${
                      project.liveUrl
                        ? `<a href="${project.liveUrl}" target="_blank" style="background:rgba(16,185,129,0.2);color:#10b981;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;text-decoration:none;">
                        <i class="fa-solid fa-globe"></i>
                    </a>`
                        : ""
                    }
                </div>
            </div>
        `;
  }

  openModal(projectId = null) {
    const modal = document.getElementById("project-modal");
    if (!modal) return;

    const title = document.getElementById("project-modal-title");
    if (title) {
      title.innerHTML = projectId
        ? '<i class="fa-solid fa-edit" style="color:#38bdf8;"></i> تعديل المشروع'
        : '<i class="fa-solid fa-circle-plus" style="color:#38bdf8;"></i> إضافة مشروع جديد';
    }

    if (projectId) {
      const project = this.projects.find((p) => p.id === projectId);
      if (project) {
        Utils.setVal("edit-project-id", project.id);
        Utils.setVal("proj-name", project.name);
        Utils.setVal("proj-category", project.category);
        Utils.setVal("proj-status", project.status);
        Utils.setVal("proj-priority", project.priority);
        Utils.setVal("proj-completion", project.completion);
        Utils.setVal("proj-client", project.client || "");
        Utils.setVal("proj-start-date", project.startDate || "");
        Utils.setVal("proj-end-date", project.endDate || "");
        Utils.setVal("proj-tech", project.tech || "");
        Utils.setVal("proj-desc", project.desc || "");
        Utils.setVal("proj-full-desc", project.fullDesc || "");
        Utils.setVal("proj-thumbnail", project.thumbnail || "");
        Utils.setVal("proj-video-url", project.videoUrl || "");
        Utils.setVal("proj-gallery", project.gallery || "");
        Utils.setVal("proj-live-url", project.liveUrl || "");
        Utils.setVal("proj-github-url", project.githubUrl || "");
        Utils.setVal("proj-docs-url", project.docsUrl || "");
        Utils.setVal("proj-case-url", project.caseUrl || "");
        Utils.setVal("proj-meta-title", project.metaTitle || "");
        Utils.setVal("proj-slug", project.slug || "");
        Utils.setVal("proj-keywords", project.keywords || "");

        const featured = document.getElementById("proj-featured");
        if (featured) featured.checked = project.featured || false;

        const hidden = document.getElementById("proj-hidden");
        if (hidden) hidden.checked = project.hidden || false;
      }
    } else {
      document.getElementById("project-form")?.reset();
      Utils.setVal("edit-project-id", "");
      Utils.setVal("proj-completion", 100);
      Utils.setVal("proj-status", "Draft");
      Utils.setVal("proj-priority", "Medium");
    }

    modal.style.display = "flex";
    this.switchModalTab("tab-general");
    this.updateProjectPreview();
  }

  closeModal() {
    const modal = document.getElementById("project-modal");
    if (modal) modal.style.display = "none";
  }

  switchModalTab(tabId, activeBtn = null) {
    // إخفاء الكل
    document.querySelectorAll(".project-tab-content").forEach((el) => {
      el.style.display = "none";
    });

    // إظهار المطلوب
    const target = document.getElementById(tabId);
    if (target) target.style.display = "block";

    // تحديث الأزرار
    document.querySelectorAll("#project-modal .tab-btn").forEach((btn) => {
      btn.className = "saas-btn saas-btn-secondary tab-btn";
    });
    if (activeBtn) {
      activeBtn.className = "saas-btn saas-btn-primary tab-btn active-tab";
    } else {
      document.querySelectorAll("#project-modal .tab-btn").forEach((btn) => {
        if (btn.dataset.tab === tabId) {
          btn.className = "saas-btn saas-btn-primary tab-btn active-tab";
        }
      });
    }

    this.currentTab = tabId;
  }

  saveProject(e) {
    e.preventDefault();

    const id = Utils.getVal("edit-project-id");
    const data = {
      name: Utils.getVal("proj-name"),
      category: Utils.getVal("proj-category"),
      status: Utils.getVal("proj-status"),
      priority: Utils.getVal("proj-priority"),
      completion: parseInt(Utils.getVal("proj-completion")) || 0,
      client: Utils.getVal("proj-client"),
      startDate: Utils.getVal("proj-start-date"),
      endDate: Utils.getVal("proj-end-date"),
      tech: Utils.getVal("proj-tech"),
      desc: Utils.getVal("proj-desc"),
      fullDesc: Utils.getVal("proj-full-desc"),
      thumbnail: Utils.getVal("proj-thumbnail"),
      videoUrl: Utils.getVal("proj-video-url"),
      gallery: Utils.getVal("proj-gallery"),
      liveUrl: Utils.getVal("proj-live-url"),
      githubUrl: Utils.getVal("proj-github-url"),
      docsUrl: Utils.getVal("proj-docs-url"),
      caseUrl: Utils.getVal("proj-case-url"),
      metaTitle: Utils.getVal("proj-meta-title"),
      slug: Utils.getVal("proj-slug"),
      keywords: Utils.getVal("proj-keywords"),
      featured: document.getElementById("proj-featured")?.checked || false,
      hidden: document.getElementById("proj-hidden")?.checked || false,
    };

    if (!data.name) {
      Utils.toast("⚠️ اسم المشروع مطلوب", "warning");
      return;
    }

    if (id) {
      const index = this.projects.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.projects[index] = { ...this.projects[index], ...data };
        Utils.toast("✅ تم تحديث المشروع", "success");
      }
    } else {
      data.id = Utils.genId();
      this.projects.push(data);
      Utils.toast("✅ تم إضافة المشروع", "success");
    }

    this.closeModal();
    this.saveToStorage();
    this.renderProjects();
    this.updateStats();

    if (this.app.home) {
      this.app.home.addLog(`📁 ${id ? "تعديل" : "إضافة"} مشروع: ${data.name}`);
    }
  }

  editProject(id) {
    this.openModal(id);
  }

  deleteProject(id) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveToStorage();
    this.renderProjects();
    this.updateStats();
    Utils.toast("🗑️ تم حذف المشروع", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم حذف مشروع");
    }
  }

  toggleProjectVisibility(id) {
    const project = this.projects.find((p) => p.id === id);
    if (project) {
      project.hidden = !project.hidden;
      this.saveToStorage();
      this.renderProjects();
      this.updateStats();
      Utils.toast(
        project.hidden ? "👁️ تم إخفاء المشروع" : "👁️ تم إظهار المشروع",
        "info",
      );
    }
  }

  filterProjects() {
    const query = Utils.getVal("project-search-input").toLowerCase();
    const category = Utils.getVal("filter-project-category");
    const status = Utils.getVal("filter-project-status");
    const priority = Utils.getVal("filter-project-priority");
    const sort = Utils.getVal("sort-projects-select");

    let filtered = this.projects.filter((p) => !p.hidden);

    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.tech || "").toLowerCase().includes(query) ||
          (p.client || "").toLowerCase().includes(query) ||
          (p.desc || "").toLowerCase().includes(query),
      );
    }
    if (category) filtered = filtered.filter((p) => p.category === category);
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (priority) filtered = filtered.filter((p) => p.priority === priority);

    // ترتيب
    if (sort === "newest") {
      filtered.sort(
        (a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0),
      );
    } else if (sort === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0),
      );
    } else if (sort === "alpha") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      filtered.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sort === "completion") {
      filtered.sort((a, b) => b.completion - a.completion);
    }

    const container = document.getElementById("projects-grid-container");
    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:60px;color:#94a3b8;">
                        <i class="fa-solid fa-search" style="font-size:48px;color:#38bdf8;opacity:0.3;"></i>
                        <p style="margin-top:16px;">لا توجد مشاريع مطابقة للبحث</p>
                    </div>
                `;
      } else {
        container.innerHTML = filtered
          .map((p) => this.renderProjectCard(p))
          .join("");
      }
    }
  }

  updateStats() {
    const total = this.projects.length;
    const visible = this.projects.filter((p) => !p.hidden);
    const completed = this.projects.filter(
      (p) => p.status === "Completed" && !p.hidden,
    );
    const published = this.projects.filter(
      (p) => p.status === "Published" && !p.hidden,
    );
    const inProgress = this.projects.filter(
      (p) => p.status === "In Progress" && !p.hidden,
    );
    const featured = this.projects.filter((p) => p.featured && !p.hidden);
    const archived = this.projects.filter(
      (p) => p.status === "Archived" || p.hidden,
    );

    Utils.setText("stat-total-projects", total);
    Utils.setText("stat-visible-projects-trend", `${visible.length} مرئية`);
    Utils.setText("stat-completed-projects", completed.length);
    Utils.setText("stat-published-projects", published.length);
    Utils.setText("stat-progress-projects", inProgress.length);
    Utils.setText("stat-featured-projects", featured.length);
    Utils.setText("stat-archived-projects", archived.length);
    Utils.setText("stat-hidden-projects", `${archived.length} مخفية`);
  }

  updateProjectBulkBar() {
    const checked = document.querySelectorAll(".project-select:checked");
    const count = checked.length;
    const bar = document.getElementById("project-bulk-bar");
    const label = document.getElementById("project-selected-count");

    if (bar) {
      bar.style.display = count > 0 ? "flex" : "none";
    }
    if (label) {
      label.textContent = `تم تحديد ${count} مشروع`;
    }
  }

  bulkAction(action) {
    const checked = document.querySelectorAll(".project-select:checked");
    const ids = Array.from(checked)
      .map((el) => {
        const card = el.closest(".project-card");
        return card ? card.dataset.projectId : null;
      })
      .filter(Boolean);

    if (ids.length === 0) {
      Utils.toast("⚠️ لم يتم تحديد أي مشروع", "warning");
      return;
    }

    if (action === "delete" && !confirm(`هل تريد حذف ${ids.length} مشروع؟`)) {
      return;
    }

    ids.forEach((id) => {
      const project = this.projects.find((p) => p.id === id);
      if (project) {
        switch (action) {
          case "publish":
            project.status = "Published";
            break;
          case "unpublish":
            project.status = "Draft";
            break;
          case "feature":
            project.featured = !project.featured;
            break;
          case "archive":
            project.hidden = true;
            break;
          case "delete":
            this.projects = this.projects.filter((p) => p.id !== id);
            break;
        }
      }
    });

    this.saveToStorage();
    this.renderProjects();
    this.updateStats();
    this.updateProjectBulkBar();

    const messages = {
      publish: "📢 تم نشر المشاريع المحددة",
      unpublish: "👁️ تم إلغاء نشر المشاريع المحددة",
      feature: "⭐ تم تمييز المشاريع المحددة",
      archive: "📦 تم أرشفة المشاريع المحددة",
      delete: "🗑️ تم حذف المشاريع المحددة",
    };
    Utils.toast(messages[action] || "✅ تم التنفيذ", "success");

    if (this.app.home) {
      this.app.home.addLog(`📁 ${messages[action]}`);
    }
  }

  updateProjectPreview() {
    const name = Utils.getVal("proj-name") || "اسم المشروع";
    const category = Utils.getVal("proj-category") || "Web Apps";
    const status = Utils.getVal("proj-status") || "Draft";
    const desc = Utils.getVal("proj-desc") || "وصف موجز للمشروع...";
    const tech = Utils.getVal("proj-tech") || "";

    Utils.setText("prev-proj-title", name);
    Utils.setText("prev-proj-category", category);
    Utils.setText("prev-proj-badge", status);

    const descEl = document.getElementById("prev-proj-desc");
    if (descEl) descEl.textContent = desc || "وصف موجز للمشروع...";

    const techContainer = document.getElementById("prev-proj-tech");
    if (techContainer) {
      const techs = tech.split(",").filter((t) => t.trim());
      techContainer.innerHTML =
        techs.length > 0
          ? techs
              .slice(0, 3)
              .map((t) => `<span class="project-tech-badge">${t.trim()}</span>`)
              .join("")
          : '<span style="font-size:10px;color:#94a3b8;">لا توجد تقنيات</span>';
    }
  }

  updatePreviewDevice(device) {
    const wrapper = document.getElementById("preview-device-wrapper");
    const box = document.getElementById("live-preview-card-box");
    if (wrapper && box) {
      const widths = { desktop: "420px", tablet: "320px", mobile: "240px" };
      box.style.maxWidth = widths[device] || "420px";
      Utils.toast(
        `📱 جهاز: ${device === "desktop" ? "حاسوب" : device === "tablet" ? "تابلت" : "موبايل"}`,
        "info",
      );
    }
  }

  togglePreviewTheme() {
    const box = document.getElementById("live-preview-card-box");
    if (box) {
      const isLight =
        box.style.background === "#ffffff" || box.style.background === "white";
      box.style.background = isLight ? "rgba(18,24,43,0.95)" : "#ffffff";
      box.style.color = isLight ? "#fff" : "#000";

      const headings = box.querySelectorAll("h4");
      headings.forEach((el) => (el.style.color = isLight ? "#fff" : "#000"));

      const desc = box.querySelectorAll("p");
      desc.forEach((el) => (el.style.color = isLight ? "#cbd5e1" : "#475569"));

      Utils.toast(isLight ? "🌙 الوضع المظلم" : "☀️ الوضع الفاتح", "info");
    }
  }

  resetForm() {
    if (confirm("هل تريد إعادة تعيين النموذج؟")) {
      document.getElementById("project-form")?.reset();
      Utils.setVal("edit-project-id", "");
      Utils.setVal("proj-completion", 100);
      Utils.setVal("proj-status", "Draft");
      Utils.setVal("proj-priority", "Medium");
      this.updateProjectPreview();
      Utils.toast("🔄 تم إعادة تعيين النموذج", "info");
    }
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target.result;
        Utils.setVal("proj-thumbnail", url);
        Utils.toast("🖼️ تم رفع الصورة بنجاح", "success");
      };
      reader.readAsDataURL(file);
    }
  }

  exportProjects() {
    const data = this.projects.map((p) => ({
      name: p.name,
      category: p.category,
      status: p.status,
      priority: p.priority,
      completion: p.completion,
      client: p.client,
      tech: p.tech,
      desc: p.desc,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
    }));
    Utils.exportJSON(data, `projects-export-${Date.now()}.json`);
    Utils.toast("📥 تم تصدير المشاريع", "success");

    if (this.app.home) {
      this.app.home.addLog("📥 تم تصدير المشاريع");
    }
  }

  importProjects(e) {
    const file = e.target.files[0];
    if (!file) return;

    Utils.importJSON(file)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item) => {
            if (item.name) {
              item.id = Utils.genId();
              item.hidden = false;
              item.featured = item.featured || false;
              this.projects.push(item);
            }
          });
          this.saveToStorage();
          this.renderProjects();
          this.updateStats();
          Utils.toast(`📥 تم استيراد ${data.length} مشروع`, "success");

          if (this.app.home) {
            this.app.home.addLog(`📥 تم استيراد ${data.length} مشروع`);
          }
        }
      })
      .catch((err) => {
        Utils.toast("❌ خطأ في استيراد الملف", "error");
      });

    e.target.value = "";
  }

  saveToStorage() {
    Utils.storage.set("projects-data", this.projects);
  }
} // ============================================================
// 13. CERTIFICATES ENGINE (محرك قسم الشهادات)
// ============================================================
class CertificatesEngine {
  constructor(app) {
    this.app = app;
    this.certificates = [];
    this.selectedCerts = new Set();
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderCertificates();
    this.updateStats();
    console.log("📜 Certificates Engine ready");
  }

  setupEvents() {
    // إضافة شهادة
    const addBtn = document.getElementById("cert-add-new-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    // حفظ الكل
    const saveBtn = document.getElementById("cert-save-all-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveAll());
    }

    // إغلاق المودال
    const closeBtns = ["closeCertModalBtn", "closeCertModalBtn2"];
    closeBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => this.closeModal());
      }
    });

    // تصدير
    const exportBtn = document.getElementById("cert-export-json-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCertificates());
    }

    // استيراد
    const importBtn = document.getElementById("cert-import-json-btn");
    if (importBtn) {
      importBtn.addEventListener("click", () => {
        document.getElementById("cert-file-import-input")?.click();
      });
    }

    const importInput = document.getElementById("cert-file-import-input");
    if (importInput) {
      importInput.addEventListener("change", (e) => this.importCertificates(e));
    }

    // بحث
    const search = document.getElementById("certificates-search-input");
    if (search) {
      search.addEventListener("input", () => this.filterCertificates());
    }

    // فلترة
    const filters = [
      "cert-filter-category",
      "cert-filter-status",
      "cert-sort-by",
    ];
    filters.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => this.filterCertificates());
      }
    });

    // تحديد الكل
    const selectAll = document.getElementById("cert-select-all-checkbox");
    if (selectAll) {
      selectAll.addEventListener("change", () => this.toggleSelectAll());
    }

    // أزرار Bulk
    const bulkBtns = [
      "cert-bulk-publish-btn",
      "cert-bulk-hide-btn",
      "cert-bulk-archive-btn",
      "cert-bulk-delete-btn",
    ];
    bulkBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = id.replace("cert-bulk-", "").replace("-btn", "");
          this.bulkAction(action);
        });
      }
    });

    // حفظ النموذج
    const form = document.getElementById("certificate-form");
    if (form) {
      form.addEventListener("submit", (e) => this.saveCertificate(e));
    }
  }

  loadData() {
    const saved = Utils.storage.get("certificates-data", []);
    if (saved.length > 0) {
      this.certificates = saved;
    } else {
      // بيانات افتراضية
      this.certificates = [
        {
          id: Utils.genId(),
          title: "Introduction to Cybersecurity",
          provider: "Cisco Networking Academy",
          category: "Cybersecurity",
          issueDate: "2024-01-15",
          expirationDate: "2026-01-15",
          credentialId: "CSCO-2024-001",
          verificationUrl: "https://www.credly.com/badge/abc123",
          shortDesc: "دورة تأسيسية في مجال الأمن السيبراني",
          featured: true,
          published: true,
        },
        {
          id: Utils.genId(),
          title: "Advanced Frontend Development",
          provider: "Google Developers",
          category: "Frontend",
          issueDate: "2023-11-20",
          expirationDate: "2025-11-20",
          credentialId: "GD-2023-456",
          verificationUrl: "https://developers.google.com/certification/789",
          shortDesc: "تطوير واجهات المستخدم المتقدمة مع React و TypeScript",
          featured: true,
          published: true,
        },
        {
          id: Utils.genId(),
          title: "Machine Learning Fundamentals",
          provider: "Stanford University",
          category: "AI & Data",
          issueDate: "2023-08-10",
          expirationDate: "",
          credentialId: "STAN-2023-789",
          verificationUrl: "https://online.stanford.edu/cert/123",
          shortDesc: "أساسيات تعلم الآلة والذكاء الاصطناعي",
          featured: false,
          published: true,
        },
        {
          id: Utils.genId(),
          title: "Full Stack Web Development",
          provider: "FreeCodeCamp",
          category: "Frontend",
          issueDate: "2023-05-05",
          expirationDate: "",
          credentialId: "FCC-2023-321",
          verificationUrl: "https://freecodecamp.org/cert/456",
          shortDesc: "تطوير تطبيقات الويب من البداية إلى النهاية",
          featured: false,
          published: false,
        },
      ];
    }
  }

  renderCertificates() {
    const container = document.getElementById("certificates-grid-container");
    if (!container) return;

    const visible = this.certificates.filter((c) => c.published !== false);

    if (visible.length === 0) {
      container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">
                    <i class="fa-solid fa-award" style="font-size:48px;color:#38bdf8;opacity:0.3;"></i>
                    <p style="margin-top:12px;">لا توجد شهادات مضافة</p>
                    <button class="saas-btn saas-btn-primary" onclick="document.getElementById('cert-add-new-btn')?.click()" style="margin-top:12px;">
                        <i class="fa-solid fa-plus"></i> إضافة شهادة
                    </button>
                </div>
            `;
      return;
    }

    container.innerHTML = visible
      .map((cert) => this.renderCertificateCard(cert))
      .join("");

    // ربط الأحداث
    container.querySelectorAll(".certificate-card").forEach((card) => {
      const checkbox = card.querySelector(".cert-select");
      if (checkbox) {
        checkbox.addEventListener("change", () => this.updateBulkBar());
      }

      const editBtn = card.querySelector(".edit-cert-btn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          const id = card.dataset.certId;
          if (id) this.editCertificate(id);
        });
      }

      const deleteBtn = card.querySelector(".delete-cert-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const id = card.dataset.certId;
          if (id && confirm("هل تريد حذف هذه الشهادة؟")) {
            this.deleteCertificate(id);
          }
        });
      }

      const toggleBtn = card.querySelector(".toggle-cert-btn");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          const id = card.dataset.certId;
          if (id) this.toggleCertificateStatus(id);
        });
      }
    });
  }

  renderCertificateCard(cert) {
    const isExpired =
      cert.expirationDate && new Date(cert.expirationDate) < new Date();
    const isFeatured = cert.featured ? "⭐" : "";

    return `
            <div class="certificate-card" data-cert-id="${cert.id}" style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;border:1px solid ${cert.featured ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.06)"};">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:8px;flex:1;">
                        <input type="checkbox" class="cert-select" style="accent-color:#38bdf8;width:14px;height:14px;">
                        <div>
                            <span style="font-size:13px;font-weight:600;color:#fff;">${cert.title}</span>
                            <div style="font-size:10px;color:#94a3b8;">${cert.provider}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;align-items:center;">
                        <span style="font-size:9px;background:${cert.published ? "rgba(16,185,129,0.2)" : "rgba(148,163,184,0.2)"};color:${cert.published ? "#10b981" : "#94a3b8"};padding:2px 6px;border-radius:4px;">
                            ${cert.published ? "منشور" : "مسودة"}
                        </span>
                        ${isFeatured ? '<span style="font-size:9px;background:rgba(251,191,36,0.2);color:#fbbf24;padding:2px 6px;border-radius:4px;">⭐</span>' : ""}
                        ${isExpired ? '<span style="font-size:9px;background:rgba(239,68,68,0.2);color:#ef4444;padding:2px 6px;border-radius:4px;">منتهية</span>' : ""}
                    </div>
                </div>
                <div style="display:flex;gap:8px;font-size:10px;color:#94a3b8;flex-wrap:wrap;margin:4px 0;">
                    <span>${cert.category}</span>
                    <span>•</span>
                    <span>📅 ${Utils.formatDate(cert.issueDate)}</span>
                    ${cert.expirationDate ? `<span>• 🏁 ${Utils.formatDate(cert.expirationDate)}</span>` : ""}
                </div>
                <p style="font-size:11px;color:#cbd5e1;margin:4px 0;">${Utils.truncate(cert.shortDesc || "", 80)}</p>
                ${cert.credentialId ? `<div style="font-size:9px;color:#64748b;margin:2px 0;">🆔 ${cert.credentialId}</div>` : ""}
                <div style="display:flex;gap:4px;margin-top:8px;">
                    <button class="edit-cert-btn" style="background:rgba(56,189,248,0.2);color:#38bdf8;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="toggle-cert-btn" style="background:rgba(251,191,36,0.2);color:#fbbf24;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-${cert.published ? "eye" : "eye-slash"}"></i>
                    </button>
                    <button class="delete-cert-btn" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    ${
                      cert.verificationUrl
                        ? `<a href="${cert.verificationUrl}" target="_blank" style="background:rgba(16,185,129,0.2);color:#10b981;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;text-decoration:none;">
                        <i class="fa-solid fa-check-circle"></i>
                    </a>`
                        : ""
                    }
                </div>
            </div>
        `;
  }

  openModal(certId = null) {
    const modal = document.getElementById("certificate-modal-overlay");
    if (!modal) return;

    const title = document.getElementById("cert-modal-title");
    if (title) {
      title.innerHTML = certId
        ? '<i class="fa-solid fa-edit" style="color:#38bdf8;"></i> تعديل الشهادة'
        : '<i class="fa-solid fa-certificate" style="color:#38bdf8;"></i> إضافة شهادة جديدة';
    }

    if (certId) {
      const cert = this.certificates.find((c) => c.id === certId);
      if (cert) {
        Utils.setVal("cert-edit-id", cert.id);
        Utils.setVal("cert_title", cert.title);
        Utils.setVal("cert_provider", cert.provider);
        Utils.setVal("cert_category", cert.category);
        Utils.setVal("cert_issue_date", cert.issueDate || "");
        Utils.setVal("cert_expiration_date", cert.expirationDate || "");
        Utils.setVal("cert_credential_id", cert.credentialId || "");
        Utils.setVal("cert_verification_url", cert.verificationUrl || "");
        Utils.setVal("cert_short_desc", cert.shortDesc || "");

        const featured = document.getElementById("cert_is_featured");
        if (featured) featured.checked = cert.featured || false;

        const published = document.getElementById("cert_is_published");
        if (published) published.checked = cert.published !== false;
      }
    } else {
      document.getElementById("certificate-form")?.reset();
      Utils.setVal("cert-edit-id", "");
      const published = document.getElementById("cert_is_published");
      if (published) published.checked = true;
    }

    modal.style.display = "flex";
  }

  closeModal() {
    const modal = document.getElementById("certificate-modal-overlay");
    if (modal) modal.style.display = "none";
  }

  saveCertificate(e) {
    e.preventDefault();

    const id = Utils.getVal("cert-edit-id");
    const data = {
      title: Utils.getVal("cert_title"),
      provider: Utils.getVal("cert_provider"),
      category: Utils.getVal("cert_category"),
      issueDate: Utils.getVal("cert_issue_date"),
      expirationDate: Utils.getVal("cert_expiration_date"),
      credentialId: Utils.getVal("cert_credential_id"),
      verificationUrl: Utils.getVal("cert_verification_url"),
      shortDesc: Utils.getVal("cert_short_desc"),
      featured: document.getElementById("cert_is_featured")?.checked || false,
      published:
        document.getElementById("cert_is_published")?.checked !== false,
    };

    if (!data.title || !data.provider) {
      Utils.toast("⚠️ العنوان والجهة المانحة مطلوبان", "warning");
      return;
    }

    if (id) {
      const index = this.certificates.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.certificates[index] = { ...this.certificates[index], ...data };
        Utils.toast("✅ تم تحديث الشهادة", "success");
      }
    } else {
      data.id = Utils.genId();
      this.certificates.push(data);
      Utils.toast("✅ تم إضافة الشهادة", "success");
    }

    this.closeModal();
    this.saveToStorage();
    this.renderCertificates();
    this.updateStats();

    if (this.app.home) {
      this.app.home.addLog(`📜 ${id ? "تعديل" : "إضافة"} شهادة: ${data.title}`);
    }
  }

  editCertificate(id) {
    this.openModal(id);
  }

  deleteCertificate(id) {
    this.certificates = this.certificates.filter((c) => c.id !== id);
    this.saveToStorage();
    this.renderCertificates();
    this.updateStats();
    Utils.toast("🗑️ تم حذف الشهادة", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم حذف شهادة");
    }
  }

  toggleCertificateStatus(id) {
    const cert = this.certificates.find((c) => c.id === id);
    if (cert) {
      cert.published = !cert.published;
      this.saveToStorage();
      this.renderCertificates();
      this.updateStats();
      Utils.toast(
        cert.published ? "👁️ تم نشر الشهادة" : "👁️ تم إخفاء الشهادة",
        "info",
      );
    }
  }

  filterCertificates() {
    const query = Utils.getVal("certificates-search-input").toLowerCase();
    const category = Utils.getVal("cert-filter-category");
    const status = Utils.getVal("cert-filter-status");
    const sort = Utils.getVal("cert-sort-by");

    let filtered = this.certificates;

    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.provider.toLowerCase().includes(query) ||
          (c.credentialId || "").toLowerCase().includes(query),
      );
    }
    if (category !== "all") {
      filtered = filtered.filter((c) => c.category === category);
    }
    if (status !== "all") {
      if (status === "Published")
        filtered = filtered.filter((c) => c.published === true);
      else if (status === "Draft")
        filtered = filtered.filter((c) => c.published === false);
      else if (status === "Archived")
        filtered = filtered.filter((c) => c.hidden === true);
    }

    // ترتيب
    if (sort === "newest") {
      filtered.sort(
        (a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0),
      );
    } else if (sort === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.issueDate || 0) - new Date(b.issueDate || 0),
      );
    } else if (sort === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "featured") {
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    const container = document.getElementById("certificates-grid-container");
    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">
                        <i class="fa-solid fa-search" style="font-size:48px;color:#38bdf8;opacity:0.3;"></i>
                        <p style="margin-top:12px;">لا توجد شهادات مطابقة للبحث</p>
                    </div>
                `;
      } else {
        container.innerHTML = filtered
          .map((c) => this.renderCertificateCard(c))
          .join("");
      }
    }
  }

  updateStats() {
    const total = this.certificates.length;
    const featured = this.certificates.filter((c) => c.featured).length;
    const published = this.certificates.filter(
      (c) => c.published === true,
    ).length;
    const expired = this.certificates.filter(
      (c) => c.expirationDate && new Date(c.expirationDate) < new Date(),
    ).length;

    Utils.setText("stat-total-certs", total);
    Utils.setText("stat-featured-certs", featured);
    Utils.setText("stat-published-certs", published);
    Utils.setText("stat-expired-certs", expired);
  }

  toggleSelectAll() {
    const checked =
      document.getElementById("cert-select-all-checkbox")?.checked || false;
    document.querySelectorAll(".cert-select").forEach((el) => {
      el.checked = checked;
    });
    this.updateBulkBar();
  }

  updateBulkBar() {
    const checked = document.querySelectorAll(".cert-select:checked");
    const count = checked.length;
    const bar = document.getElementById("cert-bulk-actions-bar");
    const label = document.getElementById("cert-selected-count");

    if (bar) {
      bar.style.display = count > 0 ? "flex" : "none";
    }
    if (label) {
      label.textContent = `تم تحديد ${count} عناصر`;
    }
  }

  bulkAction(action) {
    const checked = document.querySelectorAll(".cert-select:checked");
    const ids = Array.from(checked)
      .map((el) => {
        const card = el.closest(".certificate-card");
        return card ? card.dataset.certId : null;
      })
      .filter(Boolean);

    if (ids.length === 0) {
      Utils.toast("⚠️ لم يتم تحديد أي عنصر", "warning");
      return;
    }

    if (action === "delete" && !confirm(`هل تريد حذف ${ids.length} شهادة؟`)) {
      return;
    }

    ids.forEach((id) => {
      const cert = this.certificates.find((c) => c.id === id);
      if (cert) {
        switch (action) {
          case "publish":
            cert.published = true;
            break;
          case "hide":
            cert.published = false;
            break;
          case "archive":
            cert.hidden = true;
            break;
          case "delete":
            this.certificates = this.certificates.filter((c) => c.id !== id);
            break;
        }
      }
    });

    this.saveToStorage();
    this.renderCertificates();
    this.updateStats();
    this.updateBulkBar();

    const messages = {
      publish: "📢 تم نشر الشهادات المحددة",
      hide: "👁️ تم إخفاء الشهادات المحددة",
      archive: "📦 تم أرشفة الشهادات المحددة",
      delete: "🗑️ تم حذف الشهادات المحددة",
    };
    Utils.toast(messages[action] || "✅ تم التنفيذ", "success");

    if (this.app.home) {
      this.app.home.addLog(`📜 ${messages[action]}`);
    }
  }

  exportCertificates() {
    const data = this.certificates.map((c) => ({
      title: c.title,
      provider: c.provider,
      category: c.category,
      issueDate: c.issueDate,
      expirationDate: c.expirationDate,
      credentialId: c.credentialId,
      verificationUrl: c.verificationUrl,
      shortDesc: c.shortDesc,
      featured: c.featured,
      published: c.published,
    }));
    Utils.exportJSON(data, `certificates-export-${Date.now()}.json`);
    Utils.toast("📥 تم تصدير الشهادات", "success");

    if (this.app.home) {
      this.app.home.addLog("📥 تم تصدير الشهادات");
    }
  }

  importCertificates(e) {
    const file = e.target.files[0];
    if (!file) return;

    Utils.importJSON(file)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item) => {
            if (item.title && item.provider) {
              item.id = Utils.genId();
              item.published = item.published !== false;
              item.featured = item.featured || false;
              this.certificates.push(item);
            }
          });
          this.saveToStorage();
          this.renderCertificates();
          this.updateStats();
          Utils.toast(`📥 تم استيراد ${data.length} شهادة`, "success");

          if (this.app.home) {
            this.app.home.addLog(`📥 تم استيراد ${data.length} شهادة`);
          }
        }
      })
      .catch((err) => {
        Utils.toast("❌ خطأ في استيراد الملف", "error");
      });

    e.target.value = "";
  }

  saveAll() {
    this.saveToStorage();
    Utils.toast("💾 تم حفظ جميع الشهادات", "success");

    if (this.app.home) {
      this.app.home.addLog("💾 تم حفظ جميع الشهادات");
    }
  }

  saveToStorage() {
    Utils.storage.set("certificates-data", this.certificates);
  }
}

// ============================================================
// 14. SUPPORT ENGINE (محرك خدمة العملاء)
// ============================================================
class SupportEngine {
  constructor(app) {
    this.app = app;
    this.tickets = [];
    this.activeTicketId = null;
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderTickets();
    console.log("🎧 Support Engine ready");
  }

  setupEvents() {
    const replyBtn = document.getElementById("sendReplyBtn");
    if (replyBtn) {
      replyBtn.addEventListener("click", () => this.sendReply());
    }

    const replyInput = document.getElementById("adminReplyInput");
    if (replyInput) {
      replyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendReply();
        }
      });
    }
  }

  loadData() {
    const saved = Utils.storage.get("support-tickets", []);
    if (saved.length > 0) {
      this.tickets = saved;
    } else {
      // بيانات افتراضية
      this.tickets = [
        {
          id: Utils.genId(),
          title: "مشكلة في تحميل الموقع",
          status: "open",
          priority: "high",
          customer: "Ahmed Mohamed",
          email: "ahmed@example.com",
          message: "الموقع لا يتم تحميله بشكل صحيح على متصفح Chrome",
          device: "Desktop",
          browser: "Chrome 120",
          ip: "192.168.1.1",
          location: "Cairo, Egypt",
          date: new Date(Date.now() - 3600000).toISOString(),
          replies: [],
        },
        {
          id: Utils.genId(),
          title: "استفسار عن الأسعار",
          status: "open",
          priority: "medium",
          customer: "Sara Ali",
          email: "sara@example.com",
          message: "أود معرفة تفاصيل الأسعار للخدمات المقدمة",
          device: "Mobile",
          browser: "Safari 17",
          ip: "192.168.1.2",
          location: "Alexandria, Egypt",
          date: new Date(Date.now() - 7200000).toISOString(),
          replies: [],
        },
        {
          id: Utils.genId(),
          title: "طلب تعديل في المشروع",
          status: "open",
          priority: "low",
          customer: "Khaled Hassan",
          email: "khaled@example.com",
          message: "أريد إضافة بعض التعديلات على المشروع المطلوب",
          device: "Desktop",
          browser: "Firefox 121",
          ip: "192.168.1.3",
          location: "Giza, Egypt",
          date: new Date(Date.now() - 10800000).toISOString(),
          replies: [],
        },
        {
          id: Utils.genId(),
          title: "شكراً على الخدمة الممتازة",
          status: "closed",
          priority: "low",
          customer: "Mona Ibrahim",
          email: "mona@example.com",
          message: "أود أن أشكركم على الخدمة الممتازة والدعم السريع",
          device: "Mobile",
          browser: "Chrome 120",
          ip: "192.168.1.4",
          location: "Dubai, UAE",
          date: new Date(Date.now() - 86400000).toISOString(),
          replies: [],
        },
      ];
    }
  }

  renderTickets() {
    const sidebar = document.getElementById("supportTicketsSidebar");
    if (!sidebar) return;

    const openTickets = this.tickets.filter((t) => t.status === "open");

    if (openTickets.length === 0) {
      sidebar.innerHTML = `
                <div style="text-align:center;padding:20px;color:#94a3b8;">
                    <i class="fa-solid fa-ticket" style="font-size:24px;color:#f472b6;opacity:0.3;"></i>
                    <p style="font-size:12px;margin-top:8px;">لا توجد تذاكر مفتوحة</p>
                </div>
            `;
      return;
    }

    sidebar.innerHTML = openTickets
      .map(
        (ticket) => `
            <div class="ticket-item" data-ticket-id="${ticket.id}" style="padding:12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;${this.activeTicketId === ticket.id ? "background:rgba(168,85,247,0.1);border-radius:8px;" : ""}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:12px;color:#fff;font-weight:500;">${Utils.truncate(ticket.title, 30)}</span>
                    <span style="font-size:9px;background:${ticket.priority === "high" ? "rgba(239,68,68,0.2)" : ticket.priority === "medium" ? "rgba(251,191,36,0.2)" : "rgba(16,185,129,0.2)"};color:${ticket.priority === "high" ? "#ef4444" : ticket.priority === "medium" ? "#fbbf24" : "#10b981"};padding:2px 6px;border-radius:4px;">
                        ${ticket.priority === "high" ? "عاجل" : ticket.priority === "medium" ? "متوسط" : "عادي"}
                    </span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;margin-top:4px;">
                    <span>${ticket.customer}</span>
                    <span>${Utils.formatTime(ticket.date)}</span>
                </div>
                <div style="display:flex;gap:4px;margin-top:4px;">
                    <span style="font-size:8px;background:rgba(244,114,182,0.15);color:#f472b6;padding:1px 6px;border-radius:4px;">${ticket.device}</span>
                    <span style="font-size:8px;background:rgba(56,189,248,0.15);color:#38bdf8;padding:1px 6px;border-radius:4px;">${ticket.browser}</span>
                </div>
            </div>
        `,
      )
      .join("");

    // ربط الأحداث
    sidebar.querySelectorAll(".ticket-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.ticketId;
        if (id) this.selectTicket(id);
      });
    });

    // اختيار أول تذكرة
    if (openTickets.length > 0 && !this.activeTicketId) {
      this.selectTicket(openTickets[0].id);
    }
  }

  selectTicket(id) {
    this.activeTicketId = id;
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) return;

    // تحديث العنوان
    Utils.setText("activeTicketTitle", ticket.title);
    Utils.setText(
      "activeTicketStatus",
      ticket.status === "open" ? "مفتوحة 🔵" : "مغلقة ⚪",
    );

    // تحديث المحتوى
    const body = document.getElementById("activeTicketMessages");
    if (body) {
      let html = `
                <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:6px;">
                        <span>👤 ${ticket.customer} <span style="color:#64748b;">(${ticket.email})</span></span>
                        <span>📅 ${Utils.formatDateTime(ticket.date)}</span>
                    </div>
                    <p style="font-size:12px;color:#cbd5e1;margin:8px 0;">${ticket.message}</p>
                    <div style="display:flex;gap:8px;font-size:10px;color:#64748b;">
                        <span>💻 ${ticket.device}</span>
                        <span>🌐 ${ticket.browser}</span>
                        <span>📍 ${ticket.location}</span>
                        <span>🆔 ${ticket.ip}</span>
                    </div>
                </div>
            `;

      // عرض الردود
      if (ticket.replies && ticket.replies.length > 0) {
        html += ticket.replies
          .map(
            (reply) => `
                    <div style="padding:12px;background:rgba(168,85,247,0.08);border-radius:8px;margin-bottom:8px;border-right:3px solid #a855f7;">
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;">
                            <span>👤 Admin</span>
                            <span>${Utils.formatTime(reply.date)}</span>
                        </div>
                        <p style="font-size:12px;color:#cbd5e1;margin:4px 0;">${reply.message}</p>
                    </div>
                `,
          )
          .join("");
      }

      body.innerHTML = html;
    }

    // تفعيل الرد
    const replyInput = document.getElementById("adminReplyInput");
    const replyBtn = document.getElementById("sendReplyBtn");
    if (replyInput && replyBtn) {
      replyInput.disabled = false;
      replyBtn.disabled = false;
      replyInput.placeholder = "اكتب ردك للعميل...";
      replyInput.value = "";
    }

    // تحديث التحديد
    this.renderTickets();
  }

  sendReply() {
    const input = document.getElementById("adminReplyInput");
    if (!input || !input.value.trim()) {
      Utils.toast("⚠️ الرجاء كتابة الرد", "warning");
      return;
    }

    const ticket = this.tickets.find((t) => t.id === this.activeTicketId);
    if (!ticket) {
      Utils.toast("❌ لم يتم العثور على التذكرة", "error");
      return;
    }

    const reply = {
      id: Utils.genId(),
      message: input.value.trim(),
      date: new Date().toISOString(),
    };

    if (!ticket.replies) ticket.replies = [];
    ticket.replies.push(reply);

    this.saveToStorage();
    this.selectTicket(this.activeTicketId);
    input.value = "";

    Utils.toast("✅ تم إرسال الرد", "success");

    if (this.app.home) {
      this.app.home.addLog(`💬 رد على تذكرة: ${ticket.title}`);
    }
  }

  saveToStorage() {
    Utils.storage.set("support-tickets", this.tickets);
  }
}

// ============================================================
// 15. DONATIONS ENGINE (محرك التبرعات)
// ============================================================
class DonationsEngine {
  constructor(app) {
    this.app = app;
    this.donations = [];
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderDonations();
    this.updateStats();
    console.log("💝 Donations Engine ready");
  }

  setupEvents() {
    // إضافة حملة
    const addBtn = document.getElementById("donation-add-new-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    // حفظ الكل
    const saveBtn = document.getElementById("donation-save-all-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveAll());
    }

    // إغلاق المودال
    const closeBtns = ["closeDonationModalBtn", "closeDonationModalBtn2"];
    closeBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => this.closeModal());
      }
    });

    // حفظ النموذج
    const form = document.getElementById("donation-form");
    if (form) {
      form.addEventListener("submit", (e) => this.saveDonation(e));
    }
  }

  loadData() {
    const saved = Utils.storage.get("donations-data", []);
    if (saved.length > 0) {
      this.donations = saved;
    } else {
      // بيانات افتراضية
      this.donations = [
        {
          id: Utils.genId(),
          title: "تطوير سيرفرات الموقع",
          method: "PayPal",
          target: 1000,
          raised: 450,
          accountInfo: "paypal.me/username",
          date: new Date().toISOString(),
        },
        {
          id: Utils.genId(),
          title: "تحسين تجربة المستخدم",
          method: "Vodafone Cash",
          target: 500,
          raised: 320,
          accountInfo: "01001234567",
          date: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }
  }

  renderDonations() {
    const container = document.getElementById("donations-grid-container");
    if (!container) return;

    if (this.donations.length === 0) {
      container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">
                    <i class="fa-solid fa-hand-holding-dollar" style="font-size:48px;color:#10b981;opacity:0.3;"></i>
                    <p style="margin-top:12px;">لا توجد حملات تبرع</p>
                    <button class="saas-btn saas-btn-primary" onclick="document.getElementById('donation-add-new-btn')?.click()" style="margin-top:12px;background:#10b981;">
                        <i class="fa-solid fa-plus"></i> إضافة حملة
                    </button>
                </div>
            `;
      return;
    }

    container.innerHTML = this.donations
      .map((d) => {
        const progress = Math.round((d.raised / d.target) * 100);
        return `
                <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;border:1px solid rgba(16,185,129,0.15);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <h4 style="font-size:13px;color:#fff;margin:0;">${d.title}</h4>
                            <span style="font-size:10px;color:#94a3b8;">${d.method}</span>
                        </div>
                        <span style="font-size:11px;background:rgba(16,185,129,0.15);color:#10b981;padding:2px 8px;border-radius:4px;">
                            ${progress}%
                        </span>
                    </div>
                    <div style="margin:8px 0;">
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:#cbd5e1;">
                            <span>تم جمع: $${d.raised}</span>
                            <span>المستهدف: $${d.target}</span>
                        </div>
                        <div style="width:100%;height:4px;background:rgba(255,255,255,0.1);border-radius:4px;margin-top:4px;overflow:hidden;">
                            <div style="width:${Math.min(progress, 100)}%;height:100%;background:linear-gradient(90deg,#10b981,#34d399);border-radius:4px;"></div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;">
                        <span>💳 ${d.accountInfo}</span>
                        <span>${Utils.formatDate(d.date)}</span>
                    </div>
                    <div style="display:flex;gap:4px;margin-top:8px;">
                        <button class="edit-donation-btn" style="background:rgba(16,185,129,0.2);color:#10b981;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="delete-donation-btn" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
      })
      .join("");

    // ربط الأحداث
    container.querySelectorAll(".edit-donation-btn").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const donation = this.donations[index];
        if (donation) this.openModal(donation.id);
      });
    });

    container.querySelectorAll(".delete-donation-btn").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const donation = this.donations[index];
        if (donation && confirm("هل تريد حذف هذه الحملة؟")) {
          this.deleteDonation(donation.id);
        }
      });
    });
  }

  openModal(donationId = null) {
    const modal = document.getElementById("donation-modal-overlay");
    if (!modal) return;

    const title = document.getElementById("donation-modal-title");
    if (title) {
      title.innerHTML = donationId
        ? '<i class="fa-solid fa-edit" style="color:#10b981;"></i> تعديل حملة تبرع'
        : '<i class="fa-solid fa-hand-holding-dollar" style="color:#10b981;"></i> إضافة حملة تبرع';
    }

    if (donationId) {
      const donation = this.donations.find((d) => d.id === donationId);
      if (donation) {
        Utils.setVal("donation_edit_id", donation.id);
        Utils.setVal("donation_title", donation.title);
        Utils.setVal("donation_method", donation.method);
        Utils.setVal("donation_target", donation.target);
        Utils.setVal("donation_raised", donation.raised);
        Utils.setVal("donation_account_info", donation.accountInfo);
      }
    } else {
      document.getElementById("donation-form")?.reset();
      Utils.setVal("donation_edit_id", "");
      Utils.setVal("donation_target", 500);
      Utils.setVal("donation_raised", 0);
    }

    modal.style.display = "flex";
  }

  closeModal() {
    const modal = document.getElementById("donation-modal-overlay");
    if (modal) modal.style.display = "none";
  }

  saveDonation(e) {
    e.preventDefault();

    const id = Utils.getVal("donation_edit_id");
    const data = {
      title: Utils.getVal("donation_title"),
      method: Utils.getVal("donation_method"),
      target: parseFloat(Utils.getVal("donation_target")) || 0,
      raised: parseFloat(Utils.getVal("donation_raised")) || 0,
      accountInfo: Utils.getVal("donation_account_info"),
    };

    if (!data.title) {
      Utils.toast("⚠️ عنوان الحملة مطلوب", "warning");
      return;
    }

    if (id) {
      const index = this.donations.findIndex((d) => d.id === id);
      if (index !== -1) {
        this.donations[index] = { ...this.donations[index], ...data };
        Utils.toast("✅ تم تحديث الحملة", "success");
      }
    } else {
      data.id = Utils.genId();
      data.date = new Date().toISOString();
      this.donations.push(data);
      Utils.toast("✅ تم إضافة الحملة", "success");
    }

    this.closeModal();
    this.saveToStorage();
    this.renderDonations();
    this.updateStats();

    if (this.app.home) {
      this.app.home.addLog(
        `💝 ${id ? "تعديل" : "إضافة"} حملة تبرع: ${data.title}`,
      );
    }
  }

  deleteDonation(id) {
    this.donations = this.donations.filter((d) => d.id !== id);
    this.saveToStorage();
    this.renderDonations();
    this.updateStats();
    Utils.toast("🗑️ تم حذف الحملة", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم حذف حملة تبرع");
    }
  }

  updateStats() {
    const totalRaised = this.donations.reduce((sum, d) => sum + d.raised, 0);
    const totalGoal = this.donations.reduce((sum, d) => sum + d.target, 0);
    const donors = this.donations.reduce(
      (sum, d) => sum + Math.floor(d.raised / 10),
      0,
    );

    Utils.setText("stat-total-raised", `$${totalRaised}`);
    Utils.setText("stat-total-goal", `$${totalGoal}`);
    Utils.setText("stat-donor-count", donors);
  }

  saveAll() {
    this.saveToStorage();
    Utils.toast("💾 تم حفظ جميع حملات التبرع", "success");

    if (this.app.home) {
      this.app.home.addLog("💾 تم حفظ جميع حملات التبرع");
    }
  }

  saveToStorage() {
    Utils.storage.set("donations-data", this.donations);
  }
}

// ============================================================
// 16. SOCIAL ENGINE (محرك السوشيال)
// ============================================================
class SocialEngine {
  constructor(app) {
    this.app = app;
    this.socialLinks = [];
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderSocialLinks();
    console.log("📱 Social Engine ready");
  }

  setupEvents() {
    const form = document.getElementById("socialForm");
    if (form) {
      form.addEventListener("submit", (e) => this.addSocialLink(e));
    }

    const clearBtn = document.getElementById("clearSocialBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("هل تريد تفريغ جميع روابط السوشيال؟")) {
          this.clearAll();
        }
      });
    }
  }

  loadData() {
    const saved = Utils.storage.get("social-links", []);
    if (saved.length > 0) {
      this.socialLinks = saved;
    } else {
      // بيانات افتراضية
      this.socialLinks = [
        {
          id: Utils.genId(),
          platform: "GitHub",
          link: "https://github.com/username",
          followers: 2500,
        },
        {
          id: Utils.genId(),
          platform: "LinkedIn",
          link: "https://linkedin.com/in/username",
          followers: 1800,
        },
        {
          id: Utils.genId(),
          platform: "Instagram",
          link: "https://instagram.com/username",
          followers: 1200,
        },
        {
          id: Utils.genId(),
          platform: "Twitter/X",
          link: "https://twitter.com/username",
          followers: 800,
        },
      ];
    }
  }

  renderSocialLinks() {
    const grid = document.getElementById("social_linksGrid");
    if (!grid) return;

    if (this.socialLinks.length === 0) {
      grid.innerHTML = `
                <div style="text-align:center;padding:20px;color:#94a3b8;">
                    <p style="font-size:12px;">لا توجد روابط سوشيال مضافة</p>
                </div>
            `;
      return;
    }

    const totalFollowers = this.socialLinks.reduce(
      (sum, s) => sum + s.followers,
      0,
    );

    grid.innerHTML = this.socialLinks
      .map(
        (link) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div>
                    <span style="font-size:13px;color:#fff;font-weight:500;">${link.platform}</span>
                    <a href="${link.link}" target="_blank" style="font-size:10px;color:#38bdf8;text-decoration:none;display:block;">${link.link}</a>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:12px;color:#94a3b8;">👥 ${link.followers.toLocaleString()}</span>
                    <button class="delete-social-btn" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `,
      )
      .join("");

    // عرض المجموع
    grid.innerHTML += `
            <div style="padding:12px;background:rgba(56,189,248,0.08);border-radius:8px;margin-top:8px;text-align:center;">
                <span style="font-size:12px;color:#38bdf8;">إجمالي المتابعين: ${totalFollowers.toLocaleString()} 👥</span>
            </div>
        `;

    // ربط الأحداث
    grid.querySelectorAll(".delete-social-btn").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const link = this.socialLinks[index];
        if (link && confirm(`هل تريد حذف ${link.platform}؟`)) {
          this.deleteSocialLink(link.id);
        }
      });
    });
  }

  addSocialLink(e) {
    e.preventDefault();

    const platform = document.getElementById("socialPlatform")?.value.trim();
    const link = document.getElementById("socialLink")?.value.trim();
    const followers =
      parseInt(document.getElementById("socialFollowers")?.value) || 0;

    if (!platform || !link) {
      Utils.toast("⚠️ جميع الحقول مطلوبة", "warning");
      return;
    }

    const newLink = {
      id: Utils.genId(),
      platform,
      link,
      followers,
    };

    this.socialLinks.push(newLink);
    this.saveToStorage();
    this.renderSocialLinks();

    // إعادة تعيين النموذج
    document.getElementById("socialForm")?.reset();
    Utils.toast(`✅ تم إضافة ${platform}`, "success");

    if (this.app.home) {
      this.app.home.addLog(`📱 إضافة منصة سوشيال: ${platform}`);
    }
  }

  deleteSocialLink(id) {
    this.socialLinks = this.socialLinks.filter((s) => s.id !== id);
    this.saveToStorage();
    this.renderSocialLinks();
    Utils.toast("🗑️ تم حذف الرابط", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم حذف رابط سوشيال");
    }
  }

  clearAll() {
    this.socialLinks = [];
    this.saveToStorage();
    this.renderSocialLinks();
    Utils.toast("🗑️ تم تفريغ جميع الروابط", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم تفريغ جميع روابط السوشيال");
    }
  }

  saveToStorage() {
    Utils.storage.set("social-links", this.socialLinks);
  }
} // ============================================================
// 17. MESSAGES ENGINE (محرك رسائل الزوار)
// ============================================================
class MessagesEngine {
  constructor(app) {
    this.app = app;
    this.messages = [];
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderMessages();
    console.log("✉️ Messages Engine ready");
  }

  setupEvents() {
    const clearBtn = document.getElementById("clearMessagesBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("هل تريد تفريغ جميع الرسائل؟")) {
          this.clearAll();
        }
      });
    }
  }

  loadData() {
    const saved = Utils.storage.get("messages-data", []);
    if (saved.length > 0) {
      this.messages = saved;
    } else {
      // بيانات افتراضية
      this.messages = [
        {
          id: Utils.genId(),
          name: "Ahmed Hassan",
          email: "ahmed@example.com",
          subject: "استفسار عن المشاريع",
          message: "أود معرفة المزيد عن مشاريعك السابقة في مجال تطوير الويب",
          date: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          replied: false,
        },
        {
          id: Utils.genId(),
          name: "Sara Mahmoud",
          email: "sara@example.com",
          subject: "طلب تعاون",
          message: "نحن شركة ناشئة ونبحث عن مطور ويب للانضمام لفريقنا",
          date: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          replied: false,
        },
        {
          id: Utils.genId(),
          name: "Khaled Ali",
          email: "khaled@example.com",
          subject: "شكر وتقدير",
          message: "شكراً لك على المحتوى القيم والمفيد في موقعك",
          date: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          replied: false,
        },
        {
          id: Utils.genId(),
          name: "Mona Ibrahim",
          email: "mona@example.com",
          subject: "اقتراح تطوير",
          message: "أقترح إضافة قسم للمدونة في الموقع لمشاركة الخبرات",
          date: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          replied: true,
        },
      ];
    }
  }

  renderMessages() {
    const grid = document.getElementById("messagesGrid");
    if (!grid) return;

    if (this.messages.length === 0) {
      grid.innerHTML = `
                <div style="text-align:center;padding:40px;color:#94a3b8;">
                    <i class="fa-solid fa-inbox" style="font-size:48px;color:#fb7185;opacity:0.3;"></i>
                    <p style="margin-top:12px;">لا توجد رسائل واردة</p>
                </div>
            `;
      return;
    }

    const unreadCount = this.messages.filter((m) => !m.read).length;

    grid.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(251,113,133,0.08);border-radius:8px;margin-bottom:12px;">
                <span style="font-size:12px;color:#fb7185;">
                    <i class="fa-solid fa-circle" style="font-size:8px;"></i>
                    ${unreadCount} رسائل غير مقروءة
                </span>
                <span style="font-size:11px;color:#94a3b8;">إجمالي: ${this.messages.length}</span>
            </div>
            ${this.messages.map((msg) => this.renderMessageItem(msg)).join("")}
        `;

    // ربط الأحداث
    grid.querySelectorAll(".message-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.messageId;
        if (id) this.toggleRead(id);
      });
    });

    grid.querySelectorAll(".delete-message-btn").forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const msg = this.messages[index];
        if (msg && confirm("هل تريد حذف هذه الرسالة؟")) {
          this.deleteMessage(msg.id);
        }
      });
    });
  }

  renderMessageItem(msg) {
    return `
            <div class="message-item" data-message-id="${msg.id}" style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;${!msg.read ? "background:rgba(251,113,133,0.05);border-right:3px solid #fb7185;" : ""}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:13px;font-weight:600;color:#fff;">${msg.name}</span>
                            ${!msg.read ? '<span style="font-size:8px;background:#fb7185;color:#fff;padding:1px 6px;border-radius:4px;">جديد</span>' : ""}
                            ${msg.replied ? '<span style="font-size:8px;background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;">تم الرد</span>' : ""}
                        </div>
                        <span style="font-size:11px;color:#94a3b8;">${msg.email}</span>
                        <div style="font-size:12px;color:#cbd5e1;margin-top:2px;">
                            <strong>${msg.subject}</strong>
                        </div>
                        <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">${Utils.truncate(msg.message, 80)}</p>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:80px;">
                        <span style="font-size:9px;color:#64748b;">${Utils.formatTime(msg.date)}</span>
                        <span style="font-size:9px;color:#64748b;">${Utils.formatDate(msg.date)}</span>
                        <button class="delete-message-btn" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  toggleRead(id) {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) {
      msg.read = !msg.read;
      this.saveToStorage();
      this.renderMessages();
      Utils.toast(
        msg.read
          ? "👁️ تم تحديد الرسالة كمقروءة"
          : "👁️ تم تحديد الرسالة كغير مقروءة",
        "info",
      );
    }
  }

  deleteMessage(id) {
    this.messages = this.messages.filter((m) => m.id !== id);
    this.saveToStorage();
    this.renderMessages();
    Utils.toast("🗑️ تم حذف الرسالة", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم حذف رسالة زائر");
    }
  }

  clearAll() {
    this.messages = [];
    this.saveToStorage();
    this.renderMessages();
    Utils.toast("🗑️ تم تفريغ جميع الرسائل", "info");

    if (this.app.home) {
      this.app.home.addLog("🗑️ تم تفريغ جميع رسائل الزوار");
    }
  }

  saveToStorage() {
    Utils.storage.set("messages-data", this.messages);
  }
}

// ============================================================
// 18. LOGS ENGINE (محرك سجل النشاطات)
// ============================================================
class LogsEngine {
  constructor(app) {
    this.app = app;
    this.logs = [];
    this.init();
  }

  init() {
    this.setupEvents();
    this.loadData();
    this.renderLogs();
    console.log("📋 Logs Engine ready");
  }

  setupEvents() {
    const clearBtn = document.getElementById("clearLogsBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("هل تريد مسح جميع السجلات؟")) {
          this.clearAll();
        }
      });
    }
  }

  loadData() {
    const saved = Utils.storage.get("logs-data", []);
    if (saved.length > 0) {
      this.logs = saved;
    } else {
      // بيانات افتراضية
      this.logs = [
        {
          id: Utils.genId(),
          message: "🚀 تم تشغيل لوحة التحكم",
          type: "info",
          date: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: Utils.genId(),
          message: "📊 تم تحديث بيانات الرئيسية",
          type: "success",
          date: new Date(Date.now() - 600000).toISOString(),
        },
        {
          id: Utils.genId(),
          message: "📝 تم حفظ مسودة الهيرو",
          type: "info",
          date: new Date(Date.now() - 900000).toISOString(),
        },
        {
          id: Utils.genId(),
          message: "✅ تم إضافة مهارة جديدة: React.js",
          type: "success",
          date: new Date(Date.now() - 1200000).toISOString(),
        },
        {
          id: Utils.genId(),
          message: "⚠️ محاولة تسجيل دخول فاشلة من IP غير معروف",
          type: "warning",
          date: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: Utils.genId(),
          message: "📁 تم حذف مشروع: E-Commerce Platform",
          type: "error",
          date: new Date(Date.now() - 2400000).toISOString(),
        },
        {
          id: Utils.genId(),
          message: "🚀 تم نشر التغييرات على الموقع",
          type: "success",
          date: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: Utils.genId(),
          message: "💾 تم إنشاء نسخة احتياطية للقاعدة",
          type: "info",
          date: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
    }
  }

  renderLogs() {
    const grid = document.getElementById("logsGrid");
    if (!grid) return;

    if (this.logs.length === 0) {
      grid.innerHTML = `
                <div style="text-align:center;padding:40px;color:#94a3b8;">
                    <i class="fa-solid fa-clock-rotate-left" style="font-size:48px;color:#facc15;opacity:0.3;"></i>
                    <p style="margin-top:12px;">لا توجد سجلات نشاط</p>
                </div>
            `;
      return;
    }

    const typeColors = {
      info: "#38bdf8",
      success: "#10b981",
      warning: "#fbbf24",
      error: "#ef4444",
    };

    const typeIcons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };

    grid.innerHTML = this.logs
      .slice(0, 50)
      .map(
        (log) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04);">
                <div style="display:flex;align-items:center;gap:10px;flex:1;">
                    <span style="font-size:14px;">${typeIcons[log.type] || "📋"}</span>
                    <span style="font-size:12px;color:#cbd5e1;">${log.message}</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px;min-width:150px;justify-content:flex-end;">
                    <span style="font-size:9px;background:${typeColors[log.type] || "#94a3b8"}22;color:${typeColors[log.type] || "#94a3b8"};padding:2px 8px;border-radius:4px;">
                        ${log.type || "info"}
                    </span>
                    <span style="font-size:10px;color:#64748b;">${Utils.formatTime(log.date)}</span>
                    <span style="font-size:9px;color:#64748b;">${Utils.formatDate(log.date)}</span>
                </div>
            </div>
        `,
      )
      .join("");

    // إضافة عداد
    if (this.logs.length > 50) {
      grid.innerHTML += `
                <div style="text-align:center;padding:12px;color:#64748b;font-size:11px;">
                    + ${this.logs.length - 50} سجل إضافي
                </div>
            `;
    }
  }

  addLog(message, type = "info") {
    const log = {
      id: Utils.genId(),
      message,
      type,
      date: new Date().toISOString(),
    };

    this.logs.unshift(log);

    // الحد الأقصى للسجلات
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    this.saveToStorage();
    this.renderLogs();
  }

  clearAll() {
    this.logs = [];
    this.saveToStorage();
    this.renderLogs();
    Utils.toast("🗑️ تم مسح جميع السجلات", "info");

    // إضافة سجل جديد
    this.addLog("🗑️ تم مسح جميع السجلات", "info");
  }

  saveToStorage() {
    Utils.storage.set("logs-data", this.logs);
  }
}

// ============================================================
// 19. PREVIEW ENGINE (محرك المعاينة الحية)
// ============================================================
class PreviewEngine {
  constructor(app) {
    this.app = app;
    this.previewMode = false;
    this.previewDevice = "desktop";
    this.init();
  }

  init() {
    this.setupEvents();
    console.log("👁️ Preview Engine ready");
  }

  setupEvents() {
    // زر معاينة الموقع (في السايد بار)
    const previewBtn = document.querySelector(".preview-btn");
    if (previewBtn) {
      previewBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openLivePreview();
      });
    }

    // أزرار المعاينة السريعة في الرئيسية
    const quickPreviewBtn = document.getElementById("quickPreviewBtn");
    if (quickPreviewBtn) {
      quickPreviewBtn.addEventListener("click", () => this.openLivePreview());
    }

    // أزرار فتح الموقع
    const openSiteBtns = [
      document.getElementById("btn-open-website"),
      document.getElementById("quickOpenSiteBtn"),
      document.getElementById("hero-open-website-btn"),
    ];

    openSiteBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          window.open("../index.html", "_blank");
        });
      }
    });

    // زر معاينة الموقع (Preview)
    const previewSiteBtn = document.getElementById("btn-preview-website");
    if (previewSiteBtn) {
      previewSiteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openLivePreview();
      });
    }
  }

  openLivePreview() {
    // فتح الموقع في تبويب جديد
    const previewWindow = window.open("../index.html", "_blank");

    if (previewWindow) {
      Utils.toast("👁️ فتح المعاينة الحية", "success");

      if (this.app.home) {
        this.app.home.addLog("👁️ تم فتح المعاينة الحية");
      }
    } else {
      // لو منعته الحماية
      Utils.toast("⚠️ الرجاء السماح بالنوافذ المنبثقة", "warning");
      window.location.href = "../index.html";
    }
  }

  openPreviewInFrame() {
    // معاينة داخل إطار (للاستخدام المستقبلي)
    const frame = document.createElement("iframe");
    frame.src = "../index.html";
    frame.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;border:none;background:#fff;";

    // إضافة زر إغلاق
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.style.cssText =
      "position:fixed;top:10px;right:10px;z-index:10000;background:#ef4444;color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);";
    closeBtn.addEventListener("click", () => {
      frame.remove();
      closeBtn.remove();
      Utils.toast("👁️ تم إغلاق المعاينة", "info");
    });

    document.body.appendChild(frame);
    document.body.appendChild(closeBtn);

    Utils.toast("👁️ فتح المعاينة الحية في الإطار", "success");
  }

  updatePreviewDevice(device) {
    this.previewDevice = device;
    const widths = { desktop: "100%", tablet: "768px", mobile: "375px" };
    const frame = document.querySelector("iframe");
    if (frame) {
      frame.style.maxWidth = widths[device] || "100%";
      frame.style.margin = "0 auto";
      frame.style.display = "block";
    }
    Utils.toast(
      `📱 جهاز: ${device === "desktop" ? "حاسوب" : device === "tablet" ? "تابلت" : "موبايل"}`,
      "info",
    );
  }
}

// ============================================================
// 20. INTEGRATION - تحديث المحرك الرئيسي
// ============================================================

// تحديث DashboardApp لإضافة المحركات الجديدة
// أضف هذا الكود في نهاية ملف dashboard.js

// ============================================================
// تحديث قسم _initSections في DashboardApp
// ============================================================
// استبدل دالة _initSections الموجودة بهذه النسخة المحدثة:

/*
_initSections() {
    const map = {
        'home-section': HomeEngine,
        'updater-section': UpdaterEngine,
        'hero-section': HeroEngine,
        'skills-section': SkillsEngine,
        'projects-section': ProjectsEngine,
        'certificates-section': CertificatesEngine,
        'support-section': SupportEngine,
        'donations-section': DonationsEngine,
        'social-section': SocialEngine,
        'messages-section': MessagesEngine,
        'logs-section': LogsEngine
    };
    
    for (const [id, Manager] of Object.entries(map)) {
        if (typeof Manager === 'function') {
            try {
                const instance = new Manager(this);
                this.sections[id] = instance;
                if (this.navigation) {
                    this.navigation.registerSection(id, instance);
                }
                console.log(`✅ ${id} registered`);
            } catch (error) {
                console.error(`❌ Error loading ${id}:`, error);
            }
        }
    }
}
*/

// ============================================================
// تحديث دالة initialLoad في DashboardApp
// ============================================================
// أضف هذا الكود في نهاية دالة initialLoad:

/*
// تهيئة محرك السجلات
if (!this.logs) {
    this.logs = new LogsEngine(this);
    this.sections['logs-section'] = this.logs;
    if (this.navigation) {
        this.navigation.registerSection('logs-section', this.logs);
    }
}

// تهيئة محرك المعاينة
if (!this.preview) {
    this.preview = new PreviewEngine(this);
}
*/

// ============================================================
// 21. BOOTSTRAP - تشغيل التطبيق النهائي
// ============================================================

class DashboardAppFinal {
  constructor() {
    console.log("🚀 Initializing Dashboard Application Final...");

    // المكونات الأساسية
    this.language = null;
    this.theme = null;
    this.navigation = null;
    this.sections = {};

    // المحركات الجديدة
    this.logs = null;
    this.preview = null;

    // التهيئة
    this.init();
  }

  init() {
    // 1. تهيئة محرك اللغة
    this.language = new LanguageEngine();

    // 2. تهيئة محرك الثيم
    this.theme = new ThemeEngine();

    // 3. تهيئة نظام التنقل
    this.navigation = new NavigationEngine();

    // 4. تهيئة جميع الأقسام
    this.initSections();

    // 5. الأحداث العامة
    this.setupGlobalEvents();

    // 6. تحميل البيانات الأولية
    this.initialLoad();

    // 7. تحديث واجهة السجلات في الهوم
    this.syncHomeLogs();

    console.log("✅ Dashboard Application Final ready!");
    Utils.toast("🚀 Dashboard جاهز بالكامل", "success");
  }

  initSections() {
    const map = {
      "home-section": HomeEngine,
      "updater-section": UpdaterEngine,
      "hero-section": HeroEngine,
      "skills-section": SkillsEngine,
      "projects-section": ProjectsEngine,
      "certificates-section": CertificatesEngine,
      "support-section": SupportEngine,
      "donations-section": DonationsEngine,
      "social-section": SocialEngine,
      "messages-section": MessagesEngine,
      "logs-section": LogsEngine,
    };

    for (const [id, Manager] of Object.entries(map)) {
      if (typeof Manager === "function") {
        try {
          const instance = new Manager(this);
          this.sections[id] = instance;
          if (this.navigation) {
            this.navigation.registerSection(id, instance);
          }
          console.log(`✅ ${id} registered`);
        } catch (error) {
          console.error(`❌ Error loading ${id}:`, error);
        }
      }
    }

    // تخزين مراجع للمحركات الخاصة
    this.logs = this.sections["logs-section"];
    this.preview = new PreviewEngine(this);
  }

  setupGlobalEvents() {
    // زر تبديل اللغة
    const langBtn = document.getElementById("toggleLangBtn");
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        this.language.toggle();
      });
    }

    // زر تسجيل الخروج
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    // اختصارات الكيبورد
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+P = فتح المعاينة
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        if (this.preview) {
          this.preview.openLivePreview();
        }
      }

      // Ctrl+Shift+L = تنظيف السجلات
      if (e.ctrlKey && e.shiftKey && e.key === "L") {
        e.preventDefault();
        if (this.logs && confirm("هل تريد مسح جميع السجلات؟")) {
          this.logs.clearAll();
        }
      }
    });
  }

  initialLoad() {
    console.log("📦 Loading initial data...");

    // تحميل السجلات من localStorage
    const savedLogs = Utils.storage.get("logs-data", []);
    if (savedLogs.length > 0 && this.logs) {
      this.logs.logs = savedLogs;
      this.logs.renderLogs();
    }

    // إضافة سجل بدء التشغيل
    if (this.logs) {
      this.logs.addLog("🚀 تم تشغيل لوحة التحكم - النسخة النهائية", "info");
    }

    // تحديث مؤشرات الرئيسية
    this.updateHomeIndicators();
  }

  syncHomeLogs() {
    // مزامنة السجلات مع قسم الرئيسية
    const homeEngine = this.sections["home-section"];
    if (homeEngine && this.logs) {
      // تمرير مرجع السجلات إلى الهوم
      homeEngine.logsEngine = this.logs;

      // تحديث عرض السجلات في الهوم
      if (typeof homeEngine.updateLogsDisplay === "function") {
        homeEngine.updateLogsDisplay();
      }
    }
  }

  updateHomeIndicators() {
    // تحديث مؤشرات اللغة والثيم في الهوم
    const langIndicator = document.getElementById("home-lang-indicator");
    if (langIndicator) {
      const lang = this.language.currentLang;
      const dir = this.language.direction;
      langIndicator.textContent =
        lang === "ar" ? "العربية (RTL)" : "English (LTR)";
    }

    const themeIndicator = document.getElementById("home-theme-indicator");
    if (themeIndicator) {
      const theme = this.theme.currentTheme;
      themeIndicator.textContent =
        theme === "dark" ? "الوضع المظلم 🌙" : "الوضع الفاتح ☀️";
    }
  }

  logout() {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
      Utils.toast("👋 جاري تسجيل الخروج...", "info");

      // حفظ جميع البيانات
      if (this.logs) {
        this.logs.saveToStorage();
      }

      // حفظ إعدادات المستخدم
      Utils.storage.set("user-preferences", {
        theme: this.theme.currentTheme,
        language: this.language.currentLang,
        direction: this.language.direction,
        lastLogout: new Date().toISOString(),
      });

      setTimeout(() => {
        window.location.href = "login.html";
      }, 500);
    }
  }
}

// ============================================================
// 22. RUN APPLICATION (تشغيل التطبيق النهائي)
// ============================================================

// إزالة أي تطبيق سابق
document.addEventListener("DOMContentLoaded", () => {
  window.Dashboard = new DashboardAppFinal(); // <--- صح
  console.log("📦 Dashboard instance available at window.Dashboard");
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  if (!window.Dashboard) {
    window.Dashboard = new DashboardAppFinal(); // <--- صح
  }
}

// ============================================================
// 23. CONSOLE HELPERS (مساعدين الكونسول)
// ============================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 DASHBOARD PRO - النسخة النهائية                        ║
║                                                              ║
║   📦 Dashboard متاحة عبر window.Dashboard                    ║
║                                                              ║
║   🔧 المساعدين:                                              ║
║   • Dashboard.sections - جميع الأقسام                       ║
║   • Dashboard.logs - سجل النشاطات                          ║
║   • Dashboard.preview - معاينة الموقع                      ║
║   • Dashboard.language - محرك اللغة                        ║
║   • Dashboard.theme - محرك الثيم                           ║
║   • Dashboard.navigation - نظام التنقل                     ║
║                                                              ║
║   ⌨️  الاختصارات:                                           ║
║   • Ctrl+K - بحث سريع                                      ║
║   • Ctrl+Shift+P - فتح المعاينة                            ║
║   • Ctrl+Shift+L - تنظيف السجلات                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================
// 24. SERVICE WORKER READY (جاهزية الخدمات)
// ============================================================

// تحضير للاتصال بـ Supabase
const SupabaseReady = {
  connected: false,
  config: {
    url: null,
    key: null,
  },

  init(url, key) {
    this.config.url = url;
    this.config.key = key;
    console.log("🔌 Supabase configuration ready");
  },

  async connect() {
    if (typeof supabase !== "undefined" && this.config.url && this.config.key) {
      try {
        const client = supabase.createClient(this.config.url, this.config.key);
        this.connected = true;
        console.log("✅ Supabase connected successfully");
        return client;
      } catch (error) {
        console.error("❌ Supabase connection error:", error);
        return null;
      }
    }
    console.warn("⚠️ Supabase not configured or library not loaded");
    return null;
  },
};

// تصدير جاهزية Supabase
window.SupabaseReady = SupabaseReady;

// ============================================================
// 25. ERROR HANDLING (معالجة الأخطاء العالمية)
// ============================================================

window.addEventListener("error", (e) => {
  console.error("❌ Global error:", e.error || e.message);

  // عرض خطأ للمستخدم
  if (e.error && e.error.message) {
    Utils.toast(`⚠️ خطأ: ${e.error.message}`, "error");
  }
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("❌ Unhandled promise rejection:", e.reason);
  Utils.toast(`⚠️ خطأ غير متوقع: ${e.reason || "unknown"}`, "error");
});

console.log("✅ Error handlers registered");
