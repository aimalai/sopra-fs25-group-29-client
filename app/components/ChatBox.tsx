"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Input, Button, List } from "antd";
import axios from "axios";
import { getApiDomain } from "@/utils/domain";

interface ChatMessage {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string;
}

interface ChatBoxProps {
  friendId: number;
  currentUserId: number;
}

const chatContainerStyle: CSSProperties = {
  width: "100%",
  maxWidth: "480px",
  backgroundColor: "#f0f2f5",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  marginTop: "20px",
};

const chatListStyle: CSSProperties = {
  maxHeight: "300px",
  overflowY: "auto",
  marginBottom: "10px",
};

const ChatBox: React.FC<ChatBoxProps> = ({ friendId, currentUserId }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket!");
      setIsConnected(true);
      stompClient.subscribe("/topic/messages", (msg) => {
        const receivedMsg = JSON.parse(msg.body) as ChatMessage;
        if (
          (receivedMsg.senderId === friendId && receivedMsg.receiverId === currentUserId) ||
          (receivedMsg.senderId === currentUserId && receivedMsg.receiverId === friendId)
        ) {
          setChatHistory((prev) => [...prev, receivedMsg]);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    stompClient.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [friendId, currentUserId]);

  useEffect(() => {
    axios
      .get(`${getApiDomain()}/chat/history/${currentUserId}/${friendId}`)
      .then((response) => setChatHistory(response.data))
      .catch((error) => console.error("Failed to load chat history", error));
  }, [friendId, currentUserId]);

  const sendMessage = () => {
    if (!client || !isConnected || message.trim() === "") {
      console.warn("Cannot send message: either not connected or message is empty.");
      return;
    }
    const chatMessage: ChatMessage = {
      senderId: currentUserId,
      receiverId: friendId,
      content: message,
    };
    client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(chatMessage),
    });
    setMessage("");
  };

  return (
    <div style={chatContainerStyle}>
      <List
        dataSource={chatHistory}
        renderItem={(item: ChatMessage) => (
          <List.Item>
            <strong>{item.senderId === currentUserId ? "Me" : "Friend"}:</strong> {item.content}
          </List.Item>
        )}
        style={chatListStyle}
      />
      <Input
        value={message}
        placeholder="Type to send a Message...🚀"
        onChange={(e) => setMessage(e.target.value)}
        onPressEnter={sendMessage}
      />
      <Button
        type="primary"
        onClick={sendMessage}
        disabled={!isConnected}
        style={{ marginTop: "10px", width: "100%" }}
      >
        Send
      </Button>
    </div>
  );
};

export default ChatBox;
