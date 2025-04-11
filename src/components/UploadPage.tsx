import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X } from 'lucide-react';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState('MIT');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');

  const LICENSES = [
    'MIT',
    'Apache 2.0',
    'BSD',
    'GPL',
    'Creative Commons'
  ];

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('model-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase.from('model_files').insert({
        name,
        description,
        file_path: filePath,
        size: file.size,
        user_id: user.id,
        is_public: true,
        metadata: {
          original_filename: file.name,
          content_type: file.type,
          tags,
          license
        }
      });

      if (dbError) throw dbError;

      // Reset form
      setFile(null);
      setName('');
      setDescription('');
      setTags([]);
      setLicense('MIT');
      
      // Show success message
      alert('Model uploaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Upload Model</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
            >
              {file ? (
                <div>
                  <p className="text-green-600 font-semibold mb-2">{file.name}</p>
                  <p className="text-gray-500 text-sm mb-4">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 text-sm hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your model file here, or{' '}
                    <label className="text-blue-600 cursor-pointer hover:text-blue-700">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                      />
                    </label>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Supported formats: .pth, .onnx, .h5, .pb
                  </p>
                </div>
              )}
            </div>

            {/* Model Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Model Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* License */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                License
              </label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {LICENSES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {uploading ? 'Uploading...' : 'Upload Model'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;