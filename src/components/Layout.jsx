import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ role, children }) => {
  return (
    // 1. Tambahkan 'w-full' di sini agar background abu-abu memenuhi 100% layar
    <div className="flex w-full min-h-screen bg-slate-50 font-sans">
      
      {/* Sidebar tetap di kiri dengan lebar tetap 64 (16rem) */}
      <Sidebar role={role} />

      {/* 2. flex-1: Memaksa area ini mengambil SELURUH sisa ruang di sebelah kanan sidebar */}
      {/* 3. w-full & overflow-x-hidden: Mencegah konten meluber keluar layar */}
      <div className="flex-1 ml-64 p-8 w-full min-h-screen overflow-x-hidden">
        
        {/* Konten halaman (seperti DashboardAdmin) akan dimuat di dalam sini */}
        {/* Karena pembungkusnya sudah 100%, konten di dalamnya akan otomatis merenggang (stretch) */}
        <div className="w-full">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default Layout;