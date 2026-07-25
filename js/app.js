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

   document.getElementById('year').textContent = new Date().getFullYear();

    // 4. Legal Modal Logic (حل مشكلة الانتقال لـ Home)
    const legalBtns = document.querySelectorAll(".legal-btn");
    const legalModal = document.getElementById("legalModal");
    const closeModal = document.querySelector(".close-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalText = document.getElementById("modal-text");

    const legalContent = {
        privacy: {
            title: "Privacy Policy",
            text: "Your privacy is important to us. This portfolio does not collect personal data except what you voluntarily submit via the contact form. All information is kept secure and confidential."
        },
        terms: {
            title: "Terms of Service",
            text: "By accessing this website, you agree to comply with these terms of service. All portfolio designs, code, and contents are owned by Mohamed Abdallah unless otherwise stated."
        }
    };

    if (legalModal) {
        legalBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault(); // منع الانتقال لأعلى الصفحة
                const type = btn.getAttribute("data-type");
                if (legalContent[type]) {
                    modalTitle.textContent = legalContent[type].title;
                    modalText.textContent = legalContent[type].text;
                    legalModal.style.display = "flex";
                }
            });
        });

        if (closeModal) {
            closeModal.addEventListener("click", () => {
                legalModal.style.display = "none";
            });
        }

        window.addEventListener("click", (e) => {
            if (e.target === legalModal) {
                legalModal.style.display = "none";
            }
        });
    }

    // 5. Back to Top Logic (حل مشكلة زر العودة للأعلى)
    const backToTopBtn = document.getElementById("backToTop");

    if (backToTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        });

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});

// 6. Scroll Spy for Active Navbar Links (حل مشكلة الشريط البنفسجي الثابت على Home)
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute("id");
        const navLink = document.querySelector(`.navbar__menu a[href*="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll(".navbar__menu a").forEach(link => link.classList.remove("active"));
                navLink.classList.add("active");
            }
        }
    });
});
window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = scrolled + '%';
    }
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

function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        let originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        btn.style.color = 'var(--color-success)';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
        }, 2000);
    });
}
function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        // إنشاء عنصر إشعار مؤقت
        let toast = document.createElement('div');
        toast.innerText = "Copied to clipboard! 📋";
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.background = "var(--color-primary)";
        toast.style.color = "#fff";
        toast.style.padding = "10px 20px";
        toast.style.borderRadius = "var(--radius-sm)";
        toast.style.zIndex = "1000";
        toast.style.boxShadow = "var(--shadow-card)";
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    });
}
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        // نزلت لتحت - اخفي الهيدر
        navbar.style.top = '-100px';
    } else {
        // طلعت لفوق - اظهر الهيدر
        navbar.style.top = '0';
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});
