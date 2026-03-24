import React, { useEffect, useState } from 'react';
import { fetchAccounts } from '../api';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const { data } = await fetchAccounts();
      setAccounts(data);
    };
    loadData();
  }, []);

  return (
    <div className="dashboard">
      <h1>Welcome Back</h1>
      {accounts.map(acc => (
        <div key={acc.id} className="account-card">
          <h3>{acc.accountType.toUpperCase()} ACCOUNT</h3>
          <p>Account #: {acc.accountNumber}</p>
          <h2>${acc.balance}</h2>
        </div>
      ))}
      <div className="actions">
        <button onClick={() => window.location.href='/transfer'}>Transfer Money</button>
      </div>
    </div>
  );
};

export default Dashboard;