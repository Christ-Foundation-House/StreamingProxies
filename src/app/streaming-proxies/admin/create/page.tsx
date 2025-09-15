'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Server, Globe, Settings, CheckCircle } from 'lucide-react';

import AdminErrorBoundary from '../_components/AdminErrorBoundary';

export default function CreateProxy() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serverLocation: '',
    maxConcurrentStreams: 10,
    bandwidthLimit: 1000,
    rtmpUrl: '',
    rtmpKey: '',
    churchBranchId: ''
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: <Server className="h-5 w-5" /> },
    { id: 2, title: 'Configuration', icon: <Settings className="h-5 w-5" /> },
    { id: 3, title: 'Location', icon: <Globe className="h-5 w-5" /> },
    { id: 4, title: 'Review', icon: <CheckCircle className="h-5 w-5" /> }
  ];

  const locations = [
    { id: 'us-east-1', name: 'US East (Virginia)', region: 'North America' },
    { id: 'us-west-2', name: 'US West (Oregon)', region: 'North America' },
    { id: 'eu-west-1', name: 'EU West (Ireland)', region: 'Europe' },
    { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', region: 'Asia Pacific' },
    { id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', region: 'Asia Pacific' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically submit to an API
    console.log('Creating proxy with data:', formData);
    alert('Proxy created successfully!');
    router.push('/streaming-proxies/admin');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proxy Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Church Proxy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this proxy's purpose"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Church Branch ID *
              </label>
              <input
                type="text"
                value={formData.churchBranchId}
                onChange={(e) => handleInputChange('churchBranchId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., branch-001"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Streams
              </label>
              <input
                type="number"
                value={formData.maxConcurrentStreams}
                onChange={(e) => handleInputChange('maxConcurrentStreams', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bandwidth Limit (Mbps)
              </label>
              <input
                type="number"
                value={formData.bandwidthLimit}
                onChange={(e) => handleInputChange('bandwidthLimit', parseInt(e.target.value))}
                min="100"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RTMP URL
              </label>
              <input
                type="url"
                value={formData.rtmpUrl}
                onChange={(e) => handleInputChange('rtmpUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="rtmp://your-server.com/live"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RTMP Stream Key
              </label>
              <input
                type="text"
                value={formData.rtmpKey}
                onChange={(e) => handleInputChange('rtmpKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your stream key"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Server Location
              </label>
              <div className="space-y-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.serverLocation === location.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('serverLocation', location.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{location.name}</h4>
                        <p className="text-sm text-gray-500">{location.region}</p>
                      </div>
                      {formData.serverLocation === location.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Configuration</h3>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-gray-900">{formData.name || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Church Branch:</span>
                  <p className="text-gray-900">{formData.churchBranchId || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Max Streams:</span>
                  <p className="text-gray-900">{formData.maxConcurrentStreams}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Bandwidth Limit:</span>
                  <p className="text-gray-900">{formData.bandwidthLimit} Mbps</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <p className="text-gray-900">
                    {locations.find(l => l.id === formData.serverLocation)?.name || 'Not selected'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">RTMP URL:</span>
                  <p className="text-gray-900 truncate">{formData.rtmpUrl || 'Not specified'}</p>
                </div>
              </div>
              {formData.description && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-gray-900 mt-1">{formData.description}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminErrorBoundary pageName="Create Proxy" showAdminActions={true}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/streaming-proxies/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Proxy</h1>
                <p className="text-sm text-gray-500">Set up a new streaming proxy server</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Create Proxy
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
    </AdminErrorBoundary>
  );
}