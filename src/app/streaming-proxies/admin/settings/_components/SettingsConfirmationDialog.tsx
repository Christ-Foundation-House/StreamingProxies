'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, X, Check } from 'lucide-react';

interface SettingsChange {
  key: string;
  oldValue: any;
  newValue: any;
  description: string;
}

interface SettingsConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  changes: SettingsChange[];
  isLoading?: boolean;
}

export default function SettingsConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  changes,
  isLoading = false
}: SettingsConfirmationDialogProps) {
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);

  if (!isOpen) return null;

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    if (value === null || value === undefined || value === '') {
      return '(empty)';
    }
    return String(value);
  };

  const getSettingDisplayName = (key: string): string => {
    if (!key) return 'Unknown Setting';
    return key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || key;
  };

  const handleConfirm = () => {
    onConfirm(reason || undefined);
    setReason('');
    setShowReasonField(false);
  };

  const handleCancel = () => {
    onClose();
    setReason('');
    setShowReasonField(false);
  };

  const criticalChanges = changes.filter(change => 
    change.key.includes('maintenance_mode') || 
    change.key.includes('security') ||
    change.key.includes('max_concurrent')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Settings Changes
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            You are about to modify {changes.length} system setting{changes.length !== 1 ? 's' : ''}. 
            Please review the changes below before confirming.
          </p>

          {criticalChanges.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                <p className="text-sm text-amber-800 font-medium">
                  Critical settings detected
                </p>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                These changes may affect system availability or security.
              </p>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-md">
            <div className="divide-y divide-gray-200">
              {changes.map((change, index) => (
                <div key={index} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {getSettingDisplayName(change.key)}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {change.description}
                      </p>
                    </div>
                    {criticalChanges.some(c => c.key === change.key) && (
                      <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Current:</span>
                      <div className="font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                        {formatValue(change.oldValue)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">New:</span>
                      <div className="font-mono bg-blue-100 px-2 py-1 rounded mt-1">
                        {formatValue(change.newValue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!showReasonField && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReasonField(true)}
                className="text-xs"
              >
                Add reason for changes (optional)
              </Button>
            </div>
          )}

          {showReasonField && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for changes (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe why these changes are being made..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {isLoading ? 'Applying Changes...' : 'Confirm Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}