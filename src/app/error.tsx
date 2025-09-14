'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-lg border border-red-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => reset()}
              variant="outline"
              className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              <span>Try again</span>
            </Button>
            
            <Link href="/" passHref>
              <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                Go to home
              </Button>
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 bg-gray-50 rounded-md text-sm text-gray-600 overflow-auto max-h-96">
              <summary className="font-medium mb-2 cursor-pointer">
                Error Details (Development Only)
              </summary>
              <pre className="whitespace-pre-wrap font-mono text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {error.stack || error.toString()}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
