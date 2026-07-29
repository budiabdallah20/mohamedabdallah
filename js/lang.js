/* ========================================================
        DYNAMIC JSON LANGUAGE & TRANSLATION SYSTEM
======================================================== */

// دالة لتغيير وتحميل اللغات من ملفات JSON الخارجية
async function changeLanguage(lang) {
    try {
        const response = await fetch(`./${lang}.json`);
        if (!response.ok) throw new Error(`Could not load ${lang}.json`);
        
        const translations = await response.json();

        // حفظ اللغة وتحديد الاتجاه تلقائياً (rtl للعربية، ltr للإنجليزية)
        localStorage.setItem("lang", lang);
        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

        // تطبيق الترجمة على العناصر التي تحتوي على data-i18n
        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.getAttribute("data-i18n");
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        // ترجمة الـ Placeholders في الفورم
        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            const key = element.getAttribute("data-i18n-placeholder");
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });

        // تحديث شريط الترحيب إن وجد
        if (typeof switchWelcomeLanguage === 'function') {
            switchWelcomeLanguage(lang);
        }

    } catch (error) {
        console.error("Error loading translation files:", error);
    }
}

// تنفيذ اللغة المحفوظة فور تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("lang") || "en";
    changeLanguage(savedLang);

    // ربط زر تغيير اللغة
    const langToggleBtn = document.querySelector(".language-toggle");
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const currentLang = localStorage.getItem("lang") || "en";
            const newLang = currentLang === "en" ? "ar" : "en";
            changeLanguage(newLang);
        });
    }
});

// إغلاق شريط الترحيب عند الضغط على زر X
const closeWelcomeBtn = document.getElementById('closeWelcomeBtn');
if (closeWelcomeBtn) {
    closeWelcomeBtn.addEventListener('click', function() {
        const banner = document.getElementById('welcomeBanner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.4s ease';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 400);
        }
    });
}

// دالة تبديل لغة شريط الترحيب
function switchWelcomeLanguage(lang) {
    const arText = document.querySelector('.welcome-banner .lang-ar');
    const enText = document.querySelector('.welcome-banner .lang-en');
    if (arText && enText) {
        if (lang === 'en') {
            arText.style.display = 'none';
            enText.style.display = 'inline';
        } else {
            arText.style.display = 'inline';
            enText.style.display = 'none';
        }
    }
}