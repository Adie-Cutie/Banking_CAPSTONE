import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      if(response && response.data){
        localStorage.setItem('token',response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
        console.log("Login Error:", err.response? err.response.data : err.message);
        alert("Login Failed: Check console for details");
    }
  };

  return (
    <div className="auth-container">
      <h2>Bank Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Enter Vault</button>
      </form>
    </div>
  );
};

export default Login;