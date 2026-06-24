import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Calendar, FileText } from 'lucide-react';
// 1. Impor library pembuat PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RekapBulanan = () => {
  const [dataLaporan, setDataLaporan] = useState({
    ringkasan: {
      saldo_saat_ini: 0,
      total_pengeluaran: 0
    },
    riwayat_transaksi: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    tanggal: '',
    bulan: '',
    tahun: ''
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

  // --- MENGAMBIL DATA API ---
  const fetchLaporan = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.tanggal) params.append('tanggal', filters.tanggal);
      if (filters.bulan) params.append('bulan', filters.bulan);
      if (filters.tahun) params.append('tahun', filters.tahun);

      const response = await axiosInstance.get(`/admin/laporan?${params.toString()}`);
      if (response.data.status === 'success') {
        setDataLaporan(response.data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil laporan:', error);
      alert('Terjadi kesalahan saat mengambil data laporan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilter = () => {
    fetchLaporan();
  };

  // --- LOGIKA BARU: CETAK DOKUMEN PDF ---
  const handlePrintPDF = () => {
    // Membuat dokumen kanvas baru berukuran A4
    const doc = new jsPDF();

    // 1. Menulis Judul
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Keuangan RT", 14, 20);

    // 2. Menulis Narasi
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const narasi = "Dokumen ini merupakan rekapitulasi resmi laporan keuangan lingkungan yang mencakup total saldo kas terkini, total akumulasi pengeluaran, serta rincian histori transaksi secara transparan.";
    // Memecah teks agar tidak melebihi lebar kertas (180mm)
    const splitNarasi = doc.splitTextToSize(narasi, 180); 
    doc.text(splitNarasi, 14, 30);

    // 3. Menulis Total Keuangan
    doc.setFont("helvetica", "bold");
    doc.text(`Total Keuangan Saat Ini   : ${formatRupiah(dataLaporan.ringkasan.saldo_saat_ini)}`, 14, 45);
    doc.text(`Total Pengeluaran Saat Ini: ${formatRupiah(dataLaporan.ringkasan.total_pengeluaran)}`, 14, 52);

    // 4. Judul Rincian
    doc.text("Rincian Pengeluaran dan Pemasukan:", 14, 65);

    // 5. Menyusun Rincian ke dalam Tabel (agar halamannya bisa bertambah otomatis jika datanya banyak)
    const tableData = dataLaporan.riwayat_transaksi.map((trx) => [
      formatTanggal(trx.tanggal_transaksi),
      trx.keterangan || (trx.kategori ? trx.kategori.nama_kategori : '-'),
      trx.jenis === 'pemasukan' ? 'Masuk' : 'Keluar',
      `${trx.jenis === 'pemasukan' ? '+' : '-'} ${formatRupiah(trx.nominal)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Tanggal', 'Keterangan', 'Jenis', 'Nominal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });

    // 6. Menyimpan dan Mengunduh File PDF
    const namaFile = `Laporan_Keuangan_${new Date().getTime()}.pdf`;
    doc.save(namaFile);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="mt-2 border-b border-gray-100 pb-4 flex justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-sm text-gray-500 mt-1">Rekapitulasi seluruh kas masuk dan keluar</p>
        </div>
        <button 
          onClick={handlePrintPDF}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <FileText size={18} />
          Cetak PDF/Laporan
        </button>
      </div>

      {/* DUA KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-blue-200 rounded-2xl shadow-sm p-8 text-center flex flex-col justify-center items-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Saldo Kas Saat Ini</p>
          <h2 className="text-4xl font-bold text-green-500">{formatRupiah(dataLaporan.ringkasan.saldo_saat_ini)}</h2>
        </div>

        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 text-center flex flex-col justify-center items-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Total Pengeluaran</p>
          <h2 className="text-4xl font-bold text-red-500">{formatRupiah(dataLaporan.ringkasan.total_pengeluaran)}</h2>
        </div>
      </div>

      {/* AREA FILTER & TABEL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-600" />
            <h2 className="text-sm font-bold text-gray-900">Riwayat Transaksi Lengkap</h2>
          </div>
          
          {/* Form Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input type="number" name="tanggal" value={filters.tanggal} onChange={handleFilterChange} placeholder="DD" className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500" min="1" max="31" />
            <input type="number" name="bulan" value={filters.bulan} onChange={handleFilterChange} placeholder="MM" className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500" min="1" max="12" />
            <input type="number" name="tahun" value={filters.tahun} onChange={handleFilterChange} placeholder="YYYY" className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500" />
            <button onClick={applyFilter} className="px-4 py-2 border border-blue-500 text-blue-500 font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors">
              Filter
            </button>
          </div>
        </div>

        {/* Tabel Data (Tampilan Layar) */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4">TANGGAL</th>
                  <th className="px-6 py-4">KETERANGAN</th>
                  <th className="px-6 py-4 text-center">JENIS</th>
                  <th className="px-6 py-4 text-right">JUMLAH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataLaporan.riwayat_transaksi.length > 0 ? (
                  dataLaporan.riwayat_transaksi.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatTanggal(trx.tanggal_transaksi)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {trx.keterangan || (trx.kategori ? trx.kategori.nama_kategori : '-')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          trx.jenis === 'pemasukan' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {trx.jenis}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${
                        trx.jenis === 'pemasukan' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {trx.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.nominal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-sm text-gray-400">
                      Belum ada data transaksi untuk periode ini.
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

export default RekapBulanan;