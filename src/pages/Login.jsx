import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Building2, Wallet, FileText, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login_id: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Tembak ke URL Pintu Universal yang baru kita buat
      const response = await axiosInstance.post('/login', formData);
      
      if (response.data.status === 'success') {
        // 2. Simpan token ke localStorage browser
        localStorage.setItem('token', response.data.access_token);
        
        // 3. Cek jabatan (role) dari data yang dikirim Laravel
        const userRole = response.data.data.role;
        
        // 4. Arahkan secara otomatis berdasarkan jabatan!
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'warga') {
          navigate('/warga/dashboard');
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Terjadi kesalahan pada server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* BAGIAN KIRI: Branding - Diperbesar untuk layar XL */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-[#1b253b] p-8 lg:p-16 xl:p-24 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 w-full max-w-xl xl:max-w-2xl mx-auto">
          {/* Logo */}
          <div className="bg-blue-600 w-14 h-14 xl:w-16 xl:h-16 rounded-xl flex items-center justify-center mb-6 xl:mb-8 shadow-lg">
            <Building2 className="text-white w-7 h-7 xl:w-8 xl:h-8" />
          </div>
          
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">SikaRT</h1>
          <p className="text-gray-400 text-sm lg:text-base xl:text-lg mb-10 xl:mb-14 leading-relaxed max-w-md xl:max-w-lg">
            Sistem Informasi Manajemen Warga & Administrasi Lingkungan yang Terintegrasi.
          </p>

          {/* Cards Fitur */}
          <div className="space-y-4 xl:space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 xl:p-6 flex items-start space-x-4 xl:space-x-5 backdrop-blur-sm">
              <div className="bg-white/10 p-3 rounded-xl shrink-0">
                <Wallet className="text-blue-400 w-6 h-6 xl:w-7 xl:h-7" />
              </div>
              <div>
                <h3 className="text-white font-medium text-base xl:text-lg">Laporan Keuangan</h3>
                <p className="text-gray-400 text-xs xl:text-sm mt-1.5">Transparansi iuran dan pengeluaran warga secara real-time.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 xl:p-6 flex items-start space-x-4 xl:space-x-5 backdrop-blur-sm">
              <div className="bg-white/10 p-3 rounded-xl shrink-0">
                <FileText className="text-blue-400 w-6 h-6 xl:w-7 xl:h-7" />
              </div>
              <div>
                <h3 className="text-white font-medium text-base xl:text-lg">Cetak Laporan</h3>
                <p className="text-gray-400 text-xs xl:text-sm mt-1.5">Mencetak laporan keuangan supaya lebih transparan</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dekorasi Background */}
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] xl:w-[40rem] xl:h-[40rem] bg-blue-900/30 rounded-full blur-3xl"></div>
      </div>

      {/* BAGIAN KANAN: Form Login */}
      <div className="w-full md:w-1/2 lg:w-[45%] bg-slate-50 flex items-center justify-center p-6 relative">
        {/* Container Form diperlebar dari max-w-md menjadi lg:max-w-lg xl:max-w-xl */}
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white p-8 xl:p-12 rounded-2xl shadow-sm border border-gray-100 z-10">
          <div className="mb-8 xl:mb-10">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 xl:mb-3">Masuk ke Portal</h2>
            <p className="text-gray-500 text-sm xl:text-base">
              Silakan masukkan akun admin Anda untuk mengelola data warga.
            </p>
          </div>

          {/* Pesan Error */}
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm xl:text-base rounded-lg border border-red-100 flex items-center">
              <span className="block sm:inline">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 xl:space-y-6">
            {/* Input Email/Username */}
            <div>
              <label className="block text-sm xl:text-base font-semibold text-gray-700 mb-2">Email/Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleInputChange}
                  placeholder="Masukkan username atau email"
                  className="w-full pl-11 pr-4 py-3 xl:py-3.5 bg-slate-50 border border-gray-200 rounded-lg text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm xl:text-base font-semibold text-gray-700">Kata Sandi</label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lupa Sandi?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 xl:py-3.5 bg-slate-50 border border-gray-200 rounded-lg text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4.5 w-4.5 xl:h-5 xl:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 block text-sm xl:text-base text-gray-600 cursor-pointer">
                Ingat saya untuk 30 hari
              </label>
            </div> 

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 xl:py-3.5 px-4 rounded-lg text-base xl:text-lg transition-colors flex justify-center items-center gap-2 mt-2"
            >
              {isLoading ? 'Memproses...' : 'Masuk'} 
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm xl:text-base text-gray-600">
              Belum memiliki akun pengelola?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Links Bawah - Diperbaiki posisinya agar presisi di tengah layar kanan */}
        <div className="absolute bottom-8 w-full flex justify-center space-x-8 text-sm xl:text-base text-gray-500 font-medium">
          <a href="#" className="hover:text-gray-800 transition-colors">Bantuan</a>
          <a href="#" className="hover:text-gray-800 transition-colors">Privasi</a>
          <a href="#" className="hover:text-gray-800 transition-colors">ID (Indonesian)</a>
        </div>
      </div>
    </div>
  );
};

export default Login;