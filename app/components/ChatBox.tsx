"use client";

import React, { useEffect, useState, useRef, CSSProperties } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
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
  height: "545px",
  backgroundColor: "#f0f2f5",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  display: "flex",
  flexDirection: "column",
};

const chatListStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  marginBottom: "10px",
};

const ChatBox: React.FC<ChatBoxProps> = ({ friendId, currentUserId }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usernames, setUsernames] = useState<Record<number, string>>({});
  const listRef = useRef<HTMLDivElement>(null);

  const handleReceivedMessage = (msg: IMessage) => {
    const received = JSON.parse(msg.body) as ChatMessage;
    const isRelevant =
      (received.senderId === friendId && received.receiverId === currentUserId) ||
      (received.senderId === currentUserId && received.receiverId === friendId);

    if (isRelevant) {
      setChatHistory((prev) => [...prev, received]);
    }
  };

  const initWebSocket = () => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      setIsConnected(true);
      stompClient.subscribe("/topic/messages", handleReceivedMessage);
    };

    stompClient.onStompError = (frame) =>
      console.error(frame.headers["message"], frame.body);
    stompClient.onWebSocketError = (error) => console.error(error);

    stompClient.activate();
    setClient(stompClient);

    return stompClient;
  };

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get<ChatMessage[]>(`${getApiDomain()}/chat/history/${currentUserId}/${friendId}`);
      setChatHistory(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsernames = async () => {
    try {
      const [meRes, frRes] = await Promise.all([
        axios.get(`${getApiDomain()}/users/${currentUserId}`),
        axios.get(`${getApiDomain()}/users/${friendId}`),
      ]);
      setUsernames({
        [currentUserId]: meRes.data.username,
        [friendId]: frRes.data.username,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const stompClient = initWebSocket();
    return () => {
      stompClient.deactivate();
    };
  }, [friendId, currentUserId]);

  useEffect(() => {
    fetchChatHistory();
    fetchUsernames();
  }, [friendId, currentUserId]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatHistory]);

  const sendMessage = () => {
    if (!client || !isConnected || !message.trim()) return;
    client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({ senderId: currentUserId, receiverId: friendId, content: message }),
    });
    setMessage("");
  };

  return (
    <div style={chatContainerStyle}>
      <p style={{ color: 'black', margin: 0, textAlign: "center", fontWeight: "bold", width: "100%", marginBottom: "10px" }}>
        Chat History:
      </p>
      <div ref={listRef} style={chatListStyle}>
        <List
          dataSource={chatHistory}
          renderItem={(item) => (
            <List.Item>
              <strong>{usernames[item.senderId] || "Loading..."}:</strong> {item.content}
            </List.Item>
          )}
        />
      </div>
      <Input
        value={message}
        placeholder="Type to send a Message...🚀"
        onChange={(e) => setMessage(e.target.value)}
        onPressEnter={sendMessage}
      />
      <Button
        style={{ backgroundColor: "#007BFF", color: "#ffffff", marginTop: 10, width: "100%" }}
        onClick={sendMessage}
        disabled={!isConnected}
      >
        Send
      </Button>
    </div>
  );
};

export default ChatBox;
