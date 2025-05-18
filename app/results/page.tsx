"use client";

import React, { useEffect, useState, CSSProperties, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Table, Button, message, Input, Space, Select, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import useAuth from "@/hooks/useAuth";

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
  minHeight: "100vh",
  paddingTop: "100px",
};

const contentStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  padding: "20px",
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
  fontSize: "1.25rem",
  color: "#000",
};

const buttonPrimaryStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  borderColor: "#007BFF",
};

const buttonDangerStyle: CSSProperties = {
  backgroundColor: "#ff4d4f",
  color: "#ffffff",
  borderColor: "#ff4d4f",
};

const tableContainerStyle: CSSProperties = {
  overflowX: "auto",
};

interface ApiResponse {
  results: SearchResult[];
  totalCount: number;
}

const ResultsPage: React.FC = () => {
  const isAuthed = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiService = useApi();
  const [userId] = useSessionStorage<number>("userId", 0);

  const initialQuery = searchParams.get("query") || "";
  const initialSort = searchParams.get("sort") || "popularity";

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [onlyCompleteResults, setOnlyCompleteResults] = useState<boolean>(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mobileScroll, setMobileScroll] = useState(false);

  useEffect(() => {
    const check = () => setMobileScroll(window.innerWidth <= 430);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!userId) return;
      try {
        const res = await apiService.get<string[]>(`/users/${userId}/watchlist`);
        if (Array.isArray(res)) setWatchlist(res);
      } catch {
        console.error("Failed to load watchlist");
      }
    };
    fetchWatchlist();
  }, [userId, apiService]);

  const isInWatchlist = (id: number) =>
    watchlist.some((entry) => {
      try {
        return JSON.parse(entry).movieId === id.toString();
      } catch {
        return false;
      }
    });

  const handleAddToWatchlist = async (record: SearchResult) => {
    if (!userId) return;
    try {
      await apiService.post(`/users/${userId}/watchlist`, {
        movieId: record.id.toString(),
        title: record.media_type === "tv" ? record.name : record.title,
        posterPath: record.poster_path || "",
      });
      message.success("Added to Watchlist");
      const res = await apiService.get<string[]>(`/users/${userId}/watchlist`);
      if (Array.isArray(res)) setWatchlist(res);
    } catch {
      message.error("Could not add to Watchlist.");
    }
  };

  const handleRemoveFromWatchlist = async (record: SearchResult) => {
    if (!userId) return;
    try {
      await apiService.delete(`/users/${userId}/watchlist/${record.id}`);
      message.success("Removed from Watchlist");
      const res = await apiService.get<string[]>(`/users/${userId}/watchlist`);
      if (Array.isArray(res)) setWatchlist(res);
    } catch {
      message.error("Could not remove from Watchlist.");
    }
  };

  const columns: ColumnsType<SearchResult> = [
    {
      title: "Poster",
      dataIndex: "poster_path",
      key: "poster",
      width: 100,
      render: (poster: string) =>
        poster ? (
          <Image
            src={`https://image.tmdb.org/t/p/w200${poster}`}
            alt="Poster"
            width={60}
            height={90}
            style={{ borderRadius: 4 }}
          />
        ) : (
          <span>No Poster</span>
        ),
    },
    {
      title: "Title",
      key: "title",
      render: (_: unknown, record: SearchResult) => (
        <a
          style={{ color: "blue" }}
          onClick={(e) => { e.stopPropagation(); router.push(
            `/results/details?id=${record.id}&media_type=${record.media_type}`
          ) }}
        >
          {record.media_type === "tv" ? record.name : record.title}
        </a>
      ),
    },
    {
      title: "Release Date",
      key: "release_date",
      width: 120,
      responsive: ["md"] as const,
      render: (_: unknown, record: SearchResult) => (
        <span>
          {record.media_type === "tv"
            ? record.first_air_date
            : record.release_date}
        </span>
      ),
    },
    {
      title: "Overview",
      dataIndex: "overview",
      key: "overview",
      responsive: ["md"] as const,
      render: (overview: string) => (
        <div style={{ height: 100, overflowY: 'auto' }}>
          <span>{overview}</span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: SearchResult) => {
        const inList = isInWatchlist(record.id);
        return (
          <Space className="actions-space" size="small">
            <Button
              style={inList ? buttonDangerStyle : buttonPrimaryStyle}
              onClick={(e) => { e.stopPropagation();
                inList
                  ? handleRemoveFromWatchlist(record)
                  : handleAddToWatchlist(record);
              }}
            >
              {inList ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
            <Button
              style={buttonPrimaryStyle}
              onClick={(e) => { e.stopPropagation(); router.push(
                `/results/details?id=${record.id}&media_type=${record.media_type}`
              ) }}
            >
              View Details
            </Button>
          </Space>
        );
      },
    },
  ];

  const fetchData = useCallback(
    async (page: number, size: number) => {
      if (!initialQuery.trim()) {
        setResults([]);
        setTotalItems(0);
        return;
      }
      setLoading(true);
      try {
        const url = `/api/movies/search?query=${encodeURIComponent(
          initialQuery
        )}&page=${page}&pageSize=${size}&sort=${encodeURIComponent(
          sortOption
        )}`;
        const resp = await apiService.get<ApiResponse>(url);
        let fetched = resp.results || [];
        if (onlyCompleteResults)
          fetched = fetched.filter((r) =>
            r.poster_path && (r.release_date || r.first_air_date) && r.overview
          );
        setResults(fetched);
        setTotalItems(resp.totalCount || 0);
      } catch {
        message.error("Error fetching search results.");
      } finally {
        setLoading(false);
      }
    },
    [initialQuery, sortOption, onlyCompleteResults, apiService]
  );

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [fetchData, currentPage, pageSize]);

  if (!isAuthed) return null;

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={boxStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={headingStyle}>Search Results for "{initialQuery}"</div>
            <Button style={buttonPrimaryStyle} onClick={() => router.push("/home")}>Back to Home</Button>
          </div>
          <Space size="large" style={{ display: "flex", flexWrap: "wrap", marginBottom: 20 }}>
            <Input
              placeholder="Search for Movies & TV Shows"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={() => router.push(`/results?query=${encodeURIComponent(searchQuery)}&sort=${encodeURIComponent(sortOption)}`)}
              style={{ width: 300 }}
              suffix={<Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={() => router.push(`/results?query=${encodeURIComponent(searchQuery)}&sort=${encodeURIComponent(sortOption)}`)} />}
            />
            <Select value={sortOption} onChange={(v) => { setSortOption(v); router.push(`/results?query=${encodeURIComponent(searchQuery)}&sort=${encodeURIComponent(v)}`); }} style={{ minWidth: 180 }}>
              <Select.Option value="popularity">Sort by Popularity</Select.Option>
              <Select.Option value="rating">Sort by Rating</Select.Option>
              <Select.Option value="newest">Sort by Newest</Select.Option>
              <Select.Option value="oldest">Sort by Oldest</Select.Option>
            </Select>
            <Checkbox checked={onlyCompleteResults} onChange={(e) => setOnlyCompleteResults(e.target.checked)} style={{ marginTop: 4 }}>
              Complete Results Only
            </Checkbox>
          </Space>
          <div style={tableContainerStyle}>
            <Table
              columns={columns}
              scroll={mobileScroll ? { x: "max-content" } : undefined}
              dataSource={results}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize,
                total: totalItems,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (p, s) => { setCurrentPage(p); if (s) setPageSize(s); }
              }}
              onRow={(record) => ({
                onClick: () => router.push(`/results/details?id=${record.id}&media_type=${record.media_type}`),
                style: { cursor: 'pointer' }
              })}
            />
          </div>
        </div>
      </div>
      <style jsx global>{`
        .actions-space {
          display: flex;
          gap: 8px;
        }
        @media (max-width: 768px) {
          .actions-space {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;