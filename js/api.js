// عنوان السيرفر الأساسي
const API_BASE_URL = 'http://localhost:5000/api';

// 1. جلب المشاريع لعرضها في الموقع
async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

// 2. إرسال رسالة تواصل جديدة من نموذج الاتصال في الموقع
async function sendContactMessage(messageData) {
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending message:', error);
      return  { status: 'error', message: 'Failed to send' };
    }
}