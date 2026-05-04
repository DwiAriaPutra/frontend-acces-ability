'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/api';

interface User {
  full_name: string;
  email: string;
  role: string;
  image_url?: string;
  providerProfile?: {
    is_verified?: boolean;
    verification_status?: string;
  };
}

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const syncUserFromStorage = () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      if (userStr && token) {
        try {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }

      setIsLoading(false);
    };

    syncUserFromStorage();

    const handleUserUpdated = () => {
      syncUserFromStorage();
    };

    const intervalId = window.setInterval(syncUserFromStorage, 500);
    window.addEventListener('user-updated', handleUserUpdated);
    window.addEventListener('storage', handleUserUpdated);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('user-updated', handleUserUpdated);
      window.removeEventListener('storage', handleUserUpdated);
    };
  }, []);

  const handleLogout = () => {
    const result = logout();
    if (result.success) {
      setIsLoggedIn(false);
      setUser(null);
      router.push('/');
    }
  };

  // Check if user is an unverified provider (show as guest on landing page)
  const isUnverifiedProvider = user && user.role === 'provider' && !(
    user.providerProfile?.is_verified
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            alt="ACCESS-ABILITY Logo"
            className="h-10 w-auto"
            src="/images/logo.svg"
          />
          <span className="ml-2 font-bold text-green-700 text-xs tracking-tight uppercase">ACCESS-ABILITY</span>
        </Link>
        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <Link href="/" className="hover:text-brand-green">Beranda</Link>
          <Link href="#layanan" className="hover:text-brand-green">Layanan</Link>
          <Link href="#tentang-kami" className="hover:text-brand-green">Tentang Kami</Link>
          <Link href="#" className="hover:text-brand-green">Daftar Provider</Link>
        </nav>
        {/* Auth Buttons or User Menu */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : isLoggedIn && user && !isUnverifiedProvider ? (
            // Show user menu only for verified providers and other logged-in users
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border border-green-200">
                  {user.image_url ? (
                    <img
                      src={user.image_url}
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-green-700 uppercase">
                      {user.full_name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('') || 'U'}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
              </div>
              <Link 
                href={user.role === 'provider' ? '/dashboard/provider/profil' : '/dashboard/user/profil'}
                className="text-brand-green font-medium text-sm hover:underline"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-red-600 transition"
              >
                Keluar
              </button>
            </div>
          ) : (
            // Show login/register buttons for guests and unverified providers
            <>
              <Link href="/register" className="text-brand-green font-medium text-sm">Daftar</Link>
              <Link href="/login" className="bg-brand-green text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-green-600 transition">Masuk</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
