/* ===================================
   SCROLL CONTROLS
   Back to top button and scroll utilities
   =================================== */

// Back to Top Button
class BackToTop {
    constructor() {
        this.button = null;
        this.scrollThreshold = 300;
        this.init();
    }

    init() {
        this.createButton();
        this.setupEventListeners();
    }

    createButton() {
        // Check if button already exists
        if (document.querySelector('.back-to-top')) {
            this.button = document.querySelector('.back-to-top');
            return;
        }

        this.button = document.createElement('button');
        this.button.className = 'back-to-top';
        this.button.setAttribute('aria-label', 'Back to top');
        this.button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(this.button);
    }

    setupEventListeners() {
        // Show/hide on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > this.scrollThreshold) {
                this.show();
            } else {
                this.hide();
            }
        });

        // Click handler
        this.button.addEventListener('click', () => {
            this.scrollToTop();
        });
    }

    show() {
        this.button.classList.add('show');
    }

    hide() {
        this.button.classList.remove('show');
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// WhatsApp Chat Bubble
class WhatsAppBubble {
    constructor(options = {}) {
        this.options = {
            phoneNumber: options.phoneNumber || '233245550101',
            message: options.message || 'Hello! I\'m interested in your luxury properties.',
            tooltip: options.tooltip || 'Chat with us on WhatsApp',
            ...options
        };
        this.bubble = null;
        this.init();
    }

    init() {
        this.createBubble();
        this.setupEventListeners();
    }

    createBubble() {
        // Check if bubble already exists
        if (document.querySelector('.whatsapp-bubble')) {
            this.bubble = document.querySelector('.whatsapp-bubble');
            return;
        }

        this.bubble = document.createElement('div');
        this.bubble.className = 'whatsapp-bubble';
        this.bubble.innerHTML = `
            <button class="whatsapp-btn" aria-label="Chat on WhatsApp">
                <i class="fab fa-whatsapp"></i>
            </button>
            <div class="whatsapp-tooltip">${this.options.tooltip}</div>
        `;
        document.body.appendChild(this.bubble);
    }

    setupEventListeners() {
        const button = this.bubble.querySelector('.whatsapp-btn');
        button.addEventListener('click', () => {
            this.openWhatsApp();
        });
    }

    openWhatsApp() {
        const encodedMessage = encodeURIComponent(this.options.message);
        const url = `https://wa.me/${this.options.phoneNumber}?text=${encodedMessage}`;
        window.open(url, '_blank');
    }

    setPhoneNumber(number) {
        this.options.phoneNumber = number;
    }

    setMessage(message) {
        this.options.message = message;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Back to Top
    new BackToTop();

    // Initialize WhatsApp Bubble
    new WhatsAppBubble({
        phoneNumber: '233245550101', // Replace with actual number
        message: 'Hello! I would like to inquire about your luxury properties.',
        tooltip: 'Chat with us on WhatsApp'
    });
});

// Export for module use
export { BackToTop, WhatsAppBubble };
