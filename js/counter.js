/* ==========================================================
   AUTO COUNTERS ANIMATION
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".counter-value, .social-counters h3");
    let animated = false;

    function runCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            let count = 0;
            // سرعة العد بناءً على الرقم المستهدف
            const speed = target / 50; 

            function updateCount() {
                count += speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count);
                    setTimeout(updateCount, 30);
                } else {
                    counter.innerText = target;
                }
            }
            updateCount();
        });
    }

    // تفعيل العدادات عند التمرير للأسفل وصولاً إليها
    window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const targetSection = document.querySelector(".social-counters") || document.querySelector(".counter-item");

        if (targetSection) {
            const sectionPosition = targetSection.offsetTop;
            if (scrollPosition >= sectionPosition && !animated) {
                runCounters();
                animated = true;
            }
        }
    });
});