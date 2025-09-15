'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, ChevronDown, X } from 'lucide-react';

export interface TimeRange {
  value: string;
  label: string;
  description?: string;
  isCustom?: boolean;
}

export interface CustomDateRange {
  start: string;
  end: string;
}

interface TimeRangeSelectorProps {
  selectedRange: string;
  customRange?: CustomDateRange;
  onRangeChange: (range: string, customRange?: CustomDateRange) => void;
  ranges?: TimeRange[];
  showQuickFilters?: boolean;
  className?: string;
}

const defaultRanges: TimeRange[] = [
  { value: '1h', label: '1 Hour', description: 'Last hour' },
  { value: '24h', label: '24 Hours', description: 'Last 24 hours' },
  { value: '7d', label: '7 Days', description: 'Last week' },
  { value: '30d', label: '30 Days', description: 'Last month' },
  { value: '90d', label: '90 Days', description: 'Last quarter' },
  { value: '1y', label: '1 Year', description: 'Last year' },
  { value: 'custom', label: 'Custom Range', description: 'Select specific dates', isCustom: true }
];

const quickFilters = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' }
];

export default function TimeRangeSelector({
  selectedRange,
  customRange,
  onRangeChange,
  ranges = defaultRanges,
  showQuickFilters = true,
  className = ''
}: TimeRangeSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempCustomRange, setTempCustomRange] = useState<CustomDateRange>(
    customRange || { start: '', end: '' }
  );

  const selectedRangeData = ranges.find(r => r.value === selectedRange);

  const handleRangeSelect = (range: string) => {
    if (range === 'custom') {
      setShowCustomPicker(true);
    } else {
      onRangeChange(range);
      setShowDropdown(false);
    }
  };

  const handleCustomRangeApply = () => {
    if (tempCustomRange.start && tempCustomRange.end) {
      onRangeChange('custom', tempCustomRange);
      setShowCustomPicker(false);
      setShowDropdown(false);
    }
  };

  const handleQuickFilter = (filterValue: string) => {
    const now = new Date();
    let start: Date, end: Date;

    switch (filterValue) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        start = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        end = now;
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        start = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate());
        end = new Date(lastWeekEnd.getFullYear(), lastWeekEnd.getMonth(), lastWeekEnd.getDate(), 23, 59, 59);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      default:
        return;
    }

    const customRange: CustomDateRange = {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };

    setTempCustomRange(customRange);
    onRangeChange('custom', customRange);
    setShowDropdown(false);
  };

  const formatCustomRangeLabel = (range: CustomDateRange) => {
    if (!range.start || !range.end) return 'Custom Range';
    const start = new Date(range.start).toLocaleDateString();
    const end = new Date(range.end).toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Selector Button */}
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="gap-2 min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {selectedRange === 'custom' && customRange
              ? formatCustomRangeLabel(customRange)
              : selectedRangeData?.label || 'Select Range'
            }
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Card className="p-4 w-80 shadow-lg">
            {/* Quick Filters */}
            {showQuickFilters && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickFilter(filter.value)}
                      className="justify-start text-sm"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Predefined Ranges */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Time Ranges</h4>
              <div className="space-y-1">
                {ranges.filter(r => !r.isCustom).map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleRangeSelect(range.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedRange === range.value && !customRange
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{range.label}</div>
                    {range.description && (
                      <div className="text-xs text-gray-500">{range.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowCustomPicker(true)}
                className="w-full justify-start gap-2"
              >
                <Clock className="h-4 w-4" />
                Custom Date Range
              </Button>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Custom Date Picker Modal */}
      {showCustomPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Custom Date Range</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomPicker(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempCustomRange.start}
                    onChange={(e) => setTempCustomRange({ ...tempCustomRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempCustomRange.end}
                    onChange={(e) => setTempCustomRange({ ...tempCustomRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {tempCustomRange.start && tempCustomRange.end && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="text-sm text-blue-700">
                      Selected range: {formatCustomRangeLabel(tempCustomRange)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {Math.ceil((new Date(tempCustomRange.end).getTime() - new Date(tempCustomRange.start).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomPicker(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCustomRangeApply}
                  disabled={!tempCustomRange.start || !tempCustomRange.end}
                >
                  Apply Range
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}