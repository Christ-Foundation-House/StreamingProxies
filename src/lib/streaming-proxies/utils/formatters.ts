import { format, formatDistanceToNow, isValid } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid time';
  return format(dateObj, 'HH:mm:ss');
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatLastUpdated = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Just now';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    return formatRelativeTime(dateObj);
  }
};

// Duration formatting
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export const formatStreamDuration = (startTime: Date | string, endTime?: Date | string): string => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = endTime ? (typeof endTime === 'string' ? new Date(endTime) : endTime) : new Date();
  
  if (!isValid(start)) return 'Invalid duration';
  
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  
  return formatDuration(durationMinutes);
};

// Data size formatting
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatBandwidth = (mbps: number): string => {
  if (mbps < 1) return `${(mbps * 1000).toFixed(0)} Kbps`;
  if (mbps < 1000) return `${mbps.toFixed(1)} Mbps`;
  return `${(mbps / 1000).toFixed(2)} Gbps`;
};

// Number formatting
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Stream-specific formatting
export const formatStreamCount = (current: number, max: number): string => {
  return `${current}/${max}`;
};

export const formatStreamUtilization = (current: number, max: number): string => {
  return formatPercentage(current, max);
};

export const formatViewerCount = (count: number): string => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Status formatting
export const formatProxyStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const formatHealthStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// URL formatting
export const formatRtmpUrl = (url: string, showKey: boolean = false): string => {
  if (!showKey) {
    // Hide the stream key part of the URL
    const urlParts = url.split('/');
    if (urlParts.length > 3) {
      return urlParts.slice(0, -1).join('/') + '/***';
    }
  }
  return url;
};

export const extractServerFromRtmpUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'Unknown';
  }
};

// Location formatting
export const formatServerLocation = (location: string): string => {
  const locationMap: Record<string, string> = {
    'us-east-1': 'US East (Virginia)',
    'us-west-2': 'US West (Oregon)',
    'eu-west-1': 'Europe (Ireland)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
    'ca-central-1': 'Canada (Central)',
    'sa-east-1': 'South America (São Paulo)',
  };
  
  return locationMap[location] || location;
};

// Error formatting
export const formatErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

// Search highlighting
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

// Truncation
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const truncateMiddle = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  const start = Math.ceil((maxLength - 3) / 2);
  const end = Math.floor((maxLength - 3) / 2);
  
  return text.substring(0, start) + '...' + text.substring(text.length - end);
};

// Validation helpers
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Color utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'red';
    case 'maintenance':
      return 'yellow';
    case 'healthy':
      return 'green';
    case 'warning':
      return 'yellow';
    case 'error':
      return 'red';
    default:
      return 'gray';
  }
};

export const getUtilizationColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Chart data formatting
export const formatChartData = (data: Array<{ date: string; value: number }>) => {
  return data.map(item => ({
    ...item,
    date: formatDate(item.date),
    formattedValue: formatNumber(item.value),
  }));
};

export const formatAnalyticsData = (data: any) => {
  return {
    ...data,
    usageByDay: data.usageByDay?.map((item: any) => ({
      ...item,
      date: formatDate(item.date),
      totalDataTransferred: formatBytes(item.totalDataTransferred),
      peakViewers: formatViewerCount(item.peakViewers),
    })),
    topProxies: data.topProxies?.map((item: any) => ({
      ...item,
      totalDataTransferred: formatBytes(item.totalDataTransferred),
    })),
  };
};

// Form helpers
export const formatFormValue = (value: any, type: string): string => {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'date':
      return value instanceof Date ? format(value, 'yyyy-MM-dd') : value;
    case 'datetime-local':
      return value instanceof Date ? format(value, "yyyy-MM-dd'T'HH:mm") : value;
    case 'number':
      return typeof value === 'number' ? value.toString() : value;
    default:
      return String(value);
  }
};

// Copy to clipboard helper
export const formatForClipboard = (data: any): string => {
  if (typeof data === 'string') return data;
  if (typeof data === 'object') return JSON.stringify(data, null, 2);
  return String(data);
};