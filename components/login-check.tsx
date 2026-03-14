'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginCheckProps {
  children: React.ReactNode;
}

export function LoginCheck({ children }: LoginCheckProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}