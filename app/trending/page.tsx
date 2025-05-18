"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import useAuth from "@/hooks/useAuth";
import { Card, Spin, Button, Space, message } from "antd";
import Image from "next/image";

interface TrendingItem {
  id: number;
  poster_path?: string;
  title?: string;
  name?: string;
  overview?: string;
}

const descriptionStyle: CSSProperties = {
  height: 80,
  overflowY: "auto",
  marginTop: 8,
  marginBottom: 8,
};

const buttonPrimaryStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  borderColor: "#007BFF",
  width: 140,
};

const buttonDangerStyle: CSSProperties = {
  backgroundColor: "#ff4d4f",
  color: "#ffffff",
  borderColor: "#ff4d4f",
  width: 180,
};

export default function TrendingPage() {
  const isAuthed = useAuth();
  const api = useApi();
  const router = useRouter();
  const [userId] = useSessionStorage<number>("userId", 0);

  const [data, setData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // initial watchlist load
  useEffect(() => {
    if (!userId) return;
    api
      .get<string[]>(`/users/${userId}/watchlist`)
      .then((res) => Array.isArray(res) && setWatchlist(res))
      .catch(() => {});
  }, [userId, api]);

  const isInWatchlist = (id: number) =>
    watchlist.some((entry) => {
      try {
        return JSON.parse(entry).movieId === id.toString();
      } catch {
        return false;
      }
    });

  const refreshWatchlist = async () => {
    if (!userId) return;
    try {
      const res = await api.get<string[]>(`/users/${userId}/watchlist`);
      if (Array.isArray(res)) setWatchlist(res);
    } catch {}
  };

  const handleAdd = async (item: TrendingItem) => {
    if (!userId) return;
    try {
      await api.post(`/users/${userId}/watchlist`, {
        movieId: item.id.toString(),
        title: item.title || item.name,
        posterPath: item.poster_path || "",
      });
      message.success("Added to Watchlist");
      refreshWatchlist();
    } catch {
      message.error("Could not add to Watchlist.");
    }
  };

  const handleRemove = async (item: TrendingItem) => {
    if (!userId) return;
    try {
      await api.delete(`/users/${userId}/watchlist/${item.id}`);
      message.success("Removed from Watchlist");
      refreshWatchlist();
    } catch {
      message.error("Could not remove from Watchlist.");
    }
  };

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/movies/trending");
      const body = typeof res === "string" ? JSON.parse(res) : res;
      setData(body.results || []);
    } catch {
      setError("Failed to load trending.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const goToDetails = (item: TrendingItem) => {
    const mediaType = item.title ? "movie" : "tv";
    router.push(`/results/details?id=${item.id}&media_type=${mediaType}`);
  };

  if (!isAuthed) return null;

  return (
    <div style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <Card
          title="Trending Now"
          style={{ marginBottom: 24 }}
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto", padding: 16 }}
        >
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 50 }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "red" }}>{error}</p>
              <Button
                type="primary"
                style={buttonPrimaryStyle}
                onClick={fetchTrending}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {data.map((item) => {
                const inList = isInWatchlist(item.id);
                return (
                  <Card
                    key={item.id}
                    hoverable
                    style={{ width: 200 }}
                    cover={
                      item.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                          alt={item.title ?? item.name ?? "Poster"}
                          width={200}
                          height={300}
                          style={{
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => goToDetails(item)}
                        />
                      ) : null
                    }
                  >
                    <Card.Meta
                      title={item.title || item.name}
                    />
                    <div style={descriptionStyle}>
                      {(item.overview || "").padEnd(200, " ").slice(0, 200)}
                    </div>
                    <Space
                      direction="vertical"
                      align="start"
                      style={{ width: "100%", marginTop: 8 }}
                    >
                      <Button
                        type="primary"
                        style={buttonPrimaryStyle}
                        onClick={() => goToDetails(item)}
                      >
                        View Details
                      </Button>
                      {inList ? (
                        <Button
                          type="primary"
                          style={buttonDangerStyle}
                          onClick={() => handleRemove(item)}
                        >
                          Remove from Watchlist
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          style={buttonPrimaryStyle}
                          onClick={() => handleAdd(item)}
                        >
                          Add to Watchlist
                        </Button>
                      )}
                    </Space>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
