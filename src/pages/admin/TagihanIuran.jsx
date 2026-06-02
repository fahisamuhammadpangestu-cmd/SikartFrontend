import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { CheckCircle2, ListTodo, Edit2, Trash2, X } from 'lucide-react';

const TagihanIuran = () => {
  const [dataTagihan, setDataTagihan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State khusus untuk menandakan kita sedang dalam mode edit
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    nama_tagihan: '',
    nominal: '',
    keterangan: ''
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  // --- 1. AMBIL DATA TAGIHAN ---
  const fetchTagihan = async () => {
    try {
      const response = await axiosInstance.get('/admin/tagihan');
      if (response.data.status === 'success') {
        setDataTagihan(response.data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagihan();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 2. SIMPAN / UPDATE TAGIHAN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editId) {
        // Jika editId ada, lakukan UPDATE (Edit)
        await axiosInstance.put(`/admin/tagihan/${editId}`, formData);
        alert('Tagihan berhasil diperbarui!');
      } else {
        // Jika tidak ada editId, lakukan CREATE (Buat Baru)
        await axiosInstance.post('/admin/tagihan', formData);
        alert('Tagihan baru berhasil dibuat!');
      }
      
      // Reset form & panggil ulang data
      cancelEdit();
      fetchTagihan();
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. SIAPKAN FORM UNTUK EDIT ---
  const handleEdit = (tagihan) => {
    setEditId(tagihan.id);
    setFormData({
      nama_tagihan: tagihan.nama_tagihan,
      nominal: tagihan.nominal,
      keterangan: tagihan.keterangan || ''
    });
    // Scroll ke atas agar form terlihat
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 4. BATALKAN EDIT ---
  const cancelEdit = () => {
    setEditId(null);
    setFormData({
      nama_tagihan: '',
      nominal: '',
      keterangan: ''
    });
  };

  // --- 5. HAPUS TAGIHAN ---
  const handleDelete = async (id, namaTagihan) => {
    const isConfirm = window.confirm(`Yakin ingin menghapus tagihan "${namaTagihan}"?`);
    if (isConfirm) {
      try {
        await axiosInstance.delete(`/admin/tagihan/${id}`);
        fetchTagihan(); // Segarkan tabel
      } catch (error) {
        console.error('Gagal menghapus:', error);
        alert('Gagal menghapus data.');
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="mt-2 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Tagihan Iuran</h1>
        <p className="text-sm text-gray-500 mt-1">Tentukan nominal iuran bulanan untuk warga RT 03 Cimuning.</p>
      </div>

      {/* FORM KELOLA TAGIHAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
        {/* Tombol batal edit (hanya muncul saat mode edit) */}
        {editId && (
          <button onClick={cancelEdit} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        )}

        <div className="flex items-center gap-2 text-blue-600 mb-6">
          <CheckCircle2 size={20} />
          <h2 className="text-base font-bold">{editId ? 'Edit Tagihan' : 'Buat Tagihan Baru'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Tagihan</label>
            <input type="text" name="nama_tagihan" value={formData.nama_tagihan} onChange={handleInputChange} required placeholder="Contoh: Iuran Keamanan Mei 2026" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nominal (Rp)</label>
            <input type="number" name="nominal" value={formData.nominal} onChange={handleInputChange} required min="1" placeholder="50000" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Keterangan</label>
            <input type="text" name="keterangan" value={formData.keterangan} onChange={handleInputChange} placeholder="Opsional" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
          </div>
          
          <div className="md:col-span-2">
            <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <CheckCircle2 size={18} />
              {isSubmitting ? '...' : (editId ? 'Perbarui' : 'Buat')}
            </button>
          </div>
        </form>
      </div>

      {/* TABEL DAFTAR TAGIHAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <ListTodo size={20} className="text-gray-500" />
          <h2 className="text-base font-bold text-gray-800">Daftar Tagihan Aktif</h2>
        </div>

        {isLoading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 text-center w-16">NO</th>
                  <th className="px-6 py-4">NAMA TAGIHAN</th>
                  <th className="px-6 py-4">KETERANGAN</th>
                  <th className="px-6 py-4 text-right">NOMINAL</th>
                  <th className="px-6 py-4 text-center">STATUS SISTEM</th>
                  <th className="px-6 py-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataTagihan.length > 0 ? (
                  dataTagihan.map((tagihan, index) => (
                    <tr key={tagihan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{tagihan.nama_tagihan}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{tagihan.keterangan || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatRupiah(tagihan.nominal)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagihan.status_sistem === 'aktif' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {tagihan.status_sistem}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* TOMBOL AKSI: EDIT DAN HAPUS */}
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => handleEdit(tagihan)} className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title="Edit Tagihan">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(tagihan.id, tagihan.nama_tagihan)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Hapus Tagihan">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-sm text-gray-400">
                      Belum ada tagihan yang dibuat.
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

export default TagihanIuran;