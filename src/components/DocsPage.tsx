import React, { useState } from 'react';
import { Book, Code, Terminal, Package, Cpu, Zap, ChevronRight, Search, ExternalLink } from 'lucide-react';

const DocsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">Installation</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm mb-4">
              npm install @openhumanoid/core
            </div>
            <p className="text-gray-600 mb-4">
              This will install the core OpenHumanoid package with all necessary dependencies.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Usage</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm">
              {`import { HumanoidModel } from '@openhumanoid/core';\n\nconst model = await HumanoidModel.load('OpenWalk-v1');\nawait model.initialize();\n\n// Start the walking sequence\nawait model.walk();`}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Key Concepts</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                <div>
                  <span className="font-medium">Models:</span>
                  <p className="text-gray-600">Pre-trained humanoid models for various tasks</p>
                </div>
              </li>
              <li className="flex items-start">
                <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                <div>
                  <span className="font-medium">Controllers:</span>
                  <p className="text-gray-600">High-level APIs for controlling humanoid behavior</p>
                </div>
              </li>
              <li className="flex items-start">
                <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                <div>
                  <span className="font-medium">Tasks:</span>
                  <p className="text-gray-600">Predefined actions like walking, manipulation, etc.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    'api-reference': {
      title: 'API Reference',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">HumanoidModel</h3>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="border-b px-4 py-3">
                  <code className="text-sm">static async load(modelId: string): Promise&lt;HumanoidModel&gt;</code>
                </div>
                <div className="px-4 py-3">
                  <p className="text-gray-600 mb-2">Loads a pre-trained humanoid model from the model hub.</p>
                  <h4 className="font-medium mb-1">Parameters:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>modelId: Identifier of the model to load</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Controller</h3>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="border-b px-4 py-3">
                  <code className="text-sm">async initialize(config?: ControllerConfig): Promise&lt;void&gt;</code>
                </div>
                <div className="px-4 py-3">
                  <p className="text-gray-600 mb-2">Initializes the humanoid controller with optional configuration.</p>
                  <h4 className="font-medium mb-1">Parameters:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>config: Optional controller configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'examples': {
      title: 'Examples',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Code Examples</h2>

          <div className="grid gap-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Basic Walking Example</h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm mb-4">
                  {`import { HumanoidModel } from '@openhumanoid/core';\n\nasync function walkDemo() {\n  const model = await HumanoidModel.load('OpenWalk-v1');\n  await model.initialize();\n\n  // Configure walking parameters\n  const params = {\n    speed: 1.0,\n    direction: { x: 1, y: 0 }\n  };\n\n  // Start walking\n  await model.walk(params);\n}`}
                </div>
                <p className="text-gray-600">
                  This example demonstrates how to load a model and initiate a basic walking sequence.
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Object Manipulation</h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm mb-4">
                  {`import { HumanoidModel } from '@openhumanoid/core';\n\nasync function manipulationDemo() {\n  const model = await HumanoidModel.load('ManipulateGPT');\n  await model.initialize();\n\n  // Define object properties\n  const target = {\n    position: { x: 0.5, y: 1.0, z: 0.3 },\n    size: { width: 0.1, height: 0.1, depth: 0.1 }\n  };\n\n  // Grasp object\n  await model.grasp(target);\n}`}
                </div>
                <p className="text-gray-600">
                  This example shows how to perform basic object manipulation tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'deployment': {
      title: 'Deployment',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Deployment Guide</h2>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Cloud Deployment</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Deploy your models to the cloud for scalable inference and API access.
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm mb-4">
                {`# Deploy using CLI\noh deploy ./my-model --name my-model-v1`}
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                  <span>Automatic scaling based on demand</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                  <span>Built-in monitoring and logging</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                  <span>API key management and usage tracking</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Edge Deployment</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Deploy models directly to edge devices for local inference.
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm mb-4">
                {`# Export model for edge deployment\noh export ./my-model --target edge --optimize`}
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                  <span>Optimized for resource-constrained devices</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                  <span>Offline inference support</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-blue-600 mt-1 mr-2" size={16} />
                  <span>Hardware-specific optimizations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Documentation</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('getting-started')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    activeSection === 'getting-started'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Book size={18} className="mr-2" />
                  Getting Started
                </button>
                <button
                  onClick={() => setActiveSection('api-reference')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    activeSection === 'api-reference'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Code size={18} className="mr-2" />
                  API Reference
                </button>
                <button
                  onClick={() => setActiveSection('examples')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    activeSection === 'examples'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Terminal size={18} className="mr-2" />
                  Examples
                </button>
                <button
                  onClick={() => setActiveSection('deployment')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    activeSection === 'deployment'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Cpu size={18} className="mr-2" />
                  Deployment
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Resources</h3>
                <div className="space-y-2">
                  <a
                    href="https://github.com/openhumanoid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Package size={18} className="mr-2" />
                    GitHub
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                  <a
                    href="/tutorials"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Zap size={18} className="mr-2" />
                    Tutorials
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {sections[activeSection as keyof typeof sections].content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;