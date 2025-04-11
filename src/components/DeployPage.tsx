import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Cloud,
  Server,
  Cpu,
  Globe,
  Settings,
  BarChart,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface DeploymentConfig {
  instanceType: string;
  region: string;
  replicas: number;
  autoScale: boolean;
}

interface ModelDeployment {
  id: string;
  status: 'running' | 'stopped' | 'failed';
  createdAt: string;
  region: string;
  url: string;
  metrics: {
    requests: number;
    latency: number;
    uptime: number;
  };
}

const DeployPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [config, setConfig] = useState<DeploymentConfig>({
    instanceType: 'gpu.t4',
    region: 'us-east-1',
    replicas: 1,
    autoScale: true,
  });
  const [deploying, setDeploying] = useState(false);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([
    {
      id: 'deploy-1',
      status: 'running',
      createdAt: '2025-04-04T10:00:00Z',
      region: 'us-east-1',
      url: 'https://model1.api.openhumanoid.ai',
      metrics: {
        requests: 15234,
        latency: 156,
        uptime: 99.9,
      },
    },
    {
      id: 'deploy-2',
      status: 'running',
      createdAt: '2025-04-03T15:30:00Z',
      region: 'eu-west-1',
      url: 'https://model2.api.openhumanoid.ai',
      metrics: {
        requests: 8721,
        latency: 189,
        uptime: 99.7,
      },
    },
  ]);

  const handleDeploy = async () => {
    if (!selectedModel) return;
    
    setDeploying(true);
    try {
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDeployment: ModelDeployment = {
        id: `deploy-${Date.now()}`,
        status: 'running',
        createdAt: new Date().toISOString(),
        region: config.region,
        url: `https://${selectedModel.toLowerCase()}.api.openhumanoid.ai`,
        metrics: {
          requests: 0,
          latency: 0,
          uptime: 100,
        },
      };
      
      setDeployments(prev => [newDeployment, ...prev]);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Deploy Models</h1>
            <p className="text-gray-600">Deploy and manage your MuJoCo models</p>
          </div>
          <button
            onClick={handleDeploy}
            disabled={!selectedModel || deploying}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center"
          >
            {deploying ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Deploying...
              </>
            ) : (
              <>
                <Cloud className="mr-2" size={20} />
                Deploy Model
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Deployment Configuration</h2>
              
              <div className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a model...</option>
                    <option value="OpenWalk-v1">OpenWalk-v1</option>
                    <option value="ManipulateGPT">ManipulateGPT</option>
                    <option value="HumanoidCore-2">HumanoidCore-2</option>
                  </select>
                </div>

                {/* Instance Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instance Type
                  </label>
                  <select
                    value={config.instanceType}
                    onChange={(e) => setConfig({ ...config, instanceType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gpu.t4">GPU T4 - General Purpose</option>
                    <option value="gpu.a10">GPU A10 - High Performance</option>
                    <option value="gpu.a100">GPU A100 - Maximum Performance</option>
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={config.region}
                    onChange={(e) => setConfig({ ...config, region: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  </select>
                </div>

                {/* Replicas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Replicas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.replicas}
                    onChange={(e) => setConfig({ ...config, replicas: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Auto Scaling */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoScale"
                    checked={config.autoScale}
                    onChange={(e) => setConfig({ ...config, autoScale: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoScale" className="ml-2 block text-sm text-gray-700">
                    Enable auto-scaling
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Calculator */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Estimated Cost</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Compute (per hour)</span>
                  <span className="font-medium">$2.50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Storage (per GB)</span>
                  <span className="font-medium">$0.10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Network Transfer</span>
                  <span className="font-medium">$0.05</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Estimated Total</span>
                  <span className="text-blue-600">$2.65/hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Deployments */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Active Deployments</h2>
          <div className="grid gap-6">
            {deployments.map((deployment) => (
              <div
                key={deployment.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {deployment.status === 'running' ? (
                          <CheckCircle2 className="text-green-500" size={20} />
                        ) : deployment.status === 'failed' ? (
                          <AlertCircle className="text-red-500" size={20} />
                        ) : (
                          <Clock className="text-yellow-500" size={20} />
                        )}
                        <span className="ml-2 font-medium">
                          {deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        Deployed {new Date(deployment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {deployment.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg border">
                      Logs
                    </button>
                    <button className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg border border-red-200 hover:border-red-300">
                      Stop
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <BarChart size={16} className="mr-1" />
                      Requests
                    </div>
                    <div className="text-xl font-semibold">
                      {deployment.metrics.requests.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock size={16} className="mr-1" />
                      Avg. Latency
                    </div>
                    <div className="text-xl font-semibold">
                      {deployment.metrics.latency}ms
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Settings size={16} className="mr-1" />
                      Uptime
                    </div>
                    <div className="text-xl font-semibold">
                      {deployment.metrics.uptime}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployPage;