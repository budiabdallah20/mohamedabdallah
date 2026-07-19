/* ========================================================
        PORTFOLIO APP - V1.0 (Production Optimized)
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

    // 2. Console Welcome
    console.log(`%cWelcome 👋 Portfolio by Mohamed Abdallah`, "color: #7b2cbf; font-size: 20px; font-weight: bold;");
    console.log(`%cFrontend Developer | Mathematics & Computer Science Student`, "color: #555; font-size: 14px;");
    console.log(`%cCheck out my GitHub: https://github.com/MohamedAbdallah`, "color: #7b2cbf;");

    // 3. Theme Toggle Logic
    const themeToggle = document.querySelector(".theme-toggle");
    const themeIcon = themeToggle?.querySelector("i");
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    // استخدام الهلال دائماً للثيم (ممتلئ للمظلم، ومفرغ للفاتح)
    if (themeIcon) {
        themeIcon.className = savedTheme === "dark" ? "fa-solid fa-moon" : "fa-regular fa-moon";
    }

    themeToggle?.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        let newTheme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        
        if (themeIcon) {
            themeIcon.className = newTheme === "dark" ? "fa-solid fa-moon" : "fa-regular fa-moon";
        }
    });

    // 4. UI Selection
    const navbar = document.querySelector(".navbar");
    const progressFill = document.querySelector(".progress-fill");
    const backToTop = document.getElementById("backToTop");
    const menu = document.querySelector(".navbar__menu");
    const toggle = document.querySelector(".navbar__toggle");
    const toggleIcon = toggle?.querySelector("i");
    const navLinks = document.querySelectorAll(".navbar__link");
    const sections = document.querySelectorAll("section");

    // 5. Navbar Mobile Toggle & Close Logic
    toggle?.addEventListener("click", () => {
        menu.classList.toggle("active");
        const isOpen = menu.classList.contains("active");
        if (toggleIcon) toggleIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });

    // إغلاق المنيو عند الضغط في أي مكان
    document.addEventListener("click", (e) => {
        if (menu?.classList.contains("active") && !menu.contains(e.target) && !toggle?.contains(e.target)) {
            menu.classList.remove("active");
            if (toggleIcon) toggleIcon.className = "fa-solid fa-bars";
        }
    });

    // قفل المنيو عند اختيار لينك
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            if (toggleIcon) toggleIcon.className = "fa-solid fa-bars";
        });
    });

    // 6. Unified Scroll Events (Performance Optimized)
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
                if (progressFill) {
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    progressFill.style.width = (window.scrollY / height) * 100 + "%";
                }
                if (backToTop) backToTop.classList.toggle("show", window.scrollY > 300);
                
                let current = "";
                sections.forEach(s => { if (window.scrollY >= s.offsetTop - 150) current = s.getAttribute("id"); });
                navLinks.forEach(l => {
                    l.classList.remove("active");
                    if (l.getAttribute("href")?.includes(current)) l.classList.add("active");
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // تفعيل وظيفة الصعود للأعلى عند الضغط على الزرار (تمت الإضافة)
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // 7. Ripple Effect for Buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            let ripple = document.createElement("span");
            this.appendChild(ripple);
            let x = e.clientX - e.target.offsetLeft;
            let y = e.clientY - e.target.offsetTop;
            ripple.style.left = x + "px";
            ripple.style.top = y + "px";
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 8. Scroll Reveal & Counter
    const revealElements = document.querySelectorAll('.section-title, .about__card, .skill__card, .counter-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                if (entry.target.classList.contains('counter-item')) startCounter(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealElements.forEach(el => { el.classList.add("reveal"); observer.observe(el); });

    function startCounter(item) {
        const val = item.querySelector(".counter-value");
        const target = parseInt(val.getAttribute("data-target"));
        let count = 0;
        let timer = setInterval(() => {
            count++;
            val.textContent = count;
            if (count >= target) clearInterval(timer);
        }, 2000 / target);
    }

    // 9. Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.key === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // 10. Footer Year
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered!'))
            .catch(err => console.log('Service Worker Failed', err));
    });
}