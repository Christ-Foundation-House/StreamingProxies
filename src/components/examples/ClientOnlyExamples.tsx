'use client';

import { useState, useEffect } from 'react';
import { ClientOnly, useIsClient } from '../ClientOnly';

/**
 * Example component showing browser-specific information
 * that would cause hydration mismatches if rendered on server
 */
function BrowserInfo() {
  const [info, setInfo] = useState<{
    userAgent: string;
    language: string;
    platform: string;
    cookiesEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    setInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
    });
  }, []);

  if (!info) return <div>Loading browser info...</div>;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Browser Information</h3>
      <div className="space-y-1 text-sm">
        <div><strong>Platform:</strong> {info.platform}</div>
        <div><strong>Language:</strong> {info.language}</div>
        <div><strong>Cookies:</strong> {info.cookiesEnabled ? 'Enabled' : 'Disabled'}</div>
        <div><strong>User Agent:</strong> {info.userAgent.substring(0, 50)}...</div>
      </div>
    </div>
  );
}

/**
 * Example component showing localStorage usage
 * that needs client-side rendering
 */
function LocalStorageExample() {
  const [storedValue, setStoredValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('clientOnlyExample') || '';
    setStoredValue(stored);
    setInputValue(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('clientOnlyExample', inputValue);
    setStoredValue(inputValue);
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold mb-2">LocalStorage Example</h3>
      <div className="space-y-2">
        <div className="text-sm">
          <strong>Stored value:</strong> {storedValue || 'None'}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a value"
            className="px-2 py-1 border rounded text-sm"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Example showing conditional rendering based on client/server
 */
function ConditionalRenderingExample() {
  const isClient = useIsClient();

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="font-semibold mb-2">Conditional Rendering</h3>
      <div className="text-sm">
        <div><strong>Environment:</strong> {isClient ? 'Client' : 'Server'}</div>
        <div><strong>Hydrated:</strong> {isClient ? 'Yes' : 'No'}</div>
        {isClient && (
          <div className="mt-2 p-2 bg-green-100 rounded">
            This content only appears on the client!
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Collection of examples demonstrating ClientOnly usage patterns
 */
export function ClientOnlyExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold">ClientOnly Component Examples</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Browser-specific information */}
        <ClientOnly 
          fallback={
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          }
        >
          <BrowserInfo />
        </ClientOnly>

        {/* LocalStorage example */}
        <ClientOnly 
          fallback={
            <div className="p-4 bg-blue-100 rounded-lg">
              <div className="font-semibold mb-2">LocalStorage Example</div>
              <div className="text-sm text-gray-600">Loading...</div>
            </div>
          }
          loading={
            <div className="p-4 bg-blue-100 rounded-lg">
              <div className="font-semibold mb-2">LocalStorage Example</div>
              <div className="text-sm text-gray-600">Initializing...</div>
            </div>
          }
          delay={200}
        >
          <LocalStorageExample />
        </ClientOnly>

        {/* Conditional rendering example */}
        <ConditionalRenderingExample />
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Usage Guidelines</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Use ClientOnly for components that access browser APIs</li>
          <li>Wrap time-sensitive components to prevent hydration mismatches</li>
          <li>Provide meaningful fallback content for better UX</li>
          <li>Use loading states for smooth transitions</li>
          <li>Consider using useIsClient hook for simple conditional rendering</li>
        </ul>
      </div>
    </div>
  );
}

export default ClientOnlyExamples;