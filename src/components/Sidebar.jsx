import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { 
  LayoutDashboard, Users, Wallet, CheckSquare, 
  Receipt, FileBarChart, Home, CreditCard, 
  Clock, FileText, Shield, User as UserIcon
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  
  // State untuk menyimpan nama pengguna yang sedang login
  const [namaPengguna, setNamaPengguna] = useState('');

  // Mengambil nama pengguna dari database saat Sidebar dimuat
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Otomatis menyesuaikan URL berdasarkan role (admin/profile atau warga/profile)
        const response = await axiosInstance.get(`/${role}/profile`);
        if (response.data.status === 'success') {
          // Mengambil nama_lengkap dari data user
          setNamaPengguna(response.data.data.nama_lengkap);
        }
      } catch (error) {
        console.error('Gagal memuat data pengguna di sidebar:', error);
      }
    };

    fetchUserData();
  }, [role]);

  // Fungsi untuk Logout
  const handleLogout = () => {
    const konfirmasi = window.confirm('Apakah Anda yakin ingin keluar?');
    if (konfirmasi) {
      localStorage.removeItem('token'); // Hapus kunci tiket
      
      // Arahkan kembali ke halaman login yang sesuai dengan role-nya
      if (role === 'admin') {
        navigate('/admin/login');
      } else {
        navigate('/warga/login');
      }
    }
  };

  // --- MENU ADMIN ---
  const adminMenus = [
    { title: 'UTAMA', items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Data Warga', path: '/admin/warga', icon: <Users size={20} /> },
    ]},
    { title: 'KEUANGAN', items: [
      { name: 'Manajemen Kas', path: '/admin/kas', icon: <Wallet size={20} /> },
      { name: 'Verifikasi', path: '/admin/verifikasi', icon: <CheckSquare size={20} /> },
      { name: 'Tagihan Iuran', path: '/admin/tagihan', icon: <Receipt size={20} /> },
    ]},
    { title: 'LAPORAN', items: [
      { name: 'Rekap Bulanan', path: '/admin/laporan', icon: <FileBarChart size={20} /> },
    ]}
  ];

  // --- MENU WARGA ---
  const wargaMenus = [
    { title: 'MENU WARGA', items: [
      { name: 'Dashboard', path: '/warga/dashboard', icon: <Home size={20} /> },
      { name: 'Pembayaran iuran', path: '/warga/pembayaran', icon: <CreditCard size={20} /> },
      { name: 'Riwayat bayar', path: '/warga/riwayat', icon: <Clock size={20} /> },
      { name: 'Laporan kas RT', path: '/warga/laporan', icon: <FileText size={20} /> },
    ]}
  ];

  const menus = role === 'admin' ? adminMenus : wargaMenus;

  return (
    <div className="w-64 h-screen bg-[#111827] text-gray-300 flex flex-col fixed left-0 top-0 z-50">
      
      {/* HEADER SIDEBAR */}
      <div className="p-6 border-b border-gray-800">
        {role === 'admin' ? (
          <div>
            <h1 className="text-white text-xl font-bold tracking-wider">SikaRT</h1>
            <p className="text-[10px] text-gray-500 font-semibold mt-1 tracking-widest uppercase">PANEL ADMIN</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Shield className="text-white w-8 h-8" />
            <div>
              <h1 className="text-white text-base font-bold leading-tight">SikaRT</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Panel Warga</p>
            </div>
          </div>
        )}
      </div>

      {/* LIST MENU */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-hide">
        {menus.map((group, index) => (
          <div key={index}>
            <p className="text-[10px] font-bold text-gray-500 mb-3 tracking-wider ml-2 uppercase">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-500' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER SIDEBAR: PROFIL & LOGOUT */}
      <div className="p-5 border-t border-gray-800 flex flex-col gap-5">
        
        {/* BAGIAN PROFIL DINAMIS */}
        <Link 
          to={role === 'admin' ? '/admin/profile' : '/warga/profile'} 
          className="flex items-center gap-3 hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors group cursor-pointer"
        >
          <div className="bg-[#1f2937] p-2 rounded-full shrink-0 group-hover:bg-gray-700 transition-colors">
            <UserIcon className="text-gray-300 w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              {/* Akan menampilkan nama dari database, jika sedang loading akan menampilkan teks default sementara */}
              {namaPengguna || (role === 'admin' ? 'Memuat...' : 'Memuat...')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Status: {role === 'admin' ? 'Administrator' : 'Warga'}
            </p>
          </div>
        </Link>
        
        {/* Tombol Logout Seragam */}
        <button 
          onClick={handleLogout}
          className="w-full bg-[#1e293b] hover:bg-[#334155] text-gray-200 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center border border-gray-700/50"
        >
          Keluar
        </button>
      </div>

    </div>
  );
};

export default Sidebar;