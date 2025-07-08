// src/RouterApp.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import App from './App';
import ProtectedRoute from './pages/ProtectedRoute';

const RouterApp = () => (
  <Router>
    <Routes>
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected route */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<App />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default RouterApp;
