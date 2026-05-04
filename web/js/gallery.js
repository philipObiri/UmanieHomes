// ===================================
//  GALLERY PAGE FUNCTIONALITY
// ===================================

// Gallery Data
const galleryImages = [
    // Exteriors
    { id: 1, category: 'exteriors', title: 'Modern Villa Facade', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
    { id: 2, category: 'exteriors', title: 'Luxury Estate Entrance', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
    { id: 3, category: 'exteriors', title: 'Contemporary Architecture', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80' },
    { id: 4, category: 'exteriors', title: 'Beachfront Property', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
    { id: 5, category: 'exteriors', title: 'Urban Penthouse', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },

    // Interiors
    { id: 6, category: 'interiors', title: 'Grand Foyer', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' },
    { id: 7, category: 'interiors', title: 'Elegant Staircase', image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80' },
    { id: 8, category: 'interiors', title: 'Luxury Hallway', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
    { id: 9, category: 'interiors', title: 'Open Floor Plan', image: 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80' },

    // Living Rooms
    { id: 10, category: 'living', title: 'Contemporary Living Space', image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80' },
    { id: 11, category: 'living', title: 'Cozy Lounge Area', image: 'https://images.unsplash.com/photo-1600210491852-f0900c3e4b18?auto=format&fit=crop&w=800&q=80' },
    { id: 12, category: 'living', title: 'Modern Minimalist Living', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80' },
    { id: 13, category: 'living', title: 'Luxury Seating Area', image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80' },
    { id: 14, category: 'living', title: 'Panoramic View Living Room', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80' },

    // Kitchens
    { id: 15, category: 'kitchens', title: 'Gourmet Kitchen', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80' },
    { id: 16, category: 'kitchens', title: 'Modern Chef\'s Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80' },
    { id: 17, category: 'kitchens', title: 'Island Kitchen Design', image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=800&q=80' },
    { id: 18, category: 'kitchens', title: 'Luxury Kitchen & Dining', image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80' },

    // Bedrooms
    { id: 19, category: 'bedrooms', title: 'Master Suite', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
    { id: 20, category: 'bedrooms', title: 'Serene Bedroom Retreat', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80' },
    { id: 21, category: 'bedrooms', title: 'Elegant Bedroom', image: 'https://images.unsplash.com/photo-1616594266889-c92c1e0919e1?auto=format&fit=crop&w=800&q=80' },
    { id: 22, category: 'bedrooms', title: 'Luxury Sleeping Space', image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=800&q=80' },

    // Amenities
    { id: 23, category: 'amenities', title: 'Infinity Pool', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80' },
    { id: 24, category: 'amenities', title: 'Private Gym', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' },
    { id: 25, category: 'amenities', title: 'Home Cinema', image: 'https://images.unsplash.com/photo-1560089168-6516081f5bf1?auto=format&fit=crop&w=800&q=80' },
    { id: 26, category: 'amenities', title: 'Wine Cellar', image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80' },
    { id: 27, category: 'amenities', title: 'Spa & Wellness', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80' },
    { id: 28, category: 'amenities', title: 'Outdoor Terrace', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80' },
];

// Gallery State
let allImages = galleryImages;
let filteredImages = [...allImages];
let currentFilter = 'all';
let displayedCount = 0;
const imagesPerLoad = 9;
let currentLightboxIndex = 0;

// Initialize Gallery
function initGallery() {
    updateFilterCounts();
    loadImages(true);
    setupFilterButtons();
    setupLoadMore();
}

// Update Filter Counts
function updateFilterCounts() {
    const counts = {
        all: allImages.length,
        exteriors: allImages.filter(img => img.category === 'exteriors').length,
        interiors: allImages.filter(img => img.category === 'interiors').length,
        living: allImages.filter(img => img.category === 'living').length,
        kitchens: allImages.filter(img => img.category === 'kitchens').length,
        bedrooms: allImages.filter(img => img.category === 'bedrooms').length,
        amenities: allImages.filter(img => img.category === 'amenities').length,
    };

    document.querySelectorAll('.filter-btn').forEach(btn => {
        const category = btn.getAttribute('data-category');
        const countSpan = btn.querySelector('.count');
        if (countSpan) {
            countSpan.textContent = `(${counts[category] || 0})`;
        }
    });
}

// Load Images
function loadImages(reset = false) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    if (reset) {
        grid.innerHTML = '';
        displayedCount = 0;
    }

    const imagesToShow = filteredImages.slice(displayedCount, displayedCount + imagesPerLoad);

    imagesToShow.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${img.image}" alt="${img.title}" loading="lazy">
            <div class="gallery-zoom-icon">
                <i class="fas fa-search-plus"></i>
            </div>
            <div class="gallery-overlay">
                <div class="gallery-title">${img.title}</div>
                <div class="gallery-category">${img.category}</div>
            </div>
        `;

        // Add click handler to open lightbox
        item.addEventListener('click', () => {
            currentLightboxIndex = filteredImages.indexOf(img);
            openLightbox();
        });

        grid.appendChild(item);
    });

    displayedCount += imagesToShow.length;
    updateStats();
    updateLoadMoreButton();
}

// Update Stats
function updateStats() {
    const showingCount = document.getElementById('showingCount');
    const totalCount = document.getElementById('totalCount');
    if (showingCount) showingCount.textContent = displayedCount;
    if (totalCount) totalCount.textContent = filteredImages.length;
}

// Update Load More Button
function updateLoadMoreButton() {
    const btn = document.getElementById('loadMoreBtn');
    if (!btn) return;

    if (displayedCount >= filteredImages.length) {
        btn.disabled = true;
        btn.textContent = 'No More Images';
    } else {
        btn.disabled = false;
        btn.textContent = 'Load More Images';
    }
}

// Setup Filter Buttons
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter images
            currentFilter = btn.getAttribute('data-category');

            if (currentFilter === 'all') {
                filteredImages = [...allImages];
            } else {
                filteredImages = allImages.filter(img => img.category === currentFilter);
            }

            // Reset and reload
            loadImages(true);

            // Scroll to gallery
            const galleryGrid = document.getElementById('galleryGrid');
            if (galleryGrid) {
                galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Setup Load More
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadImages(false);
        });
    }
}

// Lightbox
const lightbox = document.getElementById('lightbox');
if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');

    function openLightbox() {
        if (filteredImages.length === 0 || !lightboxImg) return;

        const currentImage = filteredImages[currentLightboxIndex];
        lightboxImg.src = currentImage.image;
        lightboxImg.alt = currentImage.title;
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${filteredImages.length}`;
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function nextImage() {
        if (!lightboxImg) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % filteredImages.length;
        const currentImage = filteredImages[currentLightboxIndex];
        lightboxImg.src = currentImage.image;
        lightboxImg.alt = currentImage.title;
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${filteredImages.length}`;
        }
    }

    function prevImage() {
        if (!lightboxImg) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + filteredImages.length) % filteredImages.length;
        const currentImage = filteredImages[currentLightboxIndex];
        lightboxImg.src = currentImage.image;
        lightboxImg.alt = currentImage.title;
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${filteredImages.length}`;
        }
    }

    // Lightbox event listeners
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');

    if (lightboxClose) {
        lightboxClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextImage();
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
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
}

// Initialize
initGallery();
