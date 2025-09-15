'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';
import SettingInput from './SettingInput';

interface Setting {
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

interface SettingsCategoryProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  settings: Setting[];
  onSave: (categoryId: string, changes: Record<string, any>) => Promise<void>;
  onReset: (categoryId: string) => void;
  isLoading?: boolean;
}

export default function SettingsCategory({ 
  category, 
  settings, 
  onSave, 
  onReset, 
  isLoading = false 
}: SettingsCategoryProps) {
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    settings.forEach(setting => {
      initial[setting.key] = setting.value;
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modifiedKeys, setModifiedKeys] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    
    // Track modified keys
    const originalSetting = settings.find(s => s.key === key);
    if (originalSetting && originalSetting.value !== value) {
      setModifiedKeys(prev => {
        const newSet = new Set(prev);
        newSet.add(key);
        return newSet;
      });
    } else {
      setModifiedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }

    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateSettings = (): boolean => {
    const newErrors: Record<string, string> = {};

    settings.forEach(setting => {
      const value = localSettings[setting.key];
      const validation = setting.validation;

      if (!validation) return;

      // Required validation
      if (validation.required && (value === null || value === undefined || value === '')) {
        newErrors[setting.key] = 'This field is required';
        return;
      }

      // String validations
      if (setting.type === 'string' && typeof value === 'string') {
        if (validation.min && value.length < validation.min) {
          newErrors[setting.key] = `Must be at least ${validation.min} characters`;
        }
        if (validation.max && value.length > validation.max) {
          newErrors[setting.key] = `Must be no more than ${validation.max} characters`;
        }
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          newErrors[setting.key] = 'Invalid format';
        }
      }

      // Number validations
      if (setting.type === 'number' && typeof value === 'number') {
        if (validation.min && value < validation.min) {
          newErrors[setting.key] = `Must be at least ${validation.min}`;
        }
        if (validation.max && value > validation.max) {
          newErrors[setting.key] = `Must be no more than ${validation.max}`;
        }
      }

      // Select validations
      if (setting.type === 'select' && validation.options) {
        if (!validation.options.includes(value)) {
          newErrors[setting.key] = `Must be one of: ${validation.options.join(', ')}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      return;
    }

    setIsSaving(true);
    try {
      const changes: Record<string, any> = {};
      Array.from(modifiedKeys).forEach(key => {
        changes[key] = localSettings[key];
      });

      await onSave(category.id, changes);
      setModifiedKeys(new Set());
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Error handling would be done by parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const resetSettings: Record<string, any> = {};
    settings.forEach(setting => {
      resetSettings[setting.key] = setting.value;
    });
    setLocalSettings(resetSettings);
    setModifiedKeys(new Set());
    setErrors({});
    onReset(category.id);
  };

  const hasChanges = modifiedKeys.size > 0;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isSaving || isLoading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || hasErrors || isSaving || isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasErrors && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-sm text-red-800">
              Please fix the validation errors before saving.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {settings.map((setting) => (
          <SettingInput
            key={setting.key}
            setting={setting}
            onChange={handleSettingChange}
            error={errors[setting.key]}
            isModified={modifiedKeys.has(setting.key)}
          />
        ))}
      </div>

      {hasChanges && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            You have unsaved changes in {modifiedKeys.size} setting{modifiedKeys.size !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </Card>
  );
}