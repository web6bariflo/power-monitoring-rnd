import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import React from 'react';
import { MqttProvider } from './store/Mqtt';
import { BrowserRouter } from 'react-router-dom';
import Master from './Master.jsx';  // Import your main component
  // Make sure this import is correct

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <BrowserRouter> */}
    <MqttProvider>
      <Master />
    </MqttProvider>
    {/* </BrowserRouter> */}
  </StrictMode>
);
