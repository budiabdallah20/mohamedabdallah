// بيانات مشروع Supabase (المصدر الوحيد للحقيقة)
const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// 1. إرسال رسالة تواصل جديدة وتخزينها في جدول messages
async function sendContactMessage(formData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
            body: JSON.stringify(formData)
        });
        return response.ok ? { status: 'success' } : { status: 'error' };
    } catch (error) {
        console.error('Network Error:', error);
        return { status: 'error' };
    }
}

// 2. تحميل المشاريع (مقسّمة لفئتين: Featured أو Mini)
async function loadProjects() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const projects = await res.json();
        
        const grid = document.getElementById("dynamic-projects-grid");
        if (!grid || !projects.length) return;

        grid.innerHTML = projects.map(proj => `
            <article class="project-card">
                <div class="project-image">
                    <img src="${proj.image || 'assets/projects/images/portfolio.png'}" alt="${proj.title}" loading="lazy">
                    <div class="project-overlay"><span>${proj.category || 'Featured'} Project</span></div>
                </div>
                <div class="project-content">
                    <span class="project-status completed">${proj.status || 'Completed'}</span>
                    <h3>${proj.title}</h3>
                    <p>${proj.description}</p>
                    <div class="project-tech">
                        ${(proj.tags || []).map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    <div class="project-buttons">
                        ${proj.demo_url ? `<a href="${proj.demo_url}" target="_blank" class="btn-view"><i class="fa-solid fa-eye"></i> Live Demo</a>` : ''}
                        ${proj.github_url ? `<a href="${proj.github_url}" target="_blank" class="btn-github"><i class="fa-brands fa-github"></i> GitHub Repo</a>` : ''}
                    </div>
                </div>
            </article>
        `).join('');
    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

// 3. تحميل المهارات (مقسّمة إلى 4 فئات ثابتة: Frontend, Backend, Tools & Methods, Soft Skills)
async function loadSkills() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/skills?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const skills = await res.json();
        
        const wrapper = document.getElementById("dynamic-skills-wrapper");
        if (!wrapper || !skills.length) return;

        const categories = {};
        skills.forEach(skill => {
            const cat = skill.category || 'Frontend';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(skill);
        });

        wrapper.innerHTML = Object.keys(categories).map(catName => `
            <div class="skills__category">
                <h3 class="skills__heading">${catName}</h3>
                <div class="skills__grid">
                    ${categories[catName].map(s => `
                        <div class="skill__card">
                            <h4>${s.name}</h4>
                            <span>${s.level || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error loading skills:", err);
    }
}

// 4. تحميل الشهادات
async function loadCertificates() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/certificates?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const certs = await res.json();
        
        const container = document.getElementById("dynamic-certificates-container");
        if (!container || !certs.length) return;

        container.innerHTML = `
            <div class="certificates__header">
                <span class="section-subtitle">Achievements</span>
                <h2 class="certificates__title">Certificates & Learning</h2>
            </div>
            ${certs.map(cert => `
                <div class="certificate-card" style="margin-bottom: 1.5rem;">
                    <div class="certificate-icon"><i class="fa-solid fa-award"></i></div>
                    <h3>${cert.title}</h3>
                    <p>${cert.description || ''}</p>
                </div>
            `).join('')}
        `;
    } catch (err) {
        console.error("Error loading certificates:", err);
    }
}

// 5. تحميل إعدادات الموقع والهيرو وقسم "من أنا" بالأسماء الثابتة
async function loadSettings() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const settings = await res.json();
        
        if (settings.length > 0) {
            const data = settings[0];
            
            // الهيرو (Hero Section)
            if (data.hero_title) {
                const el = document.getElementById("dynamic-hero-title");
                if (el) el.innerText = data.hero_title;
            }
            if (data.hero_description) {
                const el = document.getElementById("dynamic-hero-desc");
                if (el) el.innerText = data.hero_description;
            }
            if (data.hero_image) {
                const el = document.getElementById("dynamic-hero-img");
                if (el) el.src = data.hero_image;
            }

            // قسم "من أنا" (About Section + 4 معلومات أساسية)
            if (data.about_text) {
                const el = document.getElementById("dynamic-about-text");
                if (el) el.innerText = data.about_text;
            }
            if (data.about_image) {
                const el = document.getElementById("dynamic-about-img");
                if (el) el.src = data.about_image;
            }
            if (data.location) {
                const el = document.getElementById("dynamic-about-location");
                if (el) el.innerText = data.location;
            }
            if (data.education) {
                const el = document.getElementById("dynamic-about-education");
                if (el) el.innerText = data.education;
            }
            if (data.career_objective) {
                const el = document.getElementById("dynamic-about-career");
                if (el) el.innerText = data.career_objective;
            }
            if (data.extra_info) {
                const el = document.getElementById("dynamic-about-extra");
                if (el) el.innerText = data.extra_info;
            }
        }
    } catch (err) {
        console.error("Error loading settings:", err);
    }
}

// 6. تحميل قسم الدعم والتبرعات (Vodafone Cash, Instapay, Phone)
async function loadDonations() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/donations?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const donations = await res.json();
        
        if (donations.length > 0) {
            const data = donations[0];
            const vodafoneEl = document.getElementById("dynamic-vodafone-cash");
            if (vodafoneEl) vodafoneEl.innerText = data.vodafone_cash;

            const instapayEl = document.getElementById("dynamic-instapay");
            if (instapayEl) instapayEl.innerText = data.instapay_account;

            const phoneEl = document.getElementById("dynamic-phone");
            if (phoneEl) phoneEl.innerText = data.personal_phone;

            const noteEl = document.getElementById("dynamic-support-note");
            if (noteEl) noteEl.innerText = data.support_note;
        }
    } catch (err) {
        console.error("Error loading donations:", err);
    }
}

// 7. تحميل حسابات السوشيال ميديا مع الكونتر التلقائي عند الضغط
async function loadSocialMedia() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/social_media?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const socials = await res.json();
        
        const container = document.getElementById("dynamic-social-container");
        if (!container || !socials.length) return;

        container.innerHTML = socials.map(s => `
            <a href="${s.profile_url}" target="_blank" class="social-link-item" onclick="incrementSocialClick(${s.id})">
                <i class="${s.icon_class || 'fa-solid fa-share'}"></i>
                <span>${s.platform_name}</span>
                <span class="click-counter">(${s.click_count || 0})</span>
            </a>
        `).join('');
    } catch (err) {
        console.error("Error loading social media:", err);
    }
}

// دالة لتحديث الكونتر تلقائياً عند النقر على أي أكونت سوشيال ميديا
async function incrementSocialClick(id) {
    try {
        // جلب العدد الحالي أولاً
        const res = await fetch(`${SUPABASE_URL}/rest/v1/social_media?id=eq.${id}&select=click_count`, { headers: supabaseHeaders });
        const data = await res.json();
        if(data && data.length > 0) {
            const newCount = (data[0].click_count || 0) + 1;
            await fetch(`${SUPABASE_URL}/rest/v1/social_media?id=eq.${id}`, {
                method: 'PATCH',
                headers: supabaseHeaders,
                body: JSON.stringify({ click_count: newCount })
            });
        }
    } catch(e) {
        console.error("Error updating click counter:", e);
    }
}

// 8. تسجيل زيارة جديدة لـ عداد الزوار
async function trackVisitor() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/visitors_counter?select=count&id=eq.1`, { headers: supabaseHeaders });
        const data = await res.json();
        if (data && data.length > 0) {
            const currentCount = data[0].count || 0;
            await fetch(`${SUPABASE_URL}/rest/v1/visitors_counter?id=eq.1`, {
                method: 'PATCH',
                headers: supabaseHeaders,
                body: JSON.stringify({ count: currentCount + 1 })
            });
        }
    } catch(e) {
        console.error("Error tracking visitor:", e);
    }
}

// التشغيل التلقائي عند تحميل الصفحة والربط الكامل
document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    loadSkills();
    loadCertificates();
    loadSettings();
    loadDonations();
    loadSocialMedia();
    trackVisitor();

    // ربط نموذج التواصل
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = {
                name: contactForm.querySelector('[name="name"]').value,
                email: contactForm.querySelector('[name="email"]').value,
                subject: contactForm.querySelector('[name="subject"]').value,
                message: contactForm.querySelector('[name="message"]').value
            };

            const result = await sendContactMessage(formData);
            if (result.status === 'success') {
                alert('تم ارسال الرسالة بنجاح!');
                contactForm.reset();
            } else {
                alert('حدث خطأ أثناء الإرسال.');
            }
        });
    }
});