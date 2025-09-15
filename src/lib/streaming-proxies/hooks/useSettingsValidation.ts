'use client';

import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface SettingValidation {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  validation?: ValidationRule;
}

interface UseSettingsValidationReturn {
  validateSetting: (setting: SettingValidation, value: any) => ValidationResult;
  validateMultipleSettings: (settings: Array<{ setting: SettingValidation; value: any }>) => Record<string, string>;
  errors: Record<string, string>;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export function useSettingsValidation(): UseSettingsValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSetting = useCallback((setting: SettingValidation, value: any): ValidationResult => {
    const { type, validation } = setting;

    // Type validation
    if (type === 'string' && typeof value !== 'string') {
      return { valid: false, error: 'Value must be a string' };
    }
    if (type === 'number' && (typeof value !== 'number' || isNaN(value))) {
      return { valid: false, error: 'Value must be a valid number' };
    }
    if (type === 'boolean' && typeof value !== 'boolean') {
      return { valid: false, error: 'Value must be a boolean' };
    }

    if (!validation) return { valid: true };

    // Required validation
    if (validation.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: 'This field is required' };
    }

    // Skip further validation if value is empty and not required
    if (!validation.required && (value === null || value === undefined || value === '')) {
      return { valid: true };
    }

    // String validations
    if (type === 'string' && typeof value === 'string') {
      if (validation.min && value.length < validation.min) {
        return { 
          valid: false, 
          error: `Must be at least ${validation.min} character${validation.min !== 1 ? 's' : ''}` 
        };
      }
      if (validation.max && value.length > validation.max) {
        return { 
          valid: false, 
          error: `Must be no more than ${validation.max} character${validation.max !== 1 ? 's' : ''}` 
        };
      }
      if (validation.pattern) {
        try {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return { valid: false, error: 'Invalid format' };
          }
        } catch (err) {
          console.warn('Invalid regex pattern:', validation.pattern);
          return { valid: false, error: 'Invalid validation pattern' };
        }
      }
    }

    // Number validations
    if (type === 'number' && typeof value === 'number' && !isNaN(value)) {
      if (validation.min !== undefined && value < validation.min) {
        return { valid: false, error: `Must be at least ${validation.min}` };
      }
      if (validation.max !== undefined && value > validation.max) {
        return { valid: false, error: `Must be no more than ${validation.max}` };
      }
    }

    // Select validations
    if (type === 'select' && validation.options) {
      if (!validation.options.includes(value)) {
        return { 
          valid: false, 
          error: `Must be one of: ${validation.options.join(', ')}` 
        };
      }
    }

    return { valid: true };
  }, []);

  const validateMultipleSettings = useCallback((
    settingsToValidate: Array<{ setting: SettingValidation; value: any }>
  ): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    settingsToValidate.forEach(({ setting, value }) => {
      const result = validateSetting(setting, value);
      if (!result.valid && result.error) {
        newErrors[setting.key] = result.error;
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return newErrors;
  }, [validateSetting]);

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    validateSetting,
    validateMultipleSettings,
    errors,
    clearError,
    clearAllErrors,
    hasErrors,
  };
}