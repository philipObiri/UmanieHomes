// ===================================
//  CONTACT PAGE FUNCTIONALITY
// ===================================

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Mobile Menu
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileBackdrop = document.querySelector('.mobile-menu-backdrop');

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

// Navigation Scroll Effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Back to Top Button
const backToTop = document.querySelector('.back-to-top');
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

// WhatsApp Bubble
document.querySelector('.whatsapp-btn').addEventListener('click', function() {
    const phoneNumber = '233245550100';
    const message = encodeURIComponent('Hello! I would like to inquire about your luxury properties.');
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
});

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

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-show`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Contact Form
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Validate
    if (!firstName || !lastName || !email || !phone || !subject || !message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Simulate form submission
    showToast(`Thank you ${firstName}! We've received your message and will get back to you within 24 hours.`);
    contactForm.reset();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Load FAQ
async function loadFAQ() {
    try {
        const response = await fetch('../data/faqs.json');
        const faqs = await response.json();
        const accordion = document.getElementById('faqAccordion');

        // Group by category
        const categories = {};
        faqs.forEach(faq => {
            if (!categories[faq.category]) {
                categories[faq.category] = [];
            }
            categories[faq.category].push(faq);
        });

        // Render by category
        accordion.innerHTML = Object.entries(categories).map(([category, questions]) => `
            <div class="accordion-category" style="margin-bottom: 40px;">
                <h3 style="color: var(--accent-gold); margin-bottom: 20px; font-size: 1.3rem;">${category}</h3>
                <div class="accordion">
                    ${questions.map((faq, index) => `
                        <div class="accordion-item">
                            <button class="accordion-header" aria-expanded="false">
                                <span class="accordion-title">${faq.question}</span>
                                <i class="fas fa-chevron-down accordion-icon"></i>
                            </button>
                            <div class="accordion-content">
                                <div class="accordion-body">
                                    <p>${faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Accordion functionality
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const content = item.querySelector('.accordion-content');
                const isOpen = header.getAttribute('aria-expanded') === 'true';

                // Close all other items
                document.querySelectorAll('.accordion-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherHeader = otherItem.querySelector('.accordion-header');
                        const otherContent = otherItem.querySelector('.accordion-content');
                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherContent.style.maxHeight = '0';
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                if (isOpen) {
                    header.setAttribute('aria-expanded', 'false');
                    content.style.maxHeight = '0';
                    item.classList.remove('active');
                } else {
                    header.setAttribute('aria-expanded', 'true');
                    // Set max-height to actual scroll height + padding for smooth animation
                    const actualHeight = content.scrollHeight;
                    content.style.maxHeight = (actualHeight + 100) + 'px';
                    item.classList.add('active');

                    // After animation, set to none to allow dynamic content
                    setTimeout(() => {
                        if (item.classList.contains('active')) {
                            content.style.maxHeight = 'none';
                        }
                    }, 500);
                }
            });
        });

    } catch (error) {
        console.error('Error loading FAQs:', error);
        document.getElementById('faqAccordion').innerHTML = `
            <p style="text-align: center; color: var(--text-secondary);">
                FAQs will be loaded here. Make sure to serve this page from a web server.
            </p>
        `;
    }
}

// Initialize
loadFAQ();
