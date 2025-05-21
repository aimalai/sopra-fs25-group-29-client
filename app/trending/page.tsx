"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Card, Spin, Button } from "antd";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";

interface TrendingItem {
  id: number;
  poster_path?: string;
  title?: string;
  name?: string;
  overview?: string;
  media_type: "movie" | "tv";
}

export default function TrendingPage() {
  const isAuthed = useAuth();
  const api = useApi();
  const router = useRouter();
  const [data, setData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const fetchTrending = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get("/api/movies/trending");
      const body = typeof res==="string"? JSON.parse(res): res;
      setData(body.results as TrendingItem[]);
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
    router.push(`/results/details?id=${item.id}&media_type=${item.media_type}`);
  };

  if (!isAuthed) return null;

  return (
    <div style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <Card
          title="Trending Now"
          style={{ marginBottom: 24 }}
          bodyStyle={{
            maxHeight: "70vh",
            overflowY: "auto",
            padding: 16,
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 50 }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "red" }}>{error}</p>
              <Button onClick={fetchTrending}>Retry</Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {data.map(item => (
                <Card
                  key={item.id}
                  hoverable
                  onClick={() => goToDetails(item)}
                  style={{ width: 200, cursor: "pointer" }}
                  cover={
                    item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                        alt={item.title ?? item.name ?? "Poster"}
                        width={200}
                        height={300}
                        style={{ objectFit: "cover" }}
                      />
                    ) : null
                  }
                >
                  <Card.Meta
                    title={item.title || item.name}
                    description={(item.overview || "").slice(0, 80) + "..."}
                  />
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}