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
            if (window.scrollY > 400) {
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
});document.addEventListener("DOMContentLoaded", () => {
    const starsContainer = document.getElementById("starsContainer");
    if (!starsContainer) return;

    const starsCount = 35; // عدد النجوم في الشاشة (ممكن تزوده أو تقلله)

    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement("div");
        star.classList.add("star");

        // خصائص عشوائية لكل نجمة (الحجم، المكان، والسرعة)
        const size = Math.random() * 3 + 1; // حجم النجمة بين 1px و 4px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}vw`;
        
        // سرعات مختلفة عشان الحركة تبلغ واقعية
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        star.style.setProperty('--float-duration', `${Math.random() * 10 + 10}s`);
        star.style.setProperty('--opacity', Math.random());

        // تأخير عشوائي في بداية الحركة
        star.style.animationDelay = `${Math.random() * 5}s`;

        starsContainer.appendChild(star);
    }
});document.querySelectorAll('.btn, .glass-card').forEach(element => {
    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0px, 0px)';
    });
});const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // صوت ناعم وخفيف
clickSound.volume = 0.2;

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {}); // عشان يتخطى قيود المتصفحات للصوت
    });
});document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
});
document.addEventListener("DOMContentLoaded", () => {
    
  

    // --- 2. تأثير الكتابة التلقائية (Typing Effect) ---
    // حط الـ ID ده (typewriter-text) على العنصر أو العنوان اللي عايزه يكتب لوحده
    const typeElement = document.getElementById("typewriter-text");
    if (typeElement) {
        const words = [
            "مرحباً بك في موقعي الشخصي",
            "أنا مطور واجهات أمامية (Frontend Developer)",
            "أهلاً بك في عالم الإبداع والبرمجة"
        ];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function typeWriter() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typeElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                typeElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typeSpeed = 2000; // وقت الانتظار لما الجملة تكتمل
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(typeWriter, typeSpeed);
        }

        typeWriter();
    }
});document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contactForm'); // لو الـ ID مختلف، غيره هنا لاسم الـ form عندك

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // عشان الصفحة متعملش Refresh لوحدها

            // جمع البيانات اللي الزائر كتبها (تأكد أن الـ inputs ليها حقل name مظبوط)
            const formData = {
                name: contactForm.querySelector('[name="name"]')?.value,
                email: contactForm.querySelector('[name="email"]')?.value,
                subject: contactForm.querySelector('[name="subject"]')?.value,
                message: contactForm.querySelector('[name="message"]')?.value
            };

            // استخدام دالة الـ API اللي عملناها في ملف api.js
            const result = await sendContactMessage(formData);

            if (result && result.status === 'success') {
                alert('تم إرسال رسالتك بنجاح! شكراً لك.');
                contactForm.reset(); // تفريغ النموذج بعد الإرسال
            } else {
                alert('عذراً، حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.');
            }
        });
    }
});
