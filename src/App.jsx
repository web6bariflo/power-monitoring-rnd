import React from 'react';
import RnD from './pages/R&D';
import Chart from './components/Chart';
import { useMqtt } from './store/Mqtt';

const App = () => {
  const { eventLogs, passedMessage, alertStatus } = useMqtt(); // Access eventLogs and passedMessage from context

  // Get the most recent event log, if available
  const lastStatusEvent = eventLogs?.length > 0 ? eventLogs[eventLogs.length - 1] : null;

  return (
    <div className="h-screen bg-gray-50 font-sans py-6">

      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Power Monitoring Dashboard
        </h1>


        {/* Show the latest R&D event if passedMessage exists */}
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





        {/* Show the latest status event log if it exists */}
        {lastStatusEvent ? (
          <h2 className="text-lg text-gray-600 mt-1">
            📢 Status: {lastStatusEvent.message}
          </h2>
        ) : (
          <h2 className="text-lg text-gray-600 mt-1">No recent device status events.</h2>
        )}
      </header>

      <span className="text-sm font-semibold text-gray-700 ms-8">
        Alert Status: {alertStatus}
      </span>



      {/* Column Layout */}
      <div className="flex flex-col md:flex-row gap-2 max-w-7xl mx-auto">
        {/* R&D Panel - 20% width */}
        <div className="w-full md:w-2/7 h-90">
          <RnD />
        </div>

        {/* Chart Panel - 80% width */}
        <div className="w-full md:w-5/7 bg-white rounded-lg shadow-sm border border-gray-200 me-4 p-2">
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Device Analytics
          </h2>

          <Chart />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-xs">
        <p>Power Monitoring Dashboard • Bariflo Labs - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
