import React, { createContext, useContext, useEffect, useState } from "react";
import mqtt from "mqtt";

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [eventLogs, setEventLogs] = useState([]);
  const [passedMessage, setPassedMessage] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null); // 'on', 'off', or null


  const [data, setData] = useState(() => {
    return {
      // "123/rnd": [],
      "pomon/BFL_PomonA001/rnd/status": [],
    };


  });

  useEffect(() => {
    const mqttClient = mqtt.connect({
      hostname: "mqttbroker.bc-pl.com",
      port: 443,
      protocol: "wss",
      path: "/mqtt",
      username: "mqttuser",
      password: "Bfl@2025",
      clientId: `mqtt_${Math.random().toString(16).slice(4)}`,
      reconnectPeriod: 5000,
    });

    const handleStatusChange = (newStatus) => {
      if (connectionStatus !== newStatus) {
        setConnectionStatus(newStatus);
        console.log(`MQTT: ${newStatus}`);
      }
    };

    mqttClient.on("connect", () => {
      handleStatusChange("connected");
      mqttClient.subscribe([
        // "123/rnd",
        "pomon/BFL_PomonA001/rnd/status",
        "pomon/BFL_PomonA001/rnd/alart"
        // "project/maintenance/alart",
        // "project/maintenance/test",
      ]);
    });

    mqttClient.on("reconnect", () => {
      handleStatusChange("reconnecting");
    });

    mqttClient.on("offline", () => {
      handleStatusChange("disconnected");
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT error:", err);
      handleStatusChange("error");
    });

    mqttClient.on("message", (topic, message) => {
      const messageStr = message.toString();
      console.log(`📩 ${topic}:`, messageStr);

      // Split multi-line messages (if both devices are in one message)
      const lines = messageStr.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      const newMessages = lines.map(line => ({
        time: new Date().toISOString(),
        value: line,
      }));

      setData((prevData) => {
        const existing = prevData[topic] || [];
        const updatedData = {
          ...prevData,
          [topic]: [...existing, ...newMessages].slice(-4),
        };
        return updatedData;
      });

      // Filter specific logs for eventLogs
      const allowedLogs = [
        "New R&D event scheduled.",
        "Activated Aeration Device",
        "Deactivated Aeration Device",
      ];

      lines.forEach((line) => {
        if (topic === "pomon/BFL_PomonA001/rnd/status" && allowedLogs.some(msg => line.includes(msg))) {
          setEventLogs(prev => [...prev, { time: new Date().toISOString(), message: line }]);
        }

        // ✅ Handle alert status separately
        if (topic === "pomon/BFL_PomonA001/rnd/alart") {
          setAlertStatus(messageStr.trim().toLowerCase()); // 'on' or 'off'
          return;
        }

      });
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
      handleStatusChange("disconnected");
    };
  }, []);


  const publishMessage = (topic, message) => {
    if (client && client.connected) {
      client.publish(topic, message);
      console.log(`🚀 Published to ${topic}:`, message);

      if (topic === "pomon/BFL_PomonA001/rnd/schedule") {
        try {
          const parsed = JSON.parse(message);
          setPassedMessage(parsed);
        } catch (err) {
          console.error("Failed to parse R&D schedule message:", err);
        }
      }
    } else {
      console.warn("❌ MQTT client not connected");
    }
  };

  const clearTopicData = (topic) => {
    setData((prevData) => {
      const updatedData = {
        ...prevData,
        [topic]: [],
      };
      return updatedData;
    });
  };

  return (
    <MqttContext.Provider
      value={{ data, publishMessage, clearTopicData, alertStatus, connectionStatus, eventLogs, passedMessage }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => useContext(MqttContext);