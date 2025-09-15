'use client';

import { useState, useEffect, useCallback } from 'react';

interface SystemSetting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  category: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

interface SettingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SystemSettingsData {
  settings: Record<string, SystemSetting>;
  categories: SettingCategory[];
}

interface SettingsAuditEntry {
  id: string;
  settingKey: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

interface UseSystemSettingsReturn {
  settings: Record<string, SystemSetting>;
  categories: SettingCategory[];
  isLoading: boolean;
  error: string | null;
  updateSetting: (key: string, value: any, reason?: string) => Promise<void>;
  updateMultipleSettings: (updates: Array<{ key: string; value: any }>, reason?: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
  getSettingsByCategory: (categoryId: string) => SystemSetting[];
  validateSetting: (key: string, value: any) => { valid: boolean; error?: string };
  getAuditHistory: (settingKey?: string) => Promise<SettingsAuditEntry[]>;
  hasUnsavedChanges: boolean;
  resetChanges: () => void;
}

export function useSystemSettings(categoryFilter?: string): UseSystemSettingsReturn {
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({});
  const [categories, setCategories] = useState<SettingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalSettings, setOriginalSettings] = useState<Record<string, SystemSetting>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = categoryFilter 
        ? `/api/admin/settings?category=${categoryFilter}`
        : '/api/admin/settings';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch settings');
      }

      const data: SystemSettingsData = result.data;
      
      // Transform the settings object to include the key in each setting
      const transformedSettings: Record<string, SystemSetting> = {};
      Object.entries(data.settings).forEach(([key, setting]) => {
        transformedSettings[key] = { ...setting, key };
      });
      
      setSettings(transformedSettings);
      setCategories(data.categories);
      setOriginalSettings(transformedSettings);
      setHasUnsavedChanges(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch system settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  const validateSetting = useCallback((key: string, value: any): { valid: boolean; error?: string } => {
    const setting = settings[key];
    if (!setting) {
      return { valid: false, error: 'Setting not found' };
    }

    const { type, validation } = setting;

    // Type validation
    if (type === 'string' && typeof value !== 'string') {
      return { valid: false, error: 'Value must be a string' };
    }
    if (type === 'number' && typeof value !== 'number') {
      return { valid: false, error: 'Value must be a number' };
    }
    if (type === 'boolean' && typeof value !== 'boolean') {
      return { valid: false, error: 'Value must be a boolean' };
    }

    if (!validation) return { valid: true };

    // Required validation
    if (validation.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: 'This setting is required' };
    }

    // String validations
    if (type === 'string' && typeof value === 'string') {
      if (validation.min && value.length < validation.min) {
        return { valid: false, error: `Value must be at least ${validation.min} characters` };
      }
      if (validation.max && value.length > validation.max) {
        return { valid: false, error: `Value must be no more than ${validation.max} characters` };
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return { valid: false, error: 'Value format is invalid' };
      }
    }

    // Number validations
    if (type === 'number' && typeof value === 'number') {
      if (validation.min && value < validation.min) {
        return { valid: false, error: `Value must be at least ${validation.min}` };
      }
      if (validation.max && value > validation.max) {
        return { valid: false, error: `Value must be no more than ${validation.max}` };
      }
    }

    // Select validations
    if (type === 'select' && validation.options) {
      if (!validation.options.includes(value)) {
        return { valid: false, error: `Value must be one of: ${validation.options.join(', ')}` };
      }
    }

    return { valid: true };
  }, [settings]);

  const updateSetting = useCallback(async (key: string, value: any, reason?: string) => {
    try {
      // Validate the setting
      const validationResult = validateSetting(key, value);
      if (!validationResult.valid) {
        throw new Error(validationResult.error);
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update setting');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update setting');
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));

      // Create audit entry if reason provided
      if (reason) {
        await createAuditEntry(key, originalSettings[key]?.value, value, reason);
      }

      // Check if we still have unsaved changes
      const updatedSettings = { ...settings, [key]: { ...settings[key], value } };
      const hasChanges = Object.keys(updatedSettings).some(
        settingKey => updatedSettings[settingKey].value !== originalSettings[settingKey]?.value
      );
      setHasUnsavedChanges(hasChanges);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [settings, originalSettings, validateSetting]);

  const updateMultipleSettings = useCallback(async (
    updates: Array<{ key: string; value: any }>, 
    reason?: string
  ) => {
    try {
      // Validate all settings first
      for (const update of updates) {
        const validationResult = validateSetting(update.key, update.value);
        if (!validationResult.valid) {
          throw new Error(`${update.key}: ${validationResult.error}`);
        }
      }

      const response = await fetch('/api/admin/settings/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          settings: updates,
          changedBy: 'current-user', // In real app, get from auth context
          reason 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const result = await response.json();
      
      if (!result.success && result.data.errors.length > 0) {
        const errorMessages = result.data.errors.map((err: any) => `${err.key}: ${err.error}`);
        throw new Error(errorMessages.join(', '));
      }

      // Update local state for successful updates
      const updatedSettings = { ...settings };
      result.data.updated.forEach((update: any) => {
        updatedSettings[update.key] = { ...updatedSettings[update.key], value: update.value };
      });
      setSettings(updatedSettings);

      // Check if we still have unsaved changes
      const hasChanges = Object.keys(updatedSettings).some(
        settingKey => updatedSettings[settingKey].value !== originalSettings[settingKey]?.value
      );
      setHasUnsavedChanges(hasChanges);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [settings, originalSettings, validateSetting]);

  const createAuditEntry = async (settingKey: string, oldValue: any, newValue: any, reason: string) => {
    try {
      await fetch('/api/admin/settings/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settingKey,
          oldValue,
          newValue,
          changedBy: 'current-user', // In real app, get from auth context
          reason,
        }),
      });
    } catch (err) {
      console.warn('Failed to create audit entry:', err);
      // Don't throw here as the setting update was successful
    }
  };

  const getAuditHistory = useCallback(async (settingKey?: string): Promise<SettingsAuditEntry[]> => {
    try {
      const url = settingKey 
        ? `/api/admin/settings/audit?settingKey=${settingKey}`
        : '/api/admin/settings/audit';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit history');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch audit history');
      }

      return result.data.entries.map((entry: any) => ({
        ...entry,
        changedAt: new Date(entry.changedAt)
      }));
    } catch (err) {
      console.error('Failed to fetch audit history:', err);
      return [];
    }
  }, []);

  const getSettingsByCategory = useCallback((categoryId: string): SystemSetting[] => {
    return Object.entries(settings)
      .filter(([_, setting]) => setting.category === categoryId)
      .map(([key, setting]) => ({ ...setting, key }));
  }, [settings]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const resetChanges = useCallback(() => {
    setSettings(originalSettings);
    setHasUnsavedChanges(false);
    setError(null);
  }, [originalSettings]);

  // Track changes to determine if there are unsaved changes
  useEffect(() => {
    const hasChanges = Object.keys(settings).some(
      key => settings[key].value !== originalSettings[key]?.value
    );
    setHasUnsavedChanges(hasChanges);
  }, [settings, originalSettings]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    categories,
    isLoading,
    error,
    updateSetting,
    updateMultipleSettings,
    refreshSettings,
    getSettingsByCategory,
    validateSetting,
    getAuditHistory,
    hasUnsavedChanges,
    resetChanges,
  };
}