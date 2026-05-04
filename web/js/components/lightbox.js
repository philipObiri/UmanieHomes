/* ===================================
   LIGHTBOX COMPONENT
   Full-screen image gallery viewer
   =================================== */

class Lightbox {
    constructor(options = {}) {
        this.options = {
            closeOnBackdrop: options.closeOnBackdrop !== undefined ? options.closeOnBackdrop : true,
            closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
            keyboard: options.keyboard !== undefined ? options.keyboard : true,
            zoom: options.zoom !== undefined ? options.zoom : true,
            thumbnails: options.thumbnails !== undefined ? options.thumbnails : true,
            ...options
        };

        this.images = [];
        this.currentIndex = 0;
        this.isOpen = false;
        this.isZoomed = false;
        this.lightboxElement = null;

        this.createLightbox();
        this.setupEventListeners();
    }

    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Image gallery');

        lightbox.innerHTML = `
            <div class="lightbox-container">
                <button class="lightbox-close" aria-label="Close lightbox">
                    <i class="fas fa-times"></i>
                </button>

                <div class="lightbox-counter"></div>

                <button class="lightbox-nav prev" aria-label="Previous image">
                    <i class="fas fa-chevron-left"></i>
                </button>

                <img class="lightbox-image" src="" alt="" />

                <button class="lightbox-nav next" aria-label="Next image">
                    <i class="fas fa-chevron-right"></i>
                </button>

                <div class="lightbox-caption"></div>

                ${this.options.zoom ? `
                    <div class="lightbox-zoom-controls">
                        <button class="lightbox-zoom-btn" data-action="zoom-in" aria-label="Zoom in">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="lightbox-zoom-btn" data-action="zoom-out" aria-label="Zoom out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                    </div>
                ` : ''}

                ${this.options.thumbnails ? `
                    <div class="lightbox-thumbnails"></div>
                ` : ''}

                <div class="lightbox-loading" style="display: none;">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);
        this.lightboxElement = lightbox;

        // Get element references
        this.container = lightbox.querySelector('.lightbox-container');
        this.image = lightbox.querySelector('.lightbox-image');
        this.closeBtn = lightbox.querySelector('.lightbox-close');
        this.prevBtn = lightbox.querySelector('.lightbox-nav.prev');
        this.nextBtn = lightbox.querySelector('.lightbox-nav.next');
        this.counter = lightbox.querySelector('.lightbox-counter');
        this.caption = lightbox.querySelector('.lightbox-caption');
        this.thumbnailsContainer = lightbox.querySelector('.lightbox-thumbnails');
        this.loading = lightbox.querySelector('.lightbox-loading');
    }

    setupEventListeners() {
        // Close button
        this.closeBtn.addEventListener('click', () => this.close());

        // Navigation
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        // Backdrop click
        if (this.options.closeOnBackdrop) {
            this.lightboxElement.addEventListener('click', (e) => {
                if (e.target === this.lightboxElement) {
                    this.close();
                }
            });
        }

        // Keyboard navigation
        if (this.options.keyboard) {
            document.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;

                switch (e.key) {
                    case 'Escape':
                        if (this.options.closeOnEscape) {
                            this.close();
                        }
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.next();
                        break;
                }
            });
        }

        // Zoom functionality
        if (this.options.zoom) {
            this.image.addEventListener('click', () => this.toggleZoom());

            const zoomInBtn = this.lightboxElement.querySelector('[data-action="zoom-in"]');
            const zoomOutBtn = this.lightboxElement.querySelector('[data-action="zoom-out"]');

            if (zoomInBtn) {
                zoomInBtn.addEventListener('click', () => this.zoomIn());
            }

            if (zoomOutBtn) {
                zoomOutBtn.addEventListener('click', () => this.zoomOut());
            }
        }
    }

    open(images, startIndex = 0) {
        this.images = Array.isArray(images) ? images : [images];
        this.currentIndex = startIndex;
        this.isOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Show lightbox
        this.lightboxElement.classList.add('active');

        // Load first image
        this.showImage(this.currentIndex);

        // Create thumbnails
        if (this.options.thumbnails && this.images.length > 1) {
            this.createThumbnails();
        }

        // Focus trap
        this.closeBtn.focus();

        // Emit open event
        this.lightboxElement.dispatchEvent(new CustomEvent('lightboxOpen', {
            detail: { index: this.currentIndex, images: this.images }
        }));
    }

    close() {
        this.isOpen = false;
        this.isZoomed = false;

        // Restore body scroll
        document.body.style.overflow = '';

        // Hide lightbox
        this.lightboxElement.classList.remove('active');

        // Clear images
        this.image.src = '';
        this.images = [];

        // Emit close event
        this.lightboxElement.dispatchEvent(new CustomEvent('lightboxClose'));
    }

    prev() {
        if (this.currentIndex > 0) {
            this.showImage(this.currentIndex - 1);
        } else if (this.images.length > 1) {
            this.showImage(this.images.length - 1);
        }
    }

    next() {
        if (this.currentIndex < this.images.length - 1) {
            this.showImage(this.currentIndex + 1);
        } else if (this.images.length > 1) {
            this.showImage(0);
        }
    }

    showImage(index) {
        if (index < 0 || index >= this.images.length) return;

        this.currentIndex = index;
        const imageData = this.images[index];

        // Show loading
        this.loading.style.display = 'block';
        this.image.style.opacity = '0';

        // Reset zoom
        this.isZoomed = false;
        this.image.classList.remove('zoomed');

        // Load image
        const img = new Image();
        img.onload = () => {
            this.image.src = imageData.src || imageData;
            this.image.alt = imageData.alt || '';
            this.image.style.opacity = '1';
            this.loading.style.display = 'none';
        };
        img.src = imageData.src || imageData;

        // Update counter
        this.updateCounter();

        // Update caption
        this.updateCaption(imageData);

        // Update navigation buttons
        this.updateNavButtons();

        // Update thumbnails
        this.updateThumbnails();

        // Emit change event
        this.lightboxElement.dispatchEvent(new CustomEvent('lightboxChange', {
            detail: { index: this.currentIndex, image: imageData }
        }));
    }

    updateCounter() {
        if (this.images.length > 1) {
            this.counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
            this.counter.style.display = 'block';
        } else {
            this.counter.style.display = 'none';
        }
    }

    updateCaption(imageData) {
        if (imageData.title || imageData.description) {
            this.caption.innerHTML = `
                ${imageData.title ? `<h3>${imageData.title}</h3>` : ''}
                ${imageData.description ? `<p>${imageData.description}</p>` : ''}
            `;
            this.caption.style.display = 'block';
        } else {
            this.caption.style.display = 'none';
        }
    }

    updateNavButtons() {
        if (this.images.length <= 1) {
            this.prevBtn.style.display = 'none';
            this.nextBtn.style.display = 'none';
        } else {
            this.prevBtn.style.display = 'flex';
            this.nextBtn.style.display = 'flex';
        }
    }

    createThumbnails() {
        if (!this.thumbnailsContainer) return;

        this.thumbnailsContainer.innerHTML = '';

        this.images.forEach((imageData, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'lightbox-thumbnail';
            if (index === this.currentIndex) {
                thumbnail.classList.add('active');
            }

            const img = document.createElement('img');
            img.src = imageData.thumbnail || imageData.src || imageData;
            img.alt = imageData.alt || '';

            thumbnail.appendChild(img);
            thumbnail.addEventListener('click', () => this.showImage(index));

            this.thumbnailsContainer.appendChild(thumbnail);
        });
    }

    updateThumbnails() {
        if (!this.thumbnailsContainer) return;

        const thumbnails = this.thumbnailsContainer.querySelectorAll('.lightbox-thumbnail');
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.classList.toggle('active', index === this.currentIndex);
        });
    }

    toggleZoom() {
        if (this.isZoomed) {
            this.zoomOut();
        } else {
            this.zoomIn();
        }
    }

    zoomIn() {
        this.isZoomed = true;
        this.image.classList.add('zoomed');
    }

    zoomOut() {
        this.isZoomed = false;
        this.image.classList.remove('zoomed');
    }

    destroy() {
        this.close();
        if (this.lightboxElement) {
            this.lightboxElement.remove();
        }
    }
}

// Initialize lightbox for images with data-lightbox attribute
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = new Lightbox();

    // Single images
    document.querySelectorAll('[data-lightbox]').forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const src = element.dataset.lightbox || element.src || element.href;
            const alt = element.alt || element.dataset.alt || '';
            const title = element.dataset.title || '';
            const description = element.dataset.description || '';

            lightbox.open({
                src,
                alt,
                title,
                description
            });
        });
    });

    // Gallery groups
    const galleries = {};

    document.querySelectorAll('[data-lightbox-gallery]').forEach(element => {
        const galleryName = element.dataset.lightboxGallery;

        if (!galleries[galleryName]) {
            galleries[galleryName] = [];
        }

        const imageData = {
            src: element.dataset.src || element.src || element.href,
            alt: element.alt || element.dataset.alt || '',
            title: element.dataset.title || '',
            description: element.dataset.description || '',
            thumbnail: element.dataset.thumbnail || element.src || element.href
        };

        galleries[galleryName].push(imageData);

        element.style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const index = galleries[galleryName].indexOf(imageData);
            lightbox.open(galleries[galleryName], index);
        });
    });
});

// Export for module use
export default Lightbox;
