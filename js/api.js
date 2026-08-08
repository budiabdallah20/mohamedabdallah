// ============================================================ */
// 🚀 API - SUPABASE CONNECTION v3.5 (النسخة النهائية)        */
// ============================================================ */

// ============================================================ */
// 01. CONFIGURATION                                            */
// ============================================================ */

const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// ============================================================ */
// 02. VISITOR INFO HELPER                                      */
// ============================================================ */

async function getVisitorInfo() {
    let ipAddress = 'Unknown';
    let location = 'Unknown';
    
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
        
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
            const geoData = await geoResponse.json();
            location = `${geoData.city || ''}, ${geoData.country_name || ''}`.trim() || 'Unknown';
        } catch (e) {
            console.log('Could not fetch location');
        }
    } catch (e) {
        console.log('Could not fetch IP address');
    }
    
    return { ipAddress, location };
}

// ============================================================ */
// 03. SEND SUPPORT TICKET                                      */
// ============================================================ */

async function sendSupportTicket(formData) {
    try {
        const { ipAddress, location } = await getVisitorInfo();

        const completeData = {
            id: Math.floor(Math.random() * 1000000000),
            sender_name: formData.name.trim(),
            sender_email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            status: 'pending',
            reply_message: null,
            replied_at: null,
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            location: location,
            created_at: new Date().toISOString()
        };

        console.log('📤 Sending support ticket:', completeData);

        const response = await fetch(`${SUPABASE_URL}/rest/v1/support_tickets`, {
            method: 'POST',
            headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
            body: JSON.stringify(completeData)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ API Error:', error);
            return { status: 'error', message: error };
        }

        const data = await response.json();
        console.log('✅ Ticket saved:', data);

        document.dispatchEvent(new CustomEvent('dashboard:new-ticket', {
            detail: completeData
        }));

        document.dispatchEvent(new CustomEvent('dashboard:log', {
            detail: {
                message: `🎧 تذكرة دعم جديدة من: ${completeData.sender_name}`,
                type: 'support',
                details: completeData.subject
            }
        }));

        return { status: 'success', data: completeData };

    } catch (error) {
        console.error('❌ Network Error:', error);
        return { status: 'error', message: error.message };
    }
}

// ============================================================ */
// 04. SEND CONTACT MESSAGE                                     */
// ============================================================ */

async function sendContactMessage(formData) {
    try {
        const { ipAddress, location } = await getVisitorInfo();

        const completeData = {
            id: Math.floor(Math.random() * 10000000),
            sender_name: formData.name.trim(),
            sender_email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            location: location,
            created_at: new Date().toISOString()
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
            body: JSON.stringify(completeData)
        });

        if (!response.ok) {
            return { status: 'error' };
        }

        document.dispatchEvent(new CustomEvent('dashboard:new-message', {
            detail: completeData
        }));

        return { status: 'success' };

    } catch (error) {
        console.error('Network Error:', error);
        return { status: 'error' };
    }
}

// ============================================================ */
// 05. SEND DONATION                                            */
// ============================================================ */

async function sendDonation(donationData) {
    try {
        const { ipAddress, location } = await getVisitorInfo();

        const completeData = {
            id: Math.floor(Math.random() * 1000000000),
            amount: parseFloat(donationData.amount),
            platform: donationData.platform || 'Vodafone Cash',
            donor_name: donationData.donor_name || 'Anonymous',
            donor_phone: donationData.donor_phone || '',
            message: donationData.message || '',
            location: location,
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            status: 'pending',
            is_active: true,
            created_at: new Date().toISOString()
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/donations`, {
            method: 'POST',
            headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
            body: JSON.stringify(completeData)
        });

        if (response.ok) {
            document.dispatchEvent(new CustomEvent('dashboard:donation-received', {
                detail: completeData
            }));
            return { status: 'success', data: completeData };
        }
        
        return { status: 'error' };
    } catch (error) {
        console.error('Network Error:', error);
        return { status: 'error' };
    }
}

// ============================================================ */
// 06. LOAD PROJECTS                                            */
// ============================================================ */

async function loadProjects() {
    console.log('📁 Loading projects from Supabase...');
    
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=*&is_hidden=eq.false&order=created_at.desc`, {
            headers: supabaseHeaders
        });
        
        if (!res.ok) {
            console.warn('⚠️ Projects table may not exist yet');
            return;
        }
        
        const projects = await res.json();
        console.log('✅ Projects loaded:', projects?.length || 0);
        
        const counter = document.getElementById('projectsCounter');
        if (counter) {
            counter.textContent = projects?.length || 0;
        }
        
        const grid = document.getElementById('dynamic-projects-grid');
        if (!grid) return;
        
        if (!projects || projects.length === 0) {
            grid.innerHTML = `
                <p style="text-align:center;padding:2rem;color:var(--text-muted);">
                    لا توجد مشاريع حالياً. أضف مشاريعك من لوحة التحكم.
                </p>
            `;
            return;
        }
        
        grid.innerHTML = projects.map(p => `
            <article class="project-card">
                <div class="project-image">
                    <img src="${p.image_url || './assets/logo/Mohamed-Abdallah--logo.png'}" 
                         alt="${p.title}" loading="lazy"
                         onerror="this.src='./assets/logo/Mohamed-Abdallah--logo.png'">
                    <div class="project-overlay">
                        <span>${p.is_featured ? '⭐ مميز' : (p.status || 'مشروع')}</span>
                    </div>
                </div>
                <div class="project-content">
                    <span class="project-status ${p.status === 'Completed' ? 'completed' : 'in-progress'}">
                        ${p.status || 'قيد التطوير'}
                    </span>
                    <h3>${p.title}</h3>
                    <p>${p.description || ''}</p>
                    <div class="project-tech">
                        ${(p.tech_stack || []).map(t => `<span>${t}</span>`).join('')}
                    </div>
                    <div class="project-buttons">
                        ${p.demo_url ? `<a href="${p.demo_url}" target="_blank" class="btn-view"><i class="fa-solid fa-eye"></i> معاينة</a>` : ''}
                        ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="btn-github"><i class="fa-brands fa-github"></i> كود</a>` : ''}
                    </div>
                </div>
            </article>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error loading projects:', error);
    }
}

// ============================================================ */
// 07. LOAD SKILLS                                              */
// ============================================================ */

async function loadSkills() {
    console.log('📚 Loading skills from Supabase...');
    
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/skills?select=*&is_hidden=eq.false&order=created_at.desc`, {
            headers: supabaseHeaders
        });
        
        if (!res.ok) {
            console.warn('⚠️ Skills table may not exist yet');
            return;
        }
        
        const skills = await res.json();
        console.log('✅ Skills loaded:', skills?.length || 0);
        
        const wrapper = document.getElementById('dynamic-skills-wrapper');
        if (!wrapper) return;
        
        if (!skills || skills.length === 0) {
            wrapper.innerHTML = `
                <p style="text-align:center;padding:2rem;color:var(--text-muted);">
                    لا توجد مهارات حالياً. أضف مهاراتك من لوحة التحكم.
                </p>
            `;
            return;
        }
        
        const categories = {};
        skills.forEach(skill => {
            const cat = skill.category || 'أخرى';
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
                            ${s.progress ? `<div class="skill-progress"><div style="width:${s.progress}%"></div></div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error loading skills:', error);
    }
}

// ============================================================ */
// 08. LOAD CERTIFICATES - مع دعم الصورة                      */
// ============================================================ */

async function loadCertificates() {
    console.log('🏅 Loading certificates from Supabase...');
    
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/certificates?select=*&is_published=eq.true&order=created_at.desc`, {
            headers: supabaseHeaders
        });
        
        if (!res.ok) {
            console.warn('⚠️ Certificates table may not exist yet');
            return;
        }
        
        const certs = await res.json();
        console.log('✅ Certificates loaded:', certs?.length || 0);
        
        const container = document.getElementById('dynamic-certificates-container');
        if (!container) return;
        
        if (!certs || certs.length === 0) {
            return;
        }
        
        let html = `
            <div class="certificates__header">
                <span class="section-subtitle">الشهادات</span>
                <h2 class="certificates__title">الإنجازات والتعلم</h2>
                <p>شهاداتي المهنية والدورات التي أكملتها</p>
            </div>
            <div class="certificates-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px,1fr)); gap:1.5rem; margin-top:1.5rem;">
        `;
        
        certs.forEach(cert => {
            // معالجة الصورة
            let imageHtml = '';
            if (cert.image_url && cert.image_url.startsWith('data:image')) {
                imageHtml = `
                    <div class="cert-image-wrap" style="width:100%; height:180px; overflow:hidden; border-radius:12px 12px 0 0; background:var(--bg-secondary);">
                        <img src="${cert.image_url}" alt="${cert.title}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                `;
            } else {
                imageHtml = `
                    <div class="cert-image-wrap" style="width:100%; height:180px; overflow:hidden; border-radius:12px 12px 0 0; background:var(--bg-secondary); display:flex; align-items:center; justify-content:center;">
                        <i class="fa-solid fa-certificate" style="font-size:3rem; opacity:0.2; color:var(--text-muted);"></i>
                    </div>
                `;
            }
            
            // معالجة المهارات
            let skillsHtml = '';
            if (cert.skills && cert.skills.length > 0) {
                skillsHtml = `
                    <div class="learning-tags" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.75rem;">
                        ${cert.skills.map(s => `<span style="background:var(--bg-secondary); padding:0.25rem 0.75rem; border-radius:20px; font-size:0.75rem; color:var(--text-secondary);">${s}</span>`).join('')}
                    </div>
                `;
            }
            
            html += `
                <div class="certificate-card" style="background:var(--card-bg); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); transition:all 0.3s ease;">
                    ${imageHtml}
                    <div style="padding:1.5rem;">
                        <div class="certificate-icon" style="margin-bottom:0.5rem;">
                            <i class="fa-solid fa-award" style="color:var(--color-primary);"></i>
                        </div>
                        <h3 style="font-size:1.1rem; margin-bottom:0.5rem; color:var(--text-primary);">${cert.title}</h3>
                        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.5rem;">${cert.description || 'شهادة مهنية'}</p>
                        ${cert.provider ? `<small style="color:var(--text-muted); display:block; margin-bottom:0.25rem;">🏢 ${cert.provider}</small>` : ''}
                        ${cert.issue_date ? `<small style="color:var(--text-muted); display:block;">📅 ${new Date(cert.issue_date).toLocaleDateString('ar-EG')}</small>` : ''}
                        ${skillsHtml}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        container.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error loading certificates:', error);
    }
}

// ============================================================ */
// 09. LOAD SETTINGS                                            */
// ============================================================ */

async function loadSettings() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const settings = await res.json();
        
        if (settings.length > 0) {
            const data = settings[0];
            
            if (data.hero_title) {
                const el = document.getElementById('dynamic-hero-title');
                if (el) el.innerText = data.hero_title;
            }
            if (data.hero_description) {
                const el = document.getElementById('dynamic-hero-desc');
                if (el) el.innerText = data.hero_description;
            }
            if (data.hero_image) {
                const el = document.getElementById('dynamic-hero-img');
                if (el) el.src = data.hero_image;
            }
            if (data.about_text) {
                const el = document.getElementById('dynamic-about-text');
                if (el) el.innerText = data.about_text;
            }
            if (data.about_image) {
                const el = document.getElementById('dynamic-about-img');
                if (el) el.src = data.about_image;
            }
        }
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

// ============================================================ */
// 10. LOAD DONATIONS                                           */
// ============================================================ */

async function loadDonations() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/donations?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const donations = await res.json();
        
        if (donations.length > 0) {
            const data = donations[0];
            const vodafoneEl = document.getElementById('dynamic-vodafone-cash');
            if (vodafoneEl) vodafoneEl.innerText = data.vodafone_cash || '+20 106 522 8072';
        }
    } catch (err) {
        console.error('Error loading donations:', err);
    }
}

// ============================================================ */
// 11. LOAD SOCIAL MEDIA                                        */
// ============================================================ */

async function loadSocialMedia() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/social_links?select=*&is_active=eq.true`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const socials = await res.json();
        
        const container = document.getElementById('dynamic-social-container');
        if (!container || !socials.length) return;

        container.innerHTML = socials.map(s => `
            <a href="${s.link}" target="_blank" class="social-link-item" onclick="incrementSocialClick(${s.id})">
                <i class="${s.icon || 'fa-solid fa-share'}"></i>
                <span>${s.platform}</span>
                <span class="click-counter">(${s.click_count || 0})</span>
            </a>
        `).join('');
    } catch (err) {
        console.error('Error loading social media:', err);
    }
}

// ============================================================ */
// 12. INCREMENT SOCIAL CLICK                                   */
// ============================================================ */

async function incrementSocialClick(id) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/social_links?id=eq.${id}&select=click_count`, { headers: supabaseHeaders });
        const data = await res.json();
        if (data && data.length > 0) {
            const newCount = (data[0].click_count || 0) + 1;
            await fetch(`${SUPABASE_URL}/rest/v1/social_links?id=eq.${id}`, {
                method: 'PATCH',
                headers: supabaseHeaders,
                body: JSON.stringify({ click_count: newCount })
            });
        }
    } catch (e) {
        console.error('Error updating click counter:', e);
    }
}

// ============================================================ */
// 13. TRACK VISITOR                                            */
// ============================================================ */

async function trackVisitor() {
    try {
        if (!sessionStorage.getItem('visited_tracked')) {
            await fetch(`${SUPABASE_URL}/rest/v1/visitors`, {
                method: 'POST',
                headers: { ...supabaseHeaders, 'Prefer': 'return=minimal' },
                body: JSON.stringify({
                    ip_address: 'live_visitor',
                    user_agent: navigator.userAgent,
                    created_at: new Date().toISOString()
                })
            });
            sessionStorage.setItem('visited_tracked', 'true');
            console.log('✅ Visitor tracked');
        }
    } catch (e) {
        console.log('Visitor tracking error:', e);
    }
}

// ============================================================ */
// 14. 🔥 NOTIFY CERTIFICATES UPDATED - جديد                   */
// ============================================================ */

function notifyCertificatesUpdated() {
    console.log('🔄 إرسال إشعار تحديث الشهادات...');
    document.dispatchEvent(new CustomEvent('dashboard:certificates-updated', {
        detail: { 
            source: 'api.js', 
            timestamp: new Date().toISOString(),
            action: 'refresh'
        }
    }));
}

// ============================================================ */
// 15. 🔥 SYNC CERTIFICATES - جديد                             */
// ============================================================ */

async function syncCertificates() {
    console.log('☁️ مزامنة الشهادات مع Supabase...');
    
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/certificates?select=*&order=created_at.desc`, {
            headers: supabaseHeaders
        });
        
        if (!res.ok) {
            console.warn('⚠️ Failed to sync certificates');
            return;
        }
        
        const certs = await res.json();
        console.log('✅ Synced:', certs?.length || 0, 'certificates');
        
        // تحديث localStorage
        if (certs && certs.length > 0) {
            localStorage.setItem('dashboard-certificates', JSON.stringify(certs));
        }
        
        // إرسال إشعار
        notifyCertificatesUpdated();
        
        // تحديث الموقع
        if (typeof loadCertificates === 'function') {
            setTimeout(loadCertificates, 300);
        }
        
        return certs;
        
    } catch (error) {
        console.error('❌ Error syncing certificates:', error);
        return null;
    }
}

// ============================================================ */
// 16. EXPOSE TO GLOBAL WINDOW                                  */
// ============================================================ */

window.sendSupportTicket = sendSupportTicket;
window.sendContactMessage = sendContactMessage;
window.sendDonation = sendDonation;
window.loadProjects = loadProjects;
window.loadSkills = loadSkills;
window.loadCertificates = loadCertificates;
window.loadSettings = loadSettings;
window.loadDonations = loadDonations;
window.loadSocialMedia = loadSocialMedia;
window.incrementSocialClick = incrementSocialClick;
window.trackVisitor = trackVisitor;
window.notifyCertificatesUpdated = notifyCertificatesUpdated;
window.syncCertificates = syncCertificates;

// ============================================================ */
// 17. 🔥 استماع لتحديثات الداشبورد - جديد                    */
// ============================================================ */

document.addEventListener('dashboard:certificates-updated', function(e) {
    console.log('🔄 استلام تحديث من الداشبورد للشهادات:', e.detail);
    if (typeof loadCertificates === 'function') {
        setTimeout(loadCertificates, 500);
    }
});

document.addEventListener('dashboard:projects-updated', function(e) {
    console.log('🔄 استلام تحديث من الداشبورد للمشاريع:', e.detail);
    if (typeof loadProjects === 'function') {
        setTimeout(loadProjects, 500);
    }
});

document.addEventListener('dashboard:skills-updated', function(e) {
    console.log('🔄 استلام تحديث من الداشبورد للمهارات:', e.detail);
    if (typeof loadSkills === 'function') {
        setTimeout(loadSkills, 500);
    }
});

// ============================================================ */
// 18. INITIALIZATION                                           */
// ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 API - Initializing...');

    setTimeout(() => {
        loadProjects();
        loadSkills();
        loadCertificates();
        loadSettings();
        loadDonations();
        loadSocialMedia();
        trackVisitor();
    }, 300);

    // ========================================================== */
    // ربط نموذج التواصل                                           */
    // ========================================================== */

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'جاري الإرسال...';
            }

            const formData = {
                name: contactForm.querySelector('[name="name"]').value,
                email: contactForm.querySelector('[name="email"]').value,
                subject: contactForm.querySelector('[name="subject"]').value,
                message: contactForm.querySelector('[name="message"]').value
            };

            const result = await sendContactMessage(formData);

            if (result.status === 'success') {
                alert('✅ تم إرسال رسالتك بنجاح!');
                contactForm.reset();
            } else {
                alert('❌ حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'إرسال';
            }
        });
    }

    // ========================================================== */
    // ربط نموذج التبرعات                                         */
    // ========================================================== */

    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = donationForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'جاري الإرسال...';
            }

            const formData = {
                amount: donationForm.querySelector('[name="amount"]').value,
                platform: donationForm.querySelector('[name="platform"]')?.value || 'Vodafone Cash',
                donor_name: donationForm.querySelector('[name="donor_name"]')?.value || '',
                donor_phone: donationForm.querySelector('[name="donor_phone"]')?.value || '',
                message: donationForm.querySelector('[name="message"]')?.value || ''
            };

            const result = await sendDonation(formData);

            if (result.status === 'success') {
                alert('✅ شكراً لك على تبرعك!');
                donationForm.reset();
            } else {
                alert('❌ حدث خطأ، حاول مرة أخرى.');
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'تبرع الآن';
            }
        });
    }

    // ========================================================== */
    // ربط نموذج الدعم الفني                                      */
    // ========================================================== */

    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        console.log('✅ Support form found, attaching listener...');

        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📤 Support form submitted');

            const submitBtn = supportForm.querySelector('button[type="submit"]');
            const statusEl = document.getElementById('supportFormStatus');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            }

            if (statusEl) {
                statusEl.textContent = '⏳ جاري إرسال شكواك...';
                statusEl.className = 'form-status sending';
            }

            const formData = {
                name: supportForm.querySelector('[name="supportName"]')?.value ||
                      supportForm.querySelector('#supportName')?.value || '',
                email: supportForm.querySelector('[name="supportEmail"]')?.value ||
                       supportForm.querySelector('#supportEmail')?.value || '',
                subject: supportForm.querySelector('[name="supportSubject"]')?.value ||
                        supportForm.querySelector('#supportSubject')?.value || '',
                message: supportForm.querySelector('[name="supportMessage"]')?.value ||
                        supportForm.querySelector('#supportMessage')?.value || ''
            };

            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                alert('⚠️ الرجاء ملء جميع الحقول المطلوبة');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الشكوى';
                }
                if (statusEl) {
                    statusEl.textContent = '⚠️ الرجاء ملء جميع الحقول';
                    statusEl.className = 'form-status error';
                }
                return;
            }

            console.log('📤 Sending support ticket:', formData);

            const result = await sendSupportTicket(formData);
            console.log('📥 Result:', result);

            if (result.status === 'success') {
                if (statusEl) {
                    statusEl.textContent = '✅ تم إرسال شكواك بنجاح! سنتواصل معك قريباً.';
                    statusEl.className = 'form-status success';
                }
                alert('✅ تم إرسال شكواك بنجاح! سنتواصل معك خلال 24 ساعة.');
                supportForm.reset();
            } else {
                if (statusEl) {
                    statusEl.textContent = `❌ فشل الإرسال: ${result.message || 'حاول مرة أخرى'}`;
                    statusEl.className = 'form-status error';
                }
                alert('❌ حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الشكوى';
            }
        });
    } else {
        console.warn('⚠️ Support form not found! Check ID: supportForm');
    }

    console.log('✅ API - All forms initialized');
});

// ============================================================ */
// 19. CONSOLE HELPERS                                          */
// ============================================================ */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 API - FULLY CONNECTED v3.5                            ║
║                                                              ║
║   ✅ sendSupportTicket()  - تذاكر الدعم                     ║
║   ✅ sendContactMessage() - رسائل التواصل                   ║
║   ✅ sendDonation()       - التبرعات                        ║
║   ✅ loadProjects()       - المشاريع                        ║
║   ✅ loadSkills()         - المهارات                        ║
║   ✅ loadCertificates()   - الشهادات (مع الصور)            ║
║   ✅ loadSettings()       - إعدادات الموقع                  ║
║   ✅ loadDonations()      - التبرعات                        ║
║   ✅ loadSocialMedia()    - السوشيال ميديا                  ║
║   ✅ trackVisitor()       - تسجيل الزوار                    ║
║   ✅ syncCertificates()   - مزامنة الشهادات 🆕             ║
║   ✅ notifyCertificatesUpdated() - إشعار تحديث 🆕          ║
║                                                              ║
║   📡 Dashboard Events:                                      ║
║   • dashboard:new-ticket                                    ║
║   • dashboard:new-message                                   ║
║   • dashboard:donation-received                             ║
║   • dashboard:certificates-updated 🆕                      ║
║   • dashboard:projects-updated 🆕                          ║
║   • dashboard:skills-updated 🆕                            ║
║   • dashboard:log                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);