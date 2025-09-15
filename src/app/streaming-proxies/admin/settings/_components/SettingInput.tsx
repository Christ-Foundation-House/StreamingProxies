'use client';

import { useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface SettingInputProps {
  setting: {
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'select';
    description: string;
    validation?: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
      options?: string[];
    };
  };
  onChange: (key: string, value: any) => void;
  error?: string;
  isModified?: boolean;
}

export default function SettingInput({ setting, onChange, error, isModified }: SettingInputProps) {
  const [localValue, setLocalValue] = useState(setting.value);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (value: any) => {
    setLocalValue(value);
    onChange(setting.key, value);
  };

  const renderInput = () => {
    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
      error 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;

    switch (setting.type) {
      case 'string':
        return (
          <input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={baseClasses}
            placeholder={setting.validation?.pattern ? 'Enter valid format' : ''}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={localValue || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            min={setting.validation?.min}
            max={setting.validation?.max}
            className={baseClasses}
          />
        );

      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localValue || false}
              onChange={(e) => handleChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        );

      case 'select':
        return (
          <select
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={baseClasses}
          >
            {setting.validation?.options?.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  const getValidationHint = () => {
    if (!setting.validation) return null;

    const hints = [];
    if (setting.validation.required) hints.push('Required');
    if (setting.validation.min && setting.type === 'string') {
      hints.push(`Min ${setting.validation.min} characters`);
    }
    if (setting.validation.max && setting.type === 'string') {
      hints.push(`Max ${setting.validation.max} characters`);
    }
    if (setting.validation.min && setting.type === 'number') {
      hints.push(`Min: ${setting.validation.min}`);
    }
    if (setting.validation.max && setting.type === 'number') {
      hints.push(`Max: ${setting.validation.max}`);
    }

    return hints.length > 0 ? hints.join(', ') : null;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {setting.key ? setting.key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Setting'}
          {setting.validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isModified && (
          <div className="flex items-center text-xs text-blue-600">
            <Check className="h-3 w-3 mr-1" />
            Modified
          </div>
        )}
      </div>

      <div className="relative">
        {renderInput()}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <p className="text-xs text-gray-500">{setting.description}</p>
        {getValidationHint() && (
          <p className="text-xs text-gray-400">{getValidationHint()}</p>
        )}
        {error && (
          <p className="text-xs text-red-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}