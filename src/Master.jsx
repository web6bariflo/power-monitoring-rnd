// src/RouterApp.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/LogIn';
import App from './App';
import ProtectedRoute from './pages/ProtectedRoute';

const RouterApp = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/powermonitoringdashboard" element={<App />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default RouterApp;
