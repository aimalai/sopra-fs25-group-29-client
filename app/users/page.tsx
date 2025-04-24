"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, message, Input, Space, Spin } from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import Image from "next/image";
import type { SortOrder } from 'antd/es/table/interface';
import { Select } from "antd";

interface Movie {
  movieId: string;
  posterPath?: string;
  title?: string;
  addedOn?: string;
}

interface TrendingItem {
  id: number;
  poster_path?: string;
  title?: string;
  name?: string;
  overview?: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [friendQuery, setFriendQuery] = useState("");
  const [friendResults, setFriendResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [friendWatchlist, setFriendWatchlist] = useState<Movie[]>([]);


  const { value: userId } = useLocalStorage<number>("userId", 0);

  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState<boolean>(false);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  const fetchTrending = async () => {
    setTrendingLoading(true);
    setTrendingError(null);
    try {
      const res = await apiService.get("/api/movies/trending");
      const data = typeof res === "string" ? JSON.parse(res) : res;
      setTrending(data.results || []);
    } catch (error) {
      console.error("Error fetching trending", error);
      setTrendingError("Failed to load trending content.");
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
    const interval = setInterval(fetchTrending, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      loadWatchlist();
      loadFriends();
      loadFriendRequests();
    }
  }, [apiService, userId]);

  useEffect(() => {
    const timeout = setTimeout(searchFriends, 300);
    return () => clearTimeout(timeout);
  }, [friendQuery]);

  useEffect(() => {
    const interval = setInterval(searchFriends, 5000);
    return () => clearInterval(interval);
  }, [friendQuery]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      loadFriends();
      loadFriendRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [apiService, userId]);

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
      setWatchlistMovies(parsedItems as Movie[]);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const searchFriends = async () => {
    const q = friendQuery.trim().toLowerCase();
    try {
      const all = await apiService.get<User[]>("/users");
      if (!q) {
        setFriendResults(all);
      } else {
        setFriendResults(
          all.filter((u) =>
            (u.username?.toLowerCase().includes(q) ?? false) ||
            (u.email?.toLowerCase().includes(q) ?? false)
          )
        );
      }
    } catch {
      message.error("Error searching for friends. Please try again.");
    }
  };

  const handleRemove = async (movieId: string) => {
    try {
      await apiService.delete(`/users/${userId}/watchlist/${movieId}`);
      loadWatchlist();
    } catch {
      message.error("Could not remove movie from watchlist.");
    }
  };

  const loadFriends = async () => {
    try {
      const friendsData = await apiService.get<User[]>(`/users/${userId}/friends`);
      setFriends(friendsData);
    } catch {
      message.error("Could not load your friend list");
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requestIds = await apiService.get<(number | string)[]>(`/users/${userId}/friendrequests`);
      const requestsData = await Promise.all(
        requestIds.map((id) => apiService.get<User>(`/users/${id}`))
      );
      setFriendRequests(requestsData);
    } catch {
      message.error("Could not load friend requests");
    }
  };

  const acceptRequest = async (fromUserId: number | string) => {
    try {
      await apiService.put(`/users/${userId}/friendrequests/${fromUserId}/accept`, {});
      loadFriendRequests();
      loadFriends();
    } catch {
      message.error("Could not accept friend request");
    }
  };

  const declineRequest = async (fromUserId: number | string) => {
    try {
      await apiService.delete(`/users/${userId}/friendrequests/${fromUserId}`);
      loadFriendRequests();
    } catch {
      message.error("Could not decline friend request");
    }
  };

  const loadFriendWatchlist = async (friendId: number) => {
    try {
      const all = await apiService.get<{
        friendId: number;
        username: string;
        watchlist: string[];
      }[]>(`/users/${userId}/friends/watchlists`);
      const dto = all.find((f) => f.friendId === friendId);
      if (dto) {
        const movies = dto.watchlist
          .map((item) => {
            try { return JSON.parse(item); } 
            catch { return null; }
          })
          .filter((m): m is Movie => m !== null);
        setFriendWatchlist(movies);
      } else {
        setFriendWatchlist([]);
      }
    } catch {
      message.error("Could not load friend's watchlist.");
      setFriendWatchlist([]);
    }
  };

  const watchlistColumns = [
    {
      title: "Poster",
      dataIndex: "posterPath",
      key: "poster",
      width: 100,
      render: (posterPath?: string) => {
        if (!posterPath) return <span>No Poster</span>;
        return (
          <Image
            src={`https://image.tmdb.org/t/p/w200${posterPath}`}
            alt="Poster"
            width={60}
            height={90}
            style={{ borderRadius: "4px" }}
          />
        );
      },
    },
    {
      title: "Title",
      key: "title",
      render: (_: unknown, record: Movie) => (
        <a
          onClick={() => router.push(`/results/details?id=${record.movieId}&media_type=movie`)}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          {record.title ?? ""}
        </a>
      ),
    },
    {
      title: "Added On",
      dataIndex: "addedOn",
      key: "addedOn",
      sorter: (a: Movie, b: Movie) =>
        new Date(a.addedOn!).getTime() - new Date(b.addedOn!).getTime(),
      sortDirections: ['descend', 'ascend'] as SortOrder[],
      render: (addedOn?: string) =>
        addedOn ? new Date(addedOn).toLocaleDateString() : "",
    },

    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Movie) => (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            type="primary"
            size="small"
            onClick={() => router.push(`/results/details?id=${record.movieId}&media_type=movie`)}
          >
            Details
          </Button>
          <DeleteOutlined
            onClick={() => handleRemove(record.movieId)}
            style={{ color: "#ff4d4f", cursor: "pointer" }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", paddingTop: "100px" }}>
      <div style={{ position: "relative" }}>
        <div
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
      </div>

      <div
        style={{
          display: "flex",
          gap: "32px",
          justifyContent: "center",
          marginTop: "60px",
          maxWidth: "1600px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 calc((100% - 32px)/2)",
            minWidth: "300px",
            gap: "32px",
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              title="Trending Now"
              style={{
                width: '100%',
                maxWidth: '1200px',
                maxHeight: '600px',
                overflow: 'hidden'
              }}
            >
              {trendingLoading ? (
                <Spin />
              ) : trendingError ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'red' }}>{trendingError}</p>
                  <Button onClick={fetchTrending}>Retry</Button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: "column",
                    maxHeight: '250px',
                    overflowY: 'auto',
                    padding: '8px',
                    gap: '24px'
                  }}
                >
                  {trending.map(item => (
                    <div
                      key={item.id}
                      style={{
                        flex: '0 0 auto',
                        display: 'flex',
                        marginRight: '16px',
                        minWidth: '300px',
                        background: '#fff',
                        borderRadius: '4px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      {item.poster_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                          alt=""
                          width={100}
                          height={150}
                          style={{ objectFit: 'cover', flexShrink: 0 }}
                        />
                      )}
                      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.title || item.name}</h4>
                        <p style={{ marginTop: '4px', fontSize: '0.9rem', color: '#555', whiteSpace: 'normal' }}>
                          {item.overview || 'No description'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card title="Search for Users">
            <div style={{ marginBottom: 10, display: "flex" }}>
              <Input
                placeholder="Search for new friends ..."
                value={friendQuery}
                onChange={(e) => setFriendQuery(e.target.value)}
                style={{ flex: 1, marginRight: 5 }}
              />
            </div>
            <Table
              dataSource={friendResults}
              rowKey="id"
              columns={[
                {
                  title: "Username",
                  key: "username",
                  render: (_, record) => (
                    <a
                      onClick={() => router.push(`/users/${record.id}`)}
                      style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
                    >
                      {record.username ?? ""}
                    </a>
                  ),
                },
                {
                  title: "Email",
                  dataIndex: "email",
                  key: "email",
                  render: (email) => email ?? "",
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status: string) => (status === "ONLINE" ? "🟢 Online" : "🔴 Offline"),
                },
                {
                  title: "Actions",
                  key: "details",
                  render: (_, record) => (
                    <Button type="primary" onClick={() => router.push(`/users/${record.id}`)}>
                      Details
                    </Button>
                  ),
                },
              ]}
            />
          </Card>

          <Card title="Friendlist">
            <Table<User>
              dataSource={friends}
              rowKey="id"
              columns={[
                {
                  title: "Username",
                  key: "username",
                  render: (_, record) => (
                    <a
                      onClick={() => router.push(`/users/${record.id}`)}
                      style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
                    >
                      {record.username ?? ""}
                    </a>
                  ),
                },
                {
                  title: "Email",
                  dataIndex: "email",
                  key: "email",
                  render: (email) => email ?? "",
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status: string) => (status === "ONLINE" ? "🟢 Online" : "🔴 Offline"),
                },
                {
                  title: "Actions",
                  key: "details",
                  render: (_, record) => (
                    <Button type="primary" onClick={() => router.push(`/users/${record.id}`)}>
                      Details
                    </Button>
                  ),
                },
              ]}
            />
            <div>
              <hr style={{ margin: "16px 0" }} />
              <p style={{ fontWeight: 'bold' }}>Incoming Friend Requests:</p>
              {friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <a
                      onClick={() => router.push(`/users/${request.id}`)}
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                        marginRight: "8px",
                      }}
                    >
                      {request.username ?? ""}
                    </a>
                    <div>
                      <Button
                        type="primary"
                        onClick={() => acceptRequest(request.id!)}
                        style={{ marginRight: 8 }}
                      >
                        Accept
                      </Button>
                      <Button
                        type="primary"
                        danger
                        onClick={() => declineRequest(request.id!)}
                        style={{ marginRight: 8 }}
                      >
                        Decline
                      </Button>
                      <Button
                        type="default"
                        onClick={() => router.push(`/users/${request.id}`)
                      }
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No incoming requests</p>
              )}
            </div>
          </Card>
        </div>

        <Card
          title="Your Watchlist"
          style={{
            flex: "1 1 calc((100% - 32px)/2)",
            minWidth: "300px",
          }}
        >
          { }

          { }
          {loadingWatchlist ? (
            <Spin />
          ) : (
            <Table
              columns={watchlistColumns}
              dataSource={selectedFriendId ? friendWatchlist : watchlistMovies}
              rowKey="movieId"
              pagination={false}
              scroll={{ y: 600 }}
              locale={{
                emptyText: selectedFriendId
                  ? "No movies or series in friend&apos;s watchlist"
                  : "No movies or series in your watchlist",
              }}
            />
          )}
          <br />
          <strong style={{ marginRight: 8 }}>
           {"Want to view your Friend's Watchlist? 👀"}
          </strong>
          <div style={{ marginBottom: 16, marginTop: 16, display: "flex", alignItems: "center" }}>
          <strong style={{ marginRight: 8 }}>
              {"Friend’s Watchlist:"}
            </strong>
            <Select<number | null>
              style={{ width: 200 }}
              placeholder="Select friend…"
              value={selectedFriendId}
              onChange={(id) => {
                setSelectedFriendId(id);
                if (id) loadFriendWatchlist(id);
              }}
              allowClear
            >
              {friends.map((f) => (
                <Select.Option key={f.id} value={f.id}>
                  {f.username}
                </Select.Option>
              ))}
            </Select>
          </div>

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
