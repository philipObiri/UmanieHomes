/* ===================================
   UMANIE HOMES - STANDALONE APP
   Combined JavaScript for direct file opening
   =================================== */

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

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

updateThemeIcon();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });
}

// Navigation Scroll Effect
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
    } else {
        nav?.classList.remove('scrolled');
    }
});

// Mobile Menu
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');

function toggleMobileMenu() {
    mobileMenuToggle?.classList.toggle('active');
    mobileMenu?.classList.toggle('active');
    mobileMenuBackdrop?.classList.toggle('active');
    document.body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    mobileMenuToggle?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    mobileMenuBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
}

mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

document.querySelectorAll('.mobile-menu .nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Scroll Reveal
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// Counter Animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
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

// Back to Top Button
const backToTopBtn = document.createElement('button');
backToTopBtn.className = 'back-to-top';
backToTopBtn.setAttribute('aria-label', 'Back to top');
backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// WhatsApp Bubble
const whatsappBubble = document.createElement('div');
whatsappBubble.className = 'whatsapp-bubble';
whatsappBubble.innerHTML = `
    <button class="whatsapp-btn" aria-label="Chat on WhatsApp">
        <i class="fab fa-whatsapp"></i>
    </button>
    <div class="whatsapp-tooltip">Chat with us on WhatsApp</div>
`;
document.body.appendChild(whatsappBubble);

whatsappBubble.querySelector('.whatsapp-btn').addEventListener('click', () => {
    const phoneNumber = '233245550101';
    const message = encodeURIComponent('Hello! I would like to inquire about your luxury properties.');
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
});

// Load Featured Properties
async function loadFeaturedProperties() {
    try {
        const response = await fetch('data/properties.json');
        const properties = await response.json();
        const featured = properties.filter(p => p.featured && p.status === 'available').slice(0, 6);
        const container = document.getElementById('featuredProperties');

        container.innerHTML = featured.map(property => `
            <a href="pages/listing-detail.html?id=${property.id}" class="card property-card reveal-scale" style="text-decoration: none; color: inherit;">
                <div class="card-img" style="background-image: url('${property.images[0]}');">
                    <span class="badge badge-featured">FEATURED</span>
                </div>
                <div class="card-content">
                    <div class="card-price">$${property.price.toLocaleString()}</div>
                    <h3 class="card-title">${property.title}</h3>
                    <p class="card-subtitle">${property.location.area}, ${property.location.city}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
                        <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
                        <span><i class="fas fa-ruler-combined"></i> ${property.sqft.toLocaleString()} sqft</span>
                    </div>
                </div>
            </a>
        `).join('');

        // Re-observe new elements
        document.querySelectorAll('#featuredProperties .reveal-scale').forEach(el => {
            revealObserver.observe(el);
        });
    } catch (error) {
        console.error('Error loading properties:', error);
        const container = document.getElementById('featuredProperties');
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Properties will be loaded here. Make sure to serve this page from a web server.</p>';
    }
}

// Load Testimonials
async function loadTestimonials() {
    try {
        const response = await fetch('data/testimonials.json');
        const testimonials = await response.json();
        const container = document.getElementById('testimonialsCarousel');

        container.innerHTML = testimonials.slice(0, 5).map(testimonial => `
            <div class="carousel-slide">
                <div class="testimonial-content">
                    <div class="testimonial-rating">
                        ${Array(testimonial.rating).fill('<i class="fas fa-star"></i>').join('')}
                    </div>
                    <p class="testimonial-quote">"${testimonial.quote}"</p>
                    <div class="testimonial-author">
                        <div class="testimonial-photo">
                            <img src="${testimonial.photo}" alt="${testimonial.name}">
                        </div>
                        <div class="testimonial-info">
                            <h4>${testimonial.name}</h4>
                            <p>${testimonial.title}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Initialize carousel after loading
        initTestimonialsCarousel();
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Simple Testimonials Carousel
function initTestimonialsCarousel() {
    const track = document.getElementById('testimonialsCarousel');
    const slides = track?.querySelectorAll('.carousel-slide');
    if (!slides || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // Create indicators
    const indicatorsContainer = track.parentElement.querySelector('.carousel-indicators');
    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator' + (i === 0 ? ' active' : '');
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
    }

    function goToSlide(index) {
        currentIndex = index;
        const offset = -index * 100;
        track.style.transform = `translateX(${offset}%)`;

        // Update indicators
        const indicators = indicatorsContainer?.querySelectorAll('.carousel-indicator');
        indicators?.forEach((ind, i) => {
            ind.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        goToSlide(currentIndex);
    }

    // Auto-advance
    setInterval(nextSlide, 6000);
}

// Newsletter Form
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('[name="email"]').value;

        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Thank you for subscribing!', 'success');
            newsletterForm.reset();
        } else {
            showToast('Please enter a valid email address', 'error');
        }
    });
}

// Simple Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Hero Price Slider
const heroPriceSlider = document.getElementById('heroPriceSlider');
const heroPriceDisplay = document.getElementById('heroPriceDisplay');

if (heroPriceSlider && heroPriceDisplay) {
    heroPriceSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        const formattedValue = '$' + (value / 1000000).toFixed(1) + 'M';
        heroPriceDisplay.textContent = formattedValue;

        // Update slider gradient
        const percentage = ((value - this.min) / (this.max - this.min)) * 100;
        this.style.background = `linear-gradient(to right, var(--accent-gold) 0%, var(--accent-gold) ${percentage}%, var(--border-color) ${percentage}%, var(--border-color) 100%)`;
    });

    // Initialize on load
    heroPriceSlider.dispatchEvent(new Event('input'));
}

// Hero Search Button
const heroSearchBtn = document.getElementById('heroSearchBtn');
if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', function() {
        const location = document.querySelector('.search-bar select:nth-of-type(1)').value;
        const propertyType = document.querySelector('.search-bar select:nth-of-type(2)').value;
        const maxPrice = heroPriceSlider ? heroPriceSlider.value : 2000000;

        // Build query string
        const params = new URLSearchParams();
        if (location !== 'All Cities') params.append('location', location);
        if (propertyType !== 'All Types') params.append('type', propertyType);
        if (maxPrice) params.append('maxPrice', maxPrice);

        // Redirect to listings page with filters
        window.location.href = `pages/listings.html?${params.toString()}`;
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

// Smooth follower movement
function animateFollower() {
    const speed = 0.15;
    followerX += (mouseX - followerX) * speed;
    followerY += (mouseY - followerY) * speed;

    cursorFollower.style.left = followerX - 20 + 'px';
    cursorFollower.style.top = followerY - 20 + 'px';

    requestAnimationFrame(animateFollower);
}
animateFollower();

// Cursor hover effects
const hoverElements = document.querySelectorAll('a, button, .btn, .card, input, select, .clickable');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });

    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });

    el.addEventListener('mousedown', () => {
        document.body.classList.add('cursor-click');
    });

    el.addEventListener('mouseup', () => {
        document.body.classList.remove('cursor-click');
    });
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

// Scroll Indicator (hide after scrolling)
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
scrollIndicator.innerHTML = `
    <div class="mouse"></div>
    <span>Scroll</span>
`;
document.body.appendChild(scrollIndicator);

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        scrollIndicator.classList.add('hidden');
    } else {
        scrollIndicator.classList.remove('hidden');
    }
});

// Smooth Parallax on Scroll (disabled on hero to prevent section overlap)
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    // Parallax effect disabled - was causing services section to move up into hero
    // The Ken Burns zoom animation on hero background provides sufficient visual interest
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProperties();
    loadTestimonials();
    console.log('%c🏠 Umanie Homes ', 'background: #0A1F44; color: #C9A974; padding: 10px 20px; font-size: 16px; font-weight: bold;');
});
