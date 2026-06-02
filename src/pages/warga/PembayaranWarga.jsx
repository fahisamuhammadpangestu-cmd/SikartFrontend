import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const PembayaranWarga = () => {
  const navigate = useNavigate();
  const [listTagihan, setListTagihan] = useState([]);
  
  const [formData, setFormData] = useState({
    tagihan_id: 'lainnya',
    tanggal_transaksi: '',
    nominal: '',
    keterangan: ''
  });

  // 1. MENGAMBIL DATA TAGIHAN DARI BACKEND
  useEffect(() => {
    const fetchTagihan = async () => {
      try {
        // Ganti URL ini dengan endpoint API aslimu yang menampilkan daftar tagihan
        const response = await axiosInstance.get('/admin/tagihan'); 
        
        // Sesuaikan dengan struktur response dari Laravel-mu
        if (response.data.status === 'success') {
          setListTagihan(response.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil tagihan', error);
      }
    };
    fetchTagihan();
  }, []);

  // 2. LOGIKA DROPDOWN & NOMINAL
  const handleDropdownChange = (e) => {
    const selectedId = e.target.value;
    
    if (selectedId === 'lainnya') {
      // Jika "Lainnya", nominal dikosongkan agar warga bisa ketik manual
      setFormData({ ...formData, tagihan_id: 'lainnya', nominal: '' });
    } else {
      // Jika pilih tagihan spesifik, cari nominalnya dan kunci nilainya
      const tagihanTerpilih = listTagihan.find(t => t.id === parseInt(selectedId));
      setFormData({ 
        ...formData, 
        tagihan_id: selectedId, 
        nominal: tagihanTerpilih ? tagihanTerpilih.nominal : '' 
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. LOGIKA SUBMIT & MEMUNCULKAN MIDTRANS
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Mengirim data ke Laravel untuk mendapatkan Token Midtrans
      const response = await axiosInstance.post('/warga/pembayaran', formData);
      
      if (response.data.status === 'success') {
        const snapToken = response.data.snap_token;
        
        // Memanggil Pop-up Midtrans menggunakan token dari Laravel
        window.snap.pay(snapToken, {
          onSuccess: function(result) {
            alert('Pembayaran berhasil! Menunggu verifikasi admin.');
            navigate('/warga/riwayat');
          },
          onPending: function(result) {
            alert('Menunggu pembayaran Anda...');
            navigate('/warga/riwayat');
          },
          onError: function(result) {
            alert('Pembayaran gagal!');
          },
          onClose: function() {
            alert('Anda menutup popup tanpa menyelesaikan pembayaran');
          }
        });
      }
    } catch (error) {
      console.error('Gagal membuat transaksi:', error);
      alert('Terjadi kesalahan saat memproses pembayaran.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans pb-10 mt-2">
      
      {/* AREA HEADER (Tanpa QR Code Besar) */}
      <div className="bg-[#3B82F6] rounded-2xl p-8 flex flex-col justify-center shadow-sm">
        <h2 className="text-3xl font-bold text-white mb-2">Pembayaran Kas RT</h2>
        <p className="text-sm text-blue-100">
          Isi formulir di bawah ini. Anda akan diarahkan ke sistem pembayaran aman (Midtrans) untuk mendapatkan kode QRIS atau metode pembayaran lainnya.
        </p>
      </div>

      {/* AREA FORMULIR KONFIRMASI */}
      <div className="w-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Formulir Pembayaran</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Tagihan (Dropdown) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Pilih Tagihan</label>
            <select 
              name="tagihan_id"
              value={formData.tagihan_id}
              onChange={handleDropdownChange}
              className="w-full bg-gray-200/70 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none transition-all"
            >
              <option value="lainnya">Lainnya (Bebas / Kas Sukarela)</option>
              {listTagihan.map((tagihan) => (
                <option key={tagihan.id} value={tagihan.id}>
                  {tagihan.nama_tagihan} - Rp {tagihan.nominal}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Pembayaran */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Tanggal Pembayaran</label>
            <input 
              type="date" 
              name="tanggal_transaksi"
              value={formData.tanggal_transaksi}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-200/70 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none transition-all"
            />
          </div>

          {/* Nominal Transfer (Terkunci jika pilih tagihan spesifik) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nominal Transfer (Rp)</label>
            <input 
              type="number" 
              name="nominal"
              value={formData.nominal}
              onChange={handleInputChange}
              readOnly={formData.tagihan_id !== 'lainnya'} // Mengunci input jika bukan "lainnya"
              required
              placeholder="Contoh: 50000" 
              className={`w-full border-transparent focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${
                formData.tagihan_id !== 'lainnya' ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-200/70 focus:bg-white focus:border-blue-500'
              }`}
            />
          </div>

          {/* Keterangan (Opsional) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Keterangan Tambahan</label>
            <input 
              type="text" 
              name="keterangan"
              value={formData.keterangan}
              onChange={handleInputChange}
              placeholder={formData.tagihan_id === 'lainnya' ? "Wajib diisi jika memilih 'Lainnya'..." : "Contoh: Bayar lunas ya admin"}
              required={formData.tagihan_id === 'lainnya'} // Wajib jika pilih lainnya
              className="w-full bg-gray-200/70 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
            />
          </div>

          {/* Tombol Konfirmasi */}
          <button 
            type="submit" 
            className="w-full bg-[#5A7EE2] hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg mt-4 transition-colors shadow-sm"
          >
            Lanjutkan ke Pembayaran (Midtrans)
          </button>

        </form>
      </div>
    </div>
  );
};

export default PembayaranWarga;