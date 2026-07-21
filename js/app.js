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

    // 2. Console Welcome
    console.log(`%cWelcome 👋 Portfolio by Mohamed`, "color: #7b2cbf; font-size: 20px; font-weight: bold;");

    // 3. Theme Toggle Logic (Crescent Moon for both modes)
    const themeToggle = document.querySelector(".theme-toggle") || document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector("i");
        if (themeIcon) {
            themeIcon.className = savedTheme === "dark" ? "fa-solid fa-moon" : "fa-regular fa-moon";
        }

        themeToggle.addEventListener("click", () => {
            let theme = document.documentElement.getAttribute("data-theme");
            let newTheme = theme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            
            if (themeIcon) {
                themeIcon.className = newTheme === "dark" ? "fa-solid fa-moon" : "fa-regular fa-moon";
            }
        });
    }

    // 4. Unified Scroll Events
    const navbar = document.querySelector(".navbar");
    const progressFill = document.querySelector(".progress-fill");
    const backToTop = document.getElementById("backToTop");
    const sections = document.querySelectorAll("section");
    const navLinksList = document.querySelectorAll(".navbar__menu a, .navbar__link"); 
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
                sections.forEach(s => { 
                    if (window.scrollY >= s.offsetTop - 150) current = s.getAttribute("id"); 
                });
                
                navLinksList.forEach(l => {
                    l.classList.remove("active");
                    if (l.getAttribute("href")?.includes(current)) l.classList.add("active");
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // 5. Ripple Effect for Buttons
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

    // 6. Scroll Reveal & Counters
    const revealElements = document.querySelectorAll('.section-title, .about__card, .skill__card, .counter-item, .counter-card');
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active", "reveal-active");
                
                const val = entry.target.querySelector(".counter-value") || entry.target.querySelector("h3[data-target]");
                if (val && !val.classList.contains("counted")) {
                    startCounter(val);
                    val.classList.add("counted"); 
                }
                observerInstance.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => { 
        el.classList.add("reveal"); 
        observer.observe(el); 
    });

    function startCounter(val) {
        const target = parseInt(val.getAttribute("data-target"));
        if (!target) return;
        let count = 0;
        let speed = 200;
        let inc = target / speed;
        
        const updateCount = () => {
            count += inc;
            if (count < target) {
                val.textContent = Math.ceil(count);
                requestAnimationFrame(updateCount);
            } else {
                val.textContent = target;
            }
        };
        updateCount();
    }

    // 7. Footer Year
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 8. MOBILE MENU LOGIC
    const mobileMenuBtn = document.querySelector(".navbar__toggle");
    const navMenu = document.querySelector(".navbar__menu");

    if (mobileMenuBtn && navMenu) {
        const menuIcon = mobileMenuBtn.querySelector("i");

        const toggleMenu = (isActive) => {
            if (isActive) {
                navMenu.classList.add("active");
                if (menuIcon) {
                    menuIcon.classList.remove("fa-bars");
                    menuIcon.classList.add("fa-xmark");
                }
                document.body.style.overflow = "hidden";
            } else {
                navMenu.classList.remove("active");
                if (menuIcon) {
                    menuIcon.classList.add("fa-bars");
                    menuIcon.classList.remove("fa-xmark");
                }
                document.body.style.overflow = "";
            }
        };

        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isCurrentlyActive = navMenu.classList.contains("active");
            toggleMenu(!isCurrentlyActive);
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                toggleMenu(false);
            });
        });

        document.addEventListener("click", (e) => {
            if (navMenu.classList.contains("active") && !navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                toggleMenu(false);
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 992) {
                toggleMenu(false);
            }
        });
    }

    // 9. Legal Modal Logic
    const modal = document.getElementById("legalModal");
    const modalTitle = document.getElementById("modal-title");
    const modalText = document.getElementById("modal-text");
    const closeBtn = document.querySelector(".close-modal");
    const legalButtons = document.querySelectorAll(".legal-btn");

    if (modal && legalButtons.length > 0) {
        const contentData = {
            privacy: {
                title: "Privacy Policy",
                text: "Welcome to my portfolio. I respect your privacy. This website does not collect personal data from visitors, except for standard analytics or messages sent directly via contact forms."
            },
            terms: {
                title: "Terms of Service",
                text: "All content, designs, and code presented in this personal portfolio are protected. You are welcome to view and explore the projects."
            }
        };

        legalButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const type = btn.getAttribute("data-type");
                if (contentData[type]) {
                    modalTitle.textContent = contentData[type].title;
                    modalText.textContent = contentData[type].text;
                    modal.style.display = "flex";
                }
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", () => modal.style.display = "none");
        }

        window.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    }
});