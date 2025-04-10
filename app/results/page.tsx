"use client";

import React, { useEffect, useState, CSSProperties, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Table, Button, message, Input, Space, Select, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
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
  fontSize: "1.25rem",
  color: "#000",
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
};

const tableStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
};

interface ApiResponse {
  results: SearchResult[];
  totalCount: number;
}

const ResultsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiService = useApi();

  const initialQuery = searchParams.get("query") || "";
  const initialSort = searchParams.get("sort") || "popularity";

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [onlyCompleteResults, setOnlyCompleteResults] = useState<boolean>(false);

  const { value: userId } = useLocalStorage<number>("userId", 0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const fetchWatchlist = async () => {
    try {
      if (!userId) return;
      const res = await apiService.get(`/users/${userId}/watchlist`);
      if (Array.isArray(res)) {
        setWatchlist(res);
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [userId]);

  const isInWatchlist = (id: number) => {
    return watchlist.some((entry) => {
      try {
        const parsed = JSON.parse(entry);
        return parsed.movieId === id.toString();
      } catch {
        return false;
      }
    });
  };

  const handleAddToWatchlist = async (record: SearchResult) => {
    try {
      if (!userId) throw new Error("No userId in local storage");
      const body = {
        movieId: record.id.toString(),
        title: record.media_type === "tv" ? record.name : record.title,
        posterPath: record.poster_path ?? "",
      };
      await apiService.post(`/users/${userId}/watchlist`, body);
      message.success("Added to Watchlist");
      fetchWatchlist();
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      message.error("Could not add to Watchlist.");
    }
  };

  const handleRemoveFromWatchlist = async (record: SearchResult) => {
    try {
      if (!userId) throw new Error("No userId in local storage");
      await apiService.delete(`/users/${userId}/watchlist/${record.id}`);
      message.success("Removed from Watchlist");
      fetchWatchlist();
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      message.error("Could not remove from Watchlist.");
    }
  };

  const columns = [
    {
      title: <span style={{ color: "#000" }}>Poster</span>,
      dataIndex: "poster_path",
      key: "poster",
      width: 100,
      render: (posterPath: string) => {
        if (!posterPath) return <span style={{ color: "#000" }}>No Poster</span>;
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
              router.push(`/results/details?id=${record.id}&media_type=${record.media_type}`)
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
        const releaseDate = record.media_type === "tv" ? record.first_air_date : record.release_date;
        return <span style={{ whiteSpace: "nowrap", color: "#000" }}>{releaseDate}</span>;
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
      width: 180,
      render: (_: unknown, record: SearchResult) => {
        const inList = isInWatchlist(record.id);
        return (
          <Button
            onClick={() =>
              inList ? handleRemoveFromWatchlist(record) : handleAddToWatchlist(record)
            }
            style={{
              backgroundColor: inList ? "#ff4d4f" : "#007BFF",
              color: "white",
              borderColor: inList ? "#ff4d4f" : "#007BFF",
            }}
          >
            {inList ? "Remove from Watchlist" : "Add to Watchlist"}
          </Button>
        );
      },
    },
  ];

  const fetchData = useCallback(
    async (page: number, size: number) => {
      if (initialQuery.trim().length === 0) {
        setResults([]);
        setTotalItems(0);
        return;
      }
      setLoading(true);
      try {
        const url = `/api/movies/search?query=${encodeURIComponent(initialQuery)}&page=${page}&pageSize=${size}&sort=${encodeURIComponent(sortOption)}`;
        const response = await apiService.get(url);
        const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
        let fetchedResults = (parsedResponse as ApiResponse).results || [];
        const totalCount = (parsedResponse as ApiResponse).totalCount || 0;

        if (onlyCompleteResults) {
          fetchedResults = fetchedResults.filter((r) =>
            r.poster_path && (r.release_date || r.first_air_date) && r.overview
          );
        }

        setResults(fetchedResults);
        setTotalItems(totalCount);
      } catch {
        message.error("Error fetching search results. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [initialQuery, sortOption, onlyCompleteResults, apiService]
  );

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [fetchData, currentPage, pageSize]);

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/results?query=${encodeURIComponent(searchQuery)}&sort=${encodeURIComponent(sortOption)}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    router.push(`/results?query=${encodeURIComponent(searchQuery)}&sort=${encodeURIComponent(value)}`);
  };

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={headingStyle}>Search Results for &quot{initialQuery}&quot</div>
            <Button style={buttonStyle} onClick={() => router.push("/users")}>
              Back to Dashboard
            </Button>
          </div>
          <Space style={{ display: "flex", marginBottom: 20, flexWrap: "wrap" }} size="large">
            <Input
              placeholder="Search for Movies & TV Shows"
              value={searchQuery}
              onChange={handleSearchChange}
              onPressEnter={handleSearchClick}
              style={{ width: 300 }}
              suffix={<Button type="primary" icon={<SearchOutlined />} onClick={handleSearchClick} />}
            />
            <Select value={sortOption} onChange={handleSortChange} style={{ minWidth: 180 }}>
              <Select.Option value="popularity">Sort by Popularity</Select.Option>
              <Select.Option value="rating">Sort by Rating</Select.Option>
              <Select.Option value="newest">Sort by Newest</Select.Option>
              <Select.Option value="oldest">Sort by Oldest</Select.Option>
            </Select>
            <Checkbox
              checked={onlyCompleteResults}
              onChange={(e) => setOnlyCompleteResults(e.target.checked)}
              style={{ marginTop: "4px" }}
            >
              Complete Results Only
            </Checkbox>
          </Space>
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
