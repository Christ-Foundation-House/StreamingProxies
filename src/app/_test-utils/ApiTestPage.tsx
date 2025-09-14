'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export function ApiTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const testApiCall = async (endpoint: string, method = 'GET') => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      const res = await fetch(endpoint, { method });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data
      });
      
      toast({
        title: 'Success',
        description: 'API request completed successfully',
      });
      
    } catch (error: any) {
      console.error('API Error:', error);
      setResponse({
        error: error.message,
        status: error.status || 500
      });
      
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Error Testing</h1>
        <p className="text-muted-foreground">
          Test API error handling and responses
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Valid Request</CardTitle>
            <CardDescription>Test a successful API call</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => testApiCall('/api/streaming-proxies')}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Test Valid Request'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
            <CardDescription>Test 404 error handling</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              onClick={() => testApiCall('/api/non-existent-route')}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Test 404 Error'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Error</CardTitle>
            <CardDescription>Test 500 error handling</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              onClick={() => testApiCall('/api/streaming-proxies/error-test')}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Test 500 Error'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>API Response Data</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
