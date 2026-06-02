import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { CheckCircle2, XCircle, Clock, Filter, Trash2 } from 'lucide-react';

const VerifikasiPembayaran = () => {
  const [data, setData] = useState({
    jumlah_menunggu: 0,
    total_nominal_masuk: 0,
    tagihan_list: [],
    transaksi_pending: [],
    transaksi_riwayat: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTagihan, setSelectedTagihan] = useState('all');

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  // --- 1. MENGAMBIL DATA DARI BACKEND ---
  const fetchVerifikasi = async (tagihanId = 'all') => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/verifikasi?tagihan_id=${tagihanId}`);
      if (response.data.status === 'success') {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      alert('Terjadi kesalahan saat memuat data verifikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifikasi(selectedTagihan);
  }, [selectedTagihan]);

  // --- 2. AKSI TERIMA ATAU TOLAK ---
  const handleVerify = async (id, statusAksi) => {
    const konfirmasi = window.confirm(
      `Apakah Anda yakin ingin ${statusAksi === 'sukses' ? 'MENERIMA' : 'MENOLAK'} pembayaran ini?`
    );

    if (konfirmasi) {
      try {
        await axiosInstance.put(`/admin/verifikasi/${id}`, { status: statusAksi });
        fetchVerifikasi(selectedTagihan);
      } catch (error) {
        console.error('Gagal memproses verifikasi:', error);
        alert(error.response?.data?.message || 'Gagal memproses verifikasi.');
      }
    }
  };

  // --- 3. AKSI HAPUS RIWAYAT ---
  const handleDeleteRiwayat = async (id) => {
    const konfirmasi = window.confirm('Apakah Anda yakin ingin menghapus riwayat transaksi ini secara permanen? Total dana masuk akan disesuaikan otomatis.');
    
    if (konfirmasi) {
      try {
        await axiosInstance.delete(`/admin/kas/${id}`);
        fetchVerifikasi(selectedTagihan);
      } catch (error) {
        console.error('Gagal menghapus riwayat:', error);
        alert(error.response?.data?.message || 'Gagal menghapus riwayat transaksi.');
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="mt-2 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
        <p className="text-sm text-gray-500 mt-1">Periksa bukti transfer dan konfirmasi iuran warga RT 03.</p>
      </div>

      {/* TOP CARDS & FILTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* KARTU 1: Menunggu Transaksi */}
        <div className="bg-white border-l-4 border-l-orange-500 rounded-xl shadow-sm p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Menunggu</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">{data.jumlah_menunggu}</span>
            <span className="text-sm font-semibold text-gray-600">Transaksi</span>
          </div>
        </div>

        {/* KARTU 2: Total Transaksi Masuk */}
        <div className="bg-white border-l-4 border-l-green-500 rounded-xl shadow-sm p-6 relative">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Dana Masuk</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-green-600">{formatRupiah(data.total_nominal_masuk)}</span>
          </div>
          
          {/* DROPDOWN FILTER */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select 
              value={selectedTagihan}
              onChange={(e) => setSelectedTagihan(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:border-blue-500 bg-gray-50 text-gray-600"
            >
              <option value="all">Tagihan Lainnya</option>
              <option value="lainnya">Tagihan Lainnya</option>
              {data.tagihan_list.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.nama_tagihan}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* ========================================= */}
          {/* TABEL 1: DAFTAR PENDING                     */}
          {/* ========================================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-orange-50/30">
              <Clock size={18} className="text-orange-500" />
              <h2 className="text-sm font-bold text-gray-800">Antrean Verifikasi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4">WARGA / BLOK</th>
                    <th className="px-6 py-4">BULAN (TAGIHAN)</th>
                    <th className="px-6 py-4">KETERANGAN</th>
                    <th className="px-6 py-4">NOMINAL</th>
                    <th className="px-6 py-4 text-center">STATUS</th>
                    <th className="px-6 py-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.transaksi_pending.length > 0 ? (
                    data.transaksi_pending.map((trx) => (
                      <tr key={trx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{trx.warga?.nama_lengkap}</p>
                          <p className="text-xs text-gray-500">{trx.warga?.blok || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{trx.tagihan?.nama_tagihan || trx.keterangan}</p>
                          <p className="text-xs text-gray-400">{formatTanggal(trx.tanggal_transaksi)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 truncate max-w-[150px]" title={trx.keterangan}>
                            {trx.keterangan || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatRupiah(trx.nominal)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600">
                            PENDING
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => handleVerify(trx.id, 'sukses')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                              <CheckCircle2 size={14} /> Terima
                            </button>
                            <button onClick={() => handleVerify(trx.id, 'gagal')} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors border border-red-100">
                              <XCircle size={14} /> Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">
                        Hore! Tidak ada antrean verifikasi saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================= */}
          {/* TABEL 2: RIWAYAT VERIFIKASI               */}
          {/* ========================================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <CheckCircle2 size={18} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-800">Riwayat Pembayaran Iuran</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4">WARGA / BLOK</th>
                    <th className="px-6 py-4">BULAN (TAGIHAN)</th>
                    <th className="px-6 py-4">KETERANGAN</th>
                    <th className="px-6 py-4">NOMINAL</th>
                    <th className="px-6 py-4 text-center">STATUS</th>
                    <th className="px-6 py-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.transaksi_riwayat.length > 0 ? (
                    data.transaksi_riwayat.map((trx) => (
                      <tr key={trx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{trx.warga?.nama_lengkap}</p>
                          <p className="text-xs text-gray-500">{trx.warga?.blok || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{trx.tagihan?.nama_tagihan || trx.keterangan}</p>
                          <p className="text-xs text-gray-400">{formatTanggal(trx.tanggal_transaksi)}</p>
                        </td>
                        
                        {/* Sel Keterangan Baru */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 truncate max-w-[150px]" title={trx.keterangan}>
                            {trx.keterangan || '-'}
                          </p>
                        </td>
                        
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatRupiah(trx.nominal)}</td>
                        
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            trx.status === 'sukses' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {trx.status === 'sukses' ? 'DITERIMA' : 'DITOLAK'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDeleteRiwayat(trx.id)} 
                            className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" 
                            title="Hapus Riwayat Permanen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">
                        Belum ada riwayat verifikasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default VerifikasiPembayaran;