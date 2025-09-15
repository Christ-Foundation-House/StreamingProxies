import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSystemSettings } from '../useSystemSettings';
import { useSettingsValidation } from '../useSettingsValidation';
import { useSettingsChangeTracking } from '../useSettingsChangeTracking';

// Mock fetch
global.fetch = vi.fn();

describe('System Settings Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          settings: {
            'system.name': {
              value: 'Test System',
              type: 'string',
              description: 'System name',
              category: 'general',
              validation: { required: true, min: 1, max: 100 }
            },
            'performance.max_streams': {
              value: 100,
              type: 'number',
              description: 'Max streams',
              category: 'performance',
              validation: { required: true, min: 1, max: 1000 }
            }
          },
          categories: [
            { id: 'general', name: 'General', description: 'General settings', icon: 'settings' },
            { id: 'performance', name: 'Performance', description: 'Performance settings', icon: 'zap' }
          ]
        }
      })
    });
  });

  describe('useSystemSettings', () => {
    it('should fetch and return system settings', async () => {
      const { result } = renderHook(() => useSystemSettings());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toHaveProperty('system.name');
      expect(result.current.settings['system.name'].value).toBe('Test System');
      expect(result.current.categories).toHaveLength(2);
    });

    it('should validate settings correctly', async () => {
      const { result } = renderHook(() => useSystemSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Valid string
      const validResult = result.current.validateSetting('system.name', 'Valid Name');
      expect(validResult.valid).toBe(true);

      // Invalid string (too short)
      const invalidResult = result.current.validateSetting('system.name', '');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('required');
    });

    it('should get settings by category', async () => {
      const { result } = renderHook(() => useSystemSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const generalSettings = result.current.getSettingsByCategory('general');
      expect(generalSettings).toHaveLength(1);
      expect(generalSettings[0].key).toBe('system.name');

      const performanceSettings = result.current.getSettingsByCategory('performance');
      expect(performanceSettings).toHaveLength(1);
      expect(performanceSettings[0].key).toBe('performance.max_streams');
    });

    it('should update settings', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { key: 'system.name', value: 'Updated Name' } })
      });

      const { result } = renderHook(() => useSystemSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSetting('system.name', 'Updated Name');
      });

      expect(result.current.settings['system.name'].value).toBe('Updated Name');
    });
  });

  describe('useSettingsValidation', () => {
    it('should validate string settings', () => {
      const { result } = renderHook(() => useSettingsValidation());

      const setting = {
        key: 'test.string',
        type: 'string' as const,
        validation: { required: true, min: 3, max: 10 }
      };

      // Valid string
      const validResult = result.current.validateSetting(setting, 'valid');
      expect(validResult.valid).toBe(true);

      // Too short
      const shortResult = result.current.validateSetting(setting, 'ab');
      expect(shortResult.valid).toBe(false);
      expect(shortResult.error).toContain('at least 3');

      // Too long
      const longResult = result.current.validateSetting(setting, 'this is too long');
      expect(longResult.valid).toBe(false);
      expect(longResult.error).toContain('no more than 10');
    });

    it('should validate number settings', () => {
      const { result } = renderHook(() => useSettingsValidation());

      const setting = {
        key: 'test.number',
        type: 'number' as const,
        validation: { required: true, min: 1, max: 100 }
      };

      // Valid number
      const validResult = result.current.validateSetting(setting, 50);
      expect(validResult.valid).toBe(true);

      // Too small
      const smallResult = result.current.validateSetting(setting, 0);
      expect(smallResult.valid).toBe(false);
      expect(smallResult.error).toContain('at least 1');

      // Too large
      const largeResult = result.current.validateSetting(setting, 101);
      expect(largeResult.valid).toBe(false);
      expect(largeResult.error).toContain('no more than 100');
    });

    it('should validate select settings', () => {
      const { result } = renderHook(() => useSettingsValidation());

      const setting = {
        key: 'test.select',
        type: 'select' as const,
        validation: { options: ['option1', 'option2', 'option3'] }
      };

      // Valid option
      const validResult = result.current.validateSetting(setting, 'option1');
      expect(validResult.valid).toBe(true);

      // Invalid option
      const invalidResult = result.current.validateSetting(setting, 'invalid');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('Must be one of');
    });
  });

  describe('useSettingsChangeTracking', () => {
    it('should track changes', () => {
      const { result } = renderHook(() => useSettingsChangeTracking());

      act(() => {
        result.current.trackChange('test.setting', 'old value', 'new value', 'Test change');
      });

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.changeCount).toBe(1);
      expect(result.current.changes['test.setting']).toBeDefined();
      expect(result.current.changes['test.setting'].newValue).toBe('new value');
    });

    it('should clear changes', () => {
      const { result } = renderHook(() => useSettingsChangeTracking());

      act(() => {
        result.current.trackChange('test.setting', 'old value', 'new value');
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.clearChange('test.setting');
      });

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.changeCount).toBe(0);
    });

    it('should undo changes', () => {
      const { result } = renderHook(() => useSettingsChangeTracking());

      act(() => {
        result.current.trackChange('test.setting', 'old value', 'new value');
      });

      const undoValue = result.current.undoChange('test.setting');
      expect(undoValue).toBe('old value');
      expect(result.current.hasChanges).toBe(false);
    });

    it('should generate change descriptions', () => {
      const { result } = renderHook(() => useSettingsChangeTracking());

      act(() => {
        result.current.trackChange('system.maintenance_mode', false, true);
      });

      const description = result.current.getChangeDescription('system.maintenance_mode');
      expect(description).toContain('Maintenance Mode');
      expect(description).toContain('Disabled → Enabled');
    });
  });
});