import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transferMoney } from '../api';
import { Send, ArrowLeft } from 'lucide-react';

const Transfer = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transferMoney({ recipientAccountNumber: recipient, amount });
      alert("✅ Transfer Successful!");
      navigate('/dashboard');
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Transfer failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>
      
      <h2>Send Money</h2>
      <form onSubmit={handleTransfer}>
        <div className="input-group">
          <label>Recipient Account Number</label>
          <input 
            type="text" 
            placeholder="e.g. ACC123456" 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required 
          />
        </div>
        
        <div className="input-group">
          <label>Amount ($)</label>
          <input 
            type="number" 
            placeholder="0.00" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required 
          />
        </div>

        <button type="submit" disabled={loading} className="send-btn">
          {loading ? "Processing..." : <><Send size={18} /> Confirm Transfer</>}
        </button>
      </form>
    </div>
  );
};

export default Transfer;