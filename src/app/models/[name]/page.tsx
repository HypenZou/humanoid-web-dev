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
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ModelDetails {
  id: string;
  name: string;
  description: string;
  model_folder_path: string;
  size: number;
  downloads: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  tags: string[];
  license: string;
  framework?: string;
  version?: string;
  requirements?: {
    [key: string]: string;
  };
  benchmarks?: {
    [key: string]: string;
  };
  users: {
    display_name: string | null;
    email: string;
  };
  readme?: string;
  files?: {
    name: string;
    size: number;
    type: "file" | "dict";
  }[];
  versions?: {
    version: string;
    date: string;
    description: string;
    changes: string[];
  }[];
}

export default function ModelDetails() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [model, setModel] = useState<ModelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"readme" | "files" | "versions">("readme");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchModelDetails();
  }, [params.name]);

  const fetchModelDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const modelName = (params.name as string).replace("_", "/");
      const { data: modelDataRsp, error: modelError } = await supabase
        .from("models")
        .select(
          `*,
        model_repo_info (
        model_id
        )`
        )
        .eq("name", modelName)
        .single();

      if (modelError) throw modelError;
      if (!modelDataRsp) throw new Error("Model not found");
      console.log(modelDataRsp, modelError);

      modelDataRsp.tags = modelDataRsp.tags.split(",");
      const modelData: ModelDetails = {
        ...modelDataRsp,
        users: {
          display_name:
            modelDataRsp.users?.display_name ||
            modelDataRsp.users?.email?.split("@")[0] ||
            "Unknown",
          email: modelDataRsp.users?.email || "",
        },
        metadata: {
          ...modelDataRsp.metadata,
          requirements: modelDataRsp.metadata?.requirements || {},
          benchmarks: modelDataRsp.metadata?.benchmarks || {},
        },
      };

      let { data: modelFileRsp, error: modelFileError } = await supabase.storage
        .from("models")
        .list(modelData.model_folder_path);
      if (modelFileError || !modelFileRsp) {
        throw new Error("Model not found");
      }

      let needFetchReadME = false;
      modelFileRsp.forEach(async (modelFile) => {
        if (modelFile.metadata?.size && modelFile.name == "README.md") {
          needFetchReadME = true;
        }
      });

      if (needFetchReadME) {
        modelData.readme = await fetchReadME(
          `${modelData.model_folder_path}/README.md`
        );
      }

      setModel(modelData);

      console.log(modelFileRsp, modelFileError, modelData.model_folder_path);
    } catch (err) {
      console.error("Error fetching model details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load model details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReadME = async (filePath: string) => {
    let { data: readme, error: readmeError } = await supabase.storage
      .from("models")
      .download(filePath);
    if (readmeError || !readme) {
      throw new Error("failed to read README");
    }
    return readme.text();
  };

  const listFilesRecursively = async (folderPath: string, zip: JSZip, currentPath: string = '') => {
    const { data: items, error: listError } = await supabase.storage
      .from('models')
      .list(folderPath);

    if (listError) throw listError;
    if (!items) return;

    for (const item of items) {
      const fullPath = `${folderPath}/${item.name}`;
      console.log(item)
      // no metadata, treat as folder
      if (!item.metadata) {
        await listFilesRecursively(fullPath, zip, `${currentPath}${item.name}/`);
      } else {
        console.log(fullPath)
        const { data, error: downloadError } = await supabase.storage
          .from('models')
          .download(fullPath);

        if (downloadError) throw downloadError;
        if (!data) throw new Error(`Failed to download ${item.name}`);

        zip.file(`${currentPath}${item.name}`, data);
      }
    }
  };

  const handleDownload = async () => {
    if (!model) return;

    try {
      setDownloading(true);
      const zip = new JSZip();
      
      await listFilesRecursively(model.model_folder_path, zip);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${model.name}.zip`);

      const { error: updateError } = await supabase
        .from('models')
        .update({ downloads: (model.downloads || 0) + 1 })
        .eq('id', model.id);

      if (updateError) {
        console.error('Failed to update download count:', updateError);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download model files. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading model details...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Model</h2>
          <p className="text-gray-600">{error || "Model not found"}</p>
          <Link
            href="/models"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            Return to Models
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Link
                href={`/profile/${model.users.display_name}`}
                className="hover:text-blue-600"
              >
                {model.users.display_name}
              </Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-gray-900">{model.name}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h1 className="text-3xl font-bold">{model.name}</h1>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {model.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{model.description}</p>

                <div className="flex flex-wrap gap-2">
                  {model?.tags?.map((tag) => (
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
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>{model.downloads || 0}</span>
                    </>
                  )}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab("readme")}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium ${
                  activeTab === "readme"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:border-gray-300"
                }`}
              >
                <BookOpen size={18} />
                README
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:border-gray-300"
                }`}
              >
                <Code2 size={18} />
                Files
              </button>
              <button
                onClick={() => setActiveTab("versions")}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium ${
                  activeTab === "versions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:border-gray-300"
                }`}
              >
                <History size={18} />
                Versions
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 prose max-w-none">
                {activeTab === "readme" && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {model.readme || "# No README"}
                  </ReactMarkdown>
                )}

                {activeTab === "files" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Files</h2>
                      <button className="text-blue-600 hover:text-blue-700">
                        Download All
                      </button>
                    </div>
                    <div className="border rounded-lg divide-y">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                          <FileCode size={20} className="text-gray-400 mr-3" />
                          <span>{model.name}</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {(model.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "versions" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Version History</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Tag className="text-blue-600" size={20} />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {model?.version || "v1.0.0"}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            Released on{" "}
                            {new Date(model.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600 text-sm mt-2">
                            Initial release
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Download size={16} className="mr-2" />
                    <span>
                      {model.downloads?.toLocaleString() || 0} downloads
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>
                      Updated {new Date(model.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield size={16} className="mr-2" />
                    <span>{model?.license || "No license"}</span>
                  </div>
                  {model?.framework && (
                    <div className="flex items-center text-gray-600">
                      <FileCode size={16} className="mr-2" />
                      <span>{model.framework}</span>
                    </div>
                  )}
                </div>

                {model?.requirements &&
                  Object.keys(model.requirements).length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {Object.entries(model.requirements).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <span>{key}</span>
                              <span className="font-mono">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {model?.benchmarks &&
                  Object.keys(model.benchmarks).length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Benchmarks</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {Object.entries(model.benchmarks).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <span>
                                {key
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                              <span className="font-mono">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

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