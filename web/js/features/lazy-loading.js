/* ===================================
   LAZY LOADING UTILITY
   Lazy load images with placeholder
   =================================== */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.01,
            placeholderClass: options.placeholderClass || 'lazy-placeholder',
            loadedClass: options.loadedClass || 'lazy-loaded',
            ...options
        };

        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: this.options.rootMargin,
                    threshold: this.options.threshold
                }
            );

            this.observeImages();
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadAllImages();
        }
    }

    observeImages() {
        const images = document.querySelectorAll('[data-lazy-src]');
        images.forEach(img => this.observer.observe(img));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.lazySrc;
        const srcset = img.dataset.lazySrcset;

        if (!src) return;

        // Create a new image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            img.src = src;

            if (srcset) {
                img.srcset = srcset;
            }

            img.classList.add(this.options.loadedClass);
            img.classList.remove(this.options.placeholderClass);

            // Remove data attributes
            delete img.dataset.lazySrc;
            delete img.dataset.lazySrcset;

            // Emit loaded event
            img.dispatchEvent(new CustomEvent('lazyLoaded'));
        };

        tempImg.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            img.classList.add('lazy-error');
        };

        tempImg.src = src;
    }

    loadAllImages() {
        const images = document.querySelectorAll('[data-lazy-src]');
        images.forEach(img => this.loadImage(img));
    }

    // Observe new images dynamically added to DOM
    observeNewImages() {
        this.observeImages();
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Initialize lazy loading
const lazyLoader = new LazyLoader();

// Watch for dynamically added images
const mutationObserver = new MutationObserver(() => {
    lazyLoader.observeNewImages();
});

mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
});

export default LazyLoader;
