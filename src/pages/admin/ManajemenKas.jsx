import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Search, Download, ArrowRightLeft, Wallet, Edit2, Trash2, X, TrendingDown } from 'lucide-react';

const ManajemenKas = () => {
  // --- STATE UNTUK DATA API ---
  const [saldoSaatIni, setSaldoSaatIni] = useState(0);
  const [totalKasKeluar, setTotalKasKeluar] = useState(0); // <-- State baru untuk Kas Keluar
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status khusus untuk menandakan kita sedang mode "Edit"
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    jenis: 'pemasukan',
    tanggal_transaksi: new Date().toISOString().split('T')[0],
    keterangan: '',
    nominal: ''
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // --- Fungsi Memanggil Data API ---
  const fetchManajemenKas = async () => {
    try {
      const response = await axiosInstance.get('/admin/kas');
      if (response.data.status === 'success') {
        setSaldoSaatIni(response.data.data.saldo_saat_ini);
        setTotalKasKeluar(response.data.data.total_kas_keluar); // <-- Menangkap data kas keluar
        setRiwayatTransaksi(response.data.data.riwayat_transaksi);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      alert(error.response?.data?.message || 'Gagal mengambil data dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManajemenKas();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Fungsi Simpan & Update ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`/admin/kas/${editId}`, formData);
        alert('Transaksi berhasil diperbarui!');
      } else {
        await axiosInstance.post('/admin/kas', formData);
        alert('Transaksi berhasil disimpan!');
      }
      cancelEdit();
      fetchManajemenKas();
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
    }
  };

  const handleEdit = (trx) => {
    setEditId(trx.id);
    setFormData({
      jenis: trx.jenis,
      tanggal_transaksi: trx.tanggal_transaksi,
      keterangan: trx.keterangan || (trx.kategori ? trx.kategori.nama_kategori : ''),
      nominal: trx.nominal
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({
      jenis: 'pemasukan',
      tanggal_transaksi: new Date().toISOString().split('T')[0],
      keterangan: '',
      nominal: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan disesuaikan otomatis.')) {
      try {
        await axiosInstance.delete(`/admin/kas/${id}`);
        fetchManajemenKas(); 
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal menghapus data.');
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="mt-2 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Kas</h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
          
          {/* ========================================= */}
          {/* KOLOM KIRI: INFO KEUANGAN & FORM          */}
          {/* ========================================= */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* GRID DUA KARTU (SALDO & KELUAR) */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* KARTU SALDO SAAT INI */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden flex flex-col justify-between h-36">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Saldo Kas Saat Ini</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 truncate">{formatRupiah(saldoSaatIni)}</h2>
                </div>
                <p className="text-[10px] text-gray-400 relative z-10">{formatTanggal(new Date())}</p>
                <div className="absolute -right-3 -bottom-3 bg-gray-50 p-4 rounded-3xl">
                   <Wallet className="w-12 h-12 text-gray-100" />
                </div>
              </div>

              {/* KARTU KAS KELUAR BARU */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden flex flex-col justify-between h-36">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Total Kas Keluar</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 truncate">{formatRupiah(totalKasKeluar)}</h2>
                </div>
                <p className="text-[10px] text-gray-400 relative z-10">Akumulasi pengeluaran</p>
                <div className="absolute -right-3 -bottom-3 bg-gray-50 p-4 rounded-3xl">
                   <TrendingDown className="w-12 h-12 text-gray-100" />
                </div>
              </div>

            </div>

            {/* FORM INPUT TRANSAKSI */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
              {editId && (
                <button type="button" onClick={cancelEdit} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <X size={20} />
                </button>
              )}

              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <ArrowRightLeft size={20} />
                <h3 className="text-base font-bold">
                  {editId ? 'Edit Transaksi' : 'Input Transaksi Kas'}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-3">Jenis Transaksi</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jenis" value="pemasukan" checked={formData.jenis === 'pemasukan'} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-blue-600">Kas Masuk</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jenis" value="pengeluaran" checked={formData.jenis === 'pengeluaran'} onChange={handleInputChange} className="w-4 h-4 text-red-500 focus:ring-red-500" />
                    <span className="text-sm font-medium text-red-500">Kas Keluar</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Tanggal Transaksi</label>
                <input type="date" name="tanggal_transaksi" value={formData.tanggal_transaksi} onChange={handleInputChange} required className="w-full pb-2 border-0 border-b border-gray-200 bg-transparent text-sm focus:ring-0 focus:border-blue-600 transition-colors px-0" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Kategori / Keterangan</label>
                <input type="text" name="keterangan" value={formData.keterangan} onChange={handleInputChange} required placeholder="Contoh: Iuran Bulanan / Beli Sapu" className="w-full pb-2 border-0 border-b border-gray-200 bg-transparent text-sm focus:ring-0 focus:border-blue-600 transition-colors px-0 placeholder-gray-400" />
              </div>

              <div className="mt-2">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Nominal (Rp)</label>
                <div className="flex items-center border-b border-gray-200 focus-within:border-blue-600 transition-colors pb-2">
                  <span className="text-sm font-bold text-gray-900 mr-2">Rp</span>
                  <input type="number" name="nominal" value={formData.nominal} onChange={handleInputChange} required min="1" placeholder="0" className="w-full border-0 bg-transparent text-sm font-bold text-gray-900 focus:ring-0 px-0" />
                </div>
              </div>

              <button type="submit" className={`w-full font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 mt-4 shadow-md text-white ${editId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
                <Download size={18} />
                {editId ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>

          {/* ========================================= */}
          {/* KOLOM KANAN: RIWAYAT TRANSAKSI            */}
          {/* ========================================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-base font-bold text-gray-500">Riwayat Transaksi</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-[400px]">
              <div className="grid grid-cols-12 bg-gray-50/50 border-b border-gray-200 px-6 py-4">
                <p className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">TGL</p>
                <p className="col-span-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">KETERANGAN</p>
                <p className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">NOMINAL</p>
                <p className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">AKSI</p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {/* KODE YANG DIPERBAIKI: Menambahkan .filter(trx => trx.status !== 'pending') */}
                {riwayatTransaksi.filter(trx => trx.status !== 'pending').length > 0 ? (
                  riwayatTransaksi.filter(trx => trx.status !== 'pending').map((trx) => (
                    <div key={trx.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center">
                      <div className="col-span-2 text-xs text-gray-500">{formatTanggal(trx.tanggal_transaksi)}</div>
                      
                      <div className="col-span-4 text-sm font-medium text-gray-900 truncate pr-2">
                        {trx.tagihan ? trx.tagihan.nama_tagihan : (trx.keterangan || (trx.kategori ? trx.kategori.nama_kategori : '-'))}
                      </div>
                      
                      <div className={`col-span-3 text-sm font-bold text-right ${trx.jenis === 'pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                        {trx.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.nominal)}
                      </div>

                      <div className="col-span-3 flex justify-center gap-2">
                        <button onClick={() => handleEdit(trx)} className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(trx.id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center pt-20">
                    <p className="text-sm text-gray-400">Belum ada riwayat transaksi.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ManajemenKas;