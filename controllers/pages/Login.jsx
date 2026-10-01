import React, { useState } from 'react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email_or_phone: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login gagal.');
      
      localStorage.setItem('token', data.token);
      alert('Login Berhasil!');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Masuk ke Sistem</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Email / Username" 
          value={credentials.email_or_phone}
          onChange={(e) => setCredentials({ ...credentials, email_or_phone: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', background: 'green', color: 'white' }}>Masuk</button>
      </form>
    </div>
  );
};

export default Login;