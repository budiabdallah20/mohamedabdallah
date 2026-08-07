// ============================================================
// 🔥 جلب المشاريع من Supabase وعرضها في الموقع
// ============================================================

// تهيئة Supabase
const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

let _supabaseClient = null;

function getSupabaseClient() {
    if (_supabaseClient) return _supabaseClient;
    
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        _supabaseClient = supabaseClient;
    } else {
        console.warn('⚠️ Supabase not available');
        return null;
    }
    return _supabaseClient;
}

// ============================================================
// 🔥 الوظيفة الرئيسية - جلب المشاريع وعرضها
// ============================================================

async function loadProjectsFromSupabase() {
    try {
        const client = getSupabaseClient();
        if (!client) {
            console.error('❌ Supabase client not available');
            return;
        }

        console.log('📤 Loading projects from Supabase...');

        const { data, error } = await client
            .from('projects')
            .select('*')
            .eq('is_hidden', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase error:', error);
            return;
        }

        console.log('📥 Projects loaded:', data?.length || 0);

        // ✅ تحديث العداد
        const counter = document.getElementById('projectsCounter');
        if (counter && data) {
            counter.textContent = data.length;
            console.log('✅ Counter updated to:', data.length);
        }

        // ✅ تحديث الـ Grid
        const grid = document.getElementById('dynamic-projects-grid');
        if (!grid) {
            console.warn('⚠️ #dynamic-projects-grid not found');
            return;
        }

        if (!data || data.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-secondary);">
                    <i class="fa-solid fa-inbox" style="font-size:2rem;display:block;margin-bottom:1rem;"></i>
                    <p>لا توجد مشاريع حالياً</p>
                </div>
            `;
            return;
        }

        const statusColors = {
            'Completed': '#10b981',
            'Published': '#3b82f6',
            'In Progress': '#f59e0b',
            'Draft': '#64748b',
            'Archived': '#ef4444'
        };

        // ✅ بناء كروت المشاريع من البيانات
        grid.innerHTML = data.map(project => {
            const statusColor = statusColors[project.status] || '#64748b';
            const techStack = project.tech_stack || [];
            const techHtml = techStack.map(t => `<span>${t}</span>`).join('');

            // ✅ استخدام لوجو موحد لكل المشاريع
            const imageUrl = 'assets/projects/images/project-logo.png';

            return `
                <article class="project-card">
                    <div class="project-image">
                        <img src="${imageUrl}" alt="${project.title}" loading="lazy"
                             onerror="this.src='assets/projects/images/project-logo.png'">
                        <div class="project-overlay">
                            <span>${project.is_featured ? '⭐ مميز' : 'مشروع'}</span>
                        </div>
                    </div>
                    <div class="project-content">
                        <span class="project-status completed" style="background:${statusColor}20; color:${statusColor}">
                            ${project.status || 'مكتمل'}
                        </span>
                        <h3>${project.title}</h3>
                        <p>${project.description || ''}</p>
                        <div class="project-tech">${techHtml}</div>
                        <div class="project-buttons">
                            ${project.demo_url ? `
                                <a href="${project.demo_url}" target="_blank" class="btn-view">
                                    <i class="fa-solid fa-eye"></i> معاينة
                                </a>
                            ` : ''}
                            ${project.github_url ? `
                                <a href="${project.github_url}" target="_blank" class="btn-github">
                                    <i class="fa-brands fa-github"></i> كود
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        console.log('✅ Projects rendered successfully');

    } catch (error) {
        console.error('❌ Error loading projects:', error);
    }
}

// ============================================================
// 🔥 تشغيل التحميل
// ============================================================

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadProjectsFromSupabase, 500);
});

// لو الصفحة اتحملت بالفعل
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(loadProjectsFromSupabase, 500);
}

// 🔥 استماع لتحديث المشاريع من الداشبورد
document.addEventListener('dashboard:projects-updated', function(e) {
    console.log('🔄 Projects updated, reloading...');
    loadProjectsFromSupabase();
});

console.log('✅ Projects loader initialized');