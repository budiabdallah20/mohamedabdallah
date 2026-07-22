/* ========================================================
        DYNAMIC JSON LANGUAGE & TRANSLATION SYSTEM
======================================================== */

// دالة لتغيير وتحميل اللغات من ملفات JSON الخارجية
async function changeLanguage(lang) {
    try {
        // جلب ملف الترجمة الخاص باللغة المختار (ar.json أو en.json)
        // تأكد أن ملفات الـ JSON موجودة في نفس المسار أو مجلد assets/lang/ مثلاً
        const response = await fetch(`./${lang}.json`);
        if (!response.ok) throw new Error(`Could not load ${lang}.json`);
        
        const translations = await response.json();

        // حفظ اللغة في الذاكرة وتثبيت الاتجاه دائمًا على LTR
        localStorage.setItem("lang", lang);
        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("dir", "ltr");

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