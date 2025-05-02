'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from 'antd';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useParams } from 'next/navigation';
import { getApiDomain } from '@/utils/domain';
import { useApi } from '@/hooks/useApi';

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YouTubePlayerOptions) => PlayerAPI;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerAPI {
  playVideo(): void;
  pauseVideo(): void;
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars?: Record<string, unknown>;
  events?: { onReady?: () => void };
}

interface Watchparty {
  id: number;
  contentLink: string;
}

function getYouTubeVideoId(url: string): string {
  const regex = /(?:youtu\.be\/|youtube\.com\/.*[?&]v=)([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : url;
}

export default function LobbyPage() {
  const { id } = useParams() as { id?: string };
  const roomId = id || 'lobby-room';
  const apiService = useApi();

  const [contentLink, setContentLink] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('Anonymous');

  const playerRef = useRef<PlayerAPI | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      fetch(`${getApiDomain()}/users/${storedId}`)
        .then(res => res.json())
        .then(user => { if (user.username) setUsername(user.username) })
        .catch(() => {});
    }
  }, []);

  // fetch the full list, then pick out our party
  useEffect(() => {
    if (!id) return;
    apiService
      .get<Watchparty[]>('/api/watchparties')
      .then(wps => {
        const wp = wps.find(w => w.id.toString() === id);
        if (wp) setContentLink(wp.contentLink);
      })
      .catch(() => {});
  }, [id, apiService]);

  useEffect(() => {
    if (!contentLink) return;
    const videoId = getYouTubeVideoId(contentLink);
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId,
        playerVars: { autoplay: 0 },
        events: { onReady: () => {} },
      });
    };
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    } else {
      window.onYouTubeIframeAPIReady();
    }
  }, [contentLink]);

  useEffect(() => {
    const socket = new SockJS(`${getApiDomain()}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/syncReadyState/${roomId}`, msg => {
          const states: Record<string, boolean> = JSON.parse(msg.body);
          const p = playerRef.current;
          if (p) {
            if (Object.values(states).every(v => v)) p.playVideo();
            else p.pauseVideo();
          }
        });
        client.subscribe(`/topic/chat/${roomId}`, msg => {
          setChatMessages(ms => [...ms, JSON.parse(msg.body)]);
        });
        client.publish({ destination: '/app/join', body: JSON.stringify({ roomId }) });
      },
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, [roomId]);

  const toggleReady = () => {
    const next = !isReady;
    setIsReady(next);
    stompClientRef.current?.publish({
      destination: next ? '/app/ready' : '/app/notReady',
      body: JSON.stringify({ roomId }),
    });
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;
    stompClientRef.current?.publish({
      destination: '/app/chat.sendLobbyMessage',
      body: JSON.stringify({ roomId, sender: username, content: newMessage.trim() }),
    });
    setNewMessage('');
  };

  return (
    <div style={{
      marginTop: '120px',
      width: '60vw',
      height: 'calc(100vh - 128px)',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gridTemplateRows: '1fr auto',
      gridTemplateAreas: '"video chat" "button button"',
      gap: 20,
      backgroundColor: '#000',
      boxSizing: 'border-box',
    }}>
      <div id="yt-player" style={{
        gridArea: 'video',
        width: '100%',
        height: '100%',
        aspectRatio: '16/9',
        backgroundColor: '#000',
      }} />
      <div style={{
        gridArea: 'chat',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          padding: 10,
          overflowY: 'auto',
          borderBottom: '1px solid #ddd',
        }}>
          {chatMessages.map((m, i) => (
            <div key={i} style={{ marginBottom: 8, color: '#000' }}>
              <strong style={{ color: '#000' }}>{m.sender}:</strong>{' '}
              <span style={{ color: '#000' }}>{m.content}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', padding: 10 }}>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onPressEnter={sendChatMessage}
            placeholder="Type a message..."
          />
          <Button onClick={sendChatMessage} style={{ marginLeft: 8 }}>
            Send
          </Button>
        </div>
      </div>
      <div style={{ gridArea: 'button', width: '100%' }}>
        <Button
          onClick={toggleReady}
          style={{
            width: '100%',
            backgroundColor: isReady ? '#ff4d4f' : '#52c41a',
            borderColor: isReady ? '#ff4d4f' : '#52c41a',
            color: '#fff',
          }}>
          {isReady ? 'I am not ready' : 'I am ready'}
        </Button>
      </div>
    </div>
  );
}
