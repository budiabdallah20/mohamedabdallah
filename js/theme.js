
document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.querySelector(".theme-toggle") || document.getElementById("theme-toggle");
    const htmlElement = document.documentElement;

    if (!themeToggleBtn) return;

    // قراءة الثيم المحفوظ أو البدء بـ dark
    const savedTheme = localStorage.getItem("theme") || "dark";
    htmlElement.setAttribute("data-theme", savedTheme);
    updateIcon(savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        let currentTheme = htmlElement.getAttribute("data-theme");
        let newTheme = currentTheme === "dark" ? "light" : "dark";
        
        htmlElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        const icon = themeToggleBtn.querySelector("i");
        if (!icon) return;
        
        if (theme === "light") {
            icon.className = "fa-solid fa-sun";
        } else {
            icon.className = "fa-solid fa-moon";
        }
    }
});