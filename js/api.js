// بيانات مشروع Supabase
const SUPABASE_URL = 'https://txcuibshcvfusegrfcbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Y3VpYnNoY3ZmdXNlZ3JmY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODY5MDgsImV4cCI6MjEwMDY2MjkwOH0.ceecXsQc9-exY_pwIZah9VMWehIkiu3xPkLhHoIP_LI';

// إرسال رسالة تواصل جديدة مباشرة إلى جدول Supabase
async function sendContactMessage(formData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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