// بيانات مشروع Supabase
const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

// الهيدر المشترك للطلبات (Headers)
const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// 1. إرسال رسالة تواصل جديدة مباشرة إلى جدول Supabase
async function sendContactMessage(formData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Messages`, {
            method: 'POST',
            headers: {
                ...supabaseHeaders,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            return { status: 'success' };
        } else {
            const errorData = await response.json();
            console.error('Supabase Error:', errorData);
            return { status: 'error' };
        }
    } catch (error) {
        console.error('Network Error:', error);
        return { status: 'error' };
    }
}

// 2. جلب وعرض البيانات في الموقع فور تحميل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // يمكنك جلب البيانات من الجداول الخاصة بك في Supabase وتحديث العناصر بناءً على الـ IDs الموجودة في HTML
        
        /* مثال لجلب المشاريع من جدول Projects لو وجد:
        const resProjects = await fetch(`${SUPABASE_URL}/rest/v1/Projects?select=*`, {
            headers: supabaseHeaders
        });
        if (resProjects.ok) {
            const projects = await resProjects.json();
            // كود عرض المشاريع هنا...
        }
        */

        // ربط نموذج التواصل HTML مع دالة الإرسال Supabase
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
                    alert('حدث خطأ أثناء إرسال الرسالة، حاول مرة أخرى.');
                }
            });
        }

    } catch (error) {
        console.error("Error fetching data from Supabase:", error);
    }
});