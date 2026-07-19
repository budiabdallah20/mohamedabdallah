// 1. دالة نسخ الإيميل
function copyMyEmail(email, btn) {
    navigator.clipboard.writeText(email).then(() => {
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>'; // تغيير الأيقونة للعلامة صح
        setTimeout(() => {
            btn.innerHTML = originalIcon; // الرجوع للأيقونة الأصلية بعد ثانية
        }, 2000);
    });
}

// 2. دالة تحديث سنة الفوتر
function updateFooterYear() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// تشغيل الوظائف عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    updateFooterYear();
});