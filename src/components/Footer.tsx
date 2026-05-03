import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* About Column */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center mb-6">
            <img
              alt="Footer Logo"
              className="h-10 w-auto brightness-200"
              src="/images/logo.svg"
            />
            <span className="ml-2 font-bold text-white text-xs tracking-tight uppercase">ACCESS-ABILITY</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed italic">
            Platform yang menghubungkan pengguna dengan pendamping profesional disabilitas profesional.
          </p>
        </div>
        {/* Services Column */}
        <div>
          <h4 className="font-bold mb-6">Layanan</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-white transition">&gt; Cari Pendamping</Link></li>
            <li><Link href="#" className="hover:text-white transition">&gt; Jadi Provider</Link></li>
          </ul>
        </div>
        {/* Support Column */}
        <div>
          <h4 className="font-bold mb-6">Bantuan</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-white transition">&gt; Pusat Bantuan</Link></li>
            <li><Link href="#" className="hover:text-white transition">&gt; Kebijakan Privasi</Link></li>
            <li><Link href="#" className="hover:text-white transition">&gt; Syarat &amp; Ketentuan</Link></li>
          </ul>
        </div>
        {/* Contact Column */}
        <div>
          <h4 className="font-bold mb-6">Kontak Kami</h4>
          <div className="space-y-4 text-sm text-gray-400">
            <p>Kota Tasikmalaya, Jawa Barat</p>
            <p>+62 21 5555 8888</p>
            <p>Ability@gmail.com</p>
            <p>Senin - Jum'at</p>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800">
        <p className="text-sm text-gray-500 italic">© 2026 ACCESS-ABILITY. Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  );
};

export default Footer;
