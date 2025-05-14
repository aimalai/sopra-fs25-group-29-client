'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from 'antd';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useParams, useRouter } from 'next/navigation';
import { getApiDomain } from '@/utils/domain';
import { useApi } from '@/hooks/useApi';
import useSessionStorage from '@/hooks/useSessionStorage';

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
  destroy?(): void;
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars?: Record<string, unknown>;
  events?: { onReady?: () => void; onError?: () => void };
}

interface Watchparty {
  id: number;
  contentLink: string;
}

export default function LobbyPage() {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const roomId = id || 'lobby-room';
  const api = useApi();

  const [contentLink, setContentLink] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [participants, setParticipants] = useState<{ username: string; ready: boolean }[]>([]);
  const [hostUsername, setHostUsername] = useState('');
  const [chat, setChat] = useState<{ sender: string; content: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [username] = useSessionStorage<string>('username', '');

  const [videoError, setVideoError] = useState(false);
  const [videoRetries, setVideoRetries] = useState(0);
  const maxVideoRetries = 2;

  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownStarted = useRef(false);

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);

  const playerRef = useRef<PlayerAPI | null>(null);
  const stompRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);
  const joinedRef = useRef(false);
  const [notReadyMsg, setNotReadyMsg] = useState<string | null>(null);
  const prevParticipantsRef = useRef<{ username: string; ready: boolean }[]>([]);
  const splashTimeout = useRef<number | null>(null);
  const [toggleLocked, setToggleLocked] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<Watchparty>(`/api/watchparties/${id}`)
      .then(wp => {
        if (wp.contentLink) setContentLink(wp.contentLink);
      })
      .catch(() => { });
  }, [id, api]);

  useEffect(() => {
    if (!contentLink) return;

    const regex = /(?:youtu\.be\/|youtube\.com\/.*[?&]v=)([^&]+)/;
    if (!contentLink.match(regex)) {
      setVideoError(true);
      setVideoRetries(maxVideoRetries);
      return;
    }

    const match = contentLink.match(regex)!;
    const vid = match[1];

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current?.destroy?.();
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: vid,
        playerVars: { autoplay: 0 },
        events: {
          onReady: () => setVideoError(false),
          onError: () => {
            setVideoError(true);
            if (videoRetries < maxVideoRetries) {
              setTimeout(() => setVideoRetries(r => r + 1), 3000);
            }
          }
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    } else {
      window.onYouTubeIframeAPIReady();
    }
  }, [contentLink, videoRetries]);

  useEffect(() => {
    if (!username) {
      return;
    }
    subscribedRef.current = false;
    joinedRef.current     = false;

    const sock = new SockJS(`${getApiDomain()}/ws`);
    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      onConnect: () => {
        if (!subscribedRef.current) {
          client.subscribe(
            `/topic/syncReadyState/${roomId}`,
            m => {
              const state = JSON.parse(m.body) as {
                participants: { username: string; ready: boolean }[];
                hostUsername: string;
              };
              const parts = state.participants || [];

              parts.forEach(pNew => {
                const pOld = prevParticipantsRef.current.find(p => p.username === pNew.username);
                if (pOld?.ready && !pNew.ready && pNew.username !== username) {
                  setNotReadyMsg(`${pNew.username} is not ready`);
                  if (splashTimeout.current) clearTimeout(splashTimeout.current);
                  splashTimeout.current = window.setTimeout(() => setNotReadyMsg(null), 2000);
                }
              });
              prevParticipantsRef.current = parts;

              setParticipants(parts);
              setHostUsername(state.hostUsername || '');

              if (!parts.every(p => p.ready)) {
                playerRef.current?.pauseVideo();
                countdownStarted.current = false;
                setCountdown(null);
              } else if (!countdownStarted.current) {
                countdownStarted.current = true;
                setCountdown(3);
              }
            }
          );
          client.subscribe(`/topic/syncTime/${roomId}`, m => {
            const { currentTime } = JSON.parse(m.body) as { currentTime: number };
            const pl = playerRef.current;
            if (pl?.seekTo) {
              pl.seekTo(currentTime, true);
              pl.playVideo();
            }
            const h = String(Math.floor(currentTime / 3600)).padStart(2, '0');
            const mnt = String(Math.floor((currentTime % 3600) / 60)).padStart(2, '0');
            const s = String(Math.floor(currentTime % 60)).padStart(2, '0');
            setSyncMessage(`You are now synced to ${h}:${mnt}:${s}`);
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = window.setTimeout(() => {
              setSyncMessage(null);
            }, 3000);
          });

          client.subscribe(`/topic/chat/${roomId}`, m => setChat(c => [...c, JSON.parse(m.body)]));
          subscribedRef.current = true;
        }
        if (!joinedRef.current) {
          client.publish({
            destination: '/app/join',
            body: JSON.stringify({ roomId, sender: username })
          });
          joinedRef.current = true;
        }
      }
    });
    client.activate();
    stompRef.current = client;
    return () => {
      if (stompRef.current?.connected) {
        stompRef.current.publish({
          destination: '/app/leave',
          body: JSON.stringify({ roomId, sender: username })
        });
      }
      client.deactivate();
    };
  }, [roomId, username]);

  useEffect(() => {
    if (countdown == null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => (c ?? 0) - 1), 1000);
      return () => clearTimeout(t);
    }
    if (username === hostUsername && playerRef.current?.getCurrentTime) {
      stompRef.current?.publish({
        destination: '/app/shareTime',
        body: JSON.stringify({
          roomId,
          currentTime: playerRef.current.getCurrentTime!()
        })
      });
    }
    setCountdown(null);
  }, [countdown]);

  const toggleReady = () => {
    if (toggleLocked) return;
    setToggleLocked(true);
    setTimeout(() => setToggleLocked(false), 3000);

    const nr = !isReady;
    setIsReady(nr);

    stompRef.current?.publish({
      destination: nr ? '/app/ready' : '/app/notReady',
      body: JSON.stringify({ roomId, sender: username })
    });

    if (!nr) {
      playerRef.current?.pauseVideo();
      countdownStarted.current = false;
      setCountdown(null);
    }
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
    <>
      {notReadyMsg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0)',
          animation: 'overlayFade 0.5s forwards',
          zIndex: 9999
        }}>
          <div style={{
            padding: '2rem 4rem',
            backgroundColor: 'rgba(255,0,0,0.9)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '2rem',
            maxWidth: '80%',
            textAlign: 'center',
            animation: 'popInBounce 0.6s'
          }}>
            {notReadyMsg}
          </div>
        </div>
      )}
      <div style={{
        marginTop: '65px',
        width: '90vw',
        maxWidth: '1600px',
        height: 'calc(100vh - 100px)',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'grid',
        gridTemplateColumns: '3fr minmax(250px, 1fr)',
        gridTemplateRows: 'auto 60px',
        gridTemplateAreas: '"video chat" "button button"',
        gap: 12,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div style={{ gridArea: 'video', position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div id="yt-player" style={{
            width: '100%',
            height: '100%',
            aspectRatio: '16/9',
            backgroundColor: '#000',
          }} />
          {videoError && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: 20,
              textAlign: 'center'
            }}
            >
              {videoRetries < maxVideoRetries ? (
                <span style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                  Video failed to load. Retrying...
                </span>
              ) : (
                <>
                  <p style={{ fontSize: '1.4rem', marginBottom: 24, lineHeight: 1.4 }}>
                    An error occurred loading the video.<br />
                    The video might be private or there may be copyright issues.
                  </p>
                  <Button
                    size="large"
                    style={{
                      backgroundColor: '#007BFF',
                      borderColor: '#007BFF',
                      color: '#ffffff',
                    }}
                    onClick={() => window.open(contentLink || '#', '_blank')}
                  >
                    Open link in new tab
                  </Button>
                </>
              )}
            </div>
          )}
          {countdown != null && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8rem', zIndex: 10
            }}>
              {countdown > 0 ? countdown : 'Go!'}
            </div>
          )}
        </div>

        <div style={{
          gridArea: 'chat',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1,
            padding: 10,
            overflowY: 'auto',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#e5e5e5',
            color: '#000',
          }}>
          Lobby (Host: {hostUsername}):<br/><br/>
            {participants.map((p, i) => (
              <span key={i} style={{ marginRight: 8 }}>
                {p.username}{p.ready ? ' ✅' : ' ⏳'}
              </span>
            ))}
          </div>

          <div style={{ flex: 2, padding: 10, overflowY: 'auto', color: '#000' }}>
            {chat.map((m, i) => (
              <div key={i} style={{ marginBottom: 8 }}><strong>{m.sender}:</strong> {m.content}</div>
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

        <div style={{ gridArea: 'button', display: 'flex', gap: 8 }}>
          <Button onClick={toggleReady} disabled={toggleLocked} style={{
            flex: 1,
            backgroundColor: isReady ? '#ff4d4f' : '#52c41a',
            borderColor: isReady ? '#ff4d4f' : '#52c41a',
            color: '#FFF'
          }}>
            {isReady ? 'I am not ready' : 'I am ready'}
          </Button>
          <Button onClick={() => router.push("/watchparty")} style={{
            flex: 1,
            backgroundColor: '#ff4d4f',
            borderColor: '#ff4d4f',
            color: '#FFF'
          }}>
            Leave Lobby
          </Button>
        </div>
        {syncMessage && (
          <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '2rem', padding: '8px 16px', borderRadius: 4 }}>
            {syncMessage}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes overlayFade {
        from { background-color: rgba(0,0,0,0); }
        to   { background-color: rgba(0,0,0,0.7); }
        }

        @keyframes popInBounce {
          0%   { transform: scale(0.5);   opacity: 0; }
          60%  { transform: scale(1.1);   opacity: 1; }
          100% { transform: scale(1);     opacity: 1; }`
      }
      </style>
    </>
  );
}