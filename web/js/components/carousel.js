/* ===================================
   CAROUSEL COMPONENT
   Reusable carousel with multiple features
   =================================== */

class Carousel {
    constructor(element, options = {}) {
        this.carousel = element;
        this.track = element.querySelector('.carousel-track');
        this.slides = Array.from(element.querySelectorAll('.carousel-slide'));
        this.prevButton = element.querySelector('.carousel-nav.prev');
        this.nextButton = element.querySelector('.carousel-nav.next');
        this.indicatorsContainer = element.querySelector('.carousel-indicators');
        this.counter = element.querySelector('.carousel-counter');
        this.thumbnails = Array.from(element.querySelectorAll('.carousel-thumbnail'));

        // Options
        this.options = {
            autoplay: options.autoplay || false,
            autoplayInterval: options.autoplayInterval || 5000,
            loop: options.loop !== undefined ? options.loop : true,
            swipe: options.swipe !== undefined ? options.swipe : true,
            keyboard: options.keyboard !== undefined ? options.keyboard : true,
            indicators: options.indicators !== undefined ? options.indicators : true,
            transition: options.transition || 'slide', // 'slide' or 'fade'
            ...options
        };

        // State
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        // Set initial state
        this.updateCarousel(0);

        // Create indicators if needed
        if (this.options.indicators && !this.indicatorsContainer) {
            this.createIndicators();
        }

        // Setup event listeners
        this.setupEventListeners();

        // Start autoplay if enabled
        if (this.options.autoplay) {
            this.startAutoplay();
        }

        // Update counter
        this.updateCounter();
    }

    createIndicators() {
        const indicatorsDiv = document.createElement('div');
        indicatorsDiv.className = 'carousel-indicators';

        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicatorsDiv.appendChild(indicator);
        });

        this.carousel.appendChild(indicatorsDiv);
        this.indicatorsContainer = indicatorsDiv;
    }

    setupEventListeners() {
        // Navigation buttons
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.prev());
        }

        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.next());
        }

        // Keyboard navigation
        if (this.options.keyboard) {
            document.addEventListener('keydown', (e) => {
                if (!this.carousel.matches(':hover')) return;

                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prev();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.next();
                }
            });
        }

        // Touch/Swipe support
        if (this.options.swipe) {
            this.track.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.track.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });

            // Mouse drag support for desktop
            let isDragging = false;
            let startPos = 0;
            let currentTranslate = 0;
            let prevTranslate = 0;

            this.track.addEventListener('mousedown', (e) => {
                isDragging = true;
                startPos = e.pageX;
                this.track.style.cursor = 'grabbing';
                this.pauseAutoplay();
            });

            this.track.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const currentPosition = e.pageX;
                currentTranslate = prevTranslate + currentPosition - startPos;
            });

            this.track.addEventListener('mouseup', (e) => {
                isDragging = false;
                this.track.style.cursor = 'grab';
                const movedBy = e.pageX - startPos;

                if (movedBy < -50) {
                    this.next();
                } else if (movedBy > 50) {
                    this.prev();
                }

                if (this.options.autoplay) {
                    this.startAutoplay();
                }
            });

            this.track.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    this.track.style.cursor = 'grab';
                }
            });
        }

        // Thumbnail clicks
        this.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => this.goToSlide(index));
        });

        // Pause autoplay on hover
        if (this.options.autoplay) {
            this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoplay());
        }
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    prev() {
        if (this.isAnimating) return;

        let newIndex = this.currentIndex - 1;

        if (newIndex < 0) {
            if (this.options.loop) {
                newIndex = this.slides.length - 1;
            } else {
                return;
            }
        }

        this.goToSlide(newIndex);
    }

    next() {
        if (this.isAnimating) return;

        let newIndex = this.currentIndex + 1;

        if (newIndex >= this.slides.length) {
            if (this.options.loop) {
                newIndex = 0;
            } else {
                return;
            }
        }

        this.goToSlide(newIndex);
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;

        this.isAnimating = true;
        this.currentIndex = index;

        this.updateCarousel(index);

        // Reset animation lock after transition
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);

        // Reset autoplay timer
        if (this.options.autoplay) {
            this.resetAutoplay();
        }
    }

    updateCarousel(index) {
        const offset = -index * 100;

        if (this.options.transition === 'fade') {
            this.slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        } else {
            this.track.style.transform = `translateX(${offset}%)`;
        }

        // Update indicators
        this.updateIndicators(index);

        // Update thumbnails
        this.updateThumbnails(index);

        // Update navigation buttons
        this.updateNavButtons(index);

        // Update counter
        this.updateCounter();

        // Emit custom event
        this.carousel.dispatchEvent(new CustomEvent('slideChange', {
            detail: { index, slide: this.slides[index] }
        }));
    }

    updateIndicators(index) {
        if (!this.indicatorsContainer) return;

        const indicators = this.indicatorsContainer.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    updateThumbnails(index) {
        this.thumbnails.forEach((thumbnail, i) => {
            thumbnail.classList.toggle('active', i === index);
        });
    }

    updateNavButtons(index) {
        if (!this.options.loop) {
            if (this.prevButton) {
                this.prevButton.disabled = index === 0;
            }

            if (this.nextButton) {
                this.nextButton.disabled = index === this.slides.length - 1;
            }
        }
    }

    updateCounter() {
        if (this.counter) {
            this.counter.textContent = `${this.currentIndex + 1} / ${this.slides.length}`;
        }
    }

    startAutoplay() {
        if (!this.options.autoplay) return;

        this.pauseAutoplay(); // Clear any existing timer

        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.options.autoplayInterval);
    }

    pauseAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    resetAutoplay() {
        this.pauseAutoplay();
        this.startAutoplay();
    }

    destroy() {
        this.pauseAutoplay();
        // Remove event listeners and reset state
        this.currentIndex = 0;
        this.track.style.transform = '';
    }

    // Public API
    getCurrentIndex() {
        return this.currentIndex;
    }

    getSlideCount() {
        return this.slides.length;
    }
}

// Auto-initialize carousels on page load
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('[data-carousel]');

    carousels.forEach(element => {
        const options = {
            autoplay: element.dataset.autoplay === 'true',
            autoplayInterval: parseInt(element.dataset.interval) || 5000,
            loop: element.dataset.loop !== 'false',
            swipe: element.dataset.swipe !== 'false',
            keyboard: element.dataset.keyboard !== 'false',
            indicators: element.dataset.indicators !== 'false',
            transition: element.dataset.transition || 'slide'
        };

        new Carousel(element, options);
    });
});

// Export for module use
export default Carousel;
