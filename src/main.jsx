import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { MqttProvider } from './store/Mqtt';
import Master from './Master.jsx';

createRoot(document.getElementById('root')).render(
    <MqttProvider>
      <Master />
    </MqttProvider>
);
