/* ===================================
   MODAL COMPONENT
   =================================== */

class Modal {
    constructor(element, options = {}) {
        this.modal = element;
        this.options = {
            closeOnBackdrop: options.closeOnBackdrop !== undefined ? options.closeOnBackdrop : true,
            closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
            focusTrap: options.focusTrap !== undefined ? options.focusTrap : true,
            ...options
        };

        this.isOpen = false;
        this.previousFocus = null;
        this.focusableElements = [];

        this.init();
    }

    init() {
        this.backdrop = this.modal.querySelector('.modal-backdrop');
        this.container = this.modal.querySelector('.modal-container');
        this.closeBtn = this.modal.querySelector('.modal-close');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Backdrop click
        if (this.options.closeOnBackdrop && this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }

        // ESC key
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        // Focus trap
        if (this.options.focusTrap) {
            this.modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && this.isOpen) {
                    this.handleTab(e);
                }
            });
        }
    }

    open() {
        this.isOpen = true;

        // Store current focus
        this.previousFocus = document.activeElement;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Show modal
        this.modal.classList.add('active');

        // Get focusable elements
        this.updateFocusableElements();

        // Focus first element
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
        }

        // Emit open event
        this.modal.dispatchEvent(new CustomEvent('modalOpen'));
    }

    close() {
        this.isOpen = false;

        // Restore body scroll
        document.body.style.overflow = '';

        // Hide modal
        this.modal.classList.remove('active');

        // Restore focus
        if (this.previousFocus) {
            this.previousFocus.focus();
        }

        // Emit close event
        this.modal.dispatchEvent(new CustomEvent('modalClose'));
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    updateFocusableElements() {
        const focusableSelectors = [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        this.focusableElements = Array.from(
            this.modal.querySelectorAll(focusableSelectors.join(','))
        );
    }

    handleTab(e) {
        if (this.focusableElements.length === 0) return;

        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
}

// Initialize modals
document.addEventListener('DOMContentLoaded', () => {
    const modals = {};

    // Initialize all modals
    document.querySelectorAll('.modal').forEach(element => {
        const modalId = element.id;
        if (modalId) {
            modals[modalId] = new Modal(element);
        }
    });

    // Trigger buttons
    document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.dataset.modalTrigger;
            if (modals[modalId]) {
                modals[modalId].open();
            }
        });
    });

    // Close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            const modalId = modal?.id;
            if (modalId && modals[modalId]) {
                modals[modalId].close();
            }
        });
    });
});

export default Modal;
