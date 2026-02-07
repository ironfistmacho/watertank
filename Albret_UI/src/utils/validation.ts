// Email validation
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (minimum 8 characters, at least one letter and one number)
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters' };
    }

    if (!/[a-zA-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true };
};

// Confirm password validation
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

// Validate sensor value range
export const validateSensorValue = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

// Form field validation
export interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
}

export const validateField = (
    value: any,
    rules: ValidationRules
): { isValid: boolean; message?: string } => {
    if (rules.required && (!value || value.toString().trim() === '')) {
        return { isValid: false, message: 'This field is required' };
    }

    if (rules.minLength && value.length < rules.minLength) {
        return { isValid: false, message: `Minimum length is ${rules.minLength}` };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
        return { isValid: false, message: `Maximum length is ${rules.maxLength}` };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
        return { isValid: false, message: 'Invalid format' };
    }

    if (rules.custom && !rules.custom(value)) {
        return { isValid: false, message: 'Validation failed' };
    }

    return { isValid: true };
};
