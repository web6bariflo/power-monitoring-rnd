import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import React from 'react';
import { MqttProvider } from './store/Mqtt';  // Make sure this import is correct

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MqttProvider>
      <App />
    </MqttProvider>
  </StrictMode>
);
