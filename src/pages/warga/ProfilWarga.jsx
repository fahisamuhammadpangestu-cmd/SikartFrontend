import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Mail, Phone, MapPin, Calendar, Shield, Activity, Edit3, X, Save, User as UserIcon } from 'lucide-react';

const ProfilWarga = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State form dibiarkan kosong, nanti akan diisi otomatis dari database
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_hp: '',
    blok: '',
    bergabung: '',
    role: '',
    status: 'Aktif',
    password: ''
  });

  // 1. FUNGSI MENGAMBIL DATA PROFIL SAAT INI
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      // Mengambil data user yang sedang login dari Laravel
      const response = await axiosInstance.get('/warga/profile');
      
      if (response.data.status === 'success') {
        const user = response.data.data;
        
        // Memasukkan data dari database ke dalam form
        setFormData({
          nama_lengkap: user.nama_lengkap || '',
          email: user.email || '',
          no_hp: user.no_hp || '',
          blok: user.blok || '',
          // Mengubah format tanggal dibuat menjadi format lokal
          bergabung: new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
          role: user.role === 'warga' ? 'Warga' : 'Admin',
          status: 'Aktif', // Default aktif
          password: '' // Password sengaja dikosongkan untuk keamanan
        });
      }
    } catch (error) {
      console.error('Gagal mengambil data profil:', error);
      alert('Gagal memuat informasi profil.');
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan fetchProfile saat halaman pertama kali dibuka
  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. FUNGSI MENANGANI KETIKAN INPUT
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. FUNGSI MENYIMPAN PERUBAHAN
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Siapkan data yang mau dikirim (buang data yang tidak perlu dikirim seperti tanggal gabung)
    const dataToSend = {
      nama_lengkap: formData.nama_lengkap,
      email: formData.email,
      no_hp: formData.no_hp,
      blok: formData.blok,
    };

    // Hanya kirim password jika user mengetik sesuatu di kolom password
    if (formData.password.trim() !== '') {
      dataToSend.password = formData.password;
    }

    try {
      const response = await axiosInstance.put('/warga/profile', dataToSend);
      if (response.data.status === 'success') {
        alert('Profil berhasil diperbarui!');
        setIsEditing(false); // Tutup form
        
        // Kosongkan kembali kolom password setelah sukses menyimpan
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Gagal memperbarui profil:', error);
      alert(error.response?.data?.message || 'Gagal memperbarui profil. Periksa kembali input Anda.');
    }
  };

  // Mengambil huruf pertama dari nama untuk dijadikan Avatar
  const inisial = formData.nama_lengkap ? formData.nama_lengkap.charAt(0).toUpperCase() : 'W';

  if (isLoading) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-10">
      
      {/* HEADER & TOMBOL EDIT */}
      <div className="mt-2 border-b border-gray-100 pb-4 flex justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola informasi profil dan pengaturan akun Anda</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-[#1F2937] hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Edit3 size={16} /> Edit Profil
          </button>
        )}
      </div>

      {isEditing ? (
        // ==========================================
        // TAMPILAN 1: MODE EDIT (FORMULIR)
        // ==========================================
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <UserIcon size={20} className="text-blue-600" /> Edit Informasi Profil
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telepon / WhatsApp</label>
              <input type="text" name="no_hp" value={formData.no_hp} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat / Blok</label>
              <input type="text" name="blok" value={formData.blok} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ganti Kata Sandi (Opsional)</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Kosongkan jika tidak ingin mengubah kata sandi" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-gray-50 transition-all" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                Batal
              </button>
              <button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      ) : (
        // ==========================================
        // TAMPILAN 2: MODE BACA (TAMPILAN AWAL)
        // ==========================================
        <div className="flex flex-col gap-6">
          
          {/* KARTU AVATAR BESAR */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 shrink-0 rounded-full bg-[#2563EB] text-white flex justify-center items-center text-5xl font-bold shadow-lg">
              {inisial}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.nama_lengkap}</h2>
              <p className="text-sm text-gray-500 mb-4">{formData.email}</p>
              <div className="flex justify-center md:justify-start gap-2">
                <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold tracking-wider">
                  {formData.role}
                </span>
                <span className="px-4 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold tracking-wider">
                  {formData.status}
                </span>
              </div>
            </div>
          </div>

          {/* GRID 6 KARTU INFORMASI DETAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-[#3B82F6]">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-lg"><Mail size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-bold text-gray-900">{formData.email}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-[#10B981]">
              <div className="p-3 bg-green-50 text-green-500 rounded-lg"><Phone size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Telepon</p>
                <p className="text-sm font-bold text-gray-900">{formData.no_hp || '-'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-[#A855F7]">
              <div className="p-3 bg-purple-50 text-purple-500 rounded-lg"><MapPin size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat / Blok</p>
                <p className="text-sm font-bold text-gray-900">{formData.blok || '-'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-[#F97316]">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-lg"><Calendar size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bergabung</p>
                <p className="text-sm font-bold text-gray-900">{formData.bergabung}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-[#6366F1]">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-lg"><Shield size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                <p className="text-sm font-bold text-gray-900">{formData.role}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-[#06B6D4]">
              <div className="p-3 bg-cyan-50 text-cyan-500 rounded-lg"><Activity size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <p className="text-sm font-bold text-gray-900">{formData.status}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilWarga;