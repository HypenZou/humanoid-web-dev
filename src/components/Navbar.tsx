import React, { useState, useEffect, useRef } from 'react';
import { Github, Menu, Notebook as Robot, LogOut, User, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  user: any;
  onAuthClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onHomeClick: () => void;
  onModelsClick: () => void;
  onDatasetsClick: () => void;
  onDocsClick: () => void;
  onDeployClick: () => void;
  showProfile: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onAuthClick, 
  onSignOut, 
  onProfileClick,
  onHomeClick,
  onModelsClick,
  onDatasetsClick,
  onDocsClick,
  onDeployClick,
  showProfile 
}) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setDisplayName(data.display_name || user.email?.split('@')[0] || '');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setDisplayName(user.email?.split('@')[0] || '');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={onHomeClick} className="flex items-center space-x-2">
              <Robot className="text-blue-600" size={28} />
              <span className="font-bold text-xl">OpenHumanoid</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={onModelsClick}
              className="text-gray-700 hover:text-blue-600"
            >
              Models
            </button>
            <button 
              onClick={onDatasetsClick}
              className="text-gray-700 hover:text-blue-600"
            >
              Datasets
            </button>
            <button 
              onClick={onDocsClick}
              className="text-gray-700 hover:text-blue-600"
            >
              Docs
            </button>
            <button 
              onClick={onDeployClick}
              className="text-gray-700 hover:text-blue-600"
            >
              Deploy
            </button>
            <a
              href="https://github.com/openhumanoid"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{displayName}</span>
                  <ChevronDown size={16} className={`transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        onProfileClick();
                        setShowDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        onSignOut();
                        setShowDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;