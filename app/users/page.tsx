"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, message, Input, Space, Spin } from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
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

interface Movie {
  movieId: string;
  posterPath?: string;
  title?: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [friendQuery, setFriendQuery] = useState("");
  const [friendResults, setFriendResults] = useState<User[]>([]);

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

  const loadWatchlist = async () => {
    if (!userId) return;
    setLoadingWatchlist(true);
    try {
      const items: string[] = await apiService.get(`/users/${userId}/watchlist`);
      const parsedItems = items
        .map((item) => {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        })
        .filter((x) => x && x.movieId);
      setWatchlistMovies(parsedItems);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
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

  const searchFriends = async () => {
    await apiService
      .get<User[]>(`/users?username=${encodeURIComponent(friendQuery)}`)
      .then((results) => {
        setFriendResults(results);
      })
      .catch(() => {
        message.error("Error searching for friends. Please try again.");
      });
  };

  const handleRemove = async (movieId: string) => {
    try {
      await apiService.delete(`/users/${userId}/watchlist/${movieId}`);
      message.success("Removed from Watchlist");
      loadWatchlist();
    } catch (error) {
      message.error("Could not remove movie from watchlist.");
      console.error("Remove failed:", error);
    }
  };

  const watchlistColumns = [
    {
      title: "Poster",
      dataIndex: "posterPath",
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a
            onClick={() => router.push(`/results/details?id=${record.movieId}&media_type=movie`)}
            style={{ marginRight: "10px" }}
          >
            {record.title}
          </a>
          <DeleteOutlined
            onClick={() => handleRemove(record.movieId)}
            style={{ color: "#ff4d4f", cursor: "pointer" }}
          />
        </div>
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
              onPressEnter={handleSearchClick}
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
          onClick={() => router.push(`/users/${userId}`)}
          style={{ position: "absolute", right: "20px", top: "50px" }}
        >
          👤 Profile
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
          title="Search for Users"
          className="dashboard-container"
          style={{ flex: "1 1 300px", maxWidth: "350px" }}
        >
          <div style={{ marginBottom: 10, display: "flex" }}>
            <Input
              placeholder="Search for new friends ..."
              value={friendQuery}
              onChange={(e) => setFriendQuery(e.target.value)}
              style={{ flex: 1, marginRight: 5 }}
            />
            <Button onClick={searchFriends}>Search</Button>
          </div>
          <Table
            dataSource={friendResults}
            rowKey="id"
            columns={[
              {
                title: "Username",
                dataIndex: "username",
                key: "username",
              },
              {
                title: "Birth Date",
                dataIndex: "birthday",
                key: "birthday",
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status: string) =>
                  status === "ONLINE" ? "🟢 Online" : "🔴 Offline",
              },
            ]}
            pagination={false}
            locale={{ emptyText: "No users found" }}
            onRow={(record) => ({
              onClick: () => router.push(`/users/${record.id}`),
            })}
          />
        </Card>

        <Card
          title="Friendlist"
          className="dashboard-container"
          style={{ flex: "1 1 300px", maxWidth: "350px" }}
        >
          <div>
            <Table
              dataSource={[]}
              rowKey="id"
              columns={[
                {
                  title: "Username",
                  dataIndex: "username",
                  key: "username",
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status: string) =>
                    status === "ONLINE" ? "🟢 Online" : "🔴 Offline",
                },
              ]}
              pagination={false}
              locale={{ emptyText: "No friends added yet" }}
            />
            <div>
              <hr style={{ margin: "16px 0" }} />
              <p>
                <strong>Incoming Friend Requests:</strong>
              </p>
              <p>No incoming requests</p>
            </div>
          </div>
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
              rowKey="movieId"
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
