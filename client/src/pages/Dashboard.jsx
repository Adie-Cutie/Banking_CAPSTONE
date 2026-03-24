import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, LogOut, Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transferData, setTransferData] = useState({ receiverAccountNumber: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // Tab state

  // 1. Fetch Transaction History
  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/transactions/history');
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. MATH LOGIC
  const income = transactions
    .filter(tx => (tx.receiver?._id || tx.receiver) === user.id)
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  const expenses = transactions
    .filter(tx => (tx.sender?._id || tx.sender) === user.id)
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  // 3. Actions
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/transactions/transfer', transferData);
      alert(`Transfer Successful! Amount deducted from your Account :(`);
      
      const updatedUser = { ...user, balance: data.newBalance };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setShowModal(false);
      fetchHistory(); 
    } catch (err) {
      alert(err.response?.data?.message || "Transfer failed :(");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-darkBg text-slate-100">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-darkCard border-r border-slate-800 p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-3 text-accent mb-10">
          <Wallet size={32} />
          <h1 className="text-2xl font-black italic">IBM BANK</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {/* Overview Button */}
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold ${
              activeTab === 'overview' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <User size={20}/> Overview
          </button>
          
          {/* History Button */}
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold ${
              activeTab === 'history' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <History size={20}/> History
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 p-4 hover:bg-red-400/10 rounded-xl mt-auto transition-colors font-bold">
          <LogOut size={20}/> Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold">Hello, {user?.name} 👋</h2>
            <p className="text-slate-400">Acc: <span className="text-accent font-mono">{user?.accountNumber}</span></p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-accent hover:bg-emerald-500 text-darkBg font-bold py-3 px-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-accent/20 transition-transform active:scale-95">
            <Send size={20}/> Send Money
          </button>
        </header>

        {/* --- VIEW 1: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-darkCard p-8 rounded-3xl border border-slate-800 shadow-xl border-b-4 border-b-accent">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest">Total Balance</p>
                <h3 className="text-5xl font-mono font-bold">${Number(user?.balance).toLocaleString()}</h3>
              </div>
              
              <div className="bg-darkCard p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Income</p>
                  <h4 className="text-2xl font-bold text-emerald-400">+${income.toLocaleString()}</h4>
                </div>
                <div className="bg-emerald-400/10 p-4 rounded-2xl"><ArrowDownLeft className="text-emerald-400"/></div>
              </div>

              <div className="bg-darkCard p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Expenses</p>
                  <h4 className="text-2xl font-bold text-red-400">-${expenses.toLocaleString()}</h4>
                </div>
                <div className="bg-red-400/10 p-4 rounded-2xl"><ArrowUpRight className="text-red-400"/></div>
              </div>
            </div>

            {/* QUICK PREVIEW TABLE (Show only last 3) */}
            <div className="bg-darkCard rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 font-bold text-xl">Recent Activity</div>
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-800">
                    {transactions.slice(0, 3).map((tx) => {
                       const isSender = (tx.sender?._id || tx.sender) === user.id;
                       return (
                        <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-5 flex items-center gap-3">
                             {isSender ? <ArrowUpRight className="text-red-400"/> : <ArrowDownLeft className="text-emerald-400"/>}
                             <span className="font-medium capitalize">{tx.type}</span>
                          </td>
                          <td className={`p-5 text-right font-bold ${isSender ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isSender ? '-' : '+'}${tx.amount.toLocaleString()}
                          </td>
                        </tr>
                       )
                    })}
                  </tbody>
                </table>
                <button onClick={() => setActiveTab('history')} className="w-full p-4 text-accent font-bold hover:bg-slate-800 transition-colors text-sm">
                  View All History
                </button>
            </div>
          </div>
        )}

        {/* --- VIEW 2: FULL HISTORY --- */}
        {activeTab === 'history' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-bold">Transaction History</h3>
                <p className="text-slate-400 text-sm">{transactions.length} Total Records</p>
            </div>
            <div className="bg-darkCard rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase font-bold tracking-widest">
                    <tr>
                      <th className="p-5">Type</th>
                      <th className="p-5">Party</th>
                      <th className="p-5">Date</th>
                      <th className="p-5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {transactions.map((tx) => {
                      const isSender = (tx.sender?._id || tx.sender) === user.id;
                      const partyName = isSender ? (tx.receiver?.name || "Recipient") : (tx.sender?.name || "Sender");
                      return (
                        <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-5 flex items-center gap-3 capitalize">
                            {isSender ? <ArrowUpRight className="text-red-400" size={16}/> : <ArrowDownLeft className="text-emerald-400" size={16}/>}
                            {tx.type}
                          </td>
                          <td className="p-5 font-medium">{partyName}</td>
                          <td className="p-5 text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                          <td className={`p-5 text-right font-bold ${isSender ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isSender ? '-' : '+'}${tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {transactions.length === 0 && <div className="p-10 text-center text-slate-500 italic">No activity yet.</div>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-darkCard border border-slate-700 p-8 rounded-3xl w-full max-w-md scale-in-center shadow-2xl">
            <h3 className="text-2xl font-bold text-center mb-6 text-white">Transfer Funds</h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <input 
                required className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl outline-none focus:border-accent font-mono"
                placeholder="Account Number"
                onChange={(e) => setTransferData({...transferData, receiverAccountNumber: e.target.value})}
              />
              <input 
                required type="number" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl outline-none focus:border-accent font-mono"
                placeholder="Amount ($)"
                onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
              />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-white">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-accent text-darkBg font-black py-4 rounded-2xl hover:bg-emerald-500 shadow-lg shadow-accent/20 transition-all">
                  {loading ? 'Sending...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;