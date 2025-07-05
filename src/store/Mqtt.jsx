import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import mqtt from "mqtt";
import axios from "axios";

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [eventLogs, setEventLogs] = useState([]);
  const [passedMessage, setPassedMessage] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL

  const [data, setData] = useState(() => ({
    // "123/rnd": [],
    "pomon/BFL_PomonA001/rnd/status": [],
  }));

  // 🔗 NEW: remember which device triggered the last post
  const lastDeviceRef = useRef(null);

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
        "pomon/BFL_PomonA001/rnd/alert",


      ]);
    });

    mqttClient.on("reconnect", () => {
      handleStatusChange("reconnecting");
    });

    mqttClient.on("offline", () => {
      handleStatusChange("disconnected");
    });

    mqttClient.on("error", (err) => {
      // console.error("MQTT error:", err);
      // handleStatusChange("error");
    });

    mqttClient.on("message", (topic, message) => {
      const messageStr = message.toString();
      console.log(`📩 ${topic}:`, messageStr);

      // Split multi-line messages (if both devices are in one message)
      const lines = messageStr
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const newMessages = lines.map((line) => ({
        time: new Date().toISOString(),
        value: line,
      }));

      setData((prevData) => {
        const existing = prevData[topic] || [];
        return {
          ...prevData,
          [topic]: [...existing, ...newMessages].slice(-4),
        };
      });

      // Filter specific logs for eventLogs
      const allowedLogs = [
        "New R&D event scheduled.",
        "Activated Aeration Device",
        "Deactivated Aeration Device",
      ];

      lines.forEach((line) => {
        if (
          topic === "pomon/BFL_PomonA001/rnd/status" &&
          allowedLogs.some((msg) => line.includes(msg))
        ) {
          setEventLogs((prev) => [
            ...prev,
            { time: new Date().toISOString(), message: line },
          ]);
        }
      });

      // ✅ Handle alert status
      if (topic === "pomon/BFL_PomonA001/rnd/alert") {
        let formatted = messageStr.trim().toLowerCase();
        console.log("📢 Alert data received:", formatted);

        try {
          const jsonPart = formatted.replace(/^alert status:\s*/i, "");
          const payload = JSON.parse(jsonPart);

          let deviceLabel = payload.adc;
          if (payload.adc === "0x48") {
            deviceLabel = "Device One";
          } else if (payload.adc === "0x49") {
            deviceLabel = "Device Two";
          }

          const phase = payload.phase.toUpperCase();
          formatted = `${deviceLabel} , ${phase}-${payload.value}`;

          if (
            (deviceId === "0x48" || deviceId === "0x49") &&
            lastDeviceRef.current !== deviceId
          ) {
            postMessage(formatted);
            lastDeviceRef.current = deviceId;
          }
        } catch {
          /* fallback to raw string if JSON parsing fails */
        }

        setAlertStatus(formatted);
        console.log("🚨 Alert status updated:", formatted);
        return;
      }

    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
      handleStatusChange("disconnected");
    };
  }, []);

  const postMessage = async (alertStatus) => {

    const formattedTime = new Date().toLocaleString("sv-SE").slice(0, 16).replace("T", " ");

    const dataToSend = {
      Alert_messages: alertStatus,
      Time_stamp: formattedTime,
    };

    console.log("📤 Sending alert data to backend:", dataToSend);

    try {
      const response = await axios.post(`${apiUrl}/post_alert/`, dataToSend);
      console.log("✅ Backend response:", response.data);
    } catch (error) {
      console.error("❌ Error posting alert message:", error);
    }
  };



  useEffect(() => {
    if (alertStatus) postMessage(alertStatus);
  }, [alertStatus]);

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
    setData((prevData) => ({
      ...prevData,
      [topic]: [],
    }));
  };

  return (
    <MqttContext.Provider
      value={{
        data,
        publishMessage,
        clearTopicData,
        alertStatus,
        connectionStatus,
        eventLogs,
        passedMessage,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => useContext(MqttContext);
