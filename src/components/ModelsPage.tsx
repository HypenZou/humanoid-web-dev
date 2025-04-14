import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tag, X, SlidersHorizontal, ArrowUpDown, Download, Star, GitFork, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Model {
  id: string;
  name: string;
  description: string;
  downloads: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  metadata: {
    tags?: string[];
    license?: string;
  };
  user_id: string;
  users?: {
    email: string;
    display_name: string;
  };
}

const TASK_CATEGORIES = [
  {
    name: 'Locomotion',
    tasks: ['Walking', 'Running', 'Jumping', 'Balance']
  },
  {
    name: 'Manipulation',
    tasks: ['Grasping', 'Pushing', 'Pulling', 'Lifting']
  },
  {
    name: 'Perception',
    tasks: ['Object Detection', 'Pose Estimation', 'Scene Understanding']
  },
  {
    name: 'Planning',
    tasks: ['Path Planning', 'Motion Planning', 'Task Planning']
  }
];

const SORT_OPTIONS = [
  { label: 'Trending', value: 'downloads-desc' },
  { label: 'Most Downloaded', value: 'downloads-desc' },
  { label: 'Recently Added', value: 'created_at-desc' },
  { label: 'Alphabetical', value: 'name-asc' },
];

const LICENSE_OPTIONS = [
  'MIT',
  'Apache 2.0',
  'BSD',
  'GPL',
  'Creative Commons'
];

const ITEMS_PER_PAGE = 10;

const ModelsPage: React.FC = () => {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('downloads-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchModels();
  }, [selectedTasks, selectedLicenses, sortBy, currentPage]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      
      let countQuery = supabase
        .from('model_files')
        .select('id', { count: 'exact' })
        .eq('is_public', true);

      if (selectedTasks.length > 0) {
        countQuery = countQuery.contains('metadata->tags', selectedTasks);
      }

      if (selectedLicenses.length > 0) {
        countQuery = countQuery.contains('metadata->license', selectedLicenses);
      }

      const { count: totalItems } = await countQuery;
      setTotalCount(totalItems || 0);

      let query = supabase
        .from('model_files')
        .select(`
          *,
          users (
            email,
            display_name
          )
        `)
        .eq('is_public', true)
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (selectedTasks.length > 0) {
        query = query.contains('metadata->tags', selectedTasks);
      }

      if (selectedLicenses.length > 0) {
        query = query.contains('metadata->license', selectedLicenses);
      }

      const [column, direction] = sortBy.split('-');
      query = query.order(column, { ascending: direction === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData = data?.map(model => ({
        ...model,
        user_email: model.users?.email,
        user_display_name: model.users?.display_name
      })) || [];
      
      setModels(transformedData);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (task: string) => {
    setSelectedTasks(prev =>
      prev.includes(task)
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
    setCurrentPage(1);
  };

  const toggleLicense = (license: string) => {
    setSelectedLicenses(prev =>
      prev.includes(license)
        ? prev.filter(l => l !== license)
        : [...prev, license]
    );
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleModelClick = (modelName: string) => {
    // Replace forward slash with underscore for the URL
    const urlSafeModelName = modelName.replace("/", "_");
    router.push(`/models/${urlSafeModelName}`);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const filteredModels = models.filter(model =>
    searchQuery
      ? model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Models</h1>
              <span className="text-gray-500">{totalCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Filter by name"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="text-gray-600 hover:text-gray-900">
                Full-text search
              </button>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {TASK_CATEGORIES.map(category => (
                <div key={category.name}>
                  <h3 className="font-semibold text-gray-900 mb-3">{category.name}</h3>
                  <div className="space-y-2">
                    {category.tasks.map(task => (
                      <button
                        key={task}
                        onClick={() => toggleTask(task)}
                        className={`flex items-center w-full px-3 py-1.5 rounded text-sm ${
                          selectedTasks.includes(task)
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="flex-1 text-left">{task}</span>
                        {selectedTasks.includes(task) && (
                          <X size={14} className="ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">License</h3>
                <div className="space-y-2">
                  {LICENSE_OPTIONS.map(license => (
                    <button
                      key={license}
                      onClick={() => toggleLicense(license)}
                      className={`flex items-center w-full px-3 py-1.5 rounded text-sm ${
                        selectedLicenses.includes(license)
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="flex-1 text-left">{license}</span>
                      {selectedLicenses.includes(license) && (
                        <X size={14} className="ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {(selectedTasks.length > 0 || selectedLicenses.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {selectedTasks.map(task => (
                    <button
                      key={task}
                      onClick={() => toggleTask(task)}
                      className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {task}
                      <X size={14} className="ml-2" />
                    </button>
                  ))}
                  {selectedLicenses.map(license => (
                    <button
                      key={license}
                      onClick={() => toggleLicense(license)}
                      className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {license}
                      <X size={14} className="ml-2" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedTasks([]);
                      setSelectedLicenses([]);
                    }}
                    className="text-gray-600 text-sm hover:text-gray-800"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading models...</p>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">No models found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredModels.map((model) => (
                    <div 
                      key={model.id} 
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleModelClick(`${model.users?.display_name || model.users?.email?.split('@')[0]}/${model.name}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {(model.users?.display_name || '').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-700">
                              {model.users?.display_name || model.users?.email?.split('@')[0]}/{model.name}
                            </h3>
                          </div>
                          <p className="text-gray-600 mt-2">{model.description}</p>
                          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Download size={16} className="mr-1" />
                              <span>{model.downloads?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock size={16} className="mr-1" />
                              <span>Updated {new Date(model.updated_at || '').toLocaleDateString()}</span>
                            </div>
                            {model.metadata?.license && (
                              <div className="text-green-600">
                                {model.metadata.license}
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Deploy
                        </button>
                      </div>
                      {model.metadata?.tags && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {model.metadata.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-lg shadow-sm">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing{' '}
                        <span className="font-medium">
                          {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{totalCount}</span>{' '}
                        results
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-lg border enabled:hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-lg border enabled:hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;