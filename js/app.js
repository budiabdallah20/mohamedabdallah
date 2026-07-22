/* ========================================================
        PORTFOLIO APP - NAVBAR & CORE LOGIC
======================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Preloader Logic
    const preloader = document.querySelector(".preloader");
    if (preloader) {
        window.addEventListener("load", () => {
            preloader.style.opacity = "0";
            setTimeout(() => preloader.style.display = "none", 500);
        });
    }

    // 2. Mobile Menu Logic (Hamburger Menu)
    const mobileMenuBtn = document.querySelector(".navbar__toggle") || document.querySelector(".hamburger");
    const navMenu = document.querySelector(".navbar__menu") || document.querySelector(".nav-menu");

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("active");
            mobileMenuBtn.classList.toggle("active");
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                mobileMenuBtn.classList.remove("active");
            });
        });
    }

    // 3. Footer Year
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

function changeLanguage(lang) {
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", "ltr");

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.getAttribute("data-i18n-placeholder");
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
}