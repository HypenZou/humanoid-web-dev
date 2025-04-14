'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import {
  Star,
  GitFork,
  Download,
  Share2,
  Clock,
  FileCode,
  Tag,
  Users,
  Shield,
  ExternalLink,
  AlertCircle,
  BookOpen,
  Code2,
  History,
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MOCK_MODEL = {
  id: '1',
  name: 'OpenWalk-v1',
  description: 'State-of-the-art humanoid walking model with dynamic balance control and natural gait synthesis. This model implements advanced locomotion algorithms based on reinforcement learning and optimal control theory.',
  file_path: '/models/openwalk-v1.pth',
  size: 256 * 1024 * 1024, // 256MB
  downloads: 15234,
  created_at: '2025-03-15T10:00:00Z',
  updated_at: '2025-04-01T15:30:00Z',
  is_public: true,
  metadata: {
    tags: ['locomotion', 'walking', 'balance', 'reinforcement-learning'],
    license: 'MIT',
    framework: 'PyTorch',
    version: '1.0.0',
    requirements: {
      python: '>=3.8',
      torch: '>=2.0.0',
      cuda: '>=11.7'
    },
    benchmarks: {
      success_rate: '94.5%',
      inference_time: '15ms',
      stability_score: '89.2%'
    }
  },
  users: {
    display_name: 'OpenHumanoid',
    email: 'team@openhumanoid.ai'
  },
  stars: 2451,
  forks: 342,
  readme: `
# OpenWalk-v1

A state-of-the-art humanoid walking model that achieves natural and robust bipedal locomotion.
## Features

- Dynamic balance control
- Natural gait synthesis
- Obstacle avoidance
- Multi-terrain adaptation
- Energy-efficient motion

## Requirements

- Python >= 3.8
- PyTorch >= 2.0.0
- CUDA >= 11.7

## Quick Start

\`\`\`python
from openhumanoid import OpenWalk

# Initialize the model
model = OpenWalk.from_pretrained('OpenWalk-v1')  

# Set walking parameters
params = {
    'velocity': 1.0,  # m/s
    'direction': [1.0, 0.0],  # forward direction
    'step_height': 0.1  # meters
}

# Generate walking motion
motion = model.generate_motion(params)
\`\`\`

## Performance

- Success Rate: 94.5%
- Average Inference Time: 15ms
- Stability Score: 89.2%

## Citation

If you use this model in your research, please cite:

\`\`\`bibtex
@article{openwalk2025,
  title={OpenWalk: A Robust Framework for Humanoid Locomotion},
  author={OpenHumanoid Team},
  journal={arXiv preprint arXiv:2025.12345},
  year={2025}
}
\`\`\`
`,
  files: [
    {
      name: 'openwalk-v1.pth',
      size: 256 * 1024 * 1024,
      type: 'model'
    },
    {
      name: 'config.yaml',
      size: 2.5 * 1024,
      type: 'config'
    },
    {
      name: 'requirements.txt',
      size: 1024,
      type: 'text'
    }
  ],
  versions: [
    {
      version: 'v1.0.0',
      date: '2025-03-15T10:00:00Z',
      description: 'Initial release with core walking capabilities',
      changes: [
        'Implemented dynamic balance control',
        'Added natural gait synthesis',
        'Integrated obstacle avoidance'
      ]
    },
    {
      version: 'v1.0.1',
      date: '2025-04-01T15:30:00Z',
      description: 'Performance improvements and bug fixes',
      changes: [
        'Improved inference speed by 20%',
        'Fixed stability issues on uneven terrain',
        'Added multi-terrain support'
      ]
    }
  ]
};

export default function ModelDetails() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState<'readme' | 'files' | 'versions'>('readme');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Navbar
        user={user}
        onAuthClick={() => {}}
        onSignOut={() => supabase.auth.signOut()}
        onProfileClick={() => {}}
        onHomeClick={() => {}}
        onModelsClick={() => {}}
        onDatasetsClick={() => {}}
        onDocsClick={() => {}}
        onDeployClick={() => {}}
        showProfile={false}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Link href={`/profile/${MOCK_MODEL.users.display_name}`} className="hover:text-blue-600">
                {MOCK_MODEL.users.display_name}
              </Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-gray-900">{MOCK_MODEL.name}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h1 className="text-3xl font-bold">{MOCK_MODEL.name}</h1>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {MOCK_MODEL.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{MOCK_MODEL.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {MOCK_MODEL.metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Star size={16} />
                  <span>{MOCK_MODEL.stars}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <GitFork size={16} />
                  <span>{MOCK_MODEL.forks}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab('readme')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium ${
                  activeTab === 'readme'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300'
                }`}
              >
                <BookOpen size={18} />
                README
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300'
                }`}
              >
                <Code2 size={18} />
                Files
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium ${
                  activeTab === 'versions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300'
                }`}
              >
                <History size={18} />
                Versions
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="col-span-2 container">
              <div className="bg-white rounded-lg shadow-sm p-6 prose max-w-none">
                {activeTab === 'readme' && (
                   <ReactMarkdown>{ MOCK_MODEL.readme}</ReactMarkdown>
                )}

                {activeTab === 'files' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Files</h2>
                      <button className="text-blue-600 hover:text-blue-700">
                        Download ZIP
                      </button>
                    </div>
                    <div className="border rounded-lg divide-y">
                      {MOCK_MODEL.files.map((file) => (
                        <div key={file.name} className="flex items-center justify-between p-4">
                          <div className="flex items-center">
                            <FileCode size={20} className="text-gray-400 mr-3" />
                            <span>{file.name}</span>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'versions' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Version History</h2>
                    <div className="space-y-6">
                      {MOCK_MODEL.versions.map((version) => (
                        <div key={version.version} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Tag className="text-blue-600" size={20} />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{version.version}</div>
                            <div className="text-gray-600 text-sm">{version.description}</div>
                            <div className="text-gray-500 text-sm mt-1">
                              Released on {new Date(version.date).toLocaleDateString()}
                            </div>
                            <ul className="mt-2 space-y-1">
                              {version.changes.map((change, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  • {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Download size={16} className="mr-2" />
                    <span>{MOCK_MODEL.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>Updated {new Date(MOCK_MODEL.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield size={16} className="mr-2" />
                    <span>{MOCK_MODEL.metadata.license} license</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileCode size={16} className="mr-2" />
                    <span>{MOCK_MODEL.metadata.framework}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {Object.entries(MOCK_MODEL.metadata.requirements).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span>{key}</span>
                        <span className="font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Benchmarks</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {Object.entries(MOCK_MODEL.metadata.benchmarks).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span>{key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deploy */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Deploy</h3>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Deploy Model
                </button>
                <a
                  href="/docs/deployment"
                  className="flex items-center justify-center mt-4 text-sm text-gray-600 hover:text-gray-800"
                >
                  Learn about deployment
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}