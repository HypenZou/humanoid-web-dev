'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Github,
  Notebook as Robot,
  Database,
  Cloud,
  Search,
  Upload,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ModelCard from '@/components/ModelCard';
import AuthModal from '@/components/AuthModal';
import ProfilePage from '@/components/ProfilePage';
import ModelsPage from '@/components/ModelsPage';
import DatasetsPage from '@/components/DatasetsPage';
import UploadPage from '@/components/UploadPage';
import DocsPage from '@/components/DocsPage';
import DeployPage from '@/components/DeployPage';

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showDatasets, setShowDatasets] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [user, setUser] = useState(null);
  const [featuredModels, setFeaturedModels] = useState([
    {
      name: 'OpenWalk-v1-test',
      description:
        'State-of-the-art humanoid walking model with dynamic balance control and natural gait synthesis.',
      stars: 2.4,
      forks: 342,
      author: 'OpenHumanoid',
      tags: ['locomotion', 'walking', 'balance'],
      image:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'ManipulateGPT',
      description:
        'Advanced manipulation model for human-like object interaction and dexterous handling.',
      stars: 1.8,
      forks: 256,
      author: 'RoboResearch',
      tags: ['manipulation', 'grasping', 'dexterity'],
      image:
        'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'HumanoidCore-2',
      description:
        'Complete humanoid control framework with integrated perception and planning capabilities.',
      stars: 3.1,
      forks: 478,
      author: 'AI-Robotics-Lab',
      tags: ['full-body', 'control', 'planning'],
      image:
        'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=400',
    },
  ]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setShowProfile(false);
    });

    const handleShowUpload = () => {
      setShowUpload(true);
      setShowProfile(false);
      setShowModels(false);
      setShowDatasets(false);
      setShowDocs(false);
      setShowDeploy(false);
    };

    window.addEventListener('showUpload', handleShowUpload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('showUpload', handleShowUpload);
    };
  }, []);

  const handleUploadClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setShowUpload(true);
      setShowProfile(false);
      setShowModels(false);
      setShowDatasets(false);
      setShowDocs(false);
      setShowDeploy(false);
    }
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowModels(false);
    setShowDatasets(false);
    setShowUpload(false);
    setShowDocs(false);
    setShowDeploy(false);
  };

  const handleHomeClick = () => {
    setShowProfile(false);
    setShowModels(false);
    setShowDatasets(false);
    setShowUpload(false);
    setShowDocs(false);
    setShowDeploy(false);
  };

  const handleModelsClick = () => {
    setShowModels(true);
    setShowProfile(false);
    setShowDatasets(false);
    setShowUpload(false);
    setShowDocs(false);
    setShowDeploy(false);
  };

  const handleDatasetsClick = () => {
    setShowDatasets(true);
    setShowProfile(false);
    setShowModels(false);
    setShowUpload(false);
    setShowDocs(false);
    setShowDeploy(false);
  };

  const handleDocsClick = () => {
    setShowDocs(true);
    setShowDatasets(false);
    setShowProfile(false);
    setShowModels(false);
    setShowUpload(false);
    setShowDeploy(false);
  };

  const handleDeployClick = () => {
    setShowDeploy(true);
    setShowDocs(false);
    setShowDatasets(false);
    setShowProfile(false);
    setShowModels(false);
    setShowUpload(false);
  };

  if (user && showProfile) {
    return (
      <>
        <Navbar
          user={user}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOut={() => supabase.auth.signOut()}
          onProfileClick={handleProfileClick}
          onHomeClick={handleHomeClick}
          onModelsClick={handleModelsClick}
          onDatasetsClick={handleDatasetsClick}
          onDocsClick={handleDocsClick}
          onDeployClick={handleDeployClick}
          showProfile={showProfile}
        />
        <ProfilePage user={user} />
      </>
    );
  }

  if (showModels) {
    return (
      <>
        <Navbar
          user={user}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOut={() => supabase.auth.signOut()}
          onProfileClick={handleProfileClick}
          onHomeClick={handleHomeClick}
          onModelsClick={handleModelsClick}
          onDatasetsClick={handleDatasetsClick}
          onDocsClick={handleDocsClick}
          onDeployClick={handleDeployClick}
          showProfile={showProfile}
        />
        <ModelsPage />
      </>
    );
  }

  if (showDatasets) {
    return (
      <>
        <Navbar
          user={user}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOut={() => supabase.auth.signOut()}
          onProfileClick={handleProfileClick}
          onHomeClick={handleHomeClick}
          onModelsClick={handleModelsClick}
          onDatasetsClick={handleDatasetsClick}
          onDocsClick={handleDocsClick}
          onDeployClick={handleDeployClick}
          showProfile={showProfile}
        />
        <DatasetsPage />
      </>
    );
  }

  if (showDocs) {
    return (
      <>
        <Navbar
          user={user}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOut={() => supabase.auth.signOut()}
          onProfileClick={handleProfileClick}
          onHomeClick={handleHomeClick}
          onModelsClick={handleModelsClick}
          onDatasetsClick={handleDatasetsClick}
          onDocsClick={handleDocsClick}
          onDeployClick={handleDeployClick}
          showProfile={showProfile}
        />
        <DocsPage />
      </>
    );
  }

  if (showDeploy) {
    return (
      <>
        <Navbar
          user={user}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOut={() => supabase.auth.signOut()}
          onProfileClick={handleProfileClick}
          onHomeClick={handleHomeClick}
          onModelsClick={handleModelsClick}
          onDatasetsClick={handleDatasetsClick}
          onDocsClick={handleDocsClick}
          onDeployClick={handleDeployClick}
          showProfile={showProfile}
        />
        <DeployPage />
      </>
    );
  }

  if (showUpload) {
    return (
      <>
        <Navbar
          user={user}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOut={() => supabase.auth.signOut()}
          onProfileClick={handleProfileClick}
          onHomeClick={handleHomeClick}
          onModelsClick={handleModelsClick}
          onDatasetsClick={handleDatasetsClick}
          onDocsClick={handleDocsClick}
          onDeployClick={handleDeployClick}
          showProfile={showProfile}
        />
        <UploadPage />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onSignOut={() => supabase.auth.signOut()}
        onProfileClick={handleProfileClick}
        onHomeClick={handleHomeClick}
        onModelsClick={handleModelsClick}
        onDatasetsClick={handleDatasetsClick}
        onDocsClick={handleDocsClick}
        onDeployClick={handleDeployClick}
        showProfile={showProfile}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Open Humanoid for Everyone
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover, share, and deploy state-of-the-art humanoid robotics
              models and datasets
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleUploadClick}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
              >
                <Upload className="mr-2" size={20} />
                Upload Model
              </button>
              <button 
                onClick={handleDeployClick}
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center"
              >
                <Cloud className="mr-2" size={20} />
                Deploy Model
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={24} />
            <input
              type="text"
              placeholder="Search for models, datasets, or papers..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div
            onClick={handleModelsClick}
            className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <Robot className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Model Hub</h3>
            <p className="text-gray-600">
              Access a growing collection of pre-trained humanoid models ready
              for deployment.
            </p>
          </div>
          <div
            onClick={handleDatasetsClick}
            className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <Database className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Datasets</h3>
            <p className="text-gray-600">
              High-quality datasets for training and fine-tuning humanoid
              models.
            </p>
          </div>
          <div 
            onClick={handleDeployClick}
            className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <Cloud className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Deployment</h3>
            <p className="text-gray-600">
              Simple infrastructure for deploying models to real or simulated
              robots.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Models */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Models</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredModels.map((model, index) => (
            <ModelCard key={index} {...model} />
          ))}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}