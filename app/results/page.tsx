"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Table, Card, Button, message } from "antd";
import { useApi } from "@/hooks/useApi";

const ResultsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const router = useRouter();
  const apiService = useApi();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: "Poster",
      dataIndex: "poster_path",
      key: "poster",
      width: 100,
      render: (posterPath: string) => {
        if (!posterPath) {
          return <span>No Poster</span>;
        }
        return (
          <img
            src={`https://image.tmdb.org/t/p/w200${posterPath}`}
            alt="Poster"
            style={{ width: "60px", height: "auto", borderRadius: "4px" }}
          />
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <a onClick={() => router.push(`/results/details?id=${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: "Release Date",
      dataIndex: "release_date",
      key: "release_date",
      width: 120,
      render: (text: string) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
    },
    {
      title: "Overview",
      dataIndex: "overview",
      key: "overview",
    },
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      if (query.trim().length === 0) return;
      setLoading(true);
      try {
        const response = await apiService.get(`/api/movies/search?query=${encodeURIComponent(query)}`);
        const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
        setMovies(parsedResponse.results || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
        message.error("Error fetching movies. Please try again.");
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
