"use client";

import { App as AntdApp } from "antd";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, message, Spin, Rate, Input, List, Grid } from "antd";
import { useApi } from "@/hooks/useApi";
import Image from "next/image";

interface MediaDetails {
  id: number;
  title: string;
  description: string;
  cast: string;
  ratings: number;
  vote_count: number;
  release_date: string;
  genre: string;
  poster_path: string;
}

interface UserRatingResponse {
  rating: number;
  comment?: string;
}

interface AggregatedRatingResponse {
  averageRating: number;
  totalRatings: number;
}

interface ChatRating {
  id: number;
  username: string;
  movieId: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

interface UserGetDTO {
  id: number;
  username: string;
}

const DetailsPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mediaType = searchParams.get("media_type") || "movie";
  const router = useRouter();
  const apiService = useApi();

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [aggregatedUserRating, setAggregatedUserRating] = useState<number | null>(null);
  const [currentTextComment, setCurrentTextComment] = useState<string>("");
  const [editCommentMode, setEditCommentMode] = useState<boolean>(false);
  const [textRating, setTextRating] = useState<string>("");
  const [chatRatings, setChatRatings] = useState<ChatRating[]>([]);

  const getCurrentUsername = async (): Promise<string | null> => {
    const userId = localStorage.getItem("userId");
    if (!userId) return null;
    try {
      const response = await apiService.get(`/users/${userId}`);
      const user: UserGetDTO = typeof response === "string" ? JSON.parse(response) : response;
      return user.username;
    } catch {
      return null;
    }
  };

  const fetchDetails = async () => {
    if (!id) {
      message.error("No ID provided.");
      return;
    }
    setLoading(true);
    setDetailsError(false);
    try {
      const response = await apiService.get(`/api/movies/details?id=${id}&media_type=${mediaType}`);
      const data = typeof response === "string" ? JSON.parse(response) : (response as MediaDetails);
      setDetails(data);
    } catch {
      setDetailsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const checkWatchlist = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId || !id) return;
        const watchlist = await apiService.get(`/users/${userId}/watchlist`);
        if (Array.isArray(watchlist)) {
          const exists = watchlist.some((entry: string) => {
            try {
              const obj = JSON.parse(entry);
              return obj.movieId === id;
            } catch {
              return false;
            }
          });
          setInWatchlist(exists);
        }
      } catch {}
    };
    const fetchUserRating = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId || !id) return;
        const response = await apiService.get(`/api/users/${userId}/ratings?movieId=${id}`) as UserRatingResponse;
        setUserRating(response.rating);
        if (response.comment) setCurrentTextComment(response.comment);
      } catch {}
    };
    const fetchAggregatedUserRating = async () => {
      try {
        const response = await apiService.get(`/api/movies/${id}/userRatings`) as AggregatedRatingResponse;
        setAggregatedUserRating(response.averageRating);
      } catch {}
    };
    const fetchChatRatings = async () => {
      try {
        const response = await apiService.get(`/api/movies/${id}/ratings`);
        setChatRatings(Array.isArray(response) ? response : []);
      } catch {}
    };
    checkWatchlist();
    fetchUserRating();
    fetchAggregatedUserRating();
    fetchChatRatings();
  }, [id, mediaType, apiService]);

  const handleAdd = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error();
      await apiService.post(`/users/${userId}/watchlist`, {
        movieId: details!.id.toString(),
        title: details!.title,
        posterPath: details!.poster_path ?? "",
      });
      setInWatchlist(true);
    } catch {
      message.error("Error adding to Watchlist.");
    }
  };

  const handleRemove = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error();
      await apiService.delete(`/users/${userId}/watchlist/${details!.id}`);
      setInWatchlist(false);
    } catch {
      message.error("Error removing from Watchlist.");
    }
  };

  const handleUserRatingChange = async (value: number) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !id) throw new Error();
      const username = await getCurrentUsername();
      if (!username) {
        message.error("Please log in to submit your review.");
        return;
      }
      setUserRating(value);
      await apiService.post(`/api/users/${userId}/ratings`, { movieId: id, rating: value, username });
      const agg = await apiService.get(`/api/movies/${id}/userRatings`) as AggregatedRatingResponse;
      setAggregatedUserRating(agg.averageRating);
    } catch {
      message.error("Error updating rating.");
    }
  };

  const handleSubmitTextRating = async () => {
    if (textRating.length > 200) {
      message.error("Max 200 characters.");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !id) throw new Error();
      const username = await getCurrentUsername();
      if (!username) {
        message.error("Please log in to submit your review.");
        return;
      }
      await apiService.post(`/api/users/${userId}/ratings`, {
        movieId: id,
        rating: userRating,
        comment: textRating,
        username,
      });
      setCurrentTextComment(textRating);
      setEditCommentMode(false);
      const updated = await apiService.get(`/api/movies/${id}/ratings`);
      setChatRatings(Array.isArray(updated) ? updated : []);
    } catch {
      message.error("Error submitting review.");
    }
  };

  const reviewChat = chatRatings.filter((r) => r.comment && r.comment.trim());

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (detailsError) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "black" }}>
        <p>Error loading details.</p>
        <Button type="primary" onClick={fetchDetails}>
          Retry
        </Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "black" }}>
        <p>No details available.</p>
        <Button type="primary" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    );
  }

  const ratingOutOfFive = (details.ratings / 2).toFixed(1);

  return (
    <AntdApp>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 100 }}>
        <div style={{ marginTop: 60, width: screens.lg ? "80%" : "90%", maxWidth: 800 }}>
          <Card
            title={`Detailed View for "${details.title}"`}
            headStyle={{ color: "black" }}
            extra={
              <Button onClick={() => router.back()} style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", color: "white" }}>
                Back
              </Button>
            }
            style={{ backgroundColor: "#ddd", border: "1px solid #bbb" }}
          >
            <div style={{ backgroundColor: "#ccc", padding: "20px", borderRadius: "4px", display: "flex", gap: "20px", flexDirection: screens.lg ? "row" : "column", alignItems: screens.lg ? "flex-start" : "center",}}>
              {details.poster_path && (
                <div style={{ flex: "0 0 200px" }}>
                  <Image alt="Poster" src={`https://image.tmdb.org/t/p/w200${details.poster_path}`} width={200} height={300} style={{ borderRadius: 4, width: "100%", height: "auto" }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <p><strong>Release Date:</strong> {details.release_date}</p>
                  <p><strong>Genre:</strong> {details.genre}</p>
                  <p><strong>Cast:</strong> {details.cast}</p>
                  <p><strong>Description:</strong></p>
                  <p>{details.description}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>TMDB Rating:</span>
                    <Rate disabled allowHalf defaultValue={Number(ratingOutOfFive)} style={{ fontSize: "16px" }} />
                    <span>({ratingOutOfFive}/5)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>Your Rating:</span>
                    <Rate allowHalf value={userRating} onChange={handleUserRatingChange} style={{ fontSize: "16px" }} />
                    <span>({userRating}/5)</span>
                  </div>
                  {aggregatedUserRating !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>Average User Rating:</span>
                      <span>{aggregatedUserRating.toFixed(1)}/5</span>
                    </div>
                  )}
                  <Button onClick={inWatchlist ? handleRemove : handleAdd} style={{ backgroundColor: inWatchlist ? "#ff4d4f" : "#1890ff", borderColor: inWatchlist ? "#ff4d4f" : "#1890ff", color: "white" }}>
                    {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                  </Button>
                </div>
              </div>
            </div>

            {userRating > 0 && (
              <div style={{ marginTop: "20px" }}>
                {currentTextComment ? (
                  <div>
                    <p><strong>Your review:</strong> {currentTextComment}</p>
                    <Button onClick={() => { setEditCommentMode(true); setTextRating(currentTextComment); }}>
                      Edit review
                    </Button>
                  </div>
                ) : (
                  !editCommentMode && (
                    <Button onClick={() => setEditCommentMode(true)}>
                      Add review
                    </Button>
                  )
                )}
                {editCommentMode && (
                  <div style={{ marginTop: "10px" }}>
                    <Input.TextArea
                      placeholder="Enter your text rating (optional, max. 200 characters)"
                      maxLength={200}
                      rows={4}
                      value={textRating}
                      onChange={(e) => setTextRating(e.target.value)}
                    />
                    <div style={{ marginTop: "10px" }}>
                      <Button type="primary" onClick={handleSubmitTextRating}>
                        Save review
                      </Button>
                      <Button style={{ marginLeft: "10px" }} onClick={() => setEditCommentMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {reviewChat.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3>Review Chat</h3>
                <List
                  dataSource={reviewChat}
                  renderItem={(item) => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <strong>{item.username}</strong>
                            <Rate disabled allowHalf value={item.rating} style={{ fontSize: "14px" }} />
                          </div>
                        }
                        description={item.comment}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </AntdApp>
  );
};

export default DetailsPage;
