const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // تحريك الـ Follower ببطء شوية عشان يعطي تأثير احترافي
    setTimeout(() => {
        follower.style.left = (e.clientX - 10) + 'px';
        follower.style.top = (e.clientY - 10) + 'px';
    }, 50);
});

// تأثير عند الوقوف فوق أي عنصر قابل للضغط
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseover', () => {
        cursor.classList.add('cursor-hover');
        follower.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        follower.classList.remove('cursor-hover');
    });
});
const counters = document.querySelectorAll('.counter-card h3');

counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / 200; // سرعة العد

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(updateCount, 10);
        } else {
            counter.innerText = target;
        }
    };
    updateCount();
});