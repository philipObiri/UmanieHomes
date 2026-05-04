// ===================================
//  LISTING DETAIL PAGE FUNCTIONALITY
// ===================================

// Get property ID from URL
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

let currentProperty = null;
let currentImageIndex = 0;

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
    let message = 'Hello! I would like to inquire about your luxury properties.';

    if (currentProperty) {
        message = `Hello! I'm interested in ${currentProperty.title} (${currentProperty.id}). Can you provide more information?`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
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

// Load Property Details
async function loadPropertyDetails() {
    try {
        const response = await fetch('../data/properties.json');
        const properties = await response.json();
        const property = properties.find(p => p.id === propertyId);

        if (!property) {
            document.querySelector('.property-main').innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-home" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 20px;"></i>
                    <h2>Property Not Found</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 30px;">The property you're looking for doesn't exist or has been removed.</p>
                    <a href="listings.html" class="btn btn-primary">View All Properties</a>
                </div>
            `;
            return;
        }

        currentProperty = property;

        // Update page title
        document.title = `${property.title} | Umanie Homes`;

        // Set main image
        const mainImageEl = document.getElementById('mainImageEl');
        const imageCounter = document.getElementById('imageCounter');

        function updateMainImage(index) {
            currentImageIndex = index;
            mainImageEl.src = property.images[index];
            mainImageEl.alt = `${property.title} - Image ${index + 1}`;
            imageCounter.textContent = `${index + 1} / ${property.images.length}`;

            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach((t, i) => {
                t.classList.toggle('active', i === index);
            });
        }

        updateMainImage(0);

        // Main image click to open lightbox
        document.getElementById('mainImage').addEventListener('click', () => {
            openLightbox(currentImageIndex);
        });

        // Navigation buttons
        document.getElementById('prevImageBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentImageIndex - 1 + property.images.length) % property.images.length;
            updateMainImage(newIndex);
        });

        document.getElementById('nextImageBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentImageIndex + 1) % property.images.length;
            updateMainImage(newIndex);
        });

        // Create thumbnails
        const thumbnailGrid = document.getElementById('thumbnailGrid');
        thumbnailGrid.innerHTML = property.images.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${img}" alt="${property.title} - Thumbnail ${index + 1}">
            </div>
        `).join('');

        // Thumbnail click handlers
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                updateMainImage(index);
            });
        });

        // Keyboard navigation for carousel
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) {
                if (e.key === 'ArrowRight') {
                    document.getElementById('nextImageBtn').click();
                } else if (e.key === 'ArrowLeft') {
                    document.getElementById('prevImageBtn').click();
                }
            }
        });

        // Set property details
        document.getElementById('propertyPrice').textContent = `$${property.price.toLocaleString()}`;
        document.getElementById('propertyTitle').textContent = property.title;
        document.getElementById('propertyLocation').innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            ${property.location.area}, ${property.location.city}, ${property.location.country}
        `;

        // Set stats
        document.getElementById('propertyStats').innerHTML = `
            <div class="stat-item">
                <i class="fas fa-bed"></i>
                <span>${property.bedrooms} Bedrooms</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-bath"></i>
                <span>${property.bathrooms} Bathrooms</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-ruler-combined"></i>
                <span>${property.sqft.toLocaleString()} sqft</span>
            </div>
        `;

        // Set description
        document.getElementById('propertyDescription').textContent = property.description;

        // Set features
        const featuresGrid = document.getElementById('featuresGrid');
        featuresGrid.innerHTML = property.features.map(feature => `
            <div class="feature-item">
                <i class="fas fa-check"></i>
                <span>${feature}</span>
            </div>
        `).join('');

        // Set property ID
        document.getElementById('propertyId').textContent = property.id;

        // Set agent info
        const agentInitial = property.agent.name.charAt(0);
        document.getElementById('agentAvatar').textContent = agentInitial;
        document.getElementById('agentName').textContent = property.agent.name;

        // Agent contact buttons
        document.getElementById('contactAgent').addEventListener('click', () => {
            window.location.href = `tel:${property.agent.phone}`;
        });

        document.getElementById('whatsappAgent').addEventListener('click', () => {
            const message = `Hello ${property.agent.name}, I'm interested in ${property.title} (${property.id}). Can we schedule a viewing?`;
            const url = `https://wa.me/${property.agent.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });

        // Load similar properties
        loadSimilarProperties(property, properties);

    } catch (error) {
        console.error('Error loading property:', error);
        document.querySelector('.property-main').innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 20px;"></i>
                <h2>Error Loading Property</h2>
                <p style="color: var(--text-secondary);">Please try again later or contact us for assistance.</p>
            </div>
        `;
    }
}

// Load Similar Properties
function loadSimilarProperties(currentProp, allProperties) {
    const similar = allProperties
        .filter(p =>
            p.id !== currentProp.id &&
            (p.type === currentProp.type || p.location.city === currentProp.location.city) &&
            p.status === 'available'
        )
        .slice(0, 3);

    const container = document.getElementById('similarProperties');

    if (similar.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No similar properties available at the moment.</p>';
        return;
    }

    container.innerHTML = similar.map(property => `
        <a href="listing-detail.html?id=${property.id}" class="card property-card">
            <div class="card-img" style="background-image: url('${property.images[0]}');">
                ${property.featured ? '<span class="badge badge-featured">FEATURED</span>' : ''}
            </div>
            <div class="card-content">
                <div class="card-price">$${property.price.toLocaleString()}</div>
                <h3 class="card-title">${property.title}</h3>
                <p class="card-subtitle">${property.location.area}, ${property.location.city}</p>
                <div class="card-meta">
                    <span><i class="fas fa-bed"></i> ${property.bedrooms}</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms}</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.sqft.toLocaleString()} sqft</span>
                </div>
            </div>
        </a>
    `).join('');
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const lightboxCounter = lightbox.querySelector('.lightbox-counter');

function openLightbox(index) {
    if (!currentProperty) return;

    currentImageIndex = index;
    lightboxImg.src = currentProperty.images[currentImageIndex];
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentProperty.images.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function nextImage() {
    if (!currentProperty) return;
    currentImageIndex = (currentImageIndex + 1) % currentProperty.images.length;
    lightboxImg.src = currentProperty.images[currentImageIndex];
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentProperty.images.length}`;
}

function prevImage() {
    if (!currentProperty) return;
    currentImageIndex = (currentImageIndex - 1 + currentProperty.images.length) % currentProperty.images.length;
    lightboxImg.src = currentProperty.images[currentImageIndex];
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentProperty.images.length}`;
}

// Lightbox event listeners
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxNextBtn = lightbox.querySelector('.lightbox-next');
const lightboxPrevBtn = lightbox.querySelector('.lightbox-prev');

if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });
}

if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });
}

if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });
}

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    }
});

// Inquiry Form
const inquiryForm = document.getElementById('inquiryForm');
inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simulate form submission
    showToast('Your viewing request has been submitted! Our agent will contact you shortly.');
    inquiryForm.reset();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initialize
if (!propertyId) {
    window.location.href = 'listings.html';
} else {
    loadPropertyDetails();
}
