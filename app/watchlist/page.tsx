"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, Table, Spin, Button, Select, Space, message } from "antd";
import Image from "next/image";

interface Movie {
  movieId: string;
  posterPath?: string;
  title?: string;
  addedOn?: string;
}

export default function WatchlistPage() {
  const router = useRouter();
  const api = useApi();
  const { value: userId } = useLocalStorage<number | null>("userId", null);

  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<{ id: number; username: string }[]>([]);
  const [friendWatchlist, setFriendWatchlist] = useState<Movie[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);

  const loadWatchlist = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const items: string[] = await api.get(`/users/${userId}/watchlist`);
      setWatchlist(
        items
          .map(i => { try { return JSON.parse(i); } catch { return null; } })
          .filter((x): x is Movie => x !== null)
      );
    } catch {
      message.error("Failed to load your watchlist.");
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const f = await api.get<{ id: number; username: string }[]>(`/users/${userId}/friends`);
      setFriends(f);
    } catch {
      message.error("Failed to load friends list.");
    }
  };

  const loadFriendWatchlist = async (fid: number) => {
    try {
      const all = await api.get<{ friendId: number; watchlist: string[] }[]>(
        `/users/${userId}/friends/watchlists`
      );
      const dto = all.find(f => f.friendId === fid);
      if (dto) {
        setFriendWatchlist(
          dto.watchlist
            .map(i => { try { return JSON.parse(i); } catch { return null; } })
            .filter((x): x is Movie => x !== null)
        );
      } else {
        setFriendWatchlist([]);
      }
    } catch {
      message.error("Failed to load friend's watchlist.");
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadFriends();
  }, [userId]);

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
        ) : "–",
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

  return (
    <div style={{ padding: 24, paddingTop: 100, maxWidth: 800, margin: "0 auto" }}>
      <Card title="Your Watchlist" style={{ marginBottom: 24 }}>
        {loading ? (
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
        <div style={{ marginTop: 24 }}>
          <strong>Want to view your friend's watchlist? 👀</strong>
          <Space style={{ marginTop: 8 }}>
            <Select<number | null>
              placeholder="Select friend…"
              value={selectedFriendId}
              onChange={id => {
                setSelectedFriendId(id);
                if (id) loadFriendWatchlist(id);
              }}
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

      {selectedFriendId && (
        <Card title="Friend's Watchlist">
          <Table<Movie>
            dataSource={friendWatchlist}
            rowKey="movieId"
            columns={columns}
            pagination={false}
            scroll={{ y: 600 }}
            locale={{ emptyText: "No entries in your friend's watchlist." }}
          />
        </Card>
      )}
    </div>
  );
}
