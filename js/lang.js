document.addEventListener("DOMContentLoaded", () => {
    const langToggleBtn = document.getElementById("langtoggle");
    
    // اللغة الافتراضية
    let currentLang = localStorage.getItem("preferred_lang") || "ar";
    
    // تطبيق اللغة أول ما الصفحة تفتح
    applyLanguage(currentLang);

    // لما يضغط على زرار تغيير اللغة
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            currentLang = currentLang === "ar" ? "en" : "ar";
            localStorage.setItem("preferred_lang", currentLang); // تثبيت الاختيار
            applyLanguage(currentLang);
        });
    }

    function applyLanguage(lang) {
        // تثبيت لغة المستند
        document.documentElement.setAttribute("lang", lang);
        
        // 🚨 هنا السر: ثبتنا اتجاه الموقع دايماً على LTR (يسار ليمين) ومش هيتغير مهما كانت اللغة
        document.documentElement.setAttribute("dir", "ltr");

        // جلب ملف الترجمة المناسب وتغيير النصوص فقط
        fetch(`./locales/${lang}.json`)
            .then(response => response.json())
            .then(translations => {
                document.querySelectorAll("[data-i18n]").forEach(element => {
                    const key = element.getAttribute("data-i18n");
                    if (translations[key]) {
                        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                            element.placeholder = translations[key];
                        } else {
                            const icon = element.querySelector("i");
                            if (icon) {
                                element.innerHTML = "";
                                element.appendChild(icon);
                                element.append(" " + translations[key]);
                            } else {
                                element.innerHTML = translations[key];
                            }
                        }
                    }
                });
            })
            .catch(error => console.error("Error loading language file:", error));
    }
});