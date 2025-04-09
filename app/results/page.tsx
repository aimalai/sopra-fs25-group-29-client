"use client";

import React, { useEffect, useState, CSSProperties, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Table, Button, message } from "antd";
import { useApi } from "@/hooks/useApi";
import Image from "next/image";

interface SearchResult {
  id: number;
  poster_path?: string;
  media_type: string;
  name?: string;
  title?: string;
  first_air_date?: string;
  release_date?: string;
  overview?: string;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  backgroundColor: "#f2f2f2",
};

const topBarStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  padding: "16px",
  backgroundColor: "#e0e0e0",
};

const logoStyle: CSSProperties = {
  width: "150px",
  height: "auto",
};

const contentStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  padding: "20px",
  overflowY: "auto",
};

const boxStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "900px",
};

const headingStyle: CSSProperties = {
  fontWeight: "bold",
  marginBottom: "16px",
  fontSize: "1.25rem",
  color: "#000",
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  marginBottom: "20px",
};

const tableStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
};

const ResultsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiService = useApi();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);

  const handleAddToWatchlist = async (record: SearchResult) => {
    try {
      await apiService.post("/watchlist", {
        mediaId: record.id,
        mediaType: record.media_type,
      });
      message.success("Added to Watchlist");
    } catch {
      message.error("Could not add to Watchlist. Please try again.");
    }
  };

  const columns = [
    {
      title: <span style={{ color: "#000" }}>Poster</span>,
      dataIndex: "poster_path",
      key: "poster",
      width: 100,
      render: (posterPath: string) => {
        if (!posterPath) {
          return <span style={{ color: "#000" }}>No Poster</span>;
        }
        return (
          <Image
            src={`https://image.tmdb.org/t/p/w200${posterPath}`}
            alt="Poster"
            style={{ borderRadius: "4px" }}
            width={60}
            height={90}
          />
        );
      },
    },
    {
      title: <span style={{ color: "#000" }}>Title</span>,
      key: "title",
      render: (_: unknown, record: SearchResult) => {
        const title = record.media_type === "tv" ? record.name : record.title;
        return (
          <a
            style={{ color: "#000", cursor: "pointer" }}
            onClick={() =>
              router.push(
                `/results/details?id=${record.id}&media_type=${record.media_type}`
              )
            }
          >
            {title}
          </a>
        );
      },
    },
    {
      title: <span style={{ color: "#000" }}>Release Date</span>,
      key: "release_date",
      width: 120,
      render: (_: unknown, record: SearchResult) => {
        const releaseDate =
          record.media_type === "tv" ? record.first_air_date : record.release_date;
        return (
          <span style={{ whiteSpace: "nowrap", color: "#000" }}>
            {releaseDate}
          </span>
        );
      },
    },
    {
      title: <span style={{ color: "#000" }}>Overview</span>,
      dataIndex: "overview",
      key: "overview",
      render: (overview: string) => <span style={{ color: "#000" }}>{overview}</span>,
    },
    {
      title: <span style={{ color: "#000" }}>Actions</span>,
      key: "actions",
      width: 150,
      render: (_: unknown, record: SearchResult) => (
        <Button
          style={{ backgroundColor: "#007BFF", color: "#fff" }}
          onClick={() => handleAddToWatchlist(record)}
        >
          Add to Watchlist
        </Button>
      ),
    },
  ];

  const fetchData = useCallback(async (page: number, size: number) => {
    if (query.trim().length === 0) {
      setResults([]);
      setTotalItems(0);
      return;
    }
    setLoading(true);
    try {
      const response = await apiService.get(
        `/api/movies/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${size}`
      );
      const parsedResponse =
        typeof response === "string" ? JSON.parse(response) : response;
      setResults(parsedResponse.results || []);
      setTotalItems(parsedResponse.totalCount || 0);
    } catch {
      message.error("Error fetching search results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, apiService]);

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [fetchData, currentPage, pageSize]);

  const handleTableChange = (newPage: number, newPageSize: number) => {
    setCurrentPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <div style={containerStyle}>
      <div style={topBarStyle}>
        <Image src="/NiroLogo.png" alt="Logo" style={logoStyle} width={150} height={75} />
      </div>
      <div style={contentStyle}>
        <div style={boxStyle}>
          <div style={headingStyle}>Search Results for &quot;{query}&quot;</div>
          <Button style={buttonStyle} onClick={() => router.push("/users")}>
            Back to Dashboard
          </Button>
          <Table
            columns={columns}
            dataSource={results}
            rowKey="id"
            loading={loading}
            style={tableStyle}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
              onChange: handleTableChange,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
