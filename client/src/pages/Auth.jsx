import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Lock, Mail, User as UserIcon } from 'lucide-react';
import API from '../api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    // 1. Send data to backend
    const { data } = await API.post(endpoint, formData);
    
    // 2. STOPS HERE IF SUCCESSFUL: Save to LocalStorage
    // Make sure your backend sends back { token, user: { id, name, balance, ... } }
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 3. Only navigate AFTER data is saved
      navigate('/dashboard');
    } else {
      alert("Account created, but failed to log in automatically. Please sign in.");
      setIsLogin(true); // Switch to login tab
    }
  } catch (err) {
    console.error("Auth Error:", err);
    alert(err.response?.data?.message || "Something went wrong. Check your backend console.");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg p-4">
      <div className="bg-darkCard p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2 text-accent">
            <Wallet size={40} />
          </div>
          <h2 className="text-3xl font-bold italic">IBMBank</h2>
          <p className="text-slate-400 mt-2">{isLogin ? "Welcome back!" : "Create your secure account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:border-accent outline-none"
                type="text" placeholder="Full Name" required
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
            <input 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:border-accent outline-none"
              type="email" placeholder="Email Address" required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
            <input 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:border-accent outline-none"
              type="password" placeholder="Password" required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button className="w-full bg-accent hover:bg-emerald-600 text-darkBg font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]">
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          {isLogin ? "New to IBM Bank?" : "Already have an account?"}{' '}
          <span 
            className="text-accent cursor-pointer hover:underline font-semibold"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create Account" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;