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
  getCurrentTime?(): number;
  seekTo?(seconds: number, allowSeekAhead: boolean): void;
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

export default function LobbyPage() {
  const { id } = useParams() as { id?: string };
  const roomId = id || 'lobby-room';
  const api = useApi();

  const [contentLink, setContentLink] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [participants, setParticipants] = useState<{ username: string; ready: boolean }[]>([]);
  const [hostUsername, setHostUsername] = useState('');
  const [chat, setChat] = useState<{ sender: string; content: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [username, setUsername] = useState('Anonymous');

  const playerRef = useRef<PlayerAPI | null>(null);
  const stompRef = useRef<Client | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid) {
      fetch(`${getApiDomain()}/users/${uid}`)
        .then(r => r.json())
        .then(u => u.username && setUsername(u.username))
        .catch(() => { });
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get<Watchparty[]>('/api/watchparties')
      .then(list => {
        const wp = list.find(w => w.id.toString() === id);
        if (wp) setContentLink(wp.contentLink);
      })
      .catch(() => { });
  }, [id, api]);

  useEffect(() => {
    if (!contentLink) return;
    const regex = /(?:youtu\.be\/|youtube\.com\/.*[?&]v=)([^&]+)/;
    const match = contentLink.match(regex);
    const vid = match ? match[1] : contentLink;
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: vid,
        playerVars: { autoplay: 0 },
        events: { onReady: () => { } },
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
    const sock = new SockJS(`${getApiDomain()}/ws`);
    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/syncReadyState/${roomId}`, m => {
          const state = JSON.parse(m.body) as {
            participants: { username: string; ready: boolean }[];
            hostUsername: string;
          };
          const parts = state.participants || [];
          setParticipants(parts);
          setHostUsername(state.hostUsername || '');

          if (!parts.every(p => p.ready)) {
            playerRef.current?.pauseVideo();
          }
          else if (username === state.hostUsername && playerRef.current?.getCurrentTime) {
            client.publish({
              destination: '/app/shareTime',
              body: JSON.stringify({
                roomId,
                currentTime: playerRef.current.getCurrentTime!()
              })
            });
          }
        });

        client.subscribe(`/topic/syncTime/${roomId}`, m => {
          const { currentTime } = JSON.parse(m.body) as { currentTime: number };
          const pl = playerRef.current;
          if (pl?.seekTo) {
            pl.seekTo(currentTime, true);
            pl.playVideo();
          }
        });

        client.subscribe(`/topic/chat/${roomId}`, m => {
          setChat(c => [...c, JSON.parse(m.body)]);
        });

        client.publish({
          destination: '/app/join',
          body: JSON.stringify({ roomId, sender: username })
        });
      }
    });
    client.activate();
    stompRef.current = client;
    return () => { client.deactivate(); };
  }, [roomId, username]);

  const toggleReady = () => {
    const nr = !isReady;
    setIsReady(nr);
    stompRef.current?.publish({
      destination: nr ? '/app/ready' : '/app/notReady',
      body: JSON.stringify({ roomId, sender: username })
    });
  };

  const sendChat = () => {
    if (!msg.trim()) return;
    stompRef.current?.publish({
      destination: '/app/chat.sendLobbyMessage',
      body: JSON.stringify({ roomId, sender: username, content: msg.trim() })
    });
    setMsg('');
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
      gap: 15,
      backgroundColor: '#00000000',
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
        color: '#000',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          padding: 10,
          overflowY: 'auto',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#e5e5e5',
          fontSize: '1rem'
        }}>
          Lobby (Host: {hostUsername}):
          <br /><br />
          Who is ready?
          <br /><br />
          {participants.map((p, i) => (
            <span key={i} style={{ marginLeft: 12 }}>
              {p.username} {p.ready ? '✔️' : '⏳'}
            </span>
          ))}
        </div>

        <div style={{ flex: 2, padding: 10, overflowY: 'auto' }}>
          {chat.map((m, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{m.sender}:</strong> {m.content}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', padding: 10, borderTop: '1px solid #ddd' }}>
          <Input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onPressEnter={sendChat}
            placeholder="Type a message..."
          />
          <Button onClick={sendChat} style={{ marginLeft: 8 }}>Send</Button>
        </div>
      </div>

      <div style={{ gridArea: 'button', width: '100%' }}>
        <Button
          onClick={toggleReady}
          style={{
            width: '100%',
            backgroundColor: isReady ? '#ff4d4f' : '#52c41a',
            borderColor: isReady ? '#ff4d4f' : '#52c41a',
            color: '#FFF'
          }}
        >
          {isReady ? 'I am not ready' : 'I am ready'}
        </Button>
      </div>
    </div>
  );
}
