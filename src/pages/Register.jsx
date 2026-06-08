import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Shield, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    nik: '',
    blok: '',
    no_hp: '',
    email: '',
    password: '',
    status_warga: 'Warga Tetap',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post('/register', formData);
      if (response.data.status === 'success') {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      
      {/* BAGIAN KIRI (Desain Biru Gelap) */}
      <div className="hidden md:flex md:w-1/2 bg-[#111827] text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wider">SikaRT</h2>
              <p className="text-xs text-gray-400 tracking-widest uppercase">PORTAL WARGA</p>
            </div>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Akses layanan lingkungan dengan lebih mudah & cepat.
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Daftarkan diri Anda sebagai warga untuk mengakses informasi iuran, transparansi kas, dan layanan administrasi secara digital.
          </p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex items-start gap-4 backdrop-blur-sm">
            <div className="bg-blue-600/20 text-blue-500 p-3 rounded-full shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Keamanan Terjamin</h3>
              <p className="text-sm text-gray-400">Enkripsi tingkat tinggi untuk semua data sensitif warga dan riwayat pembayaran.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN KANAN (Form Registrasi) - Layout Telah Disesuaikan */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center overflow-y-auto">
        
        {/* max-w-lg membuat form lebih proporsional mengisi ruang kosong */}
        <div className="max-w-lg w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Warga</h2>
          <p className="text-gray-500 mb-8">Lengkapi detail di bawah ini untuk mendaftarkan akun warga baru Anda.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required placeholder="Masukkan nama sesuai KTP" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm" />
            </div>

            {/* Username & NIK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Contoh: budi123" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-blue-50/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">NIK</label>
                <input type="number" name="nik" value={formData.nik} onChange={handleChange} required placeholder="16 digit NIK" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm" />
              </div>
            </div>

            {/* Nomor HP & Blok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor HP/WhatsApp</label>
                <input type="number" name="no_hp" value={formData.no_hp} onChange={handleChange} required placeholder="08xx xxxx xxxx" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Blok Rumah</label>
                <input type="text" name="blok" value={formData.blok} onChange={handleChange} required placeholder="Contoh: Blok A1 No.12" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm" />
              </div>
            </div>

            {/* Status Warga */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status Warga</label>
              <select name="status_warga" value={formData.status_warga} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-white cursor-pointer">
                <option value="Warga Tetap">Warga Tetap</option>
                <option value="Warga Kontrak">Warga Kontrak</option>
                <option value="Kos">Kos</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@contoh.com" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-blue-50/30" />
            </div>

            {/* Kata Sandi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-gray-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors mt-6 shadow-sm">
              {isLoading ? 'Memproses...' : 'Daftar Sekarang →'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            Sudah memiliki akun? <Link to="/login" className="text-blue-600 font-bold hover:underline transition-all">Masuk Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;