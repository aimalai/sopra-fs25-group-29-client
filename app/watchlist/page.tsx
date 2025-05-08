"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import { Card, Table, Spin, Button, Select, Space, message } from "antd";
import Image from "next/image";

interface Movie {
  movieId: string;
  posterPath?: string;
  title?: string;
  addedOn?: string;
}
interface TopRatedMovie {
  movieId: string;
  posterPath?: string;
  title?: string;
  rating: number;
  friendUsername: string;
}

export default function WatchlistPage() {
  const router = useRouter();
  const api = useApi();
  const [token] = useSessionStorage<string>("token", "");
  const [userId] = useSessionStorage<number>("userId", 0);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [friends, setFriends] = useState<{ id: number; username: string }[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [friendWatchlist, setFriendWatchlist] = useState<Movie[]>([]);
  const [shareableAllowed, setShareableAllowed] = useState(true);
  const [shareableMessage, setShareableMessage] = useState("");

  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [loadingFriendWatch, setLoadingFriendWatch] = useState(false);
  const [loadingTopRated, setLoadingTopRated] = useState(false);
  const [topRated, setTopRated] = useState<TopRatedMovie[]>([]);

  const loadWatchlist = async () => {
    if (!userId) return;
    setLoadingWatchlist(true);
    try {
      const items: string[] = await api.get(`/users/${userId}/watchlist`);
      const parsed = items
        .map(i => { try { return JSON.parse(i); } catch { return null; } })
        .filter((x): x is Movie => x !== null);
      const unique = Array.from(
        new Map(parsed.map(m => [m.movieId, m])).values()
      );
      setWatchlist(unique);
    } catch {
      message.error("Failed to load your watchlist.");
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const loadFriends = async () => {
    if (!userId) return;
    try {
      const f = await api.get<{ id: number; username: string }[]>(`/users/${userId}/friends`);
      setFriends(f);
    } catch {
      message.error("Failed to load friends list.");
    }
  };

  const loadFriendWatchlist = async (fid: number) => {
    if (!userId) return;
    setLoadingFriendWatch(true);
    try {
      const all = await api.get<{ friendId: number; watchlist: string[] }[]>(`/users/${userId}/friends/watchlists`);
      const dto = all.find(f => f.friendId === fid);
      const friendName = friends.find(f => f.id === fid)?.username ?? "This Friend";
      if (!dto) {
        setShareableAllowed(false);
        setShareableMessage(`${friendName} doesn't want to share his/her watchlist.`);
        setFriendWatchlist([]);
      } else {
        setShareableAllowed(true);
        setShareableMessage("");
        const parsed = dto.watchlist
          .map(i => { try { return JSON.parse(i); } catch { return null; } })
          .filter((x): x is Movie => x !== null);
        setFriendWatchlist(parsed);
      }
    } catch {
      message.error("Failed to load friend's watchlist.");
    } finally {
      setLoadingFriendWatch(false);
    }
  };

  const loadTopRated = async () => {
    if (!userId) return;
    setLoadingTopRated(true);
    try {
      const data = await api.get<TopRatedMovie[]>(`/api/users/${userId}/friends/top-rated?minRating=4`);
      const unique = Array.from(
        new Map(data.map(item => [item.movieId, item])).values()
      );
      setTopRated(unique);
    } catch {
      message.error("Failed to load recommended movies.");
    } finally {
      setLoadingTopRated(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadWatchlist();
      loadFriends();
      loadTopRated();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && selectedFriendId) {
      loadFriendWatchlist(selectedFriendId);
    }
  }, [userId, selectedFriendId]);

  const columns = [
    {
      title: "Poster",
      key: "poster",
      render: (_: unknown, r: Movie) =>
        r.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w200${r.posterPath}`}
            alt=""
            width={60}
            height={90}
            style={{ borderRadius: 4 }}
          />
        ) : (
          "–"
        ),
    },
    {
      title: "Title",
      key: "title",
      render: (_: unknown, r: Movie) => (
        <a
          onClick={() => router.push(`/results/details?id=${r.movieId}&media_type=movie`)}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          {r.title}
        </a>
      ),
    },
    {
      title: "Added On",
      dataIndex: "addedOn",
      key: "addedOn",
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : ""),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: Movie) => (
        <Button
          type="primary"
          size="small"
          onClick={() => router.push(`/results/details?id=${r.movieId}&media_type=movie`)}
        >
          Details
        </Button>
      ),
    },
  ];

  const columnsRecommended = [
    {
      title: "Poster",
      key: "poster",
      render: (_: unknown, r: TopRatedMovie) =>
        r.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w200${r.posterPath}`}
            alt=""
            width={60}
            height={90}
            style={{ borderRadius: 4 }}
          />
        ) : (
          "–"
        ),
    },
    {
      title: "Title",
      key: "title",
      render: (_: unknown, r: TopRatedMovie) => (
        <a
          onClick={() => router.push(`/results/details?id=${r.movieId}&media_type=movie`)}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          {r.title}
        </a>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: TopRatedMovie) => (
        <Button
          type="primary"
          size="small"
          onClick={() => router.push(`/results/details?id=${r.movieId}&media_type=movie`)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, paddingTop: 100, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Card title="Your Watchlist" style={{ marginBottom: 24 }}>
            {loadingWatchlist ? (
              <Spin />
            ) : (
              <Table<Movie>
                dataSource={watchlist}
                rowKey="movieId"
                columns={columns}
                pagination={false}
                scroll={{ y: 600 }}
                locale={{ emptyText: "No entries in your watchlist." }}
              />
            )}
            {/* FRIEND SELECT */}
            <div style={{ marginTop: 16 }}>
              <strong>Want to view your friend's watchlist? 👀</strong>
              <Space style={{ marginTop: 8 }}>
                <Select<number | null>
                  placeholder="Select friend…"
                  value={selectedFriendId}
                  onChange={id => setSelectedFriendId(id)}
                  allowClear
                  style={{ width: 200 }}
                >
                  {friends.map(f => (
                    <Select.Option key={f.id} value={f.id}>
                      {f.username}
                    </Select.Option>
                  ))}
                </Select>
              </Space>
            </div>
          </Card>
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Films & Shows rated above 4 stars by friends" style={{ marginBottom: 24 }}>
            {loadingTopRated ? (
              <Spin />
            ) : (
              <Table<TopRatedMovie>
                dataSource={topRated}
                rowKey="movieId"
                columns={columnsRecommended}
                pagination={false}
                scroll={{ y: 600 }}
                locale={{ emptyText: "No recommended movies." }}
              />
            )}
          </Card>
        </div>
      </div>

      {selectedFriendId && (
        <Card
          title={`${friends.find(f => f.id === selectedFriendId)?.username}'s Watchlist`}
          style={{ marginTop: 24 }}
        >
          {!shareableAllowed ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#555",
                fontStyle: "italic",
                backgroundColor: "#f9f9f9",
                borderRadius: 4,
              }}
            >
              {shareableMessage}
            </div>
          ) : loadingFriendWatch ? (
            <Spin />
          ) : (
            <Table<Movie>
              dataSource={friendWatchlist}
              rowKey="movieId"
              columns={columns}
              pagination={false}
              scroll={{ y: 600 }}
              locale={{ emptyText: "No entries in your friend's watchlist." }}
            />
          )}
        </Card>
      )}
    </div>
  );
}
