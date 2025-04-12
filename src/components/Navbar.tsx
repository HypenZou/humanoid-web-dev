'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Github, Menu, Notebook as Robot, LogOut, User, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Navbar as BNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';

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
  showProfile 
}) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

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
    <BNavbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Link href="/" passHref legacyBehavior>
          <BNavbar.Brand className="d-flex align-items-center">
            <Robot className="text-primary me-2" size={28} />
            <span className="fw-bold fs-4">OpenHumanoid</span>
          </BNavbar.Brand>
        </Link>

        <BNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Link href="/models" passHref legacyBehavior>
              <Nav.Link>Models</Nav.Link>
            </Link>
            <Link href="/datasets" passHref legacyBehavior>
              <Nav.Link>Datasets</Nav.Link>
            </Link>
            <Link href="/docs" passHref legacyBehavior>
              <Nav.Link>Docs</Nav.Link>
            </Link>
            <Link href="/deploy" passHref legacyBehavior>
              <Nav.Link>Deploy</Nav.Link>
            </Link>
            <Nav.Link 
              href="https://github.com/openhumanoid"
              target="_blank"
              className="d-flex align-items-center"
            >
              <Github size={20} className="me-1" />
              GitHub
            </Nav.Link>
            
            {user ? (
              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                      <span className="text-primary fw-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="ms-2">{displayName}</span>
                  </div>
                }
                id="user-dropdown"
              >
                <Link href="/profile" passHref legacyBehavior>
                  <NavDropdown.Item>
                    <User size={16} className="me-2" />
                    Profile
                  </NavDropdown.Item>
                </Link>
                <NavDropdown.Item 
                  onClick={onSignOut}
                  className="text-danger"
                >
                  <LogOut size={16} className="me-2" />
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <button
                onClick={onAuthClick}
                className="btn btn-primary"
              >
                Sign In
              </button>
            )}
          </Nav>
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  );
};

export default Navbar;