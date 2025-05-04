"use client";

import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Card, Spin, Button } from "antd";
import Image from "next/image";

interface TrendingItem {
  id: number;
  poster_path?: string;
  title?: string;
  name?: string;
  overview?: string;
}

export default function TrendingPage() {
  const api = useApi();
  const [data, setData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const fetch = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get("/api/movies/trending");
      const body = typeof res==="string"? JSON.parse(res): res;
      setData(body.results || []);
    } catch {
      setError("Failed to load trending.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div style={{ padding: 24, paddingTop: 100, maxWidth: 1200, margin: "0 auto" }}>
      <Card title="Trending Now" style={{ marginBottom: 24 }}>
        {loading ? (
          <Spin />
        ) : error ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "red" }}>{error}</p>
            <Button onClick={fetch}>Retry</Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {data.map(item => (
              <Card
                key={item.id}
                hoverable
                cover={
                  item.poster_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                      alt=""
                      width={200} height={300}
                      style={{ objectFit: "cover" }}
                    />
                  )
                }
                style={{ width: 200 }}
              >
                <Card.Meta
                  title={item.title||item.name}
                  description={item.overview?.slice(0, 80) + "..."}
                />
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
