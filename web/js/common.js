// ===================================
//  COMMON FUNCTIONALITY FOR ALL PAGES
// ===================================

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

// Mobile Menu
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileBackdrop = document.querySelector('.mobile-menu-backdrop');

if (mobileMenuToggle && mobileMenu && mobileBackdrop) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileBackdrop.classList.toggle('active');
    });

    mobileBackdrop.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileBackdrop.classList.remove('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileBackdrop.classList.remove('active');
        });
    });
}

// Navigation Scroll Effect
const nav = document.querySelector('nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Back to Top Button
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// WhatsApp Bubble
const whatsappBtn = document.querySelector('.whatsapp-btn');
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function() {
        const phoneNumber = '233245550100';
        const message = encodeURIComponent('Hello! I would like to inquire about your luxury properties.');
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank');
    });
}

// Custom Cursor
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

const cursorFollower = document.createElement('div');
cursorFollower.className = 'custom-cursor-follower';
document.body.appendChild(cursorFollower);

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX - 10 + 'px';
    cursor.style.top = mouseY - 10 + 'px';
    cursor.classList.add('active');
    cursorFollower.classList.add('active');
});

function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    cursorFollower.style.left = followerX - 20 + 'px';
    cursorFollower.style.top = followerY - 20 + 'px';
    requestAnimationFrame(animateFollower);
}
animateFollower();

// Cursor hover effects
document.querySelectorAll('a, button, .clickable').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// Scroll Progress Bar
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
});

// Counter Animation
function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            if (target < 10) {
                element.textContent = prefix + current.toFixed(1) + suffix;
            } else {
                element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
            }
            requestAnimationFrame(updateCounter);
        } else {
            if (target < 10) {
                element.textContent = prefix + target.toFixed(1) + suffix;
            } else {
                element.textContent = prefix + Math.floor(target).toLocaleString() + suffix;
            }
        }
    };

    updateCounter();
}

// Intersection Observer for counters
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe all counters
document.querySelectorAll('[data-counter]').forEach(counter => {
    counterObserver.observe(counter);
});
