import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Trash2, Megaphone, Send, Users } from 'lucide-react';

const DataWarga = () => {
  const [warga, setWarga] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form input pengumuman baru
  const [formPengumuman, setFormPengumuman] = useState({ judul: '', konten: '' });

  // 1. Ambil data warga dan pengumuman dari Laravel
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resWarga = await axiosInstance.get('/admin/warga');
      if (resWarga.data.status === 'success') setWarga(resWarga.data.data);

      const resPengumuman = await axiosInstance.get('/admin/pengumuman');
      if (resPengumuman.data.status === 'success') setPengumuman(resPengumuman.data.data);
    } catch (error) {
      console.error('Gagal memuat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Fungsi simpan pengumuman baru
  const handleSimpanPengumuman = async (e) => {
    e.preventDefault();
    if (!formPengumuman.judul || !formPengumuman.konten) return alert('Isi semua bidang judul dan konten!');
    
    try {
      const response = await axiosInstance.post('/admin/pengumuman', formPengumuman);
      if (response.data.status === 'success') {
        alert('Pengumuman berhasil disebarkan!');
        setFormPengumuman({ judul: '', konten: '' });
        fetchData(); 
      }
    } catch (error) {
      console.error('Gagal menyimpan pengumuman:', error);
      alert('Gagal menyebarkan pengumuman!');
    }
  };

  // 3. Fungsi hapus pengumuman
  const handleHapusPengumuman = async (id) => {
    if (window.confirm('Hapus pengumuman ini?')) {
      try {
        const response = await axiosInstance.delete(`/admin/pengumuman/${id}`);
        if (response.data.status === 'success') fetchData();
      } catch (error) {
        console.error('Gagal menghapus pengumuman:', error);
      }
    }
  };

  // ================= YANG BARU: FUNGSI HAPUS WARGA =================
  const handleHapusWarga = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data akun warga ini?')) {
      try {
        const response = await axiosInstance.delete(`/admin/warga/${id}`);
        if (response.data.status === 'success') {
          fetchData(); // Refresh tabel setelah berhasil dihapus
        }
      } catch (error) {
        console.error('Gagal menghapus data warga:', error);
        alert('Gagal menghapus data warga.');
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Warga & Informasi</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data penduduk RT 03 Cimuning dan buat pengumuman resmi.</p>
      </div>

      {/* ================= FORM CRUD PENGUMUMAN ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
            <Megaphone size={18} />
            <h2>Buat Pengumuman Baru</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Informasi yang diketik di sini akan langsung muncul di halaman dashboard warga.</p>
          
          <form onSubmit={handleSimpanPengumuman} className="space-y-3">
            <input 
              type="text" 
              placeholder="Judul Pengumuman (contoh: Jadwal Kerja Bakti)" 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-gray-50"
              value={formPengumuman.judul}
              onChange={(e) => setFormPengumuman({ ...formPengumuman, judul: e.target.value })}
            />
            <textarea 
              placeholder="Tuliskan isi pengumuman secara detail di sini..." 
              rows="3"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-gray-50 resize-none"
              value={formPengumuman.konten}
              onChange={(e) => setFormPengumuman({ ...formPengumuman, konten: e.target.value })}
            ></textarea>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
              <Send size={14} /> Sebarkan Informasi
            </button>
          </form>
        </div>

        {/* RIWAYAT PENGUMUMAN AKTIF */}
        <div className="lg:col-span-2 border-l border-gray-100 lg:pl-6 overflow-y-auto max-h-[220px]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pengumuman Aktif saat ini ({pengumuman.length})</h3>
          {pengumuman.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Belum ada pengumuman yang disebarkan.</p>
          ) : (
            <div className="space-y-3">
              {pengumuman.map((p) => (
                <div key={p.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-start border border-gray-200/50">
                  <div className="overflow-hidden pr-4">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{p.judul}</h4>
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{p.konten}</p>
                  </div>
                  <button onClick={() => handleHapusPengumuman(p.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= TABEL DATA WARGA ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <h2 className="text-sm font-bold text-gray-900">Daftar Pengurus & Warga</h2>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white text-[10px] font-bold text-gray-400 uppercase border-b border-gray-200">
                <th className="px-6 py-4">NO</th>
                <th className="px-6 py-4">NAMA LENGKAP</th>
                <th className="px-6 py-4">USERNAME</th>
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">BLOK</th>
                {/* KOLOM YANG DIKEMBALIKAN */}
                <th className="px-6 py-4">NO TELEPON</th>
                <th className="px-6 py-4">STATUS WARGA</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {warga.map((w, index) => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{w.nama_lengkap}</td>
                  <td className="px-6 py-4 text-gray-500">{w.username}</td>
                  <td className="px-6 py-4 text-gray-500">{w.nik || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{w.blok || '-'}</td>
                  
                  {/* ISI KOLOM YANG DIKEMBALIKAN */}
                  <td className="px-6 py-4 text-gray-500">{w.nomor_hp || w.no_hp || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-600 uppercase">
                      {w.status_warga}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleHapusWarga(w.id)} 
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Hapus Warga"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataWarga;