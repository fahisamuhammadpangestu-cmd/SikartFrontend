import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { 
  Bell, User, TrendingUp, TrendingDown, ChevronLeft, ChevronRight 
} from 'lucide-react';

const LaporanWarga = () => {
  // 1. STATE UNTUK FILTER (Default: Semua transaksi)
  const [filters, setFilters] = useState({
    bulan: '', 
    tahun: '',    
    jenis: ''                                      
  });

  // 2. STATE UNTUK DATA API (Pastikan ada saldoAkhir dan totalMasukPeriode)
  const [laporan, setLaporan] = useState({
    saldoAkhir: 0,
    totalMasukPeriode: 0,
    totalKeluar: 0,
    transaksi: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // 3. FUNGSI FORMATTING
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka || 0);
  };

  const formatTanggal = (tanggalString) => {
    if (!tanggalString) return '-';
    const date = new Date(tanggalString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // 4. MENGAMBIL DATA DARI BACKEND
  const fetchLaporan = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/warga/laporan', { params: filters });
      
      if (response.data.status === 'success') {
        const apiData = response.data.data;
        
        // PENGHUBUNG DATA (Pastikan nama ini cocok dengan API Laravel-mu)
        setLaporan({
          saldoAkhir: apiData.ringkasan.saldo_akhir_keseluruhan, 
          totalMasukPeriode: apiData.ringkasan.total_masuk_periode,
          totalKeluar: apiData.ringkasan.total_keluar_periode,
          transaksi: apiData.detail_transaksi
        });
      }
    } catch (error) {
      console.error('Gagal mengambil data laporan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleFilterSubmit = () => {
    fetchLaporan();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Daftar Bulan untuk Dropdown
  const namaBulan = [
    { id: '', nama: 'Semua Bulan' },
    { id: '1', nama: 'Januari' }, { id: '2', nama: 'Februari' },
    { id: '3', nama: 'Maret' }, { id: '4', nama: 'April' },
    { id: '5', nama: 'Mei' }, { id: '6', nama: 'Juni' },
    { id: '7', nama: 'Juli' }, { id: '8', nama: 'Agustus' },
    { id: '9', nama: 'September' }, { id: '10', nama: 'Oktober' },
    { id: '11', nama: 'November' }, { id: '12', nama: 'Desember' }
  ];

  const tahunSekarang = new Date().getFullYear();
  const daftarTahun = ['']; 
  for (let i = 2024; i <= tahunSekarang + 1; i++) {
    daftarTahun.push(i.toString());
  }

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-10">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-center mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Kas RT</h1>
          <p className="text-sm text-gray-500 mt-1">Monitoring transparansi kas warga</p>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-gray-800 transition-colors"><Bell size={20} /></button>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex justify-center items-center">
            <User size={16} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* 2. AREA FILTER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-end gap-4">
        
        <div className="w-full md:w-1/4">
          <label className="block text-xs font-bold text-gray-500 mb-2">Bulan</label>
          <select 
            name="bulan" 
            value={filters.bulan} 
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
          >
            {namaBulan.map(b => (
              <option key={b.id} value={b.id}>{b.nama}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-xs font-bold text-gray-500 mb-2">Tahun</label>
          <select 
            name="tahun" 
            value={filters.tahun} 
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">Semua Tahun</option>
            {daftarTahun.filter(t => t !== '').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-xs font-bold text-gray-500 mb-2">Jenis Transaksi</label>
          <select 
            name="jenis" 
            value={filters.jenis} 
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">Semua transaksi</option>
            <option value="pemasukan">Pemasukan saja</option>
            <option value="pengeluaran">Pengeluaran saja</option>
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <button 
            onClick={handleFilterSubmit}
            className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Tampilkan Laporan
          </button>
        </div>
      </div>

      {/* 3. KARTU RINGKASAN STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Saldo Kas Saat Ini */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-[#10B981] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Kas Saat Ini</p>
            <div className="p-1.5 bg-green-50 text-green-500 rounded-md">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#10B981] mb-1">{formatRupiah(laporan.saldoAkhir)}</h3>
          </div>
        </div>

        {/* Total Keluar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-[#EF4444] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Keluar (Filter)</p>
            <div className="p-1.5 bg-red-50 text-red-500 rounded-md">
              <TrendingDown size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#EF4444] mb-1">{formatRupiah(laporan.totalKeluar)}</h3>
          </div>
        </div>

      </div>

      {/* 4. TABEL DETAIL TRANSAKSI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900">Detail Transaksi Laporan</h2>
        </div>

        {/* Area Tabel */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-white">
                <th className="px-6 py-4 text-center w-16">NO</th>
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4">JENIS</th>
                <th className="px-6 py-4 w-1/3">KETERANGAN</th>
                <th className="px-6 py-4 text-right">MASUK</th>
                <th className="px-6 py-4 text-right">KELUAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-400">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : laporan.transaksi?.length > 0 ? (
                laporan.transaksi.map((trx, index) => (
                  <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 text-center font-medium">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatTanggal(trx.tanggal_transaksi)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${
                        trx.jenis === 'pemasukan' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {trx.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal min-w-[200px] font-medium">
                      {trx.tagihan ? trx.tagihan.nama_tagihan : (trx.keterangan || (trx.kategori ? trx.kategori.nama_kategori : '-'))}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-500 text-right">
                      {trx.jenis === 'pemasukan' ? formatRupiah(trx.nominal) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500 text-right">
                      {trx.jenis === 'pengeluaran' ? formatRupiah(trx.nominal) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">
                    Tidak ada data transaksi pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel (Ringkasan Bawah) */}
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="text-xs text-gray-500">
            <p className="mb-1">Menampilkan <b>{laporan.transaksi?.length || 0}</b> transaksi</p>
            <p className="font-bold text-sm mt-2">
              <span className="text-green-600">Masuk (Periode): {formatRupiah(laporan.totalMasukPeriode)}</span> 
              <span className="mx-2 text-gray-300">|</span> 
              <span className="text-red-500">Keluar (Periode): {formatRupiah(laporan.totalKeluar)}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex justify-center items-center border border-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex justify-center items-center bg-[#1D4ED8] rounded text-white font-bold text-xs shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex justify-center items-center border border-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LaporanWarga;