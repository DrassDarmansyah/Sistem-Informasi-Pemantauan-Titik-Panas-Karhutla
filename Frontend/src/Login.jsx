import React, { useState } from 'react';

export default function Login({ onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Login berhasil!');
        if (data.token) localStorage.setItem('token', data.token);
        if (onNavigate) onNavigate('home');
      } else {
        alert(data.message || 'Login gagal.');
      }
    } catch (err) {
      alert('Gagal terhubung ke server backend.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#1a202c', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Masuk ke VINIX7</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email / No. HP</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#2d3748', color: '#fff' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #4a5568', backgroundColor: '#2d3748', color: '#fff' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Masuk</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        Belum punya akun? <span onClick={() => onNavigate && onNavigate('register')} style={{ color: '#63b3ed', cursor: 'pointer', textDecoration: 'underline' }}>Daftar Warga</span>
      </p>
    </div>
  );
}