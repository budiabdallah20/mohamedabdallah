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
});