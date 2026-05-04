/* ===================================
   FORM VALIDATION UTILITY
   =================================== */

import toast from '../components/toast.js';

class FormValidator {
    constructor(form, options = {}) {
        this.form = form;
        this.options = {
            validateOnInput: options.validateOnInput !== undefined ? options.validateOnInput : true,
            showToast: options.showToast !== undefined ? options.showToast : true,
            ...options
        };

        this.errors = {};
        this.init();
    }

    init() {
        // Prevent default form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        if (this.options.validateOnInput) {
            const inputs = this.form.querySelectorAll('.form-control, .form-input, .form-select, .form-textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        this.validateField(input);
                    }
                });
            });
        }
    }

    handleSubmit() {
        if (this.validate()) {
            const formData = this.getFormData();

            // Emit custom event
            this.form.dispatchEvent(new CustomEvent('formValid', {
                detail: { data: formData }
            }));

            if (this.options.showToast) {
                toast.success('Form submitted successfully!');
            }

            return formData;
        } else {
            if (this.options.showToast) {
                toast.error('Please fix the errors in the form');
            }

            // Focus first error field
            const firstError = this.form.querySelector('.form-group.error .form-control, .form-group.error .form-input');
            if (firstError) {
                firstError.focus();
            }

            return false;
        }
    }

    validate() {
        this.errors = {};
        let isValid = true;

        const inputs = this.form.querySelectorAll('.form-control, .form-input, .form-select, .form-textarea');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(input) {
        const formGroup = input.closest('.form-group');
        const name = input.name || input.id;
        const value = input.value.trim();
        const isRequired = input.hasAttribute('required');
        const type = input.type || input.dataset.validate;

        // Clear previous error
        this.clearError(formGroup);

        // Required validation
        if (isRequired && !value) {
            this.setError(formGroup, input, 'This field is required');
            return false;
        }

        // Skip further validation if empty and not required
        if (!value && !isRequired) {
            return true;
        }

        // Email validation
        if (type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.setError(formGroup, input, 'Please enter a valid email address');
                return false;
            }
        }

        // Phone validation
        if (type === 'tel' || input.dataset.validate === 'phone') {
            const phoneRegex = /^[\d\s\+\-\(\)]+$/;
            if (!phoneRegex.test(value) || value.length < 10) {
                this.setError(formGroup, input, 'Please enter a valid phone number');
                return false;
            }
        }

        // Min length validation
        if (input.hasAttribute('minlength')) {
            const minLength = parseInt(input.getAttribute('minlength'));
            if (value.length < minLength) {
                this.setError(formGroup, input, `Minimum ${minLength} characters required`);
                return false;
            }
        }

        // Max length validation
        if (input.hasAttribute('maxlength')) {
            const maxLength = parseInt(input.getAttribute('maxlength'));
            if (value.length > maxLength) {
                this.setError(formGroup, input, `Maximum ${maxLength} characters allowed`);
                return false;
            }
        }

        // Pattern validation
        if (input.hasAttribute('pattern')) {
            const pattern = new RegExp(input.getAttribute('pattern'));
            if (!pattern.test(value)) {
                this.setError(formGroup, input, input.dataset.patternMessage || 'Invalid format');
                return false;
            }
        }

        // Custom validation
        if (input.dataset.validate === 'match') {
            const matchFieldId = input.dataset.match;
            const matchField = this.form.querySelector(`#${matchFieldId}`);
            if (matchField && value !== matchField.value) {
                this.setError(formGroup, input, 'Fields do not match');
                return false;
            }
        }

        // Success state
        this.setSuccess(formGroup);
        return true;
    }

    setError(formGroup, input, message) {
        if (formGroup) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');

            let errorElement = formGroup.querySelector('.form-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'form-error';
                input.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
        }

        this.errors[input.name || input.id] = message;
    }

    setSuccess(formGroup) {
        if (formGroup) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');

            const errorElement = formGroup.querySelector('.form-error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }

    clearError(formGroup) {
        if (formGroup) {
            formGroup.classList.remove('error', 'success');

            const errorElement = formGroup.querySelector('.form-error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    reset() {
        this.form.reset();
        this.errors = {};

        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => this.clearError(group));
    }
}

// Auto-initialize forms with data-validate attribute
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('[data-validate]');
    forms.forEach(form => {
        new FormValidator(form);
    });
});

export default FormValidator;
