"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Table, Input, Button, Card } from "antd";

const columns = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Release Date",
    dataIndex: "release_date",
    key: "release_date",
  },
  {
    title: "Overview",
    dataIndex: "overview",
    key: "overview",
  },
];

const ResultsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const apiService = useApi();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMovies = async () => {
      if (query.trim().length === 0) return;
      setLoading(true);
      try {
        // Rufe den Such-Endpunkt des Backends auf
        const response = await apiService.get(`/api/movies/search?query=${encodeURIComponent(query)}`);
        const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
        setMovies(parsedResponse.results || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [query, apiService]);

  return (
    <div style={{ padding: "20px" }}>
      <Card title={`Search Results for "${query}"`}>
        <Button type="primary" onClick={() => router.push("/users")}>
          Back to Dashboard
        </Button>
        <Table
          style={{ marginTop: "20px" }}
          columns={columns}
          dataSource={movies}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ResultsPage;
