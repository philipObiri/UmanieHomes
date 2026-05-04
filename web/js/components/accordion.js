/* ===================================
   ACCORDION COMPONENT
   =================================== */

class Accordion {
    constructor(element, options = {}) {
        this.accordion = element;
        this.items = Array.from(element.querySelectorAll('.accordion-item'));
        this.options = {
            allowMultiple: options.allowMultiple || false,
            ...options
        };

        this.init();
    }

    init() {
        this.items.forEach((item, index) => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');

            if (!header || !content) return;

            // Set ARIA attributes
            const headerId = `accordion-header-${index}`;
            const contentId = `accordion-content-${index}`;

            header.id = headerId;
            header.setAttribute('aria-controls', contentId);
            header.setAttribute('aria-expanded', 'false');

            content.id = contentId;
            content.setAttribute('aria-labelledby', headerId);
            content.setAttribute('role', 'region');

            // Click handler
            header.addEventListener('click', () => this.toggle(item));

            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(item);
                }
            });
        });
    }

    toggle(item) {
        const isActive = item.classList.contains('active');
        const header = item.querySelector('.accordion-header');

        if (isActive) {
            this.close(item);
        } else {
            // Close other items if allowMultiple is false
            if (!this.options.allowMultiple) {
                this.items.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        this.close(otherItem);
                    }
                });
            }

            this.open(item);
        }
    }

    open(item) {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');

        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');

        // Emit open event
        this.accordion.dispatchEvent(new CustomEvent('accordionOpen', {
            detail: { item }
        }));
    }

    close(item) {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');

        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');

        // Emit close event
        this.accordion.dispatchEvent(new CustomEvent('accordionClose', {
            detail: { item }
        }));
    }

    openAll() {
        this.items.forEach(item => this.open(item));
    }

    closeAll() {
        this.items.forEach(item => this.close(item));
    }
}

// Initialize accordions
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-accordion]').forEach(element => {
        const allowMultiple = element.dataset.accordion === 'multiple';
        new Accordion(element, { allowMultiple });
    });
});

export default Accordion;
