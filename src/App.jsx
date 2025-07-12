import React, { useEffect, useRef } from 'react';
import RnD from './pages/R&D';
import Chart from './components/Chart';
import { useMqtt } from './store/Mqtt';
import axios from 'axios';

const App = () => {
  const { eventLogs, passedMessage, alertStatus } = useMqtt();
  const user_name = localStorage.getItem('User_name');
  const deviceId = localStorage.getItem('Device_id');
  const hasPostedRef = useRef(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ✅ Post alert after login & alert status received
  useEffect(() => {
    if (alertStatus && deviceId && !hasPostedRef.current) {
      const postMessage = async () => {
        const formattedTime = new Date().toLocaleString("sv-SE").slice(0, 16).replace("T", " ");
        const dataToSend = {
          alert_message: alertStatus,
          Time_stamp: formattedTime,
          device_id: deviceId,
        };

        console.log("📤 Posting alert from App.jsx:", dataToSend);
        try {
          const response = await axios.post(`${apiUrl}/post_alert/`, dataToSend);
          console.log("✅ Backend response:", response.data);
          hasPostedRef.current = true;
        } catch (error) {
          console.error("❌ Error posting alert:", error.response?.data || error.message);
        }
      };

      postMessage();
    }
  }, [alertStatus, deviceId]);

  const lastStatusEvent = eventLogs?.length > 0 ? eventLogs[eventLogs.length - 1] : null;

  return (
    <div className="h-screen bg-gray-50 font-sans py-6">
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Power Monitoring Dashboard
        </h1>

        {passedMessage ? (
          <h2 className="text-lg text-indigo-700 mt-2 font-medium">
            🕒 Power Monitoring Schedule: Start: {passedMessage.start_time}, Duration: {passedMessage.duration}s,
            :    {
              passedMessage.main === 1
                ? 'Device One'
                : passedMessage.main === 2
                  ? 'Device Two'
                  : 'No Device Selected'
            }
          </h2>
        ) : (
          <h2 className="text-lg text-gray-600 mt-2">No schedule published.</h2>
        )}

        {lastStatusEvent ? (
          <h2 className="text-lg text-gray-600 mt-1">
            📢 Status: {lastStatusEvent.message}
          </h2>
        ) : (
          <h2 className="text-lg text-gray-600 mt-1">No recent device status events.</h2>
        )}
      </header>

      <div className="animate-fadeInOut fixed top-4 left-4 z-50 bg-white border-l-4 border-blue-500 shadow-xl rounded-xl px-6 py-4 w-fit max-w-sm">
        <div>
          {/* <p className="text-sm text-gray-500">Hello,</p> */}
          <p className="text-lg font-bold text-gray-800">
            Welcome, <span className="text-blue-700">{user_name}</span>
          </p>
        </div>
      </div>

      <div className='flex flex-row justify-between items-center w-full max-w-7xl mx-auto mb-6 px-6'>
        <div className="text-md font-semibold text-gray-700">
          Alert Status: {alertStatus}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 max-w-7xl mx-auto">
        <div className="w-full md:w-2/7 h-90">
          <RnD />
        </div>

        <div className="w-full md:w-5/7 bg-white rounded-lg shadow-sm border border-gray-200 me-4 p-2">
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Device Analytics
          </h2>
          <Chart />
        </div>
      </div>

      <footer className="mt-16 text-center text-gray-500 text-xs">
        <p>Power Monitoring Dashboard • Bariflo Cybernetics - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
