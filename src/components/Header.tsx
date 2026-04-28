import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            alt="ACCESS-ABILITY Logo"
            className="h-10 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpjustQnD2e9tpWYOrpyCwIiXwMU_wPvPo2qsW7T-Ak1qY3nktzDaszSCMaQKblkjzzljyzkKzwFcHN4bE8EWGOSZsaPtIVf20zaHgluhar6idN5z97gCK086HyLquBVxcWxSO0GxdfbYik6JI9vduqo-1wc8oK45MP-rNSI9sCDkxlHyivIkCb_P1PJaRKsmuXiA7ojTe5VrHXlCGjDBsw54C-2H3kT1NWwI5JQwFoLQ4UhPziw6183FemJkrw60LJ2chW8qJmz4"
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
        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/register" className="text-brand-green font-medium text-sm">Daftar</Link>
          <Link href="/login" className="bg-brand-green text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-green-600 transition">Masuk</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
