'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadPage from '@/components/UploadPage';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

export default function Upload() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/');
      }
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!user) return null;

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
      <UploadPage />
    </>
  );
}