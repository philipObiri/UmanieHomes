/* ===================================
   UMANIE HOMES - MAIN JAVASCRIPT
   Core initialization and functionality
   =================================== */

// --- THEME TOGGLE ---
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to 'light'
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// Update icon based on current theme
function updateThemeIcon() {
    const icon = themeToggle?.querySelector('i');
    if (!icon) return;

    const currentTheme = html.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Initialize theme icon on page load
updateThemeIcon();

// Theme toggle click handler
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });
}

// --- NAVIGATION SCROLL EFFECT ---
const nav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
    } else {
        nav?.classList.remove('scrolled');
    }
});

// --- MOBILE MENU TOGGLE ---
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');
const mobileNavLinks = document.querySelectorAll('.mobile-menu .nav-links a');

function toggleMobileMenu() {
    mobileMenuToggle?.classList.toggle('active');
    mobileMenu?.classList.toggle('active');
    mobileMenuBackdrop?.classList.toggle('active');

    // Prevent body scroll when menu is open
    if (mobileMenu?.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    mobileMenuToggle?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    mobileMenuBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
}

// Mobile menu toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

// Close on backdrop click
if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
}

// Close on link click
mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
        closeMobileMenu();
    }
});

// --- SCROLL REVEAL ANIMATIONS ---
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optionally unobserve after revealing
            // revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// --- ACTIVE NAVIGATION LINK ---
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath ||
            (currentPath.includes('/pages/') && linkPath.includes(currentPath.split('/').pop()))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Set active link on page load
document.addEventListener('DOMContentLoaded', setActiveNavLink);

// --- SMOOTH SCROLL FOR ANCHOR LINKS ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Ignore if it's just "#"
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// --- COUNTER ANIMATION (for statistics) ---
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };

    updateCounter();
}

// Observe counter elements
const counterElements = document.querySelectorAll('[data-counter]');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counterElements.forEach(el => counterObserver.observe(el));

// --- FORM UTILITIES ---
// Add focus class to form groups
document.querySelectorAll('.form-control, .form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement?.classList.add('focused');
    });

    input.addEventListener('blur', function() {
        this.parentElement?.classList.remove('focused');
    });
});

// --- CONSOLE WELCOME MESSAGE ---
console.log('%c🏠 Umanie Homes ', 'background: #0A1F44; color: #C9A974; padding: 10px 20px; font-size: 16px; font-weight: bold;');
console.log('%cLuxury African Real Estate', 'color: #4B5563; font-size: 12px;');

// --- EXPORT FOR MODULE USE ---
export {
    toggleMobileMenu,
    closeMobileMenu,
    animateCounter,
    setActiveNavLink
};
