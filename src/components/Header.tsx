'use client';

import Link from 'next/link';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setIsLoggedIn(false);
      setUser(null);
      setIsMobileMenuOpen(false);
      router.push('/');
    }
  };

  // Check if user is an unverified provider (show as guest on landing page)
  const isUnverifiedProvider = user && user.role === 'provider' && !(
    user.providerProfile?.is_verified
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center min-w-0">
          <img
            alt="ACCESS-ABILITY Logo"
            className="h-9 sm:h-10 w-auto flex-shrink-0"
            src="/images/logo.svg"
          />
          <span className="ml-2 font-bold text-green-700 text-[11px] sm:text-xs tracking-tight uppercase truncate">ACCESS-ABILITY</span>
        </Link>
        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <Link href="/" className="hover:text-brand-green">Beranda</Link>
          <Link href="#layanan" className="hover:text-brand-green">Layanan</Link>
          <Link href="#tentang-kami" className="hover:text-brand-green">Tentang Kami</Link>
          <Link href="#" className="hover:text-brand-green">Daftar Provider</Link>
        </nav>
        {/* Auth Buttons or User Menu */}
        <div className="hidden md:flex items-center space-x-4">
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
        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-700 transition hover:bg-gray-50"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="sr-only">Menu</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            )}
          </svg>
        </button>
      </div>
      {isMobileMenuOpen ? (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 shadow-sm">
          <nav className="flex flex-col py-3 text-sm font-medium text-gray-700">
            <Link href="/" className="py-3 hover:text-brand-green" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
            <Link href="#layanan" className="py-3 hover:text-brand-green" onClick={() => setIsMobileMenuOpen(false)}>Layanan</Link>
            <Link href="#tentang-kami" className="py-3 hover:text-brand-green" onClick={() => setIsMobileMenuOpen(false)}>Tentang Kami</Link>
            <Link href="/register-provider" className="py-3 hover:text-brand-green" onClick={() => setIsMobileMenuOpen(false)}>Daftar Provider</Link>
          </nav>
          <div className="border-t border-gray-100 pt-4">
            {isLoading ? (
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            ) : isLoggedIn && user && !isUnverifiedProvider ? (
              <div className="space-y-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border border-green-200">
                    {user.image_url ? (
                      <img src={user.image_url} alt={user.full_name} className="h-full w-full object-cover" />
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
                  <span className="truncate text-sm font-medium text-gray-700">{user.full_name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={user.role === 'provider' ? '/dashboard/provider/profil' : '/dashboard/user/profil'}
                    className="rounded-md border border-green-200 px-4 py-2 text-center text-sm font-medium text-brand-green"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/register" className="rounded-md border border-green-200 px-4 py-2 text-center text-sm font-medium text-brand-green" onClick={() => setIsMobileMenuOpen(false)}>Daftar</Link>
                <Link href="/login" className="rounded-md bg-brand-green px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-green-600" onClick={() => setIsMobileMenuOpen(false)}>Masuk</Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
