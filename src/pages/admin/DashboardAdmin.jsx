import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Calendar, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Menyiapkan kerangka data awal 
  const [data, setData] = useState({
    ringkasan: {
      total_pengeluaran: 0,
      saldo_akhir: 0,
      butuh_verifikasi: 0
    },
    transaksi_terakhir: [],
    grafik: [
      { name: 'Minggu 1', value: 0 },
      { name: 'Minggu 2', value: 0 },
      { name: 'Minggu 3', value: 0 },
      { name: 'Minggu 4', value: 0 }
    ]
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  // Mendapatkan Bulan & Tahun saat ini (Contoh: Mei 2026)
  const currentMonthYear = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/admin/dashboard');
        if (response.data.status === 'success') {
          const result = response.data.data;
          setData({
            ringkasan: result.ringkasan,
            transaksi_terakhir: result.transaksi_terakhir,
            // Fallback jika backend tidak mengirim grafik
            grafik: result.grafik || data.grafik 
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER: Judul & Tanggal */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-4 mt-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ringkasan Statistik</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau kondisi keuangan RT 03 secara real-time.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
          <Calendar size={16} />
          {currentMonthYear}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        /* MAIN GRID LAYOUT (Kiri: 8 Kolom, Kanan: 4 Kolom) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ===================================== */}
          {/* BAGIAN KIRI (Stats & Chart)           */}
          {/* ===================================== */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* KARTU STATISTIK (Sesuai Permintaan: Hanya 2 Kartu) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Saldo Kas RT */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-green-500">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Saldo Kas RT</p>
                <h2 className="text-3xl font-bold text-green-600 mb-2 truncate">
                  {formatRupiah(data.ringkasan.saldo_akhir)}
                </h2>
                <p className="text-xs text-gray-400">Saldo Aktif</p>
              </div>

              {/* Total Kas Keluar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-red-500">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Kas Keluar</p>
                <h2 className="text-3xl font-bold text-red-600 mb-2 truncate">
                  {formatRupiah(data.ringkasan.total_pengeluaran)}
                </h2>
                <p className="text-xs text-gray-400">Update: Hari ini</p>
              </div>

            </div>

            {/* CHART: Tren Keuangan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">Tren Keuangan</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.grafik} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatRupiah(value), 'Nominal']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotoneX" 
                      dataKey="value" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ===================================== */}
          {/* BAGIAN KANAN (Verifikasi & Riwayat)   */}
          {/* ===================================== */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* CARD: Butuh Verifikasi */}
            <div className="bg-[#2563eb] rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4 text-blue-100">Butuh Verifikasi</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-7xl font-bold leading-none">{data.ringkasan.butuh_verifikasi}</span>
                  <span className="text-sm text-blue-100 leading-tight">iuran menunggu<br />validasi</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/verifikasi')}
                className="w-full bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Buka Verifikasi
              </button>
            </div>

            {/* CARD: Transaksi Terakhir */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
              <h3 className="text-base font-bold text-gray-900 mb-6">Transaksi Terakhir</h3>
              
              {data.transaksi_terakhir.filter(trx => trx.status !== 'pending').length > 0 ? (
                <div className="flex flex-col gap-4">
                  {data.transaksi_terakhir.filter(trx => trx.status !== 'pending').map((trx) => (
                    <div key={trx.id} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                      <div className="overflow-hidden pr-2">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {trx.tagihan ? trx.tagihan.nama_tagihan : (trx.keterangan || (trx.kategori ? trx.kategori.nama_kategori : 'Iuran Kas'))}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{trx.jenis}</p>
                      </div>
                      <span className={`text-sm font-bold whitespace-nowrap ${trx.jenis === 'pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                        {trx.jenis === 'pemasukan' ? '+' : '-'}{formatRupiah(trx.nominal)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <ClipboardList className="text-gray-300 w-10 h-10" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">Belum ada transaksi</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;