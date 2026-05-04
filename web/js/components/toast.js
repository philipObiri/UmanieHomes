/* ===================================
   TOAST NOTIFICATION COMPONENT
   =================================== */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(message, options = {}) {
        const toast = {
            id: Date.now() + Math.random(),
            message: options.message || message,
            title: options.title || '',
            type: options.type || 'info', // success, error, warning, info
            duration: options.duration || 5000,
            closeable: options.closeable !== undefined ? options.closeable : true
        };

        this.toasts.push(toast);
        this.render(toast);

        // Auto remove after duration
        if (toast.duration > 0) {
            setTimeout(() => {
                this.remove(toast.id);
            }, toast.duration);
        }

        return toast.id;
    }

    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    render(toast) {
        const toastElement = document.createElement('div');
        toastElement.className = `toast toast-${toast.type}`;
        toastElement.dataset.toastId = toast.id;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toastElement.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[toast.type]}"></i>
            </div>
            <div class="toast-content">
                ${toast.title ? `<div class="toast-title">${toast.title}</div>` : ''}
                <div class="toast-message">${toast.message}</div>
            </div>
            ${toast.closeable ? `
                <button class="toast-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
            ${toast.duration > 0 ? `
                <div class="toast-progress" style="animation-duration: ${toast.duration}ms"></div>
            ` : ''}
        `;

        this.container.appendChild(toastElement);

        // Trigger animation
        setTimeout(() => {
            toastElement.classList.add('show');
        }, 10);

        // Close button
        if (toast.closeable) {
            const closeBtn = toastElement.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.remove(toast.id));
        }
    }

    remove(toastId) {
        const toastElement = this.container.querySelector(`[data-toast-id="${toastId}"]`);

        if (toastElement) {
            toastElement.classList.remove('show');
            toastElement.classList.add('hide');

            setTimeout(() => {
                toastElement.remove();
                this.toasts = this.toasts.filter(t => t.id !== toastId);
            }, 300);
        }
    }

    removeAll() {
        this.toasts.forEach(toast => this.remove(toast.id));
    }
}

// Create singleton instance
const toast = new ToastManager();

export default toast;
