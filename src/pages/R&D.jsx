import React, { useState } from 'react';
import { useMqtt } from '../store/Mqtt';

const RnD = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedPart, setSelectedPart] = useState('');
  const [result, setResult] = useState('');
  const { publishMessage } = useMqtt();

  

  const calculateTimeDifference = () => {
    if (!startTime || !endTime) {
      setResult('Please select both start and end time.');
      return;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalSeconds = (startHours * 60 + startMinutes) * 60;
    const endTotalSeconds = (endHours * 60 + endMinutes) * 60;

    let differenceInSeconds = endTotalSeconds - startTotalSeconds;

    if (differenceInSeconds < 0) {
      differenceInSeconds += 24 * 60 * 60;
    }

    setResult(`${differenceInSeconds} second(s)`);

    // Map selectedPart to numeric value
    const partMap = {
      'Part One': 1,
      'Part Two': 2,
    };

    const message = {

      start_time: startTime,

      duration: differenceInSeconds,
      main: partMap[selectedPart] || 0,
    };

    publishMessage('pomon/rnd/schedule', JSON.stringify(message));
    // publishMessage('456/rnd', JSON.stringify(message));
    
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-68">
        {/* <h2 className="text-xl font-bold text-center text-indigo-600 mb-6">R&D Time Tracker</h2> */}

        {/* Start Time Input*/}
        <div className="mb-4 mt-4">
          <label className="text-sm text-gray-700 mb-1 block">Start Time : </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded-xl"
            step="60"
          />
        </div>

        {/* End Time Input */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 mb-1 block">End Time : </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded-xl"
            step="60"
          />
        </div>

        {/* Part Selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Select Part : </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="Part One"
                checked={selectedPart === 'Part One'}
                onChange={(e) => setSelectedPart(e.target.value)}
                onClick={() => {
                  if (selectedPart === 'Part One') {
                    setSelectedPart('');
                  }



                }}
              />
              <span>Part One</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="Part Two"
                checked={selectedPart === 'Part Two'}
                onChange={(e) => setSelectedPart(e.target.value)}
                onClick={() => {
                  if (selectedPart === 'Part Two') {
                    setSelectedPart('');
                  }
                }}
              />
              <span>Part Two</span>
            </label>
          </div>
        </div>

        <button
          onClick={calculateTimeDifference}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700"
        >
          Publish Time
        </button>

        {result && (
          <div className="mt-6 text-center text-indigo-700 text-lg font-medium">
            <div>⏱️ <strong>{selectedPart || 'Selected Part :'}</strong></div>
            <div>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
};
 



export default RnD;


