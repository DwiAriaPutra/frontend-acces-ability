/*
Header: Google OAuth Callback Handler
Tujuan: Handle callback dari Google OAuth, tukar authorization code dengan token
Caller: Redirect dari Google OAuth
Dependensi: @/api.handleGoogleCallback
Status: Active
*/

'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleGoogleCallback } from '@/api';
import { registerForPush } from '@/utils/fcm';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        console.log('[GoogleCallback] Received code:', code ? 'Yes' : 'No');
        console.log('[GoogleCallback] Error param:', errorParam);

        if (errorParam) {
          setError(`Google login error: ${errorParam}`);
          setIsLoading(false);
          return;
        }

        if (!code) {
          setError('No authorization code received from Google');
          setIsLoading(false);
          return;
        }

        console.log('[GoogleCallback] Exchanging code with backend...');
        const result = await handleGoogleCallback(code);

        if (result.success && result.data) {
          sessionStorage.setItem("accessToken", result.data.token);
          sessionStorage.setItem("user", JSON.stringify({
            ...result.data.user,
            providerProfile: result.data.providerProfile
          }));
          console.log('[GoogleCallback] Login successful, redirecting to dashboard');

          try {
            void registerForPush().then((r) => console.log('[GoogleCallback] registerForPush', r));
          } catch (e) {
            console.error('[GoogleCallback] registerForPush error', e);
          }
          
          // Determine redirect path; only send providers to provider dashboard when verified
          let redirectPath = '/';
          if (result.data.user.role === 'provider') {
            const isVerified = !!result.data.providerProfile?.is_verified;
            if (isVerified) {
              redirectPath = '/dashboard/provider';
            } else {
              // Show error message for unverified provider
              setError('Akun Anda masih menunggu persetujuan dari admin. Silakan hubungi support atau coba kembali nanti.');
              setIsLoading(false);
              // Redirect to landing page after 3 seconds
              setTimeout(() => {
                router.push('/');
              }, 3000);
              return;
            }
          } else if (result.data.user.role === 'admin') {
            redirectPath = '/dashboard/admin';
          } else {
            redirectPath = '/dashboard/user';
          }

          setTimeout(() => {
            router.push(redirectPath);
          }, 500);
        } else {
          setError(result.message || 'Google login failed');
          setIsLoading(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[GoogleCallback] Error:', err);
        setError(`Failed to complete login: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    exchangeCodeForToken();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-green bg-opacity-20 rounded-full mb-4">
              <svg className="w-6 h-6 text-brand-green animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sedang memproses login</h2>
            <p className="text-gray-500 text-sm">Mohon tunggu, kami sedang menyelesaikan login Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Login Gagal</h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <a href="/login" className="inline-block px-6 py-2 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-hover transition-colors">
              Kembali ke Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function LoadingFallback() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-green bg-opacity-20 rounded-full mb-4">
            <svg className="w-6 h-6 text-brand-green animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sedang memproses login</h2>
          <p className="text-gray-500 text-sm">Mohon tunggu, kami sedang menyelesaikan login Anda...</p>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
