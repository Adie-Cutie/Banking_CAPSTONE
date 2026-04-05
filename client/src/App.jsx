import React from 'react';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Auth = lazy(() => import('./pages/Auth'));

// This wrapper checks if a user is logged in before showing the Dashboard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Suspense><Router>
      <div className="min-h-screen bg-darkBg selection:bg-accent selection:text-darkBg">
        <Routes>
          {/* Landing/Login Page */}
          <Route path="/" element={<Auth />} />

          {/* Protected Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />

          {/* Redirect any unknown routes to Login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router></Suspense>
  );
}

export default App;