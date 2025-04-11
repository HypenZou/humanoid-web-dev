import React, { useState } from 'react';
import { Database, Download, Users, Search, Filter, Clock } from 'lucide-react';

interface Dataset {
  id: string;
  name: string;
  description: string;
  size: string;
  samples: number;
  category: string;
  license: string;
  lastUpdated: string;
  downloads: number;
  imageUrl: string;
}

const SAMPLE_DATASETS: Dataset[] = [
  {
    id: '1',
    name: 'HumanoidMotion-1M',
    description: 'Large-scale dataset of human motion captures for training humanoid robots, including walking, manipulation, and acrobatic movements.',
    size: '2.3 TB',
    samples: 1000000,
    category: 'Motion',
    license: 'CC BY-NC 4.0',
    lastUpdated: '2025-03-15',
    downloads: 12420,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'RoboGrasp-500K',
    description: 'Comprehensive dataset of robot grasping attempts across various objects and conditions, with success/failure annotations.',
    size: '800 GB',
    samples: 500000,
    category: 'Manipulation',
    license: 'MIT',
    lastUpdated: '2025-03-10',
    downloads: 8150,
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'HumanoidVision-HD',
    description: 'High-definition visual data from humanoid robot perspectives, including depth maps and segmentation masks.',
    size: '1.5 TB',
    samples: 750000,
    category: 'Vision',
    license: 'Apache 2.0',
    lastUpdated: '2025-03-01',
    downloads: 6300,
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=400'
  }
];

const CATEGORIES = [
  'Motion',
  'Manipulation',
  'Vision',
  'Navigation',
  'Interaction',
  'Multi-modal'
];

const LICENSES = [
  'MIT',
  'Apache 2.0',
  'CC BY-NC 4.0',
  'CC BY 4.0',
  'Academic'
];

const DatasetsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'downloads' | 'date' | 'size'>('downloads');

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleLicense = (license: string) => {
    setSelectedLicenses(prev =>
      prev.includes(license)
        ? prev.filter(l => l !== license)
        : [...prev, license]
    );
  };

  const filteredDatasets = SAMPLE_DATASETS
    .filter(dataset =>
      (searchQuery === '' || 
       dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       dataset.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategories.length === 0 || selectedCategories.includes(dataset.category)) &&
      (selectedLicenses.length === 0 || selectedLicenses.includes(dataset.license))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'date':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Datasets</h1>
            <span className="text-gray-500">{SAMPLE_DATASETS.length.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'downloads' | 'date' | 'size')}
              className="border rounded-lg px-3 py-2"
            >
              <option value="downloads">Most Downloads</option>
              <option value="date">Recently Updated</option>
              <option value="size">Largest Size</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`flex items-center w-full px-3 py-1.5 rounded text-sm ${
                        selectedCategories.includes(category)
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Licenses */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Licenses</h3>
                <div className="space-y-2">
                  {LICENSES.map(license => (
                    <button
                      key={license}
                      onClick={() => toggleLicense(license)}
                      className={`flex items-center w-full px-3 py-1.5 rounded text-sm ${
                        selectedLicenses.includes(license)
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {license}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="grid gap-6">
              {filteredDatasets.map(dataset => (
                <div key={dataset.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    <div className="w-48 h-48">
                      <img
                        src={dataset.imageUrl}
                        alt={dataset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-xl font-semibold text-blue-600 mb-2">{dataset.name}</h3>
                      <p className="text-gray-600 mb-4">{dataset.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Database size={16} className="mr-2" />
                          <span>{dataset.size}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users size={16} className="mr-2" />
                          <span>{dataset.samples.toLocaleString()} samples</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Download size={16} className="mr-2" />
                          <span>{dataset.downloads.toLocaleString()} downloads</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          <span>Updated {new Date(dataset.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {dataset.category}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {dataset.license}
                          </span>
                        </div>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetsPage;