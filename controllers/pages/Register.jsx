import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({ email_or_phone: '', password: '', wilayah_id: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email_or_phone || !formData.password || !formData.wilayah_id) {
      return setErrorMsg('Semua kolom wajib diisi!');
    }
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registrasi gagal.');
      setSuccessMsg('Registrasi berhasil! Silakan login.');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Daftar Akun Warga</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Email / No HP" 
          value={formData.email_or_phone}
          onChange={(e) => setFormData({ ...formData, email_or_phone: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input 
          type="text" 
          placeholder="ID Wilayah" 
          value={formData.wilayah_id}
          onChange={(e) => setFormData({ ...formData, wilayah_id: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', background: 'blue', color: 'white' }}>Daftar</button>
      </form>
    </div>
  );
};

export default Register;