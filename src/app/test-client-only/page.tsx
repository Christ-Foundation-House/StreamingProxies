'use client';

import { ClientOnly, TimeDisplay, ClientOnlyExamples } from '@/components';

export default function TestClientOnlyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">ClientOnly Component Test</h1>
      
      <div className="space-y-8">
        {/* Basic ClientOnly test */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Basic ClientOnly Test</h2>
          <ClientOnly 
            fallback={<div className="p-4 bg-gray-100 rounded">Loading on server...</div>}
          >
            <div className="p-4 bg-green-100 rounded">
              This content only renders on the client!
              <br />
              Current time: {new Date().toLocaleString()}
            </div>
          </ClientOnly>
        </section>

        {/* TimeDisplay component test */}
        <section>
          <h2 className="text-lg font-semibold mb-4">TimeDisplay Component Test</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Current Time</h3>
              <TimeDisplay realTime />
            </div>
            <div>
              <h3 className="font-medium mb-2">Specific Date</h3>
              <TimeDisplay 
                timestamp={new Date('2024-01-01T12:00:00')} 
                format="relative" 
              />
            </div>
          </div>
        </section>

        {/* Full examples */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Complete Examples</h2>
          <ClientOnlyExamples />
        </section>
      </div>
    </div>
  );
}