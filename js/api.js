// بيانات مشروع Supabase (المصدر الوحيد للحقيقة)
const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// 1. إرسال رسالة تواصل جديدة
async function sendContactMessage(formData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Messages`, {
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

// 2. تحميل المشاريع
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
                    <div class="project-overlay"><span>Featured Project</span></div>
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

// 3. تحميل المهارات
async function loadSkills() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/skills?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const skills = await res.json();
        
        const wrapper = document.getElementById("dynamic-skills-wrapper");
        if (!wrapper || !skills.length) return;

        // تجميع المهارات حسب الفئة واعادة رسمها ديناميكياً
        const categories = {};
        skills.forEach(skill => {
            const cat = skill.category || 'Other Skills';
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

// 5. تحميل الإعدادات (الهيرو، البايو، الصور)
async function loadSettings() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const settings = await res.json();
        
        if (settings.length > 0) {
            const data = settings[0];
            
            // الهيرو
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

            // عني (About)
            if (data.about_text) {
                const el = document.getElementById("dynamic-about-text");
                if (el) el.innerText = data.about_text;
            }
            if (data.about_image) {
                const el = document.getElementById("dynamic-about-img");
                if (el) el.src = data.about_image;
            }

            // الشعار وصورة التواصل
            if (data.site_logo) {
                const el = document.getElementById("dynamic-nav-logo");
                if (el) el.innerText = data.site_logo;
            }
            if (data.contact_image) {
                const el = document.getElementById("dynamic-contact-img");
                if (el) el.src = data.contact_image;
            }
        }
    } catch (err) {
        console.error("Error loading settings:", err);
    }
}

// 6. تفعيل الـ Realtime لتحديث الأقسام فورياً دون تحديث الصفحة
function initRealtimeListeners() {
    const wsUrl = `${SUPABASE_URL.replace('https://', 'wss://')}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;
    
    try {
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            socket.send(JSON.stringify({
                topic: "realtime:public",
                event: "phx_join",
                payload: {},
                ref: "1"
            }));
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.event === "postgres_changes") {
                const table = message.payload.table;
                
                if (table === 'projects') loadProjects();
                if (table === 'skills') loadSkills();
                if (table === 'certificates') loadCertificates();
                if (table === 'site_settings') loadSettings();
            }
        };
    } catch (e) {
        console.error("Realtime connection error:", e);
    }
}

// تشغيل الكل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    loadSkills();
    loadCertificates();
    loadSettings();
    initRealtimeListeners();

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