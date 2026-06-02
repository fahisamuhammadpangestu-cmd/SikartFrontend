import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DataWarga from './pages/admin/DataWarga';
import ManajemenKas from './pages/admin/ManajemenKas';
import Verifikasi from './pages/admin/Verifikasi';
import TagihanIuran from './pages/admin/TagihanIuran';
import RekapBulanan from './pages/admin/RekapBulanan';
import ProfileAdmin from './pages/admin/ProfileAdmin';

import DashboardWarga from './pages/warga/DashboardWarga';
import PembayaranWarga from './pages/warga/PembayaranWarga';
import RiwayatWarga from './pages/warga/RiwayatWarga';
import LaporanWarga from './pages/warga/LaporanWarga';
import ProfilWarga from './pages/warga/ProfilWarga';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rute Admin menggunakan Layout */}
        <Route path="/admin/dashboard" element={
          <Layout role="admin">
            <DashboardAdmin />
          </Layout>
        } />

        <Route path="/admin/warga" element={
          <Layout role="admin">
            <DataWarga />
          </Layout>
        } />

        <Route path="/admin/kas" element={
          <Layout role="admin">
            <ManajemenKas />
          </Layout>
        } />

        <Route path="/admin/verifikasi" element={
          <Layout role="admin">
            <Verifikasi />
          </Layout>
        } />

        <Route path="/admin/tagihan" element={
          <Layout role="admin">
            <TagihanIuran />
          </Layout>
        } />

        <Route path="/admin/laporan" element={
          <Layout role="admin">
            <RekapBulanan />
          </Layout>
        } />

        <Route path="/admin/profile" element={
          <Layout role="admin">
            <ProfileAdmin />
          </Layout>
        } />

        {/* Rute Warga menggunakan Layout */}
       <Route path="/warga/dashboard" element={
          <Layout role="warga">
            <DashboardWarga />
          </Layout>
        } />

        <Route path="/warga/pembayaran" element={
          <Layout role="warga">
            <PembayaranWarga />
          </Layout>
        } />

        <Route path="/warga/riwayat" element={
          <Layout role="warga">
            <RiwayatWarga />
          </Layout>
        } />

        <Route path="/warga/laporan" element={
          <Layout role="warga">
            <LaporanWarga />
          </Layout>
        } />

        <Route path="/warga/profile" element={
          <Layout role="warga">
            <ProfilWarga />
          </Layout>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;