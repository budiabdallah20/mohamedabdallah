// ============================================================ */
// 🚀 API - SUPABASE CONNECTION (المصدر الوحيد للحقيقة)       */
// ============================================================ */

// بيانات مشروع Supabase
const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// ============================================================ */
// 1️⃣ دالة مساعدة لجلب IP والموقع                           */
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
// 2️⃣ إرسال تذكرة دعم جديدة (الربط مع موقع وداشبورد)        */
// ============================================================ */

async function sendSupportTicket(formData) {
    try {
        // 1. جلب معلومات الزائر
        const { ipAddress, location } = await getVisitorInfo();

        // 2. تجميع البيانات
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

        // 3. إرسال البيانات لقاعدة البيانات
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

        // 4. 🔥 إرسال إشعار للـ Dashboard (مهم جداً)
        document.dispatchEvent(new CustomEvent('dashboard:new-ticket', {
            detail: completeData
        }));

        // 5. إرسال إشعار ثانٍ للـ Logs Engine
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
// 3️⃣ إرسال رسالة تواصل جديدة (المحادثات)                   */
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

        // إشعار للداشبورد
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
// 4️⃣ إرسال تبرع جديد                                          */
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
            // إشعار للداشبورد
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
// 5️⃣ دوال تحميل البيانات للموقع (GET)                       */
// ============================================================ */

// 5.1 تحميل المشاريع
// loadProjects();  ← علقها
// استخدم loadProjectsFromSupabase بدلاً منها
if (typeof loadProjectsFromSupabase === 'function') {
    loadProjectsFromSupabase();
}

// 5.2 تحميل المهارات
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

// 5.3 تحميل الشهادات
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

// 5.4 تحميل إعدادات الموقع
async function loadSettings() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=*`, { headers: supabaseHeaders });
        if (!res.ok) return;
        const settings = await res.json();
        
        if (settings.length > 0) {
            const data = settings[0];
            
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

// 5.5 تحميل بيانات التبرعات (للشاشة)
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

// 5.6 تحميل السوشيال ميديا
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

// 5.7 تحديث عداد النقرات على السوشيال ميديا
async function incrementSocialClick(id) {
    try {
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

// 5.8 تسجيل زوار الموقع
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

// ============================================================ */
// 6️⃣ ربط جميع النماذج في الموقع الرئيسي                     */
// ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    console.log('🚀 API - Initializing...');

    // تحميل البيانات
    loadProjects();
    loadSkills();
    loadCertificates();
    loadSettings();
    loadDonations();
    loadSocialMedia();
    trackVisitor();

    // ========================================================== */
    // 6.1 ربط نموذج التواصل (Contact Form)                      */
    // ========================================================== */
    
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "جاري الإرسال...";
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
                submitBtn.innerText = "إرسال";
            }
        });
    }

    // ========================================================== */
    // 6.2 ربط نموذج التبرعات (Donation Form)                    */
    // ========================================================== */
    
    const donationForm = document.getElementById("donationForm");
    if (donationForm) {
        donationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const submitBtn = donationForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "جاري الإرسال...";
            }
            
            const formData = {
                amount: donationForm.querySelector('[name="amount"]').value,
                platform: donationForm.querySelector('[name="platform"]').value || 'Vodafone Cash',
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
                submitBtn.innerText = "تبرع الآن";
            }
        });
    }

    // ========================================================== */
    // 6.3 🔥 ربط نموذج الدعم الفني (Support Form) - الأهم     */
    // ========================================================== */
    
    const supportForm = document.getElementById("supportForm");
    if (supportForm) {
        console.log('✅ Support form found, attaching listener...');
        
        supportForm.addEventListener("submit", async (e) => {
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
            
            // التحقق من الحقول
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
// 7️⃣ تصدير الدوال للاستخدام العالمي                         */
// ============================================================ */

// جعل الدوال متاحة في window للاستخدام من أي مكان
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

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 API - FULLY CONNECTED v2.0                            ║
║                                                              ║
║   ✅ Support Tickets - sendSupportTicket()                  ║
║   ✅ Contact Messages - sendContactMessage()                ║
║   ✅ Donations - sendDonation()                             ║
║   ✅ Load Projects - loadProjects()                         ║
║   ✅ Load Skills - loadSkills()                             ║
║   ✅ Load Certificates - loadCertificates()                 ║
║   ✅ Load Settings - loadSettings()                         ║
║   ✅ Load Donations - loadDonations()                       ║
║   ✅ Load Social Media - loadSocialMedia()                  ║
║                                                              ║
║   🔗 Connected to: ${SUPABASE_URL}                          ║
║   📡 Dashboard Events:                                      ║
║   • dashboard:new-ticket                                    ║
║   • dashboard:new-message                                   ║
║   • dashboard:donation-received                             ║
║   • dashboard:log                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);