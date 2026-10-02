import React, { useState } from 'react';

export default function Register({ onNavigate }) {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    wilayah: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Pendaftaran berhasil! Mengalihkan ke halaman Login...');
        if (onNavigate) onNavigate('login');
      } else {
        alert(data.message || 'Gagal mendaftar.');
      }
    } catch (err) {
      alert('Gagal terhubung ke server backend.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#1a202c', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Daftar Akun Warga</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nama Lengkap</label>
          <input type="text" name="nama" value={formData.nama} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#2d3748', color: '#fff' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email / No. HP</label>
          <input type="text" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#2d3748', color: '#fff' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#2d3748', color: '#fff' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Wilayah / Provinsi</label>
          <select name="wilayah" value={formData.wilayah} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#2d3748', color: '#fff' }}>
            <option value="">-- Pilih Wilayah --</option>
            <option value="Riau">Riau</option>
            <option value="Kalimantan Tengah">Kalimantan Tengah</option>
            <option value="Sumatera Selatan">Sumatera Selatan</option>
            <option value="Kalimantan Barat">Kalimantan Barat</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Daftar Sekarang</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        Sudah punya akun? <span onClick={() => onNavigate && onNavigate('login')} style={{ color: '#63b3ed', cursor: 'pointer', textDecoration: 'underline' }}>Masuk di sini</span>
      </p>
    </div>
  );
}