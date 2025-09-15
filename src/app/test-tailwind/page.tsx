'use client';

import { useState } from 'react';

export default function TailwindTestPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Tailwind CSS Test Page
              </h1>
              <p className="text-muted-foreground text-lg">
                Testing responsive design, theming, and custom variables
              </p>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Toggle {darkMode ? 'Light' : 'Dark'} Mode
              </button>
            </div>

            {/* Color Palette Test */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary text-primary-foreground p-4 rounded-md text-center">
                  Primary
                </div>
                <div className="bg-secondary text-secondary-foreground p-4 rounded-md text-center">
                  Secondary
                </div>
                <div className="bg-accent text-accent-foreground p-4 rounded-md text-center">
                  Accent
                </div>
                <div className="bg-destructive text-destructive-foreground p-4 rounded-md text-center">
                  Destructive
                </div>
              </div>
            </div>

            {/* Responsive Grid Test */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Responsive Grid</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-muted text-muted-foreground p-4 rounded-md text-center"
                  >
                    Item {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Test */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Typography</h2>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <h2 className="text-3xl font-semibold">Heading 2</h2>
                <h3 className="text-2xl font-medium">Heading 3</h3>
                <h4 className="text-xl">Heading 4</h4>
                <p className="text-base">
                  This is a paragraph with regular text. It should be readable and properly styled.
                </p>
                <p className="text-sm text-muted-foreground">
                  This is smaller text with muted color.
                </p>
              </div>
            </div>

            {/* Button Variants Test */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Button Variants</h2>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Primary Button
                </button>
                <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
                  Secondary Button
                </button>
                <button className="border border-border bg-background text-foreground px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  Outline Button
                </button>
                <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors">
                  Destructive Button
                </button>
              </div>
            </div>

            {/* Form Elements Test */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Input Field</label>
                  <input
                    type="text"
                    placeholder="Enter some text..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Select Field</label>
                  <select className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Textarea</label>
                  <textarea
                    placeholder="Enter some text..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Spacing and Layout Test */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Spacing & Layout</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                  <span>Flex Layout</span>
                  <span className="text-muted-foreground">Space Between</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-accent text-accent-foreground rounded-md text-center">
                    Grid 1
                  </div>
                  <div className="p-4 bg-accent text-accent-foreground rounded-md text-center">
                    Grid 2
                  </div>
                  <div className="p-4 bg-accent text-accent-foreground rounded-md text-center">
                    Grid 3
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Responsive Test */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Mobile Responsive</h2>
              <div className="space-y-4">
                <div className="block sm:hidden bg-red-100 text-red-800 p-4 rounded-md">
                  Visible only on mobile (&lt; 640px)
                </div>
                <div className="hidden sm:block md:hidden bg-yellow-100 text-yellow-800 p-4 rounded-md">
                  Visible only on tablet (640px - 768px)
                </div>
                <div className="hidden md:block lg:hidden bg-blue-100 text-blue-800 p-4 rounded-md">
                  Visible only on desktop (768px - 1024px)
                </div>
                <div className="hidden lg:block bg-green-100 text-green-800 p-4 rounded-md">
                  Visible only on large screens (&gt; 1024px)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}