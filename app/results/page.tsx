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
  const [results, setResults] = useState<any[]>([]);
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
      key: "title",
      render: (_: any, record: any) => {
        const title = record.media_type === "tv" ? record.name : record.title;
        return (
          <a onClick={() => router.push(`/results/details?id=${record.id}&media_type=${record.media_type}`)}>
            {title}
          </a>
        );
      },
    },
    {
      title: "Release Date",
      key: "release_date",
      width: 120,
      render: (_: any, record: any) => {
        const releaseDate = record.media_type === "tv" ? record.first_air_date : record.release_date;
        return <span style={{ whiteSpace: "nowrap" }}>{releaseDate}</span>;
      },
    },
    {
      title: "Overview",
      dataIndex: "overview",
      key: "overview",
    },
  ];

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) return;
      setLoading(true);
      try {
        const response = await apiService.get(`/api/movies/search?query=${encodeURIComponent(query)}`);
        const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
        setResults(parsedResponse.results || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        message.error("Error fetching search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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
          dataSource={results}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ResultsPage;
