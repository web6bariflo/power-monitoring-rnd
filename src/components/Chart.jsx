import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useMqtt } from '../store/Mqtt';

const LineCharts = () => {
  const { data, clearTopicData, alertStatus } = useMqtt();
  const messages = data['pomon/BFL_PomonA001/rnd/status'] || [];
  // const messages = data['123/rnd'] || [];
  console.log(messages);

  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance1 = useRef(null);
  const chartInstance2 = useRef(null);

  const [latest48Data, setLatest48Data] = useState({ R: 0, Y: 0, B: 0 });
  const [latest49Data, setLatest49Data] = useState({ R: 0, Y: 0, B: 0 });

  const [visible48, setVisible48] = useState({ R: true, Y: true, B: true });
  const [visible49, setVisible49] = useState({ R: true, Y: true, B: true });

  useEffect(() => {
    if (!messages.length) return;

    const parseMessage = (msg) => {
      const { value } = msg;
      const match = value.match(/Device_0x(\w+): R=([\d.]+), Y=([\d.]+), B=([\d.]+)/);
      if (!match) return null;
      return {
        device: `Device_0x${match[1]}`,
        R: parseFloat(match[2]),
        Y: parseFloat(match[3]),
        B: parseFloat(match[4]),
      };
    };

    const parsed = messages.map(parseMessage).filter(Boolean);

    const latestData48 = [...parsed].reverse().find(p => p.device === 'Device_0x48');
    const latestData49 = [...parsed].reverse().find(p => p.device === 'Device_0x49');

    if (latestData48) {
      setLatest48Data({ R: latestData48.R, Y: latestData48.Y, B: latestData48.B });
    }

    if (latestData49) {
      setLatest49Data({ R: latestData49.R, Y: latestData49.Y, B: latestData49.B });
    }
  }, [messages]);

  const buildChart = (ref, instanceRef, label, values, visibilities) => {
    const labels = [];
    const data = [];
    const backgroundColors = [];

    if (visibilities.R) {
      labels.push('R');
      data.push(values.R);
      backgroundColors.push('#ef4444');
    }
    if (visibilities.Y) {
      labels.push('Y');
      data.push(values.Y);
      backgroundColors.push('#facc15');
    }
    if (visibilities.B) {
      labels.push('B');
      data.push(values.B);
      backgroundColors.push('#3b82f6');
    }

    if (instanceRef.current) instanceRef.current.destroy();

    instanceRef.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: backgroundColors,
            borderRadius: 4,
            barThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeOutBounce',
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  };

  useEffect(() => {
    if (chartRef1.current && latest48Data) {
      buildChart(chartRef1, chartInstance1, 'Device_0x48', latest48Data, visible48);
    }
  }, [latest48Data, visible48]);

  useEffect(() => {
    if (chartRef2.current && latest49Data) {
      buildChart(chartRef2, chartInstance2, 'Device_0x49', latest49Data, visible49);
    }
  }, [latest49Data, visible49]);

  const handleReset = () => {
    clearTopicData("pomon/BFL_PomonA001/rnd/status");
  };

  return (
    <React.Fragment>
      <button
        onClick={handleReset}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-xl me-16"
      >
        Reset
      </button>



      <div className="flex flex-col md:flex-row gap-6 p-3 h-fit">




        {/* Device 0x48 */}
        <div className="w-full md:w-1/2 h-96 bg-white p-4 shadow rounded relative">
          <h2 className="text-lg font-semibold mb-2">Areation Device One</h2>
          <div className="absolute top-4 right-4 flex gap-2 text-sm">
            <label className="flex items-center gap-1 text-red-600 font-medium">
              <input
                type="checkbox"
                checked={visible48.R}
                style={{ accentColor: '#ef4444' }}
                onChange={() => setVisible48((prev) => ({ ...prev, R: !prev.R }))}
              />
              R
            </label>
            <label className="flex items-center gap-1 text-yellow-600 font-medium">
              <input
                type="checkbox"
                checked={visible48.Y}
                style={{ accentColor: '#facc15' }}
                onChange={() => setVisible48((prev) => ({ ...prev, Y: !prev.Y }))}
              />
              Y
            </label>
            <label className="flex items-center gap-1 text-blue-600 font-medium">
              <input
                type="checkbox"
                checked={visible48.B}
                style={{ accentColor: '#3b82f6' }}
                onChange={() => setVisible48((prev) => ({ ...prev, B: !prev.B }))}
              />
              B
            </label>
          </div>
          <canvas ref={chartRef1} className="w-full h-full" />
        </div>

        {/* Device 0x49 */}
        <div className="w-full md:w-1/2 h-96 bg-white p-4 shadow rounded relative">
          <h2 className="text-lg font-semibold mb-2">Areation Device Two</h2>
          <div className="absolute top-4 right-4 flex gap-2 text-sm">
            <label className="flex items-center gap-1 text-red-600 font-medium">
              <input
                type="checkbox"
                checked={visible49.R}
                style={{ accentColor: '#ef4444' }}
                onChange={() => setVisible49((prev) => ({ ...prev, R: !prev.R }))}
              />
              R
            </label>
            <label className="flex items-center gap-1 text-yellow-600 font-medium">
              <input
                type="checkbox"
                checked={visible49.Y}
                style={{ accentColor: '#facc15' }}
                onChange={() => setVisible49((prev) => ({ ...prev, Y: !prev.Y }))}
              />
              Y
            </label>
            <label className="flex items-center gap-1 text-blue-600 font-medium">
              <input
                type="checkbox"
                checked={visible49.B}
                onChange={() => setVisible49((prev) => ({ ...prev, B: !prev.B }))}
              />
              B
            </label>
          </div>
          <canvas ref={chartRef2} className="w-full h-full" />
        </div>


      </div>
    </React.Fragment>
  );
};

export default LineCharts;