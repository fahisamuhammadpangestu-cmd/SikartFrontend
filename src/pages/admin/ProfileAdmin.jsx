import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Mail, Phone, MapPin, Calendar, Shield, Activity, Edit3, X, Save, User } from 'lucide-react';

const ProfilAdmin = () => {
  // State untuk menyimpan data asli dari database
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk mengontrol apakah sedang mode edit atau tidak
  const [isEditing, setIsEditing] = useState(false);
  
  // State untuk menampung ketikan user saat mengedit form
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_hp: '',
    blok: '',
    password: '' // Dikosongkan, hanya diisi jika ingin ganti password
  });

  // Fungsi untuk mengubah format tanggal (contoh: 15 Januari 2024)
  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // 1. Fungsi Mengambil Data Profil Saat Ini
  const fetchProfile = async () => {
    try {
      // Endpoint ini otomatis tahu siapa yang login dari token
      const response = await axiosInstance.get('/admin/profile');
      if (response.data.status === 'success') {
        const user = response.data.data;
        setProfileData(user);
        // Isi form dengan data yang ada
        setFormData({
          nama_lengkap: user.nama_lengkap || '',
          email: user.email || '',
          no_hp: user.no_hp || '',
          blok: user.blok || '',
          password: '' 
        });
      }
    } catch (error) {
      console.error('Gagal mengambil profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil data pertama kali saat halaman dimuat
  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Fungsi Menangani Ketikan di Form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Fungsi Menyimpan Perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mengirim data baru ke backend
      await axiosInstance.put('/admin/profile', formData);
      alert('Profil berhasil diperbarui!');
      
      // Matikan mode edit dan segarkan data
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Gagal memperbarui profil:', error);
      alert('Terjadi kesalahan saat menyimpan profil.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mendapatkan inisial nama untuk avatar (contoh: "Fahisa Muhammad" -> "F")
  const inisial = profileData?.nama_lengkap ? profileData.nama_lengkap.charAt(0).toUpperCase() : 'A';

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER & TOMBOL EDIT */}
      <div className="mt-2 border-b border-gray-100 pb-4 flex justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola informasi profil dan pengaturan akun Anda</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Edit3 size={16} /> Edit Profil
          </button>
        )}
      </div>

      {isEditing ? (
        // ==========================================
        // TAMPILAN MODE EDIT (FORM)
        // ==========================================
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Edit Informasi Profil
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telepon / WhatsApp</label>
              <input type="number" name="no_hp" value={formData.no_hp} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat / Blok</label>
              <input type="text" name="blok" value={formData.blok} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ganti Kata Sandi (Opsional)</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Kosongkan jika tidak ingin mengubah kata sandi" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-gray-50" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                Batal
              </button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      ) : (
        // ==========================================
        // TAMPILAN MODE BACA (TAMPILAN AWAL)
        // ==========================================
        <div className="flex flex-col gap-6">
          
          {/* KARTU AVATAR BESAR */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex justify-center items-center text-4xl font-bold shadow-lg">
              {inisial}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profileData?.nama_lengkap}</h2>
              <p className="text-sm text-gray-500 mb-3">{profileData?.email}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {profileData?.role}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {profileData?.status_warga || 'Aktif'}
                </span>
              </div>
            </div>
          </div>

          {/* GRID INFORMASI DETAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-blue-500">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-lg"><Mail size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-bold text-gray-900">{profileData?.email}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-green-500">
              <div className="p-3 bg-green-50 text-green-500 rounded-lg"><Phone size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Telepon</p>
                <p className="text-sm font-bold text-gray-900">{profileData?.no_hp || '-'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-purple-500">
              <div className="p-3 bg-purple-50 text-purple-500 rounded-lg"><MapPin size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat / Blok</p>
                <p className="text-sm font-bold text-gray-900">{profileData?.blok || '-'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-orange-500">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-lg"><Calendar size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bergabung</p>
                <p className="text-sm font-bold text-gray-900">{formatTanggal(profileData?.created_at)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-indigo-500">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-lg"><Shield size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                <p className="text-sm font-bold text-gray-900 capitalize">{profileData?.role}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 border-l-4 border-l-teal-500">
              <div className="p-3 bg-teal-50 text-teal-500 rounded-lg"><Activity size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <p className="text-sm font-bold text-gray-900">{profileData?.status_warga || 'Aktif'}</p>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ProfilAdmin;