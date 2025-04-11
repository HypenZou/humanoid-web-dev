'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { BarChart3, Upload, Download, Users, Edit2, ArrowLeft } from 'lucide-react';
import ModelCard from './ModelCard';

interface ProfileStats {
  totalUploads: number;
  totalDownloads: number;
  publicModels: number;
}

interface UserModel {
  id: string;
  name: string;
  description: string;
  downloads: number;
  created_at: string;
  is_public: boolean;
  metadata: {
    tags?: string[];
  };
}

interface UserProfile {
  display_name: string | null;
  email: string;
}

const ProfilePage: React.FC<{ user: User }> = ({ user }) => {
  const router = useRouter();
  const [models, setModels] = useState<UserModel[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalUploads: 0,
    totalDownloads: 0,
    publicModels: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchUserModels();
  }, [user.id]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('display_name, email')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, create new profile
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                email: user.email,
                display_name: null
              }
            ])
            .select('display_name, email')
            .single();

          if (insertError) throw insertError;

          setProfile(newProfile);
          setNewDisplayName(newProfile.display_name || '');
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setNewDisplayName(data.display_name || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set default profile with user's email if there's an error
      setProfile({
        display_name: null,
        email: user.email || ''
      });
    }
  };

  const updateDisplayName = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ display_name: newDisplayName })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, display_name: newDisplayName } : null);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating display name:', error);
    }
  };

  const fetchUserModels = async () => {
    try {
      const { data: userModels, error } = await supabase
        .from('model_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setModels(userModels);
      
      const stats = {
        totalUploads: userModels.length,
        totalDownloads: userModels.reduce((acc, model) => acc + (model.downloads || 0), 0),
        publicModels: userModels.filter(model => model.is_public).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching user models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    router.push('/upload');
  };

  const handleBackClick = () => {
    router.push('/');
  };

  const displayName = profile?.display_name || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Home
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">
              {displayName[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="border rounded px-2 py-1"
                    placeholder="Enter display name"
                  />
                  <button
                    onClick={updateDisplayName}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>
            <p className="text-gray-600">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Uploads</p>
              <h3 className="text-2xl font-bold">{stats.totalUploads}</h3>
            </div>
            <Upload className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Downloads</p>
              <h3 className="text-2xl font-bold">{stats.totalDownloads}</h3>
            </div>
            <Download className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Public Models</p>
              <h3 className="text-2xl font-bold">{stats.publicModels}</h3>
            </div>
            <Users className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Models Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Models</h2>
          <div className="flex items-center space-x-4">
            <select className="border rounded-lg px-4 py-2">
              <option value="recent">Most Recent</option>
              <option value="downloads">Most Downloads</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>
            <button 
              onClick={handleUploadClick}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Upload className="mr-2" size={20} />
              Upload Model
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your models...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2">No Models Yet</h3>
            <p className="text-gray-600 mb-4">Start by uploading your first model</p>
            <button 
              onClick={handleUploadClick}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Model
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                name={model.name}
                description={model.description}
                stars={0}
                forks={0}
                author={displayName}
                tags={model.metadata?.tags || []}
                image="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;