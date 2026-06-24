import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { 
  Bell, HelpCircle, Wallet, History, Search, Filter, 
  Calendar, ChevronLeft, ChevronRight, Circle, CheckCircle2, XCircle 
} from 'lucide-react';

const RiwayatWarga = () => {
  // 1. STATE UNTUK DATA API & PENCARIAN
  const [data, setData] = useState({
    total_terbayar: 0,
    tanggal_terakhir: null,
    riwayat: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // State baru untuk menyimpan teks pencarian dari kotak input
  const [searchTerm, setSearchTerm] = useState('');

  // 2. FUNGSI FORMATTING
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka || 0);
  };

  const formatTanggal = (tanggalString) => {
    if (!tanggalString) return '-';
    const date = new Date(tanggalString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatWaktu = (tanggalString) => {
    if (!tanggalString) return '';
    const date = new Date(tanggalString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const getStatusStyle = (statusDB) => {
    switch (statusDB) {
      case 'pending': return 'bg-slate-100 text-slate-600';
      case 'sukses': return 'bg-green-50 text-green-600';
      case 'gagal': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (statusDB) => {
    switch (statusDB) {
      case 'pending': return <Circle size={12} className="fill-slate-400 text-slate-400" />;
      case 'sukses': return <CheckCircle2 size={14} />;
      case 'gagal': return <XCircle size={14} />;
      default: return null;
    }
  };

  const getStatusLabel = (statusDB) => {
    switch (statusDB) {
      case 'pending': return 'Menunggu Verifikasi';
      case 'sukses': return 'Berhasil';
      case 'gagal': return 'Ditolak';
      default: return 'Tidak Diketahui';
    }
  };

  // 3. MENGAMBIL DATA DARI BACKEND
  const fetchRiwayat = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/warga/riwayat');
      if (response.data.status === 'success') {
        const apiData = response.data.data;
        setData({
          total_terbayar: apiData.ringkasan.total_terbayar,
          tanggal_terakhir: apiData.ringkasan.transaksi_terakhir, 
          riwayat: apiData.detail_riwayat
        });
      }
    } catch (error) {
      console.error('Gagal mengambil riwayat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // 4. LOGIKA FILTER PENCARIAN
  // Menyaring data riwayat berdasarkan kata kunci yang diketik user
  const filteredRiwayat = data.riwayat?.filter((trx) => {
    const jenisIuran = trx.tagihan ? trx.tagihan.nama_tagihan : (trx.keterangan || 'Iuran Lainnya');
    return jenisIuran.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-10">
      
      {/* HEADER TAMPILAN */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pembayaran</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-gray-800 transition-colors"><Bell size={20} /></button>
          <button className="hover:text-gray-800 transition-colors"><HelpCircle size={20} /></button>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 -mt-2 mb-2">Daftar riwayat iuran kas yang telah Anda kirimkan.</p>

      {/* KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kartu 1: Total Iuran Terbayar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Total Keseluruhan</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">Total Iuran Terbayar</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatRupiah(data.total_terbayar)}</h3>
          </div>
        </div>

        {/* Kartu 2: Transaksi Terakhir */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gray-100 p-2.5 rounded-lg text-gray-500">
              <History size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">Transaksi Terakhir</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {data.tanggal_terakhir ? formatTanggal(data.tanggal_terakhir) : 'Belum ada transaksi'}
            </h3>
          </div>
        </div>

      </div>

      {/* AREA TABEL DETAIL RIWAYAT */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden mt-2">
        
        {/* Header Tabel & Filter */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900">Detail Riwayat</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Input Cari yang sudah disambungkan dengan state */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Cari jenis iuran..." 
                className="w-full pl-8 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Tombol Filter */}
            <button className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white">
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">TANGGAL UPLOAD</th>
                <th className="px-6 py-4">BULAN IURAN</th>
                <th className="px-6 py-4">JENIS IURAN</th>
                <th className="px-6 py-4">NOMINAL</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-400">Memuat data...</td>
                </tr>
              ) : filteredRiwayat.length > 0 ? (
                filteredRiwayat.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* TANGGAL UPLOAD */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{formatTanggal(trx.created_at)}</p>
                      <p className="text-xs text-gray-500">{formatWaktu(trx.created_at)}</p>
                    </td>
                    
                    {/* BULAN IURAN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">{formatTanggal(trx.tanggal_transaksi)}</span>
                      </div>
                    </td>

                    {/* JENIS IURAN */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-800 font-medium">
                        {trx.tagihan ? trx.tagihan.nama_tagihan : (trx.keterangan || 'Iuran Lainnya')}
                      </span>
                    </td>
                    
                    {/* NOMINAL */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{formatRupiah(trx.nominal)}</span>
                    </td>
                    
                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${getStatusStyle(trx.status)}`}>
                        {getStatusIcon(trx.status)} {getStatusLabel(trx.status)}
                      </span>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-400">
                    {searchTerm ? 'Pencarian tidak ditemukan.' : 'Belum ada riwayat transaksi.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel (Pagination) */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
          <p className="text-xs text-gray-500 font-medium">
            Menampilkan {filteredRiwayat.length} riwayat iuran
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default RiwayatWarga;