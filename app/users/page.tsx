"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, message, Input, Space, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import Image from "next/image";

const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Creation Date",
    dataIndex: "creationDate",
    key: "creationDate",
  },
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
];

// Minimal interface for movies in the watchlist.
interface Movie {
  id: number;
  poster_path?: string;
  title?: string;
  release_date?: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: userId, clear: clearUserId } = useLocalStorage<number>("userId", 0);

  useEffect(() => {
    const directToken = localStorage.getItem("token");
    if (!directToken) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers: User[] = await apiService.get<User[]>("/users");
        setUsers(fetchedUsers);
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error("Error fetching users: " + error.message);
        } else {
          message.error("Error fetching users: An unknown error occurred.");
        }
      }
    };

    fetchUsers();
  }, [apiService]);

  useEffect(() => {
    const fetchWatchlistMovies = async () => {
      if (!userId) return;
      setLoadingWatchlist(true);
      try {
        const movieIds: string[] = await apiService.get(`/users/${userId}/watchlist`);
        const promises = movieIds.map(async (movieId) => {
          try {
            const response = await apiService.get(`/api/movies/details?id=${movieId}`);
            const movie = typeof response === "string" ? JSON.parse(response) : response;
            return movie;
          } catch (error) {
            console.error("Error fetching details for movie id", movieId, error);
            return null;
          }
        });
        const movies = await Promise.all(promises);
        setWatchlistMovies(movies.filter((m) => m !== null));
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoadingWatchlist(false);
      }
    };

    fetchWatchlistMovies();
  }, [apiService, userId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await apiService.put(`/users/${userId}/logout`, {});
      message.success("Logout Successful: You have been logged out successfully.");
      clearToken();
      clearUserId();
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error("Logout Failed: " + error.message);
      } else {
        message.error("Logout Failed: An unknown error occurred during logout.");
      }
    }
  };

  const watchlistColumns = [
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
          <Image
            src={`https://image.tmdb.org/t/p/w200${posterPath}`}
            alt="Poster"
            style={{ width: "60px", height: "auto", borderRadius: "4px" }}
            width={60}
            height={90}
          />
        );
      },
    },
    {
      title: "Title",
      key: "title",
      render: (_: unknown, record: Movie) => (
        <a onClick={() => router.push(`/results/details?id=${record.id}&media_type=movie`)}>
          {record.title}
        </a>
      ),
    },
    {
      title: "Release Date",
      key: "release_date",
      width: 120,
      render: (_: unknown, record: Movie) => (
        <span style={{ whiteSpace: "nowrap" }}>{record.release_date}</span>
      ),
    },
  ];

  return (
    <div className="dashboard-wrapper" style={{ padding: "20px" }}>
      <div style={{ position: "relative" }}>
        <div
          className="search-container"
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px auto",
            marginTop: "40px",
          }}
        >
          <Space>
            <Input
              placeholder="Search for Movies & TV Shows"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ width: "400px" }}
              suffix={
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearchClick}
                  style={{ marginLeft: 10 }}
                />
              }
            />
          </Space>
        </div>
        <Button
          type="default"
          onClick={() => router.push("/profile")}
          style={{ position: "absolute", right: "20px", top: "50px" }}
        >
          Profile
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginTop: "60px",
        }}
      >
        <Card
          title="Get all users from secure endpoint:"
          loading={!users}
          className="dashboard-container"
          style={{ flex: "1 1 300px", maxWidth: "350px" }}
        >
          {users && (
            <>
              <Table<User>
                columns={columns}
                dataSource={users}
                rowKey="id"
                onRow={(row) => ({
                  onClick: () => router.push(`/users/${row.id}`),
                  style: { cursor: "pointer" },
                })}
              />
              <Button onClick={handleLogout} type="primary" style={{ marginTop: "20px" }}>
                Logout
              </Button>
            </>
          )}
        </Card>

        <Card
          title="Friends Overview"
          className="dashboard-container"
          style={{ flex: "1 1 300px", maxWidth: "350px" }}
        >
          <Table
            dataSource={[]}
            columns={[
              {
                title: "Friend Name",
                dataIndex: "name",
                key: "name",
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
              },
            ]}
            locale={{ emptyText: "No friends to display" }}
            pagination={false}
          />
        </Card>

        <Card
          title="Your Watchlist"
          className="dashboard-container"
          style={{ flex: "1 1 300px", maxWidth: "350px" }}
        >
          {loadingWatchlist ? (
            <Spin />
          ) : watchlistMovies && watchlistMovies.length > 0 ? (
            <Table
              columns={watchlistColumns}
              dataSource={watchlistMovies}
              rowKey="id"
              pagination={false}
            />
          ) : (
            <p>No movies in watchlist</p>
          )}
        </Card>
      </div>
      <Button
        type="primary"
        onClick={() => router.push("/watchparty")}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        Create Watchparty
      </Button>
    </div>
  );
};

export default Dashboard;
