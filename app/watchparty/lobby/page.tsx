'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getApiDomain } from '@/utils/domain';

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

export default function LobbyPage() {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<PlayerAPI | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const roomId = 'lobby-room';

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: 'mjrNioThKWs',
        playerVars: { autoplay: 0 },
        events: { onReady: () => console.log('YT player ready') },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    } else {
      window.onYouTubeIframeAPIReady();
    }
  }, []);

  useEffect(() => {
    const apiDomain = getApiDomain();
    const socket = new SockJS(`${apiDomain}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log('[STOMP]', msg),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected');
        client.subscribe(`/topic/syncReadyState/${roomId}`, (message) => {
          console.log('↔ syncReadyState payload:', message.body);
          const states: Record<string, boolean> = JSON.parse(message.body);
          const allReady = Object.values(states).every((v) => v);
          const player = playerRef.current;
          if (player) {
            if (allReady) {
              player.playVideo();
            } else {
              player.pauseVideo();
            }
          }
        });
        client.publish({ destination: '/app/join', body: JSON.stringify({ roomId }) });
      },
    });
    client.activate();
    stompClientRef.current = client;

    return () => { 
      client.deactivate(); 
    };
  }, []);

  const toggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    const dest = newReady ? '/app/ready' : '/app/notReady';
    stompClientRef.current?.publish({ destination: dest, body: JSON.stringify({ roomId }) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
      <div id="yt-player" style={{ width: 800, height: 450 }} />
      <Button 
      onClick={toggleReady} 
      style={{ 
        marginTop: 20, 
        backgroundColor: isReady ? '#ff4d4f' : '#52c41a', 
        borderColor: isReady ? '#ff4d4f' : '#52c41a',
        }}
        >
        {isReady ? 'I am not ready' : 'I am ready'}
      </Button>
    </div>
  );
}