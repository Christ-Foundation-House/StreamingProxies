import { NextRequest, NextResponse } from 'next/server';

export interface ExportRequest {
  type: 'csv' | 'json' | 'pdf';
  data: 'performance' | 'usage' | 'costs' | 'all';
  timeRange: string;
  filters?: {
    region?: string;
    category?: string;
    proxyId?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { type, data, timeRange, filters } = body;

    // Validate request
    if (!['csv', 'json', 'pdf'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid export type' },
        { status: 400 }
      );
    }

    if (!['performance', 'usage', 'costs', 'all'].includes(data)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data type' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Fetch the actual data based on the request parameters
    // 2. Format the data according to the export type
    // 3. Generate the file (CSV, JSON, or PDF)
    // 4. Store it temporarily or return it directly

    const generateExportData = async () => {
      // This would fetch real data from your database
      const mockData = {
        performance: {
          totalStreams: 1234,
          activeStreams: 45,
          averageViewers: 37,
          uptime: 99.9
        },
        usage: {
          bandwidthTotal: 45.6,
          storageUsed: 2.3,
          cpuAverage: 65.5
        },
        costs: {
          currentMonth: 1234.56,
          yearToDate: 13456.78,
          costPerStream: 0.89
        }
      };

      switch (data) {
        case 'performance':
          return { performance: mockData.performance };
        case 'usage':
          return { usage: mockData.usage };
        case 'costs':
          return { costs: mockData.costs };
        case 'all':
          return mockData;
        default:
          return mockData;
      }
    };

    const exportData = await generateExportData();

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `analytics-${data}-${timeRange}-${timestamp}`;

    switch (type) {
      case 'json':
        return NextResponse.json({
          success: true,
          data: exportData,
          metadata: {
            filename: `${filename}.json`,
            generatedAt: new Date().toISOString(),
            type,
            dataType: data,
            timeRange,
            filters
          }
        });

      case 'csv':
        // Convert data to CSV format
        const csvData = convertToCSV(exportData);
        
        return new NextResponse(csvData, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
            'X-Export-Success': 'true'
          }
        });

      case 'pdf':
        // In production, you would generate a PDF using a library like puppeteer or jsPDF
        // For now, return a JSON response indicating PDF generation would happen
        return NextResponse.json({
          success: true,
          message: 'PDF export initiated',
          downloadUrl: `/api/admin/analytics/export/download/${filename}.pdf`,
          metadata: {
            filename: `${filename}.pdf`,
            generatedAt: new Date().toISOString(),
            type,
            dataType: data,
            timeRange,
            filters
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported export type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to export analytics data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export analytics data' 
      },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any): string {
  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened);

  const csvHeaders = headers.join(',');
  const csvValues = values.map(value => 
    typeof value === 'string' ? `"${value}"` : value
  ).join(',');

  return `${csvHeaders}\n${csvValues}`;
}

// GET endpoint for downloading generated files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Check if the file exists in your storage
    // 2. Verify user permissions to access the file
    // 3. Return the file content with appropriate headers

    return NextResponse.json({
      success: false,
      error: 'File not found or expired',
      message: 'Export files are available for 24 hours after generation'
    }, { status: 404 });

  } catch (error) {
    console.error('Failed to download export file:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to download export file' 
      },
      { status: 500 }
    );
  }
}