document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".counter-value, .counter-card h3");
    
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        if (!target) return;
        
        let count = 0;
        // زيادة المدة لتصبح الحركة أبطأ وأكثر سلاسة ووضوحاً
        const increment = target / 80; 
        
        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 40); // زيادة الوقت بين كل خطوة وأخرى
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
});document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('http://localhost:5000/api/social-stats');
        const data = await response.json();

        // نفترض إن عندك عناصر في HTML للأرقام دي، بنحدثها هنا تلقائي:
        const instaElement = document.querySelector('.instagram-count');
        const tiktokElement = document.querySelector('.tiktok-count');
        const fbElement = document.querySelector('.facebook-count');

        if (instaElement) instaElement.textContent = data.instagram;
        if (tiktokElement) tiktokElement.textContent = data.tiktok;
        if (fbElement) fbElement.textContent = data.facebook;

        console.log("Social stats loaded successfully from backend!");
    } catch (error) {
        console.error("Error loading social stats:", error);
    }
});