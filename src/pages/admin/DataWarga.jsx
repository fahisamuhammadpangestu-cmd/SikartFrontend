import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const DataWarga = () => {
  const [dataWarga, setDataWarga] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWarga = async () => {
    try {
      const response = await axiosInstance.get('/admin/warga');
      if (response.data.status === 'success') {
        setDataWarga(response.data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarga();
  }, []);

  const handleDelete = async (id, nama) => {
    // Konfirmasi penghapusan sesuai instruksimu
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus data warga bernama ${nama}? Data akan terhapus dari database dan warga harus melakukan registrasi ulang.`);
    
    if (confirmDelete) {
      try {
        await axiosInstance.delete(`/admin/warga/${id}`);
        fetchWarga(); // Refresh data tabel
      } catch (error) {
        console.error('Gagal menghapus data:', error);
        alert('Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER: Tanpa Tombol Tambah Warga */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Warga</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data penduduk RT 03 Cimuning</p>
        </div>
      </div>

      {/* KARTU TABEL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        
        {isLoading ? (
          <div className="p-10 flex justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
              
              {/* KEPALA TABEL */}
              <thead>
                <tr className="bg-white border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 text-center w-16">NO</th>
                  <th className="px-6 py-4">NAMA LENGKAP</th>
                  <th className="px-6 py-4">USERNAME</th>
                  <th className="px-6 py-4">NIK</th>
                  <th className="px-6 py-4">BLOK</th>
                  <th className="px-6 py-4">NO TELEPON</th>
                  <th className="px-6 py-4">STATUS WARGA</th>
                  <th className="px-6 py-4 text-center">AKSI</th>
                </tr>
              </thead>
              
              {/* BADAN TABEL */}
              <tbody className="divide-y divide-gray-100">
                {dataWarga.length > 0 ? (
                  dataWarga.map((warga, index) => (
                    <tr key={warga.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{warga.nama_lengkap}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{warga.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{warga.nik}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{warga.blok}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{warga.no_hp}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
                          {warga.status_warga}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* HANYA IKON TONG SAMPAH (HAPUS) */}
                        <div className="flex justify-center items-center">
                          <button 
                            onClick={() => handleDelete(warga.id, warga.nama_lengkap)}
                            className="text-red-400 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 p-2 rounded-lg" 
                            title="Hapus Data"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">
                      Belum ada data warga yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataWarga;