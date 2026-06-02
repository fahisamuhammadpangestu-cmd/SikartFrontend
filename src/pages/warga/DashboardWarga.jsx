import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const DashboardWarga = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // State awal disiapkan agar tidak error sebelum data datang
  const [data, setData] = useState({
    profil_warga: { nama: 'Memuat...', blok: '...' },
    ringkasan: { lunas: 0, ditolak: 0, menunggu: 0 },
    riwayat_terkini: []
  });

  // 1. FUNGSI MENGAMBIL DATA DARI BACKEND
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/warga/dashboard');
        if (response.data.status === 'success') {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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

  const getBulanSingkat = (tanggalString) => {
    if (!tanggalString) return '-';
    const date = new Date(tanggalString);
    return date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
  };

  // Fungsi pembantu untuk menentukan warna badge berdasarkan status dari database
  const getStyleByStatus = (status) => {
    switch (status) {
      case 'pending':
        return {
          iconBg: 'bg-yellow-100', iconText: 'text-yellow-600',
          badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-700', label: 'Menunggu Verifikasi'
        };
      case 'sukses':
        return {
          iconBg: 'bg-green-100', iconText: 'text-green-500',
          badgeBg: 'bg-green-200', badgeText: 'text-green-700', label: 'Berhasil'
        };
      case 'gagal':
        return {
          iconBg: 'bg-red-100', iconText: 'text-red-500',
          badgeBg: 'bg-red-100', badgeText: 'text-red-700', label: 'Ditolak'
        };
      default:
        return {
          iconBg: 'bg-gray-100', iconText: 'text-gray-800',
          badgeBg: 'bg-gray-100', badgeText: 'text-gray-500', label: 'Tidak Diketahui'
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* JUDUL HALAMAN (Breadcrumb di bawahnya sudah dihapus) */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* BANNER SELAMAT DATANG */}
      <div className="bg-[#254EDb] rounded-xl p-8 text-white shadow-sm mt-2">
        <p className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-2">
          Selamat Datang Kembali
        </p>
        <h2 className="text-4xl font-bold mb-2">{data.profil_warga.nama}</h2>
        <p className="text-xs text-blue-200">{data.profil_warga.blok} - Kas RT 03/RW 13</p>
      </div>

      {/* 3 KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kartu Lunas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center h-28">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Iuran Lunas</p>
          <h3 className="text-3xl font-bold text-[#10B981]">{data.ringkasan.lunas}</h3>
        </div>

        {/* Kartu Ditolak (Sebelumnya Tunggakan) */}
        <div className="bg-[#FFE4E6] rounded-xl shadow-sm p-6 flex flex-col justify-center h-28">
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Ditolak</p>
          <h3 className="text-3xl font-bold text-[#E11D48]">{data.ringkasan.ditolak}</h3>
        </div>

        {/* Kartu Menunggu */}
        <div className="bg-[#FEF9C3] rounded-xl shadow-sm p-6 flex flex-col justify-center h-28">
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Menunggu</p>
          <h3 className="text-3xl font-bold text-[#EAB308]">{data.ringkasan.menunggu}</h3>
        </div>
      </div>

      {/* DAFTAR STATUS IURAN TERKINI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-2 mb-10">
        
        {/* Header Daftar */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Status Iuran Terkini</h3>
          <button 
            onClick={() => navigate('/warga/pembayaran')}
            className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            Bayar iuran <ArrowRight size={14} />
          </button>
        </div>

        {/* List Item Transaksi */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400">Memuat riwayat terkini...</div>
          ) : data.riwayat_terkini.length > 0 ? (
            data.riwayat_terkini.map((item, index) => {
              const styles = getStyleByStatus(item.status);
              
              return (
                <div 
                  key={item.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 ${index !== data.riwayat_terkini.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Kiri: Ikon Bulan & Detail Teks */}
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex justify-center items-center font-bold text-sm ${styles.iconBg} ${styles.iconText}`}>
                      {getBulanSingkat(item.tanggal_transaksi)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        {item.tagihan ? item.tagihan.nama_tagihan : (item.keterangan || 'Iuran Lainnya')}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">
                        Tanggal: {formatTanggal(item.tanggal_transaksi)} - {formatRupiah(item.nominal)}
                      </p>
                    </div>
                  </div>

                  {/* Kanan: Badge Status */}
                  <div className="mt-4 sm:mt-0">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${styles.badgeBg} ${styles.badgeText}`}>
                      {styles.label}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-gray-400">Belum ada transaksi yang dilakukan.</div>
          )}
        </div>

      </div>

    </div>
  );
};

export default DashboardWarga;