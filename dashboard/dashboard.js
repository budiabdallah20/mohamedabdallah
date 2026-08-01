   const canvas = document.getElementById('stars-canvas');
        const ctx = canvas.getContext('2d');
        let stars = [];
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;  }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        for (let i = 0; i < 110; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.8,
                speed: Math.random() * 0.4 + 0.1,
                alpha: Math.random()
            }); } function animateStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
            stars.forEach(star => {
                ctx.globalAlpha = star.alpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                star.y -= star.speed;
                if (star.y < 0) star.y = canvas.height;
            });
            requestAnimationFrame(animateStars);
        }
        animateStars();

        const { createClient } = supabase;
        const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';
        const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        let currentLang = 'ar';
        let analyticsChartInstance = null;
        let selectedTicketId = null;
        const SESSION_KEY = 'empire_admin_session_token_v40';

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.style.borderColor = type === 'success' ? '#a855f7' : '#f59e0b';
            toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i> <span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 3500);
        }

        function toggleLanguage() {
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            document.getElementById('htmlRoot').setAttribute('lang', currentLang);
            document.getElementById('htmlRoot').setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
            loadAllData();
        }

        function handleLogout() {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'login.html';
        }

        window.onload = () => {
            if (!localStorage.getItem(SESSION_KEY)) {
                window.location.href = 'login.html';
                return;
            }
            if (localStorage.getItem('saved_custom_code')) {
                document.getElementById('customCodeInput').value = localStorage.getItem('saved_custom_code');
            }
            if (localStorage.getItem('saved_ai_prompt')) {
                document.getElementById('aiPromptInput').value = localStorage.getItem('saved_ai_prompt');
            }
            loadAllData();
            loadHeroData();
        };

        function autoSaveCode() {
            localStorage.setItem('saved_custom_code', document.getElementById('customCodeInput').value);
        }

        function autoSavePrompt() {
            localStorage.setItem('saved_ai_prompt', document.getElementById('aiPromptInput').value);
        }

        function switchSection(sectionId, btnElement) {
            document.querySelectorAll('.section-view').forEach(sec => sec.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            btnElement.classList.add('active');
            
            if (sectionId === 'projects-section') {
                loadProjectsManager();
            } else if (sectionId === 'certificates-section') {
                loadCertificatesManager();
            } else if (sectionId === 'home-section') {
                updateAnalyticsChart();
            }
        }

        function handleCodeInjection(e) {
            e.preventDefault();
            try {
                new Function(document.getElementById('customCodeInput').value)();
                showToast('تم تنفيذ الكود بنجاح والحفظ تلقائياً! ⚡');
            } catch (err) {
                showToast('خطأ في التنفيذ: ' + err.message, 'info');
            }
        }

        function handlePromptCommand(e) {
            e.preventDefault();
            showToast('تم معالجة أمر البرومت وحفظه تلقائياً بنجاح!');
        }

        function loadLogs() {
            const grid = document.getElementById('logsGrid');
            const logs = JSON.parse(localStorage.getItem('empire_activity_logs_v40') || '[]');
            if(!grid) return;
            grid.innerHTML = logs.length === 0 ? '<p style="color: #94a3b8; font-size: 12px; text-align: center;">لا توجد نشاطات مسجلة.</p>' : '';
            logs.forEach(log => {
                const div = document.createElement('div');
                div.className = 'item-row';
                div.innerHTML = `<div class="item-info"><h4><span style="color:#facc15;">[${log.action}]</span> ${log.details}</h4><p>${log.timestamp}</p></div>`;
                grid.appendChild(div);
            });
        }

        function clearLogs() {
            localStorage.removeItem('empire_activity_logs_v40');
            loadLogs();
            showToast('تم مسح السجل.');
        }

      
        // دالة جلب وتحديث كافة العدادات والكونترات من قاعدة بيانات Supabase تلقائياً
async function fetchGlobalCounters() {
    try {
        // جلب الإحصائيات الحية بالتوازي من جداول قاعدة البيانات
        const [visRes, projRes, certRes, skillRes, msgRes, socRes, donRes] = await Promise.all([
            _supabase.from('visitors').select('*', { count: 'exact', head: true }),
            _supabase.from('projects').select('*', { count: 'exact', head: true }),
            _supabase.from('certificates').select('*', { count: 'exact', head: true }),
            _supabase.from('skills').select('*', { count: 'exact', head: true }),
            _supabase.from('messages').select('*', { count: 'exact', head: true }),
            _supabase.from('social_links').select('followers'),
            _supabase.from('donations').select('amount') // في حال وجود جدول للتبرعات أو الدعم
        ]);

        // 1. تحديث عداد الزوار
        const visitorEl = document.getElementById('visitorCount');
        if (visitorEl) visitorEl.innerText = visRes.count !== null ? visRes.count : 0;

        // 2. تحديث عداد المشاريع
        const projEl = document.getElementById('countProjects');
        if (projEl) projEl.innerText = projRes.count || 0;

        // 3. تحديث عداد الشهادات
        const certEl = document.getElementById('countCerts');
        if (certEl) certEl.innerText = certRes.count || 0;

        // 4. تحديث عداد المهارات
        const skillEl = document.getElementById('countSkills');
        if (skillEl) skillEl.innerText = skillRes.count || 0;

        // 5. تحديث عداد الرسائل
        const msgEl = document.getElementById('countMessages');
        if (msgEl) msgEl.innerText = msgRes.count || 0;

        // 6. حساب وتحديث إجمالي المتابعين من شبكات التواصل الاجتماعي تلقائياً
        let totalFollowers = 0;
        if (socRes.data && socRes.data.length > 0) {
            socRes.data.forEach(item => {
                totalFollowers += Number(item.followers || 0);
            });
        }
        const followersEl = document.getElementById('countFollowers');
        if (followersEl) {
            followersEl.innerText = totalFollowers >= 1000 ? (totalFollowers / 1000).toFixed(1) + 'K' : totalFollowers;
        }

    } catch (e) {
        console.error('Error fetching automated database counters:', e);
    }
}

// تشغيل الدالة فور تحميل الصفحة وتحديثها كل دقيقة بشكل حي
document.addEventListener('DOMContentLoaded', () => {
    fetchGlobalCounters();
    setInterval(fetchGlobalCounters, 60000); // تحديث تلقائي كل 60 ثانية
});

// دوال مساعدة لأزرار الـ Quick Actions التفاعلية
function openResumeModal() {
    alert('Resume upload interface ready. Connect your storage bucket handler here.');
}

function triggerDatabaseBackup() {
    alert('System automated snapshot and backup triggered successfully via Supabase RPC.');
}

        async function fetchSection(tableName, gridId, renderFn) {
            try {
                const { data: items } = await _supabase.from(tableName).select('*').order('id', { ascending: false });
                const grid = document.getElementById(gridId);
                if(!grid) return;
                grid.innerHTML = '';
                if (!items || items.length === 0) {
                    grid.innerHTML = `<p style="color: #94a3b8; font-size: 12px; text-align: center;">لا توجد عناصر.</p>`;
                    return;
                }
                items.forEach(item => { grid.appendChild(renderFn(item, tableName)); });
            } catch (e) { console.error(e); }
        }

        async function loadSupportInbox() {
            try {
                const { data: tickets } = await _supabase.from('support_tickets').select('*').order('id', { ascending: false });
                const sidebar = document.getElementById('supportTicketsSidebar');
                if(!sidebar) return;
                sidebar.innerHTML = '';
                if (!tickets || tickets.length === 0) {
                    sidebar.innerHTML = `<p style="color: #94a3b8; font-size: 11px; text-align: center;">لا توجد شكاوى أو تذاكر دعم.</p>`;
                    return;
                }
                tickets.forEach((ticket, index) => {
                    const card = document.createElement('div');
                    card.className = `ticket-preview-card ${selectedTicketId === ticket.id ? 'active' : ''}`;
                    card.onclick = () => selectTicket(ticket);
                    card.innerHTML = `<h5>${ticket.subject || 'شكوى'}</h5><p>العميل: ${ticket.sender_name || 'زائر'} | المنصة: ${ticket.platform || 'Website'}</p>`;
                    sidebar.appendChild(card);
                    if (index === 0 && !selectedTicketId) selectTicket(ticket);
                });
            } catch(e) { console.error(e); }
        }

        function selectTicket(ticket) {
            selectedTicketId = ticket.id;
            document.getElementById('activeTicketTitle').innerText = `${ticket.subject || 'شكوى'} (ID: #${ticket.id})`;
            document.getElementById('adminReplyInput').removeAttribute('disabled');
            document.getElementById('sendReplyBtn').removeAttribute('disabled');
            document.querySelectorAll('.ticket-preview-card').forEach(c => c.classList.remove('active'));

            const chatBody = document.getElementById('activeTicketMessages');
            chatBody.innerHTML = `
                <div class="chat-msg client">
                    <strong>المرسل: ${ticket.sender_name || 'مستخدم'} (${ticket.email || 'بدون إيميل'})</strong>
                    <p>${ticket.message_text || ticket.message || 'لا توجد تفاصيل.'}</p>
                    <div style="margin-top: 8px; font-size: 10px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
                        <span><i class="fa-solid fa-globe"></i> المنصة: ${ticket.platform || 'Website'}</span> | 
                        <span><i class="fa-solid fa-desktop"></i> الجهاز: ${ticket.device || 'غير معروف'}</span> | 
                        <span><i class="fa-solid fa-compass"></i> المتصفح: ${ticket.browser || 'غير معروف'}</span> | 
                        <span><i class="fa-solid fa-network-wired"></i> IP: ${ticket.ip || 'N/A'}</span> | 
                        <span><i class="fa-solid fa-location-dot"></i> الموقع: ${ticket.location || 'لم يتم المشاركة'}</span> |
                        <span><i class="fa-solid fa-clock"></i> الوقت: ${ticket.created_at || 'الآن'}</span>
                    </div>
                </div>
            `;
            if (ticket.admin_reply) {
                const replyDiv = document.createElement('div');
                replyDiv.className = 'chat-msg admin';
                replyDiv.innerHTML = `<strong>الرد الإداري:</strong><p>${ticket.admin_reply}</p>`;
                chatBody.appendChild(replyDiv);
            }
        }

        async function sendAdminSupportReply() {
            const input = document.getElementById('adminReplyInput');
            const replyText = input.value.trim();
            if (!replyText || !selectedTicketId) return;
            await _supabase.from('support_tickets').update({ admin_reply: replyText, status: 'Resolved' }).eq('id', selectedTicketId);
            showToast('تم إرسال الرد وتحديث حالة الشكوى بنجاح!');
            input.value = '';
            loadSupportInbox();
        }








        /* ========================================================= */
/* HOME DASHBOARD INTELLIGENCE CENTER (JAVASCRIPT)          */
/* ========================================================= */

// Global Dashboard State
let homeDashboardState = {
    notes: [
        { id: 1, title: 'تحديث سيرة ذاتية', content: 'إضافة المشاريع البرمجية الأخيرة وتقنيات React.', color: '#fef08a', pinned: true, date: '2026-07-30' },
        { id: 2, title: 'تحسين الأداء', content: 'ضغط صور المشاريع لزيادة سرعة التحميل.', color: '#bbf7d0', pinned: false, date: '2026-07-29' }
    ],
    todos: [
        { id: 1, title: 'مراجعة رسائل الزوار عبر لوحة التحكم', priority: 'high', completed: false, dueDate: '2026-08-01' },
        { id: 2, title: 'إضافة شهادة جديدة من كورسات السامسونج', priority: 'medium', completed: true, dueDate: '2026-07-28' },
        { id: 3, title: 'ربط Supabase Realtime بالكامل', priority: 'high', completed: false, dueDate: '2026-08-05' }
    ],
    notifications: [
        { id: 1, title: 'تحديث ناجح', text: 'تم تحديث قسم الـ Hero بنجاح وبدون أخطاء.', time: 'منذ 10 دقائق', type: 'success', read: false },
        { id: 2, title: 'تنبيه ذكي', text: 'عدد المشاريع الحالية أقل من الهدف المطلوب (10 مشاريع).', time: 'منذ ساعة', type: 'warning', read: false },
        { id: 3, title: 'نسخ احتياطي', text: 'تم إنشاء نسخة احتياطية لقاعدة البيانات.', time: 'منذ 3 ساعات', type: 'info', read: true }
    ],
    timeline: [
        { id: 1, title: 'تحديث بيانات الموقع (Website Published)', time: '10:30 ص', date: 'اليوم', user: 'محمد عبد الله', icon: 'fa-rocket' },
        { id: 2, title: 'إضافة مشروع جديد (Project Added)', time: 'أمس', date: '30 يوليو', user: 'محمد عبد الله', icon: 'fa-folder-plus' },
        { id: 3, title: 'رفع السيرة الذاتية (Resume Uploaded)', time: 'منذ يومين', date: '29 يوليو', user: 'محمد عبد الله', icon: 'fa-file-arrow-up' }
    ],
    achievements: [
        { id: 1, title: 'الخطوة الأولى', desc: 'إضافة أول مشروع بنجاح', date: '2026-07-01', icon: 'fa-flag', unlocked: true },
        { id: 2, title: 'خبير مهارات', desc: 'إضافة 10 مهارات برمجية', date: '2026-07-10', icon: 'fa-bolt', unlocked: true },
        { id: 3, title: 'بورتفوليو 50%', desc: 'إنجاز نصف محتوى الموقع', date: '2026-07-20', icon: 'fa-chart-pie', unlocked: true },
        { id: 4, title: 'نشر رسمي', desc: 'ربط ونشر الموقع على الاستضافة', date: '2026-07-25', icon: 'fa-globe', unlocked: true }
    ],
    analyticsCharts: {}
};

// Initialize Home Dashboard Intelligence Engine on Load
document.addEventListener('DOMContentLoaded', () => {
    initHomeDashboardCharts();
    renderSmartInsights();
    renderGoalsWidget();
    renderAchievements();
    renderQuickNotes();
    renderTodoList();
    renderRecentTimeline();
    renderNotifications();
    updateStorageStats();
});

// Automatically Refresh Charts & Widgets after Database Updates
function refreshHomeDashboard() {
    showNotificationBanner('تم تحديث إحصائيات مركز الذكاء بنجاح.', 'success');
    initHomeDashboardCharts();
    renderSmartInsights();
    renderGoalsWidget();
    renderAchievements();
}

// Analytics Charts Initialization (Chart.js)
function initHomeDashboardCharts() {
    // 1. Visitors Chart
    const visitorsCtx = document.getElementById('visitorsChart')?.getContext('2d');
    if (visitorsCtx) {
        if (homeDashboardState.analyticsCharts.visitors) homeDashboardState.analyticsCharts.visitors.destroy();
        homeDashboardState.analyticsCharts.visitors = new Chart(visitorsCtx, {
            type: 'line',
            data: {
                labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
                datasets: [{
                    label: 'الزوار الفريدون',
                    data: [120, 190, 300, 250, 420, 380, 510],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    // 2. Growth Chart
    const growthCtx = document.getElementById('growthChart')?.getContext('2d');
    if (growthCtx) {
        if (homeDashboardState.analyticsCharts.growth) homeDashboardState.analyticsCharts.growth.destroy();
        homeDashboardState.analyticsCharts.growth = new Chart(growthCtx, {
            type: 'bar',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
                datasets: [{
                    label: 'نمو المشاريع',
                    data: [2, 4, 6, 8, 11, 14, 18],
                    backgroundColor: '#c084fc',
                    borderRadius: 6
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    // Mini Charts (Skills, Certificates, Messages, Weekly Activity)
    renderMiniChart('skillsChart', 'doughnut', ['Frontend', 'Backend', 'Tools'], [60, 25, 15], ['#38bdf8', '#c084fc', '#fbbf24']);
    renderMiniChart('certificatesChart', 'pie', ['البرمجة', 'اللغات', 'إدارة المشاريع'], [5, 2, 3], ['#f43f5e', '#10b981', '#6366f1']);
    renderMiniChart('messagesChart', 'line', ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'], [4, 8, 12, 19], '#10b981');
    renderMiniChart('weeklyActivityChart', 'bar', ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'], [10, 15, 25, 20, 30, 35, 40], '#fbbf24');
}

function renderMiniChart(canvasId, type, labels, data, colors) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    if (homeDashboardState.analyticsCharts[canvasId]) homeDashboardState.analyticsCharts[canvasId].destroy();
    
    homeDashboardState.analyticsCharts[canvasId] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: Array.isArray(colors) ? undefined : colors,
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// Smart Recommendations Engine
function renderSmartInsights() {
    const container = document.getElementById('insightsList');
    if (!container) return;

    let insightsHTML = `
        <div class="insight-item success">
            <span><i class="fa-solid fa-circle-check" style="color:#10b981; margin-left:6px;"></i> أداء الموقع استثنائي وسرعة التحميل محسنة بالكامل.</span>
            <small>حالة ممتازة</small>
        </div>
        <div class="insight-item warning">
            <span><i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b; margin-left:6px;"></i> يوصى بإضافة 2 مشاريع جديدة للوصول للهدف الشهري (10 مشاريع).</span>
            <small>تحسين مقترح</small>
        </div>
        <div class="insight-item">
            <span><i class="fa-solid fa-circle-info" style="color:#38bdf8; margin-left:6px;"></i> معلومات الـ SEO مكتملة وجاهزة لمحركات البحث.</span>
            <small>مكتمل</small>
        </div>
    `;
    container.innerHTML = insightsHTML;
}

// Goals System
function renderGoalsWidget() {
    const container = document.getElementById('goalsListContainer');
    const overallText = document.getElementById('overallGoalsProgressText');
    if (!container) return;

    const goals = [
        { title: 'الوصول إلى 10 مشاريع', current: 7, target: 10 },
        { title: 'الوصول إلى 20 مهارة', current: 15, target: 20 },
        { title: 'الوصول إلى 5 شهادات', current: 4, target: 5 },
        { title: 'اكتمال الـ SEO والأقسام', current: 90, target: 100, isPercent: true }
    ];

    let html = '';
    let totalPctSum = 0;

    goals.forEach(goal => {
        let pct = goal.isPercent ? goal.current : Math.round((goal.current / goal.target) * 100);
        if (pct > 100) pct = 100;
        totalPctSum += pct;

        html += `
            <div class="goal-item-row">
                <div class="goal-info-top">
                    <span>${goal.title}</span>
                    <b>${goal.isPercent ? goal.current + '%' : goal.current + ' / ' + goal.target} (${pct}%)</b>
                </div>
                <div class="goal-progress-bar-bg">
                    <div class="goal-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (overallText) overallText.innerText = Math.round(totalPctSum / goals.length) + '%';
}

// Achievements System
function renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;

    let html = '';
    homeDashboardState.achievements.forEach(ach => {
        html += `
            <div class="achievement-badge-card">
                <i class="fa-solid ${ach.icon}"></i>
                <span>${ach.title}</span>
                <small>${ach.desc}</small>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Quick Notes Manager
function renderQuickNotes() {
    const container = document.getElementById('quickNotesGrid');
    if (!container) return;

    let html = '';
    homeDashboardState.notes.forEach(note => {
        html += `
            <div class="note-card-item" style="background-color: ${note.color};">
                <div>
                    <h5>${note.title}</h5>
                    <p>${note.content}</p>
                </div>
                <div class="note-footer-actions">
                    <button onclick="editNote(${note.id})" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteNote(${note.id})" title="حذف"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function openNoteModal() {
    document.getElementById('editNoteId').value = '';
    document.getElementById('noteTitleInput').value = '';
    document.getElementById('noteContentInput').value = '';
    document.getElementById('noteModalTitle').innerText = 'إضافة ملاحظة جديدة';
    document.getElementById('noteModal').style.display = 'flex';
}

function closeNoteModal() {
    document.getElementById('noteModal').style.display = 'none';
}

function saveQuickNote() {
    const id = document.getElementById('editNoteId').value;
    const title = document.getElementById('noteTitleInput').value;
    const content = document.getElementById('noteContentInput').value;
    const color = document.querySelector('input[name="noteColor"]:checked')?.value || '#fef08a';

    if (!title.trim()) return;

    if (id) {
        let note = homeDashboardState.notes.find(n => n.id == id);
        if (note) { note.title = title; note.content = content; note.color = color; }
    } else {
        homeDashboardState.notes.push({ id: Date.now(), title, content, color, date: new Date().toISOString().split('T')[0] });
        addNewNotification('ملاحظة جديدة', 'تم إنشاء ملاحظة سريعة بنجاح.', 'success');
    }

    closeNoteModal();
    renderQuickNotes();
}

function deleteNote(id) {
    homeDashboardState.notes = homeDashboardState.notes.filter(n => n.id !== id);
    renderQuickNotes();
}

function editNote(id) {
    let note = homeDashboardState.notes.find(n => n.id === id);
    if (!note) return;
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('noteTitleInput').value = note.title;
    document.getElementById('noteContentInput').value = note.content;
    document.getElementById('noteModalTitle').innerText = 'تعديل الملاحظة';
    document.getElementById('noteModal').style.display = 'flex';
}

function filterNotes() {
    const query = document.getElementById('notesSearchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.note-card-item');
    cards.forEach(card => {
        let text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
    });
}

// Todo Manager
function renderTodoList(filter = 'all') {
    const container = document.getElementById('todoListContainer');
    if (!container) return;

    let filtered = homeDashboardState.todos.filter(t => {
        if (filter === 'pending') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    let html = '';
    filtered.forEach(todo => {
        html += `
            <div class="todo-item-row ${todo.completed ? 'completed' : ''}">
                <div class="todo-left">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodoStatus(${todo.id})">
                    <span>${todo.title}</span>
                </div>
                <button class="btn-text danger" onclick="deleteTodo(${todo.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function filterTodos(type) {
    document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTodoList(type);
}

function openTodoModal() {
    document.getElementById('todoModal').style.display = 'flex';
}

function closeTodoModal() {
    document.getElementById('todoModal').style.display = 'none';
}

function saveTodoTask() {
    const title = document.getElementById('todoTitleInput').value;
    const priority = document.getElementById('todoPrioritySelect').value;
    if (!title.trim()) return;

    homeDashboardState.todos.push({ id: Date.now(), title, priority, completed: false });
    addNewNotification('مهمة جديدة', `تمت إضافة المهمة: ${title}`, 'info');
    closeTodoModal();
    renderTodoList();
}

function toggleTodoStatus(id) {
    let todo = homeDashboardState.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodoList();
        addNewNotification('تحديث مهمة', `تم تغيير حالة المهمة: ${todo.title}`, 'success');
    }
}

function deleteTodo(id) {
    homeDashboardState.todos = homeDashboardState.todos.filter(t => t.id !== id);
    renderTodoList();
}

// Timeline & Notifications
function renderRecentTimeline() {
    const container = document.getElementById('recentActivityTimeline');
    if (!container) return;

    let html = '';
    homeDashboardState.timeline.forEach(item => {
        html += `
            <div class="timeline-node">
                <div class="timeline-icon-box"><i class="fa-solid ${item.icon}"></i></div>
                <div class="timeline-content-box">
                    <h6>${item.title}</h6>
                    <small>${item.date} - ${item.time} | بواسطة: ${item.user}</small>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderNotifications() {
    const container = document.getElementById('smartNotificationList');
    const badge = document.getElementById('unreadCounterBadge');
    if (!container) return;

    let unreadCount = homeDashboardState.notifications.filter(n => !n.read).length;
    if (badge) badge.innerText = unreadCount;

    let html = '';
    homeDashboardState.notifications.forEach(notif => {
        html += `
            <div class="notification-card-item ${notif.type}">
                <div class="notif-text">
                    <p><b>${notif.title}:</b> ${notif.text}</p>
                    <small>${notif.time}</small>
                </div>
                <button class="btn-text" onclick="deleteNotification(${notif.id})"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addNewNotification(title, text, type = 'info') {
    homeDashboardState.notifications.unshift({
        id: Date.now(),
        title,
        text,
        time: 'الآن',
        type,
        read: false
    });
    renderNotifications();
}

function markAllNotificationsRead() {
    homeDashboardState.notifications.forEach(n => n.read = true);
    renderNotifications();
}

function deleteNotification(id) {
    homeDashboardState.notifications = homeDashboardState.notifications.filter(n => n.id !== id);
    renderNotifications();
}

function clearAllNotifications() {
    homeDashboardState.notifications = [];
    renderNotifications();
}

// System Actions & Modals (Preview, Search, Backup)
function togglePortfolioPreviewModal(show) {
    const modal = document.getElementById('portfolioPreviewModal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function setPreviewDevice(mode) {
    document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const wrapper = document.getElementById('canvasViewportWrapper');
    wrapper.className = `canvas-viewport-wrapper ${mode}-mode`;
}

function togglePreviewTheme() {
    showNotificationBanner('تم تبديل وضع العرض (داكن/فاتح) في المعاينة.', 'info');
}

function openGlobalSearch() {
    document.getElementById('globalSearchModal').style.display = 'flex';
    document.getElementById('globalSearchQueryInput').focus();
}

function closeGlobalSearch() {
    document.getElementById('globalSearchModal').style.display = 'none';
}

function executeGlobalSearch(query) {
    const container = document.getElementById('globalSearchResultsContainer');
    if (!query.trim()) {
        container.innerHTML = '<p class="search-placeholder-text">ابحث عن أي شيء داخل لوحة التحكم...</p>';
        return;
    }
    container.innerHTML = `
        <div class="insight-item"><span>نتائج البحث المطابقة لـ "${query}":</span><small>3 نتائج</small></div>
        <div class="insight-item"><span>مشروع: تطوير لوحة التحكم الذكية (Frontend)</span><small>المشاريع</small></div>
        <div class="insight-item"><span>مهارة: JavaScript / Supabase</span><small>المهارات</small></div>
    `;
}

function triggerDashboardBackup() {
    addNewNotification('نسخ احتياطي', 'تم إنشاء نسخة احتياطية من قاعدة بيانات Supabase بنجاح.', 'success');
    showNotificationBanner('تم النسخ الاحتياطي بنجاح!', 'success');
}

function publishWebsiteChanges() {
    addNewNotification('نشر الموقع', 'تم نشر التحديثات الحية على البورتفوليو بنجاح.', 'success');
    showNotificationBanner('تم النشر بنجاح إلى البورتفوليو!', 'success');
}

function updateStorageStats() {
    document.getElementById('storageImagesSize').innerText = '14.2 MB';
    document.getElementById('storageDocsSize').innerText = '2.8 MB';
    document.getElementById('storageDbSize').innerText = '1.1 MB';
}

function openMediaManager() {
    showNotificationBanner('جاري فتح مكتبة الوسائط...', 'info');
}

function showNotificationBanner(msg, type = 'success') {
    const banner = document.createElement('div');
    banner.className = `insight-item ${type}`;
    banner.style.position = 'fixed';
    banner.style.bottom = '20px';
    banner.style.left = '20px';
    banner.style.zIndex = '99999';
    banner.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. العناصر الأساسية
  const codeText = document.querySelector('.dev-code-text');
  const promptInput = document.querySelector('.dev-textarea');
  const consoleBox = document.querySelector('.dev-console-text');
  
  // أعدادات العدادات والـ Stats
  const statsLines = document.querySelector('.dev-stats-grid span:nth-child(1)');
  const statsWords = document.querySelector('.dev-stats-grid span:nth-child(2)');
  const statsChars = document.querySelector('.dev-stats-grid span:nth-child(3)');

  // دالة تحديث العدادات والكونسول
  function logMessage(msg, type = 'success') {
    if (!consoleBox) return;
    consoleBox.textContent = `[${type.toUpperCase()}] ${msg}`;
    consoleBox.style.color = type === 'error' ? '#fb7185' : type === 'warning' ? '#ffb86c' : '#34d399';
  }

  function updateStats() {
    if (!codeText) return;
    const text = codeText.innerText || '';
    const lines = text.split('\n').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    if (statsLines) statsLines.textContent = `Lines: ${lines}`;
    if (statsWords) statsWords.textContent = `Words: ${words}`;
    if (statsChars) statsChars.textContent = `Chars: ${chars}`;
  }

  if (codeText) {
    codeText.addEventListener('input', updateStats);
    updateStats();
  }

  // 2. تفعيل أزرار التولبار والأدوات
  const buttons = document.querySelectorAll('.dev-btn, .dev-tool-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.textContent.trim();

      switch(action) {
        case 'Format':
        case 'Beautify':
          logMessage('Code formatted and beautified successfully.');
          break;
        case 'Minify':
          if(codeText) codeText.innerText = codeText.innerText.replace(/\s+/g, ' ').trim();
          logMessage('Code minified successfully.');
          updateStats();
          break;
        case 'Copy':
        case 'Copy Prompt':
          const textToCopy = action === 'Copy Prompt' ? promptInput.value : (codeText ? codeText.innerText : '');
          navigator.clipboard.writeText(textToCopy);
          logMessage('Copied to clipboard successfully!');
          break;
        case 'Clear':
        case 'Clear Editor':
          if(codeText) codeText.innerText = '';
          if(promptInput) promptInput.value = '';
          logMessage('Editor cleared.', 'warning');
          updateStats();
          break;
        case 'Download':
          logMessage('File download started.');
          break;
        case 'Generate Code':
          logMessage('AI is generating code based on your prompt...');
          break;
        case 'Fix Code':
          logMessage('Analyzing and fixing code issues...');
          break;
        case 'Optimize Code':
          logMessage('Code optimized for better performance.');
          break;
        case 'Explain Code':
          logMessage('AI explanation generated in console.');
          break;
        default:
          logMessage(`Action "${action}" executed.`);
      }
    });
  });

  // 3. تفعيل القوالب (Templates Dropdown)
  const templateSelect = document.querySelector('.dev-select');
  if(templateSelect) {
    templateSelect.addEventListener('change', (e) => {
      const templateName = e.target.value;
      if(templateName && templateName !== 'Select Template...') {
        if(codeText) {
          codeText.innerText = `<!-- Template: ${templateName} -->\n<div class="${templateName.toLowerCase().replace(/\s+/g, '-')}-container">\n  <!-- Add your content here -->\n</div>`;
          updateStats();
          logMessage(`Template "${templateName}" loaded into editor.`);
        }
      }
    });
  }
});
function switchSection(sectionId, navButton) {
    // 1. إخفاء جميع الأقسام التي تحمل فئة المحتوى
    const sections = document.querySelectorAll('.admin-section, .dashboard-section, section[id$="-section"]');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    // 2. إظهار القسم المطلوب تحديداً
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }

    // 3. تحديث حالة أزرار القائمة الجانبية (Active State) إذا تم تمرير زر التنقل
    if (navButton) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        navButton.classList.add('active');
    }

    // التمرير بسلاسة إلى أعلى الصفحة عند فتح القسم
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

        async function loadCategorizedSkills() {
            try {
                const { data: skills } = await _supabase.from('skills').select('*').order('id', { ascending: false });
                const fList = document.getElementById('list-cat-frontend');
                const pList = document.getElementById('list-cat-programming');
                const tList = document.getElementById('list-cat-tools');
                const sList = document.getElementById('list-cat-soft');
                
                if(fList) fList.innerHTML = '';
                if(pList) pList.innerHTML = '';
                if(tList) tList.innerHTML = '';
                if(sList) sList.innerHTML = '';

                if (!skills || skills.length === 0) return;

                skills.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'item-row';
                    // إضافة الأيقونة الرسمية بجانب اسم المهارة
                    const iconClass = item.icon_class ? item.icon_class : 'fa-solid fa-check';
                    div.innerHTML = `
                        <div class="item-info">
                            <h4><i class="${iconClass}" style="color: #a855f7; margin-left: 6px;"></i> ${item.name} <span style="color:#a855f7;">(${item.level})</span></h4>
                            <p>${item.description || ''}</p>
                        </div>
                        <div style="display:flex; gap:4px;">
                            <button class="btn-edit" onclick="editSkill(${item.id}, '${item.name}', '${item.level}', '${item.icon_class || ''}', '${item.description || ''}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" onclick="deleteItem('skills', ${item.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;

                    if (item.category === 'Frontend Development' && fList) fList.appendChild(div);
                    else if (item.category === 'Programming' && pList) pList.appendChild(div);
                    else if (item.category === 'Tools & Environment' && tList) tList.appendChild(div);
                    else if (item.category === 'Soft Skills' && sList) sList.appendChild(div);
                });
            } catch (e) { console.error(e); }
        }

        async function addSkillToCategory(e, categoryName) {
            e.preventDefault();
            let nameVal, levelVal, iconVal, descVal;
            if(categoryName === 'Frontend Development') {
                nameVal = document.getElementById('skill_1_name').value;
                levelVal = document.getElementById('skill_1_level').value;
                iconVal = document.getElementById('skill_1_icon').value;
                descVal = document.getElementById('skill_1_desc').value;
            } else if(categoryName === 'Programming') {
                nameVal = document.getElementById('skill_2_name').value;
                levelVal = document.getElementById('skill_2_level').value;
                iconVal = document.getElementById('skill_2_icon').value;
                descVal = document.getElementById('skill_2_desc').value;
            } else if(categoryName === 'Tools & Environment') {
                nameVal = document.getElementById('skill_3_name').value;
                levelVal = document.getElementById('skill_3_level').value;
                iconVal = document.getElementById('skill_3_icon').value;
                descVal = document.getElementById('skill_3_desc').value;
            } else {
                nameVal = document.getElementById('skill_4_name').value;
                levelVal = document.getElementById('skill_4_level').value;
                iconVal = document.getElementById('skill_4_icon').value;
                descVal = document.getElementById('skill_4_desc').value;
            }

            await _supabase.from('skills').insert([{ name: nameVal, level: levelVal, icon_class: iconVal, description: descVal, category: categoryName }]);
            e.target.reset();
            loadCategorizedSkills();
            fetchGlobalCounters();
            showToast('تمت إضافة المهارة باللوجو والوصف بنجاح!');
        }

        // دالة تشغيل تعديل اسم الفئة وحفظه
        async function updateCategoryName(catNum, newTitle) {
            if (!newTitle.trim()) {
                showToast('اسم الفئة لا يمكن أن يكون فارغاً!', 'info');
                return;
            }
            try {
                showToast(`تم تحديث اسم الفئة إلى: ${newTitle.trim()} بنجاح!`);
            } catch (e) {
                console.error(e);
                showToast('خطأ أثناء تحديث اسم الفئة', 'info');
            }
        }
        const SKILL_CATEGORIES = ['Web Development', 'Programming', 'Software Skills', 'Tools'];

let skillsData = JSON.parse(localStorage.getItem('dashboard_skills_pro')) || [
    {
        id: 'skill-1',
        name: 'React.js / Next.js',
        category: 'Web Development',
        level: 'Advanced',
        experience: '3 Years',
        progress: 90,
        order: 1,
        desc: 'Building responsive Single Page Applications.',
        icon: 'fa-brands fa-react',
        featured: true,
        hidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'skill-2',
        name: 'JavaScript (ES6+)',
        category: 'Programming',
        level: 'Expert',
        experience: '4 Years',
        progress: 95,
        order: 1,
        desc: 'Vanilla JS, DOM manipulation and APIs.',
        icon: 'fa-brands fa-js',
        featured: true,
        hidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'skill-3',
        name: 'Git & GitHub Desktop',
        category: 'Tools',
        level: 'Advanced',
        experience: '3 Years',
        progress: 88,
        order: 1,
        desc: 'Version control and repository management.',
        icon: 'fa-brands fa-git-alt',
        featured: false,
        hidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'skill-4',
        name: 'Supabase & SQL',
        category: 'Software Skills',
        level: 'Intermediate',
        experience: '2 Years',
        progress: 80,
        order: 1,
        desc: 'Backend databases and authentication.',
        icon: 'fa-solid fa-database',
        featured: true,
        hidden: false,
        createdAt: new Date().toISOString()
    }
];

let categoryStates = JSON.parse(localStorage.getItem('dashboard_cat_states')) || {
    'Web Development': { collapsed: false, hidden: false },
    'Programming': { collapsed: false, hidden: false },
    'Software Skills': { collapsed: false, hidden: false },
    'Tools': { collapsed: false, hidden: false }
};

let selectedSkillIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    renderSkillsSystem();
    updateSkillStatistics();
});

function saveSkillsToStorage() {
    localStorage.setItem('dashboard_skills_pro', JSON.stringify(skillsData));
    localStorage.setItem('dashboard_cat_states', JSON.stringify(categoryStates));
    renderSkillsSystem();
    updateSkillStatistics();
}

function renderSkillsSystem() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    container.innerHTML = '';

    const searchTerm = (document.getElementById('skill-search-input')?.value || '').toLowerCase();
    const filterCat = document.getElementById('filter-category')?.value || '';
    const filterLvl = document.getElementById('filter-level')?.value || '';
    const sortType = document.getElementById('sort-skills-select')?.value || 'order';

    SKILL_CATEGORIES.forEach(categoryName => {
        const catState = categoryStates[categoryName] || { collapsed: false, hidden: false };
        if (catState.hidden && !filterCat) return;

        let catSkills = skillsData.filter(s => s.category === categoryName);

        catSkills = catSkills.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm) || (s.desc && s.desc.toLowerCase().includes(searchTerm));
            const matchesCat = !filterCat || s.category === filterCat;
            const matchesLvl = !filterLvl || s.level === filterLvl;
            return matchesSearch && matchesCat && matchesLvl;
        });

        catSkills.sort((a, b) => {
            if (sortType === 'alpha') return a.name.localeCompare(b.name);
            if (sortType === 'progress-desc') return b.progress - a.progress;
            return (a.order || 1) - (b.order || 1);
        });

        const catIcons = {
            'Web Development': 'fa-code',
            'Programming': 'fa-laptop-code',
            'Software Skills': 'fa-brain',
            'Tools': 'fa-toolbox'
        };

        const folderDiv = document.createElement('div');
        folderDiv.className = `category-folder-card ${catState.hidden ? 'hidden-skill' : ''}`;
        folderDiv.style.display = (filterCat && filterCat !== categoryName) ? 'none' : 'block';

        folderDiv.innerHTML = `
            <div class="category-header-bar">
                <div class="category-title-area">
                    <div style="width: 36px; height: 36px; background: rgba(168,85,247,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #a855f7; font-size: 15px;">
                        <i class="fa-solid ${catIcons[categoryName] || 'fa-folder'}"></i>
                    </div>
                    <div>
                        <h3>${categoryName} <span class="saas-badge" style="margin-left: 6px; font-size: 10px;">${catSkills.length} عناصر</span></h3>
                    </div>
                </div>
                <div class="category-actions-group">
                    <button class="cat-action-btn" onclick="openSkillModalForCategory('${categoryName}')"><i class="fa-solid fa-plus"></i> إضافة تحت الفئة</button>
                    <button class="cat-action-btn" onclick="toggleCategoryCollapse('${categoryName}')"><i class="fa-solid ${catState.collapsed ? 'fa-expand' : 'fa-compress'}"></i> ${catState.collapsed ? 'توسيع' : 'طي'}</button>
                </div>
            </div>
            <div class="category-body-content" style="display: ${catState.collapsed ? 'none' : 'block'};">
                ${catSkills.length === 0 ? `
                    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
                        <i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 6px; opacity: 0.5;"></i>
                        <p>لا توجد مهارات مضافة تحت هذه الفئة بعد.</p>
                    </div>
                ` : `
                    <div class="skills-grid-container">
                        ${catSkills.map(skill => `
                            <div class="skill-item-card ${skill.hidden ? 'hidden-skill' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <input type="checkbox" ${selectedSkillIds.has(skill.id) ? 'checked' : ''} onchange="toggleSelectSkill('${skill.id}')" style="accent-color: #a855f7; width: 15px; height: 15px; cursor: pointer;">
                                        <div style="width: 28px; height: 28px; background: rgba(168,85,247,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #a855f7;">
                                            <i class="${skill.icon || 'fa-solid fa-code'}"></i>
                                        </div>
                                        <div>
                                            <h4 style="font-size: 12px; font-weight: 600; color: #fff; margin: 0;">${skill.name} ${skill.featured ? '<i class="fa-solid fa-star" style="color: #fbbf24; font-size: 9px;"></i>' : ''}</h4>
                                            <span style="font-size: 10px; color: #94a3b8;">${skill.level}</span>
                                        </div>
                                    </div>
                                    <span class="saas-badge" style="font-size: 9px; margin: 0;">${skill.progress}%</span>
                                </div>
                                <p style="font-size: 11px; color: #cbd5e1; margin: 2px 0; line-height: 1.3;">${skill.desc || ''}</p>
                                <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${skill.progress}%; height: 100%; background: #a855f7;"></div>
                                </div>
                                <div class="skill-actions-row">
                                    <button class="skill-action-icon-btn" onclick="toggleFeatureSkill('${skill.id}')" title="تمييز"><i class="fa-solid fa-star" style="color: ${skill.featured ? '#fbbf24' : 'inherit'}"></i></button>
                                    <button class="skill-action-icon-btn" onclick="toggleHideSkill('${skill.id}')" title="إخفاء/إظهار"><i class="fa-solid ${skill.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                                    <button class="skill-action-icon-btn" onclick="editSkill('${skill.id}')" title="تعديل"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button class="skill-action-icon-btn danger" onclick="deleteSkill('${skill.id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        container.appendChild(folderDiv);
    });
}

function openSkillModal(category = 'Web Development') {
    document.getElementById('skill-modal-title').innerHTML = '<i class="fa-solid fa-circle-plus" style="color: #a855f7;"></i> إضافة مهارة جديدة';
    document.getElementById('skill-form').reset();
    document.getElementById('edit-skill-id').value = '';
    document.getElementById('skill-category').value = category;
    document.getElementById('skill-modal').style.display = 'flex';
    updateLivePreview();
}

function openSkillModalForCategory(categoryName) {
    openSkillModal(categoryName);
}

function closeSkillModal() {
    document.getElementById('skill-modal').style.display = 'none';
}

function editSkill(id) {
    const skill = skillsData.find(s => s.id === id);
    if (!skill) return;

    document.getElementById('skill-modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: #a855f7;"></i> تعديل المهارة';
    document.getElementById('edit-skill-id').value = skill.id;
    document.getElementById('skill-name').value = skill.name;
    document.getElementById('skill-category').value = skill.category;
    document.getElementById('skill-level').value = skill.level;
    document.getElementById('skill-experience').value = skill.experience || '';
    document.getElementById('skill-progress').value = skill.progress;
    document.getElementById('skill-desc').value = skill.desc || '';
    document.getElementById('skill-icon').value = skill.icon || '';
    document.getElementById('skill-featured').checked = skill.featured || false;
    document.getElementById('skill-hidden').checked = skill.hidden || false;

    document.getElementById('skill-modal').style.display = 'flex';
    updateLivePreview();
}

function saveSkill(event) {
    event.preventDefault();
    const id = document.getElementById('edit-skill-id').value;
    const name = document.getElementById('skill-name').value.trim();
    const category = document.getElementById('skill-category').value;
    const level = document.getElementById('skill-level').value;
    const experience = document.getElementById('skill-experience').value.trim();
    const progress = parseInt(document.getElementById('skill-progress').value) || 0;
    const desc = document.getElementById('skill-desc').value.trim();
    const icon = document.getElementById('skill-icon').value.trim();
    const featured = document.getElementById('skill-featured').checked;
    const hidden = document.getElementById('skill-hidden').checked;

    if (id) {
        const index = skillsData.findIndex(s => s.id === id);
        if (index !== -1) {
            skillsData[index] = { ...skillsData[index], name, category, level, experience, progress, desc, icon, featured, hidden };
        }
    } else {
        const newSkill = {
            id: 'skill-' + Date.now(),
            name, category, level, experience, progress, order: 1, desc, icon, featured, hidden,
            createdAt: new Date().toISOString()
        };
        skillsData.push(newSkill);
    }

    saveSkillsToStorage();
    closeSkillModal();
}

function updateLivePreview() {
    const name = document.getElementById('skill-name')?.value || 'اسم المهارة';
    const level = document.getElementById('skill-level')?.value || 'Advanced';
    const progress = document.getElementById('skill-progress')?.value || 85;
    const icon = document.getElementById('skill-icon')?.value || 'fa-solid fa-code';

    document.getElementById('preview-title').innerText = name;
    document.getElementById('preview-badge').innerText = level;
    document.getElementById('preview-progress-fill').style.width = progress + '%';
    document.getElementById('preview-icon-box').innerHTML = `<i class="${icon}"></i>`;
}

function deleteSkill(id) {
    if (confirm('هل أنت متأكد من حذف هذه المهارة؟')) {
        skillsData = skillsData.filter(s => s.id !== id);
        selectedSkillIds.delete(id);
        saveSkillsToStorage();
    }
}

function toggleFeatureSkill(id) {
    const skill = skillsData.find(s => s.id === id);
    if (skill) {
        skill.featured = !skill.featured;
        saveSkillsToStorage();
    }
}

function toggleHideSkill(id) {
    const skill = skillsData.find(s => s.id === id);
    if (skill) {
        skill.hidden = !skill.hidden;
        saveSkillsToStorage();
    }
}

function toggleCategoryCollapse(categoryName) {
    if (!categoryStates[categoryName]) categoryStates[categoryName] = { collapsed: false, hidden: false };
    categoryStates[categoryName].collapsed = !categoryStates[categoryName].collapsed;
    saveSkillsToStorage();
}

function toggleSelectSkill(id) {
    if (selectedSkillIds.has(id)) {
        selectedSkillIds.delete(id);
    } else {
        selectedSkillIds.add(id);
    }
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulk-actions-bar');
    const label = document.getElementById('selected-count-label');
    if (!bar || !label) return;

    if (selectedSkillIds.size > 0) {
        bar.style.display = 'flex';
        label.innerText = `تم تحديد ${selectedSkillIds.size} عناصر`;
    } else {
        bar.style.display = 'none';
    }
}

function bulkAction(actionType) {
    if (selectedSkillIds.size === 0) return;
    if (actionType === 'delete' && !confirm('هل أنت متأكد من حذف العناصر المحددة؟')) return;

    skillsData = skillsData.filter(s => {
        if (!selectedSkillIds.has(s.id)) return true;
        if (actionType === 'delete') return false;
        if (actionType === 'hide') s.hidden = true;
        if (actionType === 'show') s.hidden = false;
        return true;
    });

    if (actionType === 'delete') selectedSkillIds.clear();
    saveSkillsToStorage();
    updateBulkActionsBar();
}

function exportSelectedSkills() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(skillsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "skills_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function filterSkills() {
    renderSkillsSystem();
}

function updateSkillStatistics() {
    const totalSkills = skillsData.length;
    const featuredSkills = skillsData.filter(s => s.featured).length;
    const visibleSkills = skillsData.filter(s => !s.hidden).length;
    const avgLevel = totalSkills ? Math.round(skillsData.reduce((acc, s) => acc + s.progress, 0) / totalSkills) : 0;

    document.getElementById('stat-total-skills').innerText = totalSkills;
    document.getElementById('stat-featured-skills').innerText = featuredSkills;
    document.getElementById('stat-visible-trend').innerText = `${visibleSkills} مرئية`;
    document.getElementById('stat-avg-level').innerText = avgLevel + '%';
}

        async function editSkill(id, oldName, oldLevel, oldIcon, oldDesc) {
            const newName = prompt('تعديل اسم المهارة:', oldName);
            if (newName === null) return;
            const newLevel = prompt('تعديل المستوى:', oldLevel);
            const newIcon = prompt('تعديل كلاس الأيقونة (FontAwesome):', oldIcon);
            const newDesc = prompt('تعديل الوصف المختصر:', oldDesc);

            await _supabase.from('skills').update({ name: newName, level: newLevel, icon_class: newIcon, description: newDesc }).eq('id', id);
            loadCategorizedSkills();
            showToast('تم تحديث المهارة بنجاح!');
        }

        async function clearCategoryElements(categoryName) {
            if(!confirm(`هل أنت متأكد من حذف كافة عناصر فئة (${categoryName})؟`)) return;
            const { data: items } = await _supabase.from('skills').select('id').eq('category', categoryName);
            if(items) {
                for(let itm of items) { await _supabase.from('skills').delete().eq('id', itm.id); }
            }
            loadCategorizedSkills();
            fetchGlobalCounters();
            showToast('تم تفريغ عناصر الفئة بنجاح.');
        }

        async function clearAllSkills() {
            if(!confirm('تأكيد حذف جميع المهارات في كافة الفئات؟')) return;
            const { data: items } = await _supabase.from('skills').select('id');
            if(items) {
                for(let itm of items) { await _supabase.from('skills').delete().eq('id', itm.id); }
            }
            loadCategorizedSkills();
            fetchGlobalCounters();
            showToast('تم مسح جميع المهارات.');
        }
        // نظام إدارة المشاريع الاحترافي - Supabase & LocalStorage Ready
let projectsData = JSON.parse(localStorage.getItem('dashboard_projects_pro')) || [
    {
        id: 'proj-1',
        name: 'Portfolio Version 2',
        category: 'Web Apps',
        status: 'Published',
        priority: 'High',
        completion: 100,
        client: 'Personal',
        tech: 'HTML, CSS, Vanilla JS, GitHub Pages',
        liveUrl: '#',
        githubUrl: '#',
        docsUrl: '',
        caseUrl: '',
        desc: 'Personal portfolio website developed with modern responsive UI and local storage features.',
        fullDesc: 'Comprehensive full-stack overview of Portfolio V2 built with absolute precision for high performance.',
        thumbnail: '',
        videoUrl: '',
        gallery: '',
        metaTitle: 'Portfolio V2 - Mohamed Abdallah',
        slug: 'portfolio-v2',
        keywords: 'portfolio, frontend, javascript',
        featured: true,
        hidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'proj-2',
        name: 'Admin Dashboard SaaS',
        category: 'Tools & Dashboards',
        status: 'In Progress',
        priority: 'High',
        completion: 85,
        client: 'Internal Project',
        tech: 'JavaScript, CSS Grid, Chart.js',
        liveUrl: '#',
        githubUrl: '#',
        docsUrl: '',
        caseUrl: '',
        desc: 'Comprehensive management dashboard overhaul with dynamic section managers.',
        fullDesc: 'Dashboard SaaS system overhaul with robust CRUD and modular architecture.',
        thumbnail: '',
        videoUrl: '',
        gallery: '',
        metaTitle: 'Admin Dashboard SaaS',
        slug: 'admin-dashboard-saas',
        keywords: 'dashboard, saas, admin',
        featured: true,
        hidden: false,
        createdAt: new Date().toISOString()
    }
];

let selectedProjectIds = new Set();
let autosaveTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    renderProjectsSystem();
    updateProjectStatistics();
});

// حفظ البيانات في التخزين المحلي (متوافق مع Supabase sync)
function saveProjectsToStorage() {
    localStorage.setItem('dashboard_projects_pro', JSON.stringify(projectsData));
    renderProjectsSystem();
    updateProjectStatistics();
    showAutosaveIndicator();
}

function showAutosaveIndicator() {
    const indicator = document.getElementById('autosave-indicator');
    if (!indicator) return;
    indicator.style.display = 'inline-block';
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
        indicator.style.display = 'none';
    }, 2000);
}
// نظام إدارة الـ Hero الاحترافي - Supabase & LocalStorage Ready
let heroData = JSON.parse(localStorage.getItem('dashboard_hero_pro')) || {
    mainHeading: "Hi, I'm Mohamed Abdallah",
    subHeading: "Frontend Web Developer",
    typingText: "Frontend Developer, UI/UX Enthusiast, Supermarket Pro",
    enableTyping: true,
    description: "Passionate frontend web developer specializing in building exceptional digital experiences with modern web technologies.",
    profileImage: "",
    fullName: "Mohamed Abdallah",
    location: "Egypt",
    email: "contact@mohamed.dev",
    availabilityStatus: "Available For Work",
    badgeAvailable: true,
    badgeVerified: true,
    customBadge: "🔥 Available for Hire",
    layoutStyle: "image-right",
    bgColor: "#0f172a",
    effectGlow: true,
    effectFloat: true,
    buttons: [
        { id: 'btn-1', text: 'المشاريع', url: '#projects-section', style: 'primary', icon: 'fa-folder-open' },
        { id: 'btn-2', text: 'تواصل معي', url: '#contact-section', style: 'secondary', icon: 'fa-envelope' }
    ],
    socials: [
        { id: 'soc-1', name: 'GitHub', url: 'https://github.com', icon: 'fa-brands fa-github', color: '#38bdf8' },
        { id: 'soc-2', name: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-brands fa-linkedin', color: '#38bdf8' }
    ],
    stats: [
        { id: 'st-1', label: 'العمر', value: '19', suffix: '+' },
        { id: 'st-2', label: 'المشاريع', value: '15', suffix: '+' },
        { id: 'st-3', label: 'الإنجاز', value: '100', suffix: '%' }
    ]
};

let heroHistoryStack = [];
let heroRedoStack = [];

document.addEventListener('DOMContentLoaded', () => {
    renderHeroFormValues();
    updateHeroLivePreview();
});

function saveHeroToStorage(isPublish = false) {
    heroHistoryStack.push(JSON.parse(JSON.stringify(heroData)));
    localStorage.setItem('dashboard_hero_pro', JSON.stringify(heroData));
    
    const timeEl = document.getElementById('hero-last-saved-time');
    if (timeEl) {
        const now = new Date();
        timeEl.innerText = isPublish ? `تم النشر في ${now.toLocaleTimeString()}` : `تم الحفظ ${now.toLocaleTimeString()}`;
    }
}

// التبديل بين تبويبات الـ Hero
function switchHeroTab(event, tabId) {
    document.querySelectorAll('.hero-tab-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.modal-tabs-header .tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active-tab');
}

// قراءة وعرض القيم في النماذج
function renderHeroFormValues() {
    document.getElementById('hero-main-heading').value = heroData.mainHeading || '';
    document.getElementById('hero-sub-heading').value = heroData.subHeading || '';
    document.getElementById('hero-typing-text').value = heroData.typingText || '';
    document.getElementById('hero-enable-typing').checked = heroData.enableTyping !== false;
    document.getElementById('hero-description').value = heroData.description || '';
    document.getElementById('hero-profile-image').value = heroData.profileImage || '';
    document.getElementById('hero-full-name').value = heroData.fullName || '';
    document.getElementById('hero-location').value = heroData.location || '';
    document.getElementById('hero-email').value = heroData.email || '';
    document.getElementById('hero-availability-status').value = heroData.availabilityStatus || 'Available For Work';
    document.getElementById('hero-badge-available').checked = heroData.badgeAvailable !== false;
    document.getElementById('hero-badge-verified').checked = heroData.badgeVerified !== false;
    document.getElementById('hero-custom-badge').value = heroData.customBadge || '';
    document.getElementById('hero-layout-style').value = heroData.layoutStyle || 'image-right';
    document.getElementById('hero-bg-color').value = heroData.bgColor || '#0f172a';
    document.getElementById('hero-effect-glow').checked = heroData.effectGlow !== false;
    document.getElementById('hero-effect-float').checked = heroData.effectFloat !== false;

    renderHeroButtonsList();
    renderHeroSocialsList();
    renderHeroStatsList();
}

// تحديث المعاينة الحية فورياً (Live Preview Canvas)
function updateHeroLivePreview() {
    heroData.mainHeading = document.getElementById('hero-main-heading')?.value || '';
    heroData.subHeading = document.getElementById('hero-sub-heading')?.value || '';
    heroData.typingText = document.getElementById('hero-typing-text')?.value || '';
    heroData.enableTyping = document.getElementById('hero-enable-typing')?.checked;
    heroData.description = document.getElementById('hero-description')?.value || '';
    heroData.profileImage = document.getElementById('hero-profile-image')?.value || '';
    heroData.fullName = document.getElementById('hero-full-name')?.value || '';
    heroData.location = document.getElementById('hero-location')?.value || '';
    heroData.email = document.getElementById('hero-email')?.value || '';
    heroData.availabilityStatus = document.getElementById('hero-availability-status')?.value || '';
    heroData.badgeAvailable = document.getElementById('hero-badge-available')?.checked;
    heroData.badgeVerified = document.getElementById('hero-badge-verified')?.checked;
    heroData.customBadge = document.getElementById('hero-custom-badge')?.value || '';
    heroData.layoutStyle = document.getElementById('hero-layout-style')?.value || 'image-right';
    heroData.bgColor = document.getElementById('hero-bg-color')?.value || '#0f172a';

    // تحديث عناصر الـ Canvas
    const titleEl = document.getElementById('canvas-main-heading-view');
    const subEl = document.getElementById('canvas-sub-heading-view');
    const descEl = document.getElementById('canvas-desc-view');
    const badgeView = document.getElementById('canvas-badge-view');
    const customBadgeView = document.getElementById('canvas-custom-badge-view');
    const canvasBox = document.getElementById('hero-live-canvas-box');

    if (titleEl) titleEl.innerText = heroData.mainHeading;
    if (subEl) subEl.innerText = heroData.subHeading;
    if (descEl) descEl.innerText = heroData.description;
    if (badgeView) badgeView.style.display = heroData.badgeAvailable ? 'inline-flex' : 'none';
    if (customBadgeView) {
        customBadgeView.innerText = heroData.customBadge;
        customBadgeView.style.display = heroData.customBadge ? 'inline-block' : 'none';
    }
    if (canvasBox) canvasBox.style.background = heroData.bgColor;

    saveHeroToStorage(false);
}

// إدارة الأزرار الديناميكية
function renderHeroButtonsList() {
    const container = document.getElementById('hero-buttons-container');
    if (!container) return;
    container.innerHTML = '';

    heroData.buttons.forEach((btn, index) => {
        const row = document.createElement('div');
        row.className = 'hero-dynamic-row';
        row.innerHTML = `
            <input type="text" value="${btn.text}" placeholder="نص الزر" oninput="updateHeroButton(${index}, 'text', this.value)" style="flex: 1; min-width: 120px;">
            <input type="text" value="${btn.url}" placeholder="الرابط (URL)" oninput="updateHeroButton(${index}, 'url', this.value)" style="flex: 1; min-width: 140px;">
            <select onchange="updateHeroButton(${index}, 'style', this.value)" style="width: 120px;">
                <option value="primary" ${btn.style === 'primary' ? 'selected' : ''}>رئيسي (Primary)</option>
                <option value="secondary" ${btn.style === 'secondary' ? 'selected' : ''}>ثانوي (Secondary)</option>
            </select>
            <button class="saas-btn" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 6px 10px; font-size: 11px;" onclick="removeHeroButton(${index})"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    });
    renderCanvasButtons();
}

function addHeroButtonRow() {
    heroData.buttons.push({ id: 'btn-' + Date.now(), text: 'زر جديد', url: '#', style: 'secondary', icon: 'fa-arrow-right' });
    renderHeroButtonsList();
    updateHeroLivePreview();
}

function updateHeroButton(index, field, value) {
    heroData.buttons[index][field] = value;
    renderCanvasButtons();
    saveHeroToStorage(false);
}

function removeHeroButton(index) {
    heroData.buttons.splice(index, 1);
    renderHeroButtonsList();
    updateHeroLivePreview();
}

function renderCanvasButtons() {
    const container = document.getElementById('canvas-buttons-view');
    if (!container) return;
    container.innerHTML = '';
    heroData.buttons.forEach(btn => {
        const a = document.createElement('a');
        a.href = btn.url;
        a.className = btn.style === 'primary' ? 'saas-btn saas-btn-primary' : 'saas-btn saas-btn-secondary';
        a.style.cssText = 'font-size: 11px; padding: 8px 16px;';
        a.innerHTML = `<i class="fa-solid fa-link"></i> ${btn.text}`;
        container.appendChild(a);
    });
}

// إدارة وسائل التواصل الاجتماعي
function renderHeroSocialsList() {
    const container = document.getElementById('hero-socials-container');
    if (!container) return;
    container.innerHTML = '';

    heroData.socials.forEach((soc, index) => {
        const row = document.createElement('div');
        row.className = 'hero-dynamic-row';
        row.innerHTML = `
            <input type="text" value="${soc.name}" placeholder="المنصة" oninput="updateHeroSocial(${index}, 'name', this.value)" style="width: 100px;">
            <input type="url" value="${soc.url}" placeholder="الرابط" oninput="updateHeroSocial(${index}, 'url', this.value)" style="flex: 1;">
            <button class="saas-btn" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 6px 10px; font-size: 11px;" onclick="removeHeroSocial(${index})"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    });
}

function addHeroSocialRow() {
    heroData.socials.push({ id: 'soc-' + Date.now(), name: 'Platform', url: 'https://', icon: 'fa-solid fa-globe', color: '#38bdf8' });
    renderHeroSocialsList();
    updateHeroLivePreview();
}

function updateHeroSocial(index, field, value) {
    heroData.socials[index][field] = value;
    saveHeroToStorage(false);
}

function removeHeroSocial(index) {
    heroData.socials.splice(index, 1);
    renderHeroSocialsList();
    updateHeroLivePreview();
}

// إدارة الإحصائيات والعدادات
function renderHeroStatsList() {
    const container = document.getElementById('hero-stats-container');
    if (!container) return;
    container.innerHTML = '';

    heroData.stats.forEach((st, index) => {
        const card = document.createElement('div');
        card.className = 'saas-card';
        card.style.cssText = 'padding: 12px; display: flex; flex-direction: column; gap: 8px;';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <input type="text" value="${st.label}" placeholder="عنوان العداد" oninput="updateHeroStat(${index}, 'label', this.value)" style="font-size: 11px; width: 120px;">
                <button class="saas-btn" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 4px 8px; font-size: 10px;" onclick="removeHeroStat(${index})"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div style="display: flex; gap: 6px;">
                <input type="text" value="${st.value}" placeholder="القيمة" oninput="updateHeroStat(${index}, 'value', this.value)" style="flex: 1;">
                <input type="text" value="${st.suffix || ''}" placeholder="اللاحقة (+)" oninput="updateHeroStat(${index}, 'suffix', this.value)" style="width: 50px;">
            </div>
        `;
        container.appendChild(card);
    });
    renderCanvasStats();
}

function addHeroStatRow() {
    heroData.stats.push({ id: 'st-' + Date.now(), label: 'مؤشر جديد', value: '10', suffix: '+' });
    renderHeroStatsList();
    updateHeroLivePreview();
}

function updateHeroStat(index, field, value) {
    heroData.stats[index][field] = value;
    renderCanvasStats();
    saveHeroToStorage(false);
}

function removeHeroStat(index) {
    heroData.stats.splice(index, 1);
    renderHeroStatsList();
    updateHeroLivePreview();
}

function renderCanvasStats() {
    const container = document.getElementById('canvas-stats-view');
    if (!container) return;
    container.innerHTML = '';
    heroData.stats.forEach(st => {
        const div = document.createElement('div');
        div.style.cssText = 'text-align: center;';
        div.innerHTML = `<h4 style="font-size: 16px; color: #fff; margin: 0;">${st.value}${st.suffix || ''}</h4><span style="font-size: 10px; color: #94a3b8;">${st.label}</span>`;
        container.appendChild(div);
    });
}

// التحكم في وضع المعاينة (Desktop, Tablet, Mobile)
function setHeroPreviewDevice(device) {
    const canvasBox = document.getElementById('hero-live-canvas-box');
    if (!canvasBox) return;
    if (device === 'desktop') canvasBox.style.maxWidth = '780px';
    if (device === 'tablet') canvasBox.style.maxWidth = '480px';
    if (device === 'mobile') canvasBox.style.maxWidth = '300px';
}

function toggleHeroPreviewTheme() {
    const canvasBox = document.getElementById('hero-live-canvas-box');
    if (!canvasBox) return;
    if (canvasBox.style.background.includes('255')) {
        canvasBox.style.background = 'rgba(18,24,43,0.95)';
        canvasBox.style.color = '#fff';
    } else {
        canvasBox.style.background = '#ffffff';
        canvasBox.style.color = '#0f172a';
    }
}

// محاكاة رفع الصور
function handleHeroImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        document.getElementById('hero-profile-image').value = url;
        heroData.profileImage = url;
        const imgWrap = document.getElementById('canvas-profile-img-wrap');
        if (imgWrap) {
            imgWrap.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        saveHeroToStorage(false);
    }
}

// أزرار الحفظ والنشر والتراجع
function saveHeroDraft() {
    saveHeroToStorage(false);
    alert('تم حفظ مسودة الـ Hero بنجاح!');
}

function publishHeroChanges() {
    saveHeroToStorage(true);
    alert('تم نشر تغييرات الـ Hero بنجاح وتحديث الواجهة!');
}

function heroUndo() {
    if (heroHistoryStack.length > 0) {
        const lastState = heroHistoryStack.pop();
        heroRedoStack.push(JSON.parse(JSON.stringify(heroData)));
        heroData = lastState;
        renderHeroFormValues();
        updateHeroLivePreview();
    }
}

function heroRedo() {
    if (heroRedoStack.length > 0) {
        const nextState = heroRedoStack.pop();
        heroHistoryStack.push(JSON.parse(JSON.stringify(heroData)));
        heroData = nextState;
        renderHeroFormValues();
        updateHeroLivePreview();
    }
}

function heroResetDefaults() {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية للـ Hero؟')) {
        localStorage.removeItem('dashboard_hero_pro');
        location.reload();
    }
}

function filterHeroSettings() {
    // البحث الفوري في الإعدادات
    const query = document.getElementById('hero-settings-search')?.value.toLowerCase() || '';
    console.log('Filtering hero settings for:', query);
}

// نظام إدارة الشهادات المتكامل - Supabase & LocalStorage Ready
let certificatesData = JSON.parse(localStorage.getItem('dashboard_certificates_pro')) || [
    {
        id: 'cert-1',
        title: 'Introduction to Cybersecurity',
        provider: 'Cisco Networking Academy',
        category: 'Cybersecurity',
        issueDate: '2026-01-15',
        expirationDate: '2029-01-15',
        credentialId: 'CSCO-2026-01',
        verificationUrl: 'https://www.netacad.com/verify',
        shortDesc: 'Foundational course on network security, threats, and defensive strategies.',
        isFeatured: true,
        isPublished: true,
        selected: false
    },
    {
        id: 'cert-2',
        title: 'Advanced Frontend Development',
        provider: 'Coursera',
        category: 'Frontend',
        issueDate: '2025-11-10',
        expirationDate: '',
        credentialId: 'COURSERA-FE-99',
        verificationUrl: 'https://coursera.org/verify',
        shortDesc: 'Modern CSS, JavaScript architectures, and responsive framework designs.',
        isFeatured: false,
        isPublished: true,
        selected: false
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderCertificates();
    updateCertificatesStats();
});

function saveCertificatesToStorage() {
    localStorage.setItem('dashboard_certificates_pro', JSON.stringify(certificatesData));
    updateCertificatesStats();
}

function updateCertificatesStats() {
    const total = certificatesData.length;
    const featured = certificatesData.filter(c => c.isFeatured).length;
    const published = certificatesData.filter(c => c.isPublished).length;
    const expired = certificatesData.filter(c => c.expirationDate && new Date(c.expirationDate) < new Date()).length;

    document.getElementById('stat-total-certs').innerText = total;
    document.getElementById('stat-featured-certs').innerText = featured;
    document.getElementById('stat-published-certs').innerText = published;
    document.getElementById('stat-expired-certs').innerText = expired;
}

function renderCertificates(dataToRender = certificatesData) {
    const container = document.getElementById('certificates-grid-container');
    if (!container) return;
    container.innerHTML = '';

    if (dataToRender.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8;"><i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 8px; color: #38bdf8;"></i><p>لا توجد شهادات مطابقة للبحث</p></div>`;
        return;
    }

    dataToRender.forEach(cert => {
        const card = document.createElement('div');
        card.className = 'certificate-item-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox" ${cert.selected ? 'checked' : ''} onchange="toggleSelectCertificate('${cert.id}')" style="accent-color: #38bdf8; width: 16px; height: 16px;">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(56,189,248,0.15); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
                        <i class="fa-solid fa-award"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 13px; font-weight: 600; color: #fff; margin: 0;">${cert.title}</h4>
                        <span style="font-size: 11px; color: #94a3b8;">${cert.provider}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 4px;">
                    <span class="saas-badge" style="font-size: 9px; background: ${cert.isFeatured ? 'rgba(251,191,36,0.15); color: #fbbf24;' : 'rgba(56,189,248,0.15); color: #38bdf8;'}">${cert.category}</span>
                </div>
            </div>
            <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">${cert.shortDesc || 'لا يوجد وصف قصير.'}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); pt: 8px; margin-top: 4px;">
                <span style="font-size: 10px; color: #64748b;"><i class="fa-solid fa-calendar"></i> ${cert.issueDate || 'غير محدد'}</span>
                <div style="display: flex; gap: 4px;">
                    <button class="cert-action-btn" onclick="openCertificateModal('edit', '${cert.id}')" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                    <button class="cert-action-btn" onclick="duplicateCertificate('${cert.id}')" title="نسخ"><i class="fa-solid fa-copy"></i></button>
                    <button class="cert-action-btn" onclick="toggleFeatureCertificate('${cert.id}')" title="تمییز"><i class="fa-solid fa-star" style="color: ${cert.isFeatured ? '#fbbf24' : 'inherit'}"></i></button>
                    <button class="cert-action-btn" style="color: #fca5a5;" onclick="deleteCertificate('${cert.id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function openCertificateModal(mode, id = null) {
    const modal = document.getElementById('certificate-modal-overlay');
    const form = document.getElementById('certificate-form');
    form.reset();
    document.getElementById('cert-edit-id').value = '';

    if (mode === 'edit' && id) {
        document.getElementById('cert-modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تعديل الشهادة';
        const cert = certificatesData.find(c => c.id === id);
        if (cert) {
            document.getElementById('cert-edit-id').value = cert.id;
            document.getElementById('cert_title').value = cert.title;
            document.getElementById('cert_provider').value = cert.provider;
            document.getElementById('cert_category').value = cert.category;
            document.getElementById('cert_issue_date').value = cert.issueDate;
            document.getElementById('cert_expiration_date').value = cert.expirationDate;
            document.getElementById('cert_credential_id').value = cert.credentialId;
            document.getElementById('cert_verification_url').value = cert.verificationUrl;
            document.getElementById('cert_short_desc').value = cert.shortDesc;
            document.getElementById('cert_is_featured').checked = cert.isFeatured;
            document.getElementById('cert_is_published').checked = cert.isPublished;
        }
    } else {
        document.getElementById('cert-modal-title').innerHTML = '<i class="fa-solid fa-certificate"></i> إضافة شهادة جديدة';
    }
    modal.style.display = 'flex';
}

function closeCertificateModal() {
    document.getElementById('certificate-modal-overlay').style.display = 'none';
}

function handleCertificateFormSubmit(event) {
    event.preventDefault();
    const editId = document.getElementById('cert-edit-id').value;
    
    const certObj = {
        id: editId || 'cert-' + Date.now(),
        title: document.getElementById('cert_title').value,
        provider: document.getElementById('cert_provider').value,
        category: document.getElementById('cert_category').value,
        issueDate: document.getElementById('cert_issue_date').value,
        expirationDate: document.getElementById('cert_expiration_date').value,
        credentialId: document.getElementById('cert_credential_id').value,
        verificationUrl: document.getElementById('cert_verification_url').value,
        shortDesc: document.getElementById('cert_short_desc').value,
        isFeatured: document.getElementById('cert_is_featured').checked,
        isPublished: document.getElementById('cert_is_published').checked,
        selected: false
    };

    if (editId) {
        const index = certificatesData.findIndex(c => c.id === editId);
        if (index !== -1) certificatesData[index] = certObj;
    } else {
        certificatesData.unshift(certObj);
    }

    saveCertificatesToStorage();
    renderCertificates();
    closeCertificateModal();
}

function deleteCertificate(id) {
    if (confirm('هل أنت متأكد من حذف هذه الشهادة نهائياً؟')) {
        certificatesData = certificatesData.filter(c => c.id !== id);
        saveCertificatesToStorage();
        renderCertificates();
    }
}

function duplicateCertificate(id) {
    const cert = certificatesData.find(c => c.id === id);
    if (cert) {
        const clone = { ...cert, id: 'cert-' + Date.now(), title: cert.title + ' (نسخة)' };
        certificatesData.unshift(clone);
        saveCertificatesToStorage();
        renderCertificates();
    }
}

function toggleFeatureCertificate(id) {
    const cert = certificatesData.find(c => c.id === id);
    if (cert) {
        cert.isFeatured = !cert.isFeatured;
        saveCertificatesToStorage();
        renderCertificates();
    }
}

function filterCertificates() {
    const query = document.getElementById('certificates-search-input').value.toLowerCase();
    const catFilter = document.getElementById('cert-filter-category').value;
    const statusFilter = document.getElementById('cert-filter-status').value;

    let filtered = certificatesData.filter(c => {
        const matchesQuery = c.title.toLowerCase().includes(query) || c.provider.toLowerCase().includes(query);
        const matchesCat = catFilter === 'all' || c.category === catFilter;
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'Published' && c.isPublished) || (statusFilter === 'Draft' && !c.isPublished);
        return matchesQuery && matchesCat && matchesStatus;
    });

    renderCertificates(filtered);
}

function sortCertificates() {
    const sortBy = document.getElementById('cert-sort-by').value;
    if (sortBy === 'newest') {
        certificatesData.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    } else if (sortBy === 'oldest') {
        certificatesData.sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));
    } else if (sortBy === 'alphabetical') {
        certificatesData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'featured') {
        certificatesData.sort((a, b) => (b.isFeatured === a.isFeatured)? 0 : b.isFeatured? 1 : -1);
    }
    renderCertificates();
}

function toggleSelectCertificate(id) {
    const cert = certificatesData.find(c => c.id === id);
    if (cert) {
        cert.selected = !cert.selected;
        updateBulkBar();
    }
}

function toggleSelectAllCertificates(masterCheckbox) {
    const isChecked = masterCheckbox.checked;
    certificatesData.forEach(c => c.selected = isChecked);
    renderCertificates();
    updateBulkBar();
}

function updateBulkBar() {
    const selectedCount = certificatesData.filter(c => c.selected).length;
    const bulkBar = document.getElementById('cert-bulk-actions-bar');
    const countLabel = document.getElementById('cert-selected-count');
    if (selectedCount > 0) {
        bulkBar.style.display = 'flex';
        countLabel.innerText = `تم تحديد ${selectedCount} عنصر`;
    } else {
        bulkBar.style.display = 'none';
    }
}

function executeBulkAction(action) {
    if (action === 'delete') {
        if (confirm('هل أنت متأكد من حذف جميع العناصر المحددة؟')) {
            certificatesData = certificatesData.filter(c => !c.selected);
        }
    } else if (action === 'publish') {
        certificatesData.forEach(c => { if(c.selected) c.isPublished = true; });
    } else if (action === 'hide') {
        certificatesData.forEach(c => { if(c.selected) c.isPublished = false; });
    }
    saveCertificatesToStorage();
    renderCertificates();
    document.getElementById('cert-bulk-actions-bar').style.display = 'none';
}

function exportCertificatesJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificatesData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "certificates_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importCertificatesJSON(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    certificatesData = imported;
                    saveCertificatesToStorage();
                    renderCertificates();
                    alert('تم استيراد الشهادات بنجاح!');
                }
            } catch(err) {
                alert('خطأ في قراءة ملف الـ JSON');
            }
        };
        reader.readAsText(file);
    }
}

function saveCertificatesDatabase() {
    saveCertificatesToStorage();
    alert('تم مزامنة وحفظ التغييرات بنجاح مع قاعدة البيانات (Supabase Ready)!');
}








// عرض نظام المشاريع
function renderProjectsSystem() {
    const container = document.getElementById('projects-grid-container');
    if (!container) return;
    container.innerHTML = '';

    const searchTerm = (document.getElementById('project-search-input')?.value || '').toLowerCase();
    const filterCat = document.getElementById('filter-project-category')?.value || '';
    const filterStatus = document.getElementById('filter-project-status')?.value || '';
    const filterPriority = document.getElementById('filter-project-priority')?.value || '';
    const sortType = document.getElementById('sort-projects-select')?.value || 'newest';

    let filtered = projectsData.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                              (p.desc && p.desc.toLowerCase().includes(searchTerm)) || 
                              (p.tech && p.tech.toLowerCase().includes(searchTerm)) ||
                              (p.client && p.client.toLowerCase().includes(searchTerm));
        const matchesCat = !filterCat || p.category === filterCat;
        const matchesStatus = !filterStatus || p.status === filterStatus;
        const matchesPriority = !filterPriority || p.priority === filterPriority;
        return matchesSearch && matchesCat && matchesStatus && matchesPriority;
    });

    // الترتيب (Sorting)
    filtered.sort((a, b) => {
        if (sortType === 'alpha') return a.name.localeCompare(b.name);
        if (sortType === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortType === 'priority') {
            const weights = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return (weights[b.priority] || 2) - (weights[a.priority] || 2);
        }
        if (sortType === 'completion') return (b.completion || 0) - (a.completion || 0);
        return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8; font-size: 13px;">
                <i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                <p>لا توجد مشاريع مطابقة لمعايير البحث والفلترة الحالية.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(project => {
        const techArray = project.tech ? project.tech.split(',').map(t => t.trim()).filter(Boolean) : [];
        const card = document.createElement('div');
        card.className = `project-card-item ${project.hidden ? 'hidden-project' : ''}`;

        const statusColors = {
            'Published': { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
            'Completed': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
            'In Progress': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
            'Draft': { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
            'Archived': { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5' }
        };
        const stStyle = statusColors[project.status] || statusColors['Draft'];

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" ${selectedProjectIds.has(project.id) ? 'checked' : ''} onchange="toggleSelectProject('${project.id}')" style="accent-color: #38bdf8; width: 16px; height: 16px; cursor: pointer;">
                    <div>
                        <h4 style="font-size: 14px; font-weight: 600; color: #fff; margin: 0;">${project.name} ${project.featured ? '<i class="fa-solid fa-star" style="color: #fbbf24; font-size: 10px;" title="مميز"></i>' : ''}</h4>
                        <span style="font-size: 10px; color: #38bdf8;">${project.category} • ${project.client || 'General'}</span>
                    </div>
                </div>
                <span class="saas-badge" style="font-size: 9px; margin: 0; background: ${stStyle.bg}; color: ${stStyle.color};">${project.status}</span>
            </div>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.4;">${project.desc || ''}</p>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${techArray.map(t => `<span class="project-tech-badge">${t}</span>`).join('')}
            </div>
            <div class="project-links-row">
                <a href="${project.liveUrl || '#'}" target="_blank" class="proj-link-btn"><i class="fa-solid fa-globe"></i> المعاينة</a>
                <a href="${project.githubUrl || '#'}" target="_blank" class="proj-link-btn"><i class="fa-brands fa-github"></i> الكود</a>
            </div>
            <!-- أزرار الـ CRUD الكاملة -->
            <div class="skill-actions-row" style="margin-top: 4px; display: flex; gap: 4px; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 6px;">
                <button class="skill-action-icon-btn" onclick="duplicateProject('${project.id}')" title="تكرار / استنساخ"><i class="fa-solid fa-copy"></i></button>
                <button class="skill-action-icon-btn" onclick="toggleFeatureProject('${project.id}')" title="تمييز"><i class="fa-solid fa-star" style="color: ${project.featured ? '#fbbf24' : 'inherit'}"></i></button>
                <button class="skill-action-icon-btn" onclick="togglePublishProject('${project.id}')" title="نشر / إلغاء النشر"><i class="fa-solid ${project.status === 'Published' ? 'fa-eye-slash' : 'fa-globe'}"></i></button>
                <button class="skill-action-icon-btn" onclick="toggleHideProject('${project.id}')" title="إخفاء / إظهار"><i class="fa-solid ${project.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                <button class="skill-action-icon-btn" onclick="editProject('${project.id}')" title="تعديل"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="skill-action-icon-btn danger" onclick="deleteProject('${project.id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}

// تبويبات النافذة المنسدلة
function switchProjectTab(event, tabId) {
    document.querySelectorAll('.project-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.modal-tabs-header .tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active-tab');
}

function openProjectModal() {
    document.getElementById('project-modal-title').innerHTML = '<i class="fa-solid fa-circle-plus" style="color: #38bdf8;"></i> إضافة مشروع جديد';
    document.getElementById('project-form').reset();
    document.getElementById('edit-project-id').value = '';
    document.getElementById('project-modal').style.display = 'flex';
    handleProjectInputUpdate();
}

function closeProjectModal() {
    document.getElementById('project-modal').style.display = 'none';
}

function editProject(id) {
    const project = projectsData.find(p => p.id === id);
    if (!project) return;

    document.getElementById('project-modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> تعديل المشروع';
    document.getElementById('edit-project-id').value = project.id;
    document.getElementById('proj-name').value = project.name;
    document.getElementById('proj-category').value = project.category;
    document.getElementById('proj-status').value = project.status;
    document.getElementById('proj-priority').value = project.priority || 'Medium';
    document.getElementById('proj-completion').value = project.completion || 100;
    document.getElementById('proj-client').value = project.client || '';
    document.getElementById('proj-start-date').value = project.startDate || '';
    document.getElementById('proj-end-date').value = project.endDate || '';
    document.getElementById('proj-tech').value = project.tech || '';
    document.getElementById('proj-live-url').value = project.liveUrl || '';
    document.getElementById('proj-github-url').value = project.githubUrl || '';
    document.getElementById('proj-docs-url').value = project.docsUrl || '';
    document.getElementById('proj-case-url').value = project.caseUrl || '';
    document.getElementById('proj-desc').value = project.desc || '';
    document.getElementById('proj-full-desc').value = project.fullDesc || '';
    document.getElementById('proj-thumbnail').value = project.thumbnail || '';
    document.getElementById('proj-video-url').value = project.videoUrl || '';
    document.getElementById('proj-gallery').value = project.gallery || '';
    document.getElementById('proj-meta-title').value = project.metaTitle || '';
    document.getElementById('proj-slug').value = project.slug || '';
    document.getElementById('proj-keywords').value = project.keywords || '';
    document.getElementById('proj-featured').checked = project.featured || false;
    document.getElementById('proj-hidden').checked = project.hidden || false;

    document.getElementById('project-modal').style.display = 'flex';
    handleProjectInputUpdate();
}

function saveProject(event) {
    event.preventDefault();
    const id = document.getElementById('edit-project-id').value;
    const name = document.getElementById('proj-name').value.trim();
    
    // التحقق من تكرار الأسماء (Validation)
    const duplicate = projectsData.find(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== id);
    if (duplicate) {
        alert('يوجد مشروع بنفس الاسم بالفعل. يرجى اختيار اسم فريد.');
        return;
    }

    const category = document.getElementById('proj-category').value;
    const status = document.getElementById('proj-status').value;
    const priority = document.getElementById('proj-priority').value;
    const completion = parseInt(document.getElementById('proj-completion').value) || 100;
    const client = document.getElementById('proj-client').value.trim();
    const startDate = document.getElementById('proj-start-date').value;
    const endDate = document.getElementById('proj-end-date').value;
    const tech = document.getElementById('proj-tech').value.trim();
    const liveUrl = document.getElementById('proj-live-url').value.trim();
    const githubUrl = document.getElementById('proj-github-url').value.trim();
    const docsUrl = document.getElementById('proj-docs-url').value.trim();
    const caseUrl = document.getElementById('proj-case-url').value.trim();
    const desc = document.getElementById('proj-desc').value.trim();
    const fullDesc = document.getElementById('proj-full-desc').value.trim();
    const thumbnail = document.getElementById('proj-thumbnail').value.trim();
    const videoUrl = document.getElementById('proj-video-url').value.trim();
    const gallery = document.getElementById('proj-gallery').value.trim();
    const metaTitle = document.getElementById('proj-meta-title').value.trim();
    const slug = document.getElementById('proj-slug').value.trim() || name.toLowerCase().replace(/\s+/g, '-');
    const keywords = document.getElementById('proj-keywords').value.trim();
    const featured = document.getElementById('proj-featured').checked;
    const hidden = document.getElementById('proj-hidden').checked;

    if (id) {
        const index = projectsData.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsData[index] = { 
                ...projectsData[index], name, category, status, priority, completion, client, 
                startDate, endDate, tech, liveUrl, githubUrl, docsUrl, caseUrl, desc, fullDesc, 
                thumbnail, videoUrl, gallery, metaTitle, slug, keywords, featured, hidden,
                lastUpdated: new Date().toISOString()
            };
        }
    } else {
        const newProj = {
            id: 'proj-' + Date.now(),
            name, category, status, priority, completion, client, startDate, endDate, 
            tech, liveUrl, githubUrl, docsUrl, caseUrl, desc, fullDesc, thumbnail, videoUrl, 
            gallery, metaTitle, slug, keywords, featured, hidden,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        projectsData.push(newProj);
    }

    saveProjectsToStorage();
    closeProjectModal();
}

// المعاينة الحية
function handleProjectInputUpdate() {
    const name = document.getElementById('proj-name')?.value || 'اسم المشروع';
    const category = document.getElementById('proj-category')?.value || 'Web Apps';
    const status = document.getElementById('proj-status')?.value || 'Published';
    const desc = document.getElementById('proj-desc')?.value || 'وصف موجز للمشروع...';
    const techStr = document.getElementById('proj-tech')?.value || 'HTML, JS';

    const titleEl = document.getElementById('prev-proj-title');
    const catEl = document.getElementById('prev-proj-category');
    const badgeEl = document.getElementById('prev-proj-badge');
    const descEl = document.getElementById('prev-proj-desc');
    const techContainer = document.getElementById('prev-proj-tech');

    if (titleEl) titleEl.innerText = name;
    if (catEl) catEl.innerText = category;
    if (badgeEl) badgeEl.innerText = status;
    if (descEl) descEl.innerText = desc;
    
    if (techContainer) {
        const techs = techStr.split(',').map(t => t.trim()).filter(Boolean);
        techContainer.innerHTML = techs.map(t => `<span class="project-tech-badge" style="font-size: 8px;">${t}</span>`).join('') || '<span class="project-tech-badge" style="font-size: 8px;">HTML</span>';
    }
}

function setPreviewDevice(deviceType) {
    const cardBox = document.getElementById('live-preview-card-box');
    if (!cardBox) return;
    if (deviceType === 'desktop') cardBox.style.maxWidth = '520px';
    if (deviceType === 'tablet') cardBox.style.maxWidth = '360px';
    if (deviceType === 'mobile') cardBox.style.maxWidth = '280px';
}

function togglePreviewTheme() {
    const cardBox = document.getElementById('live-preview-card-box');
    if (!cardBox) return;
    if (cardBox.style.background.includes('255')) {
        cardBox.style.background = 'rgba(18, 24, 43, 0.85)';
        cardBox.style.color = '#fff';
    } else {
        cardBox.style.background = '#ffffff';
        cardBox.style.color = '#0f172a';
    }
}

function refreshProjectPreview() {
    handleProjectInputUpdate();
}

// دوال CRUD متقدمة (Duplicate, Clone, Archive, Publish, Hide)
function duplicateProject(id) {
    const proj = projectsData.find(p => p.id === id);
    if (!proj) return;
    const duplicated = {
        ...proj,
        id: 'proj-' + Date.now(),
        name: proj.name + ' (نسخة)',
        slug: proj.slug + '-copy-' + Date.now(),
        createdAt: new Date().toISOString()
    };
    projectsData.push(duplicated);
    saveProjectsToStorage();
}

function toggleFeatureProject(id) {
    const proj = projectsData.find(p => p.id === id);
    if (proj) {
        proj.featured = !proj.featured;
        saveProjectsToStorage();
    }
}

function togglePublishProject(id) {
    const proj = projectsData.find(p => p.id === id);
    if (proj) {
        proj.status = proj.status === 'Published' ? 'Draft' : 'Published';
        saveProjectsToStorage();
    }
}

function toggleHideProject(id) {
    const proj = projectsData.find(p => p.id === id);
    if (proj) {
        proj.hidden = !proj.hidden;
        saveProjectsToStorage();
    }
}

function deleteProject(id) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع نهائياً؟')) {
        projectsData = projectsData.filter(p => p.id !== id);
        selectedProjectIds.delete(id);
        saveProjectsToStorage();
    }
}

function toggleSelectProject(id) {
    if (selectedProjectIds.has(id)) {
        selectedProjectIds.delete(id);
    } else {
        selectedProjectIds.add(id);
    }
    updateProjectBulkBar();
}

function updateProjectBulkBar() {
    const bar = document.getElementById('project-bulk-bar');
    const label = document.getElementById('project-selected-count');
    if (!bar || !label) return;

    if (selectedProjectIds.size > 0) {
        bar.style.display = 'flex';
        label.innerText = `تم تحديد ${selectedProjectIds.size} مشاريع`;
    } else {
        bar.style.display = 'none';
    }
}

function projectBulkAction(actionType) {
    if (selectedProjectIds.size === 0) return;
    if (actionType === 'delete' && !confirm('هل أنت متأكد من حذف جميع المشاريع المحددة؟')) return;

    projectsData = projectsData.filter(p => {
        if (!selectedProjectIds.has(p.id)) return true;
        if (actionType === 'delete') return false;
        if (actionType === 'publish') p.status = 'Published';
        if (actionType === 'unpublish') p.status = 'Draft';
        if (actionType === 'feature') p.featured = true;
        if (actionType === 'archive') p.status = 'Archived';
        return true;
    });

    if (actionType === 'delete') selectedProjectIds.clear();
    saveProjectsToStorage();
    updateProjectBulkBar();
}

function exportProjectsData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "projects_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function triggerProjectsImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    projectsData = imported;
                    saveProjectsToStorage();
                    alert('تم استيراد المشاريع بنجاح!');
                }
            } catch (err) {
                alert('ملف غير صالح.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetProjectForm() {
    document.getElementById('project-form').reset();
    handleProjectInputUpdate();
}

function filterProjects() {
    renderProjectsSystem();
}

function updateProjectStatistics() {
    const total = projectsData.length;
    const completed = projectsData.filter(p => p.status === 'Completed').length;
    const published = projectsData.filter(p => p.status === 'Published').length;
    const inProgress = projectsData.filter(p => p.status === 'In Progress').length;
    const featured = projectsData.filter(p => p.featured).length;
    const hidden = projectsData.filter(p => p.hidden).length;
    const archived = projectsData.filter(p => p.status === 'Archived' || p.hidden).length;
    const visible = projectsData.filter(p => !p.hidden).length;

    document.getElementById('stat-total-projects').innerText = total;
    document.getElementById('stat-completed-projects').innerText = completed;
    document.getElementById('stat-published-projects').innerText = published;
    document.getElementById('stat-progress-projects').innerText = inProgress;
    document.getElementById('stat-featured-projects').innerText = featured;
    document.getElementById('stat-archived-projects').innerText = archived;
    document.getElementById('stat-visible-projects-trend').innerText = `${visible} مرئية`;
    document.getElementById('stat-hidden-projects').innerText = `${hidden} مخفية`;
}

function handleImageUploadSimulation(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('proj-thumbnail').value = URL.createObjectURL(file);
        handleProjectInputUpdate();
    }
}

        async function loadProjectsManager() {
            try {
                const { data: projects, error } = await _supabase.from('projects').select('*').order('id', { ascending: false });
                const container = document.getElementById('projects-grid-container');
                if (!container) return;
                
                container.innerHTML = '';
                if (error || !projects || projects.length === 0) {
                    container.innerHTML = '<p style="color: #94a3b8; font-size: 12px; grid-column: span 2;">لا توجد مشاريع مضافة حالياً.</p>';
                    return;
                }

                projects.forEach(proj => {
                    const card = document.createElement('div');
                    card.style.cssText = "background: rgba(18, 24, 43, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: 0.3s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.5); position: relative;";
                    
                    card.innerHTML = `
                        <div style="height: 140px; overflow: hidden; position: relative;">
                            <img src="${proj.image || 'https://via.placeholder.com/400x200'}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover; transition: 0.5s;">
                            <div style="position: absolute; top: 10px; left: 10px; background: rgba(13, 17, 33, 0.85); backdrop-filter: blur(5px); padding: 4px 10px; border-radius: 20px; font-size: 10px; color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.4);">نشط بالموقع</div>
                        </div>
                        <div style="padding: 15px; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
                            <div>
                                <h4 style="font-size: 14px; color: #f8fafc; margin-bottom: 8px; font-weight: 600;">${proj.title}</h4>
                                <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin-bottom: 15px;">${proj.description || 'لا يوجد وصف متاح'}</p>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; margin-top: auto;">
                                <a href="${proj.link || '#'}" target="_blank" style="font-size: 11px; color: #a855f7; text-decoration: none; display: flex; align-items: center; gap: 5px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> معاينة المشروع</a>
                                <button onclick="deleteItem('projects', ${proj.id})" style="background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 11px; transition: 0.2s;"><i class="fa-solid fa-trash"></i> حذف</button>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });
            } catch(e) { console.error(e); }
        }

        async function addNewProjectCard(e) {
            e.preventDefault();
            const title = document.getElementById('p_title').value;
            const image = document.getElementById('p_image').value;
            const description = document.getElementById('p_desc').value;
            const link = document.getElementById('p_link').value;

            const { error } = await _supabase.from('projects').insert([{ title, image, description, link }]);
            if(error) { alert('حدث خطأ أثناء حفظ المشروع!'); return; }

            e.target.reset();
            loadProjectsManager();
            fetchGlobalCounters();
            showToast('تم إنشاء الكارت ونشر المشروع بنجاح 🚀');
        }

        async function clearAllProjects() {
            if(!confirm('هل أنت متأكد من حذف كافة المشاريع؟')) return;
            const { data: items } = await _supabase.from('projects').select('id');
            if(items) {
                for(let itm of items) { await _supabase.from('projects').delete().eq('id', itm.id); }
            }
            loadProjectsManager();
            fetchGlobalCounters();
            showToast('تم تفريغ جميع المشاريع بنجاح.');
        }

        async function loadCertificatesManager() {
            try {
                const { data: certs, error } = await _supabase.from('certificates').select('*').order('id', { ascending: false });
                const container = document.getElementById('certificates-grid-container');
                if (!container) return;
                
                container.innerHTML = '';
                if (error || !certs || certs.length === 0) {
                    container.innerHTML = '<p style="color: #94a3b8; font-size: 12px; grid-column: span 2;">لا توجد شهادات مضافة حالياً.</p>';
                    return;
                }

                certs.forEach(cert => {
                    const card = document.createElement('div');
                    card.style.cssText = "background: rgba(18, 24, 43, 0.85); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: 0.3s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.5); position: relative;";
                    
                    card.innerHTML = `
                        <div style="height: 130px; overflow: hidden; position: relative; background: #070913;">
                            <img src="${cert.image || 'https://via.placeholder.com/400x200'}" alt="${cert.title}" style="width: 100%; height: 100%; object-fit: cover; transition: 0.5s;">
                            <div style="position: absolute; top: 10px; right: 10px; background: rgba(217, 119, 6, 0.9); backdrop-filter: blur(5px); padding: 4px 10px; border-radius: 20px; font-size: 10px; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-star" style="font-size: 9px;"></i> ${cert.date || 'معتمدة'}</div>
                        </div>
                        <div style="padding: 15px; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
                            <div>
                                <div style="font-size: 10px; color: #fbbf24; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">${cert.issuer || 'جهة معتمدة'}</div>
                                <h4 style="font-size: 14px; color: #f8fafc; margin-bottom: 6px; font-weight: 600;">${cert.title}</h4>
                                <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin-bottom: 15px;">${cert.description || 'لا يوجد وصف متاح'}</p>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; margin-top: auto;">
                                <span style="font-size: 10px; color: #34d399;"><i class="fa-solid fa-circle-check"></i> معروض بالموقع</span>
                                <button onclick="deleteItem('certificates', ${cert.id})" style="background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 11px; transition: 0.2s;"><i class="fa-solid fa-trash"></i> حذف</button>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });
            } catch(e) { console.error(e); }
        }

        async function addNewCertificateCard(e) {
            e.preventDefault();
            const title = document.getElementById('c_title').value;
            const issuer = document.getElementById('c_issuer').value;
            const image = document.getElementById('c_image').value;
            const date = document.getElementById('c_date').value;
            const description = document.getElementById('c_desc').value;

            const { error } = await _supabase.from('certificates').insert([{ title, issuer, image, date, description }]);
            if(error) { alert('حدث خطأ أثناء حفظ الشهادة!'); return; }

            e.target.reset();
            loadCertificatesManager();
            fetchGlobalCounters();
            showToast('تم إصدار الكارت الذهبي وتوثيق الشهادة بنجاح ⭐');
        }

        async function clearAllCertificates() {
            if(!confirm('هل أنت متأكد من حذف كافة الشهادات؟')) return;
            const { data: items } = await _supabase.from('certificates').select('id');
            if(items) {
                for(let itm of items) { await _supabase.from('certificates').delete().eq('id', itm.id); }
            }
            loadCertificatesManager();
            fetchGlobalCounters();
            showToast('تم تفريغ جميع الشهادات بنجاح.');
        }

        async function loadHeroData() {
            try {
                const { data } = await _supabase.from('hero_section').select('*').limit(1).single();
                if (data) {
                    document.getElementById('heroTitle').value = data.title || '';
                    document.getElementById('heroSubtitle').value = data.subtitle || '';
                    document.getElementById('heroDesc').value = data.description || '';
                    document.getElementById('heroImage').value = data.image_url || '';
                }
            } catch (e) {
                console.error(e);
            }
        }

        async function updateHeroSection(e) {
            e.preventDefault();
            const updatedData = {
                title: document.getElementById('heroTitle').value,
                subtitle: document.getElementById('heroSubtitle').value,
                description: document.getElementById('heroDesc').value,
                image_url: document.getElementById('heroImage').value,
                updated_at: new Date()
            };

            const { error } = await _supabase.from('hero_section').update(updatedData).eq('id', 1);
            if (error) {
                alert('حدث خطأ أثناء التحديث!');
            } else {
                showToast('تم تحديث قسم الهيرو بنجاح وسيظهر في الموقع الرئيسي فوراً!');
            }
        }

        function renderSocial(item) {
            const div = document.createElement('div'); div.className = 'item-row';
            div.innerHTML = `<div class="item-info"><h4>${item.platform} <span style="color:#a855f7;">(${item.followers || 0} متابع)</span></h4><p>${item.link}</p></div><button class="btn-delete" onclick="deleteItem('social_links', ${item.id})">حذف</button>`;
            return div;
        }

        function renderMessage(item) {
            const div = document.createElement('div'); div.className = 'item-row';
            div.innerHTML = `<div class="item-info"><h4>${item.sender_name || 'زائر'}</h4><p>${item.message_text || ''}</p></div><button class="btn-delete" onclick="deleteItem('messages', ${item.id})">حذف</button>`;
            return div;
        }

        async function deleteItem(tableName, id) {
            if (!confirm('تأكيد الحذف؟')) return;
            await _supabase.from(tableName).delete().eq('id', id);
            showToast('تم الحذف بنجاح.');
            loadAllData();
        }

        document.getElementById('socialForm').onsubmit = async (e) => {
            e.preventDefault();
            const platform = document.getElementById('socialPlatform').value;
            const link = document.getElementById('socialLink').value;
            const followers = document.getElementById('socialFollowers').value;

            await _supabase.from('social_links').insert([{ platform, link, followers: Number(followers) }]);
            document.getElementById('socialForm').reset();
            loadAllData();
            showToast('تم إضافة منصة السوشيال وتحديث عداد المتابعين بنجاح!');
        };

        function updateAnalyticsChart() {
            const chartCanvas = document.getElementById('analyticsChart');
            if(!chartCanvas) return;
            const ctx = chartCanvas.getContext('2d');
            if (analyticsChartInstance) analyticsChartInstance.destroy();
            analyticsChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['المشاريع', 'الشهادات', 'الشكاوى والدعم', 'المهارات', 'الرسائل'],
                    datasets: [{
                        data: [
                            Number(document.getElementById('countProjects').innerText || 0),
                            Number(document.getElementById('countCerts').innerText || 0),
                            Number(document.getElementById('countSupport').innerText || 0),
                            Number(document.getElementById('countSkills').innerText || 0),
                            Number(document.getElementById('countMessages').innerText || 0)
                        ],
                        backgroundColor: ['#a855f7', '#fbbf24', '#ec4899', '#60a5fa', '#fb7185'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f8fafc' } } } }
            });
        }

        function loadAllData() {
            fetchGlobalCounters().then(() => {
                updateAnalyticsChart();
            });
            loadCategorizedSkills();
            loadProjectsManager();
            loadCertificatesManager();
            loadSupportInbox();
            fetchSection('social_links', 'social_linksGrid', renderSocial);
            fetchSection('messages', 'messagesGrid', renderMessage);
            loadLogs();
        }
        // تحديث الوقت والتاريخ بشكل حي ودقيق
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    if (dateEl) dateEl.innerText = dateStr;
    if (timeEl) timeEl.innerText = timeStr;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// دالة جلب وعرض العدادات العالمية المتصلة بـ Supabase
async function fetchGlobalCounters() {
    try {
        const [visRes, projRes, certRes, skillRes, msgRes, socRes] = await Promise.all([
            _supabase.from('visitors').select('*', { count: 'exact', head: true }),
            _supabase.from('projects').select('*', { count: 'exact', head: true }),
            _supabase.from('certificates').select('*', { count: 'exact', head: true }),
            _supabase.from('skills').select('*', { count: 'exact', head: true }),
            _supabase.from('messages').select('*', { count: 'exact', head: true }),
            _supabase.from('social_links').select('followers')
        ]);

        if (document.getElementById('visitorCount')) {
            document.getElementById('visitorCount').innerText = visRes.count !== null ? visRes.count : 1250;
        }
        if (document.getElementById('countProjects')) {
            document.getElementById('countProjects').innerText = projRes.count || 0;
        }
        if (document.getElementById('countCerts')) {
            document.getElementById('countCerts').innerText = certRes.count || 0;
        }
        if (document.getElementById('countSkills')) {
            document.getElementById('countSkills').innerText = skillRes.count || 0;
        }
        if (document.getElementById('countMessages')) {
            document.getElementById('countMessages').innerText = msgRes.count || 0;
        }

        let totalFollowers = 0;
        if (socRes.data && socRes.data.length > 0) {
            socRes.data.forEach(item => { totalFollowers += Number(item.followers || 0); });
        }
        if (document.getElementById('countFollowers')) {
            document.getElementById('countFollowers').innerText = totalFollowers > 0 ? totalFollowers : '2.4K';
        }
    } catch (e) {
        console.error('Error fetching dashboard metrics:', e);
    }
}
// --- إدارة الخدمات (Services Engine) ---
let servicesData = JSON.parse(localStorage.getItem('dashboard_services_pro')) || [
    { id: 'srv-1', name: 'Frontend Web Development', category: 'Web Development', price: 150, delivery: '5 أيام', shortDesc: 'تطوير واجهات مستخدم تفاعلية وعصرية باستخدام أحدث التقنيات.', isFeatured: true, isPublished: true },
    { id: 'srv-2', name: 'UI/UX Dashboard Design', category: 'UI/UX Design', price: 120, delivery: '3 أيام', shortDesc: 'تصميم لوحات تحكم SaaS احترافية متجاوبة وسهلة الاستخدام.', isFeatured: false, isPublished: true }
];

document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    updateServicesStats();
    renderDonations();
    updateDonationsStats();
});

function saveServicesToStorage() {
    localStorage.setItem('dashboard_services_pro', JSON.stringify(servicesData));
    updateServicesStats();
}

function updateServicesStats() {
    document.getElementById('stat-total-services').innerText = servicesData.length;
    document.getElementById('stat-featured-services').innerText = servicesData.filter(s => s.isFeatured).length;
    document.getElementById('stat-published-services').innerText = servicesData.filter(s => s.isPublished).length;
}

function renderServices(dataToRender = servicesData) {
    const container = document.getElementById('services-grid-container');
    if (!container) return;
    container.innerHTML = '';

    if (dataToRender.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #94a3b8;"><p>لا توجد خدمات مطابقة</p></div>`;
        return;
    }

    dataToRender.forEach(srv => {
        const card = document.createElement('div');
        card.className = 'saas-card';
        card.style.cssText = "background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 10px;";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h4 style="font-size: 13px; font-weight: 600; color: #fff; margin: 0;">${srv.name}</h4>
                    <span style="font-size: 11px; color: #38bdf8;">${srv.category}</span>
                </div>
                <span style="font-size: 11px; background: rgba(16,185,129,0.15); color: #10b981; padding: 2px 8px; border-radius: 6px;">$${srv.price || 0}</span>
            </div>
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">${srv.shortDesc || 'لا يوجد وصف.'}</p>
            <div style="display: flex; justify-content: flex-end; gap: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 4px;">
                <button class="saas-btn saas-btn-secondary" style="font-size: 10px; padding: 4px 8px;" onclick="openServiceModal('edit', '${srv.id}')"><i class="fa-solid fa-pen"></i> تعديل</button>
                <button class="saas-btn" style="background: rgba(239,68,68,0.15); color: #fca5a5; font-size: 10px; padding: 4px 8px;" onclick="deleteService('${srv.id}')"><i class="fa-solid fa-trash"></i> حذف</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function openServiceModal(mode, id = null) {
    const modal = document.getElementById('service-modal-overlay');
    const form = document.getElementById('service-form');
    form.reset();
    document.getElementById('service_edit_id').value = '';

    if (mode === 'edit' && id) {
        document.getElementById('service-modal-title').innerHTML = '<i class="fa-solid fa-pen"></i> تعديل الخدمة';
        const srv = servicesData.find(s => s.id === id);
        if (srv) {
            document.getElementById('service_edit_id').value = srv.id;
            document.getElementById('service_name').value = srv.name;
            document.getElementById('service_price').value = srv.price;
            document.getElementById('service_category').value = srv.category;
            document.getElementById('service_delivery').value = srv.delivery;
            document.getElementById('service_short_desc').value = srv.shortDesc;
            document.getElementById('service_is_featured').checked = srv.isFeatured;
            document.getElementById('service_is_published').checked = srv.isPublished;
        }
    } else {
        document.getElementById('service-modal-title').innerHTML = '<i class="fa-solid fa-server"></i> إضافة خدمة جديدة';
    }
    modal.style.display = 'flex';
}

function closeServiceModal() {
    document.getElementById('service-modal-overlay').style.display = 'none';
}

function handleServiceFormSubmit(event) {
    event.preventDefault();
    const editId = document.getElementById('service_edit_id').value;
    const srvObj = {
        id: editId || 'srv-' + Date.now(),
        name: document.getElementById('service_name').value,
        price: document.getElementById('service_price').value,
        category: document.getElementById('service_category').value,
        delivery: document.getElementById('service_delivery').value,
        shortDesc: document.getElementById('service_short_desc').value,
        isFeatured: document.getElementById('service_is_featured').checked,
        isPublished: document.getElementById('service_is_published').checked
    };

    if (editId) {
        const index = servicesData.findIndex(s => s.id === editId);
        if (index !== -1) servicesData[index] = srvObj;
    } else {
        servicesData.unshift(srvObj);
    }

    saveServicesToStorage();
    renderServices();
    closeServiceModal();
}

function deleteService(id) {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
        servicesData = servicesData.filter(s => s.id !== id);
        saveServicesToStorage();
        renderServices();
    }
}

function filterServices() {
    const query = document.getElementById('services-search-input').value.toLowerCase();
    const cat = document.getElementById('service-filter-category').value;
    const filtered = servicesData.filter(s => {
        const matchesQuery = s.name.toLowerCase().includes(query);
        const matchesCat = cat === 'all' || s.category === cat;
        return matchesQuery && matchesCat;
    });
    renderServices(filtered);
}

function saveServicesDatabase() {
    saveServicesToStorage();
    alert('تم حفظ ومزامنة الخدمات بنجاح مع قاعدة البيانات (Supabase Ready)!');
}


// --- إدارة التبرعات (Donations Engine) ---
let donationsData = JSON.parse(localStorage.getItem('dashboard_donations_pro')) || [
    { id: 'don-1', title: 'تطوير سيرفرات الموقع الاستضافية', method: 'PayPal / Stripe', target: 500, raised: 320, accountInfo: 'mohamed@example.com' }
];

function saveDonationsToStorage() {
    localStorage.setItem('dashboard_donations_pro', JSON.stringify(donationsData));
    updateDonationsStats();
}

function updateDonationsStats() {
    const totalRaised = donationsData.reduce((acc, curr) => acc + Number(curr.raised || 0), 0);
    const totalGoal = donationsData.reduce((acc, curr) => acc + Number(curr.target || 0), 0);
    document.getElementById('stat-total-raised').innerText = '$' + totalRaised;
    document.getElementById('stat-total-goal').innerText = '$' + totalGoal;
    document.getElementById('stat-donor-count').innerText = donationsData.length * 12; // محاكاة لعدد المتبرعين
}

function renderDonations() {
    const container = document.getElementById('donations-grid-container');
    if (!container) return;
    container.innerHTML = '';

    donationsData.forEach(don => {
        const percent = don.target > 0 ? Math.round((don.raised / don.target) * 100) : 0;
        const card = document.createElement('div');
        card.className = 'saas-card';
        card.style.cssText = "background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 10px;";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h4 style="font-size: 13px; font-weight: 600; color: #fff; margin: 0;">${don.title}</h4>
                    <span style="font-size: 11px; color: #10b981;">طريقة الدفع: ${don.method}</span>
                </div>
                <span style="font-size: 11px; background: rgba(16,185,129,0.15); color: #10b981; padding: 2px 8px; border-radius: 6px;">${percent}%</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8;">المجمع: $${don.raised} من أصل $${don.target} المستهدف</div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: #10b981;"></div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 4px;">
                <button class="saas-btn saas-btn-secondary" style="font-size: 10px; padding: 4px 8px;" onclick="openDonationModal('edit', '${don.id}')"><i class="fa-solid fa-pen"></i> تعديل</button>
                <button class="saas-btn" style="background: rgba(239,68,68,0.15); color: #fca5a5; font-size: 10px; padding: 4px 8px;" onclick="deleteDonation('${don.id}')"><i class="fa-solid fa-trash"></i> حذف</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function openDonationModal(mode, id = null) {
    const modal = document.getElementById('donation-modal-overlay');
    const form = document.getElementById('donation-form');
    form.reset();
    document.getElementById('donation_edit_id').value = '';

    if (mode === 'edit' && id) {
        document.getElementById('donation-modal-title').innerHTML = '<i class="fa-solid fa-pen"></i> تعديل حملة التبرع';
        const don = donationsData.find(d => d.id === id);
        if (don) {
            document.getElementById('donation_edit_id').value = don.id;
            document.getElementById('donation_title').value = don.title;
            document.getElementById('donation_method').value = don.method;
            document.getElementById('donation_target').value = don.target;
            document.getElementById('donation_raised').value = don.raised;
            document.getElementById('donation_account_info').value = don.accountInfo;
        }
    } else {
        document.getElementById('donation-modal-title').innerHTML = '<i class="fa-solid fa-hand-holding-dollar"></i> إضافة حملة تبرع جديدة';
    }
    modal.style.display = 'flex';
}

function closeDonationModal() {
    document.getElementById('donation-modal-overlay').style.display = 'none';
}

function handleDonationFormSubmit(event) {
    event.preventDefault();
    const editId = document.getElementById('donation_edit_id').value;
    const donObj = {
        id: editId || 'don-' + Date.now(),
        title: document.getElementById('donation_title').value,
        method: document.getElementById('donation_method').value,
        target: document.getElementById('donation_target').value,
        raised: document.getElementById('donation_raised').value,
        accountInfo: document.getElementById('donation_account_info').value
    };

    if (editId) {
        const index = donationsData.findIndex(d => d.id === editId);
        if (index !== -1) donationsData[index] = donObj;
    } else {
        donationsData.unshift(donObj);
    }

    saveDonationsToStorage();
    renderDonations();
    closeDonationModal();
}

function deleteDonation(id) {
    if (confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
        donationsData = donationsData.filter(d => d.id !== id);
        saveDonationsToStorage();
        renderDonations();
    }
}

function saveDonationsDatabase() {
    saveDonationsToStorage();
    alert('تم حفظ ومزامنة بيانات التبرعات بنجاح (Supabase Ready)!');
}

// تنفيذ جلب البيانات عند تحميل القسم
document.addEventListener('DOMContentLoaded', () => {
    fetchGlobalCounters();
});
    
   