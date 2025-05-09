"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import { Card, Spin, Button, Table, message } from "antd";
import Image from "next/image";

interface TrendingItem {
  id: number;
  poster_path?: string;
  title?: string;
  name?: string;
  overview?: string;
}

interface Movie {
  movieId: string;
  posterPath?: string;
  title?: string;
  addedOn?: string;
}

interface FriendWatchlistDTO {
  friendId: number;
  username: string;
  watchlist: Movie[];
}

export default function TrendingPage() {
  const api = useApi();
  const router = useRouter();
  const [userId] = useSessionStorage<number>("userId", 0);
  const [data, setData] = useState<TrendingItem[]>([]);
  const [friends, setFriends] = useState<{ id: number; username: string }[]>(
    []
  );
  const [friendsWatchlists, setFriendsWatchlists] = useState<
    FriendWatchlistDTO[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trending movies
  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/movies/trending");
      const body = typeof res === "string" ? JSON.parse(res) : res;
      setData(body.results || []);
    } catch {
      setError("Failed to load trending.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Fetch friends FIRST
  const fetchFriends = async () => {
    if (!userId) return;
    try {
      const friendsRes = await api.get<{ id: number; username: string }[]>(
        `/users/${userId}/friends`
      );
      setFriends(friendsRes);
      fetchFriendsWatchlists(friendsRes); // Now fetch watchlists AFTER friends are loaded
    } catch {
      message.error("Failed to load friends.");
    }
  };

  // Step 2: Fetch watchlists for each friend correctly
  const fetchFriendsWatchlists = async (
    friendsList: { id: number; username: string }[]
  ) => {
    if (!friendsList || friendsList.length === 0) return;

    try {
      const allWatchlists = await api.get<
        { friendId: number; watchlist: string[] | undefined }[]
      >(`/users/${userId}/friends/watchlists`);

      // Match correct friend IDs and ensure watchlist is always an array
      const formattedWatchlists: FriendWatchlistDTO[] = friendsList.map(
        (friend) => {
          const dto = allWatchlists.find((w) => w.friendId === friend.id);

          const parsedWatchlist = (dto?.watchlist ?? [])
            .map((w) => {
              try {
                return JSON.parse(w); // Convert string back to Movie object
              } catch {
                return null;
              }
            })
            .filter((x): x is Movie => x !== null); // Ensure proper typing

          return {
            friendId: friend.id,
            username: friend.username,
            watchlist: parsedWatchlist,
          };
        }
      );

      setFriendsWatchlists(formattedWatchlists);
    } catch {
      message.error("Failed to load friends' watchlists.");
    }
  };

  useEffect(() => {
    fetchTrending();
    fetchFriends();
  }, [userId]);

  return (
    <div style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        {/* Trending Now Section */}
        <Card
          title="Trending Now"
          style={{ marginBottom: 24 }}
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto", padding: 16 }}
        >
          {loading ? (
            <Spin />
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {data.map((item) => (
                <Card
                  key={item.id}
                  hoverable
                  onClick={() =>
                    router.push(
                      `/results/details?id=${item.id}&media_type=${
                        item.title ? "movie" : "tv"
                      }`
                    )
                  }
                  style={{ width: 200, cursor: "pointer" }}
                  cover={
                    item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                        alt={item.title ?? item.name ?? "Poster"}
                        width={200}
                        height={300}
                      />
                    ) : null
                  }
                >
                  <Card.Meta
                    title={item.title || item.name}
                    description={(item.overview || "").slice(0, 80) + "..."}
                  />
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Friends' Watchlists Section (Unified Table with Posters & Links) */}
        <Card
          title="Trending Movies Amongst Your Friends"
          style={{ marginBottom: 16 }}
        >
          <Table<Movie & { friendName: string }>
            dataSource={friendsWatchlists.flatMap((friend) =>
              friend.watchlist.map((movie) => ({
                ...movie,
                friendName: friend.username, // Add friend’s name for column display
              }))
            )}
            rowKey={(record) => `${record.friendName}-${record.movieId}`}
            pagination={false}
            locale={{ emptyText: "No movies added by friends." }}
            columns={[
              {
                title: "Friend's Name",
                dataIndex: "friendName",
                key: "friendName",
              },
              {
                title: "Movie",
                key: "movie",
                render: (
                  _: unknown,
                  record: Movie & { friendName: string }
                ) => (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {record.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${record.posterPath}`}
                        alt={record.title ?? "Movie Poster"}
                        width={50}
                        height={75}
                        style={{ borderRadius: 4 }}
                      />
                    ) : null}
                    <a
                      onClick={() =>
                        router.push(
                          `/results/details?id=${record.movieId}&media_type=movie`
                        )
                      }
                      style={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        color: "blue",
                      }}
                    >
                      {record.title}
                    </a>
                  </div>
                ),
              },
              {
                title: "Added On",
                dataIndex: "addedOn",
                key: "addedOn",
                responsive: ["md"],
                render: (timestamp: string) =>
                  new Date(timestamp).toLocaleString(),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
