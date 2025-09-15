import { NextRequest, NextResponse } from 'next/server';

// Mock system settings data - in production this would come from database
const mockSystemSettings = {
  // General Settings
  'system.name': {
    value: 'Streaming Proxy Manager',
    type: 'string' as const,
    description: 'The display name for the system',
    category: 'general',
    validation: { required: true, min: 1, max: 100 }
  },
  'system.description': {
    value: 'Advanced streaming proxy management system',
    type: 'string' as const,
    description: 'System description shown in the interface',
    category: 'general',
    validation: { max: 500 }
  },
  'system.maintenance_mode': {
    value: false,
    type: 'boolean' as const,
    description: 'Enable maintenance mode to restrict access',
    category: 'general'
  },
  
  // Performance Settings
  'performance.max_concurrent_streams': {
    value: 100,
    type: 'number' as const,
    description: 'Maximum number of concurrent streaming sessions',
    category: 'performance',
    validation: { required: true, min: 1, max: 1000 }
  },
  'performance.connection_timeout': {
    value: 30,
    type: 'number' as const,
    description: 'Connection timeout in seconds',
    category: 'performance',
    validation: { required: true, min: 5, max: 300 }
  },
  'performance.bandwidth_limit': {
    value: 1000,
    type: 'number' as const,
    description: 'Bandwidth limit per stream in Mbps',
    category: 'performance',
    validation: { required: true, min: 1, max: 10000 }
  },
  
  // Security Settings
  'security.session_timeout': {
    value: 3600,
    type: 'number' as const,
    description: 'User session timeout in seconds',
    category: 'security',
    validation: { required: true, min: 300, max: 86400 }
  },
  'security.max_login_attempts': {
    value: 5,
    type: 'number' as const,
    description: 'Maximum failed login attempts before lockout',
    category: 'security',
    validation: { required: true, min: 1, max: 20 }
  },
  'security.require_2fa': {
    value: false,
    type: 'boolean' as const,
    description: 'Require two-factor authentication for all users',
    category: 'security'
  },
  
  // Monitoring Settings
  'monitoring.log_level': {
    value: 'info',
    type: 'select' as const,
    description: 'System logging level',
    category: 'monitoring',
    validation: { 
      required: true,
      options: ['debug', 'info', 'warn', 'error']
    }
  },
  'monitoring.metrics_retention': {
    value: 30,
    type: 'number' as const,
    description: 'Metrics retention period in days',
    category: 'monitoring',
    validation: { required: true, min: 1, max: 365 }
  },
  'monitoring.alert_email': {
    value: 'admin@example.com',
    type: 'string' as const,
    description: 'Email address for system alerts',
    category: 'monitoring',
    validation: { 
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    }
  }
};

const settingCategories = [
  {
    id: 'general',
    name: 'General',
    description: 'Basic system configuration',
    icon: 'settings'
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Performance and resource settings',
    icon: 'zap'
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security and authentication settings',
    icon: 'shield'
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'Logging and monitoring configuration',
    icon: 'activity'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let settings: typeof mockSystemSettings = mockSystemSettings;
    
    // Filter by category if specified
    if (category) {
      const filteredEntries = Object.entries(mockSystemSettings).filter(
        ([_, setting]) => setting.category === category
      );
      settings = Object.fromEntries(filteredEntries) as typeof mockSystemSettings;
    }

    return NextResponse.json({
      success: true,
      data: {
        settings,
        categories: settingCategories
      }
    });
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system settings' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Setting key and value are required' 
        },
        { status: 400 }
      );
    }

    // Check if setting exists
    if (!mockSystemSettings[key as keyof typeof mockSystemSettings]) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Setting not found' 
        },
        { status: 404 }
      );
    }

    const setting = mockSystemSettings[key as keyof typeof mockSystemSettings];
    
    // Validate the value
    const validationResult = validateSettingValue(value, setting);
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error 
        },
        { status: 400 }
      );
    }

    // In production, this would update the database:
    // await db.systemSetting.update({
    //   where: { key },
    //   data: { 
    //     value: JSON.stringify(value),
    //     updatedAt: new Date()
    //   }
    // });

    // Update mock data
    setting.value = value;

    // Log the change for audit trail
    console.log(`System setting updated: ${key} = ${JSON.stringify(value)}`);

    return NextResponse.json({
      success: true,
      data: {
        key,
        value,
        message: 'Setting updated successfully'
      }
    });
  } catch (error) {
    console.error('Failed to update system setting:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update system setting' 
      },
      { status: 500 }
    );
  }
}

// Validation helper function
function validateSettingValue(value: any, setting: any): { valid: boolean; error?: string } {
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
}