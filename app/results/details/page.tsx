"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, message, Spin, Rate, Input, List, Grid } from "antd";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";

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

const buttonPrimaryStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  borderColor: "#007BFF",
};

const DetailsPage: React.FC = () => {
  const isAuthed = useAuth();
  const screens = Grid.useBreakpoint();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mediaType = searchParams.get("media_type") || "movie";
  const router = useRouter();
  const apiService = useApi();

  const [userId] = useSessionStorage<number>("userId", 0);
  const [token] = useSessionStorage<string>("token", "");

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

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
  const [messageApi, contextHolder] = message.useMessage();

  const getCurrentUsername = async (): Promise<string | null> => {
    if (!userId) return null;
    try {
      const response = await apiService.get<UserGetDTO>(`/users/${userId}`);
      return response.username;
    } catch {
      return null;
    }
  };

  const fetchDetails = async () => {
    if (!id) {
      messageApi.error("No ID provided.");
      return;
    }
    setLoading(true);
    setDetailsError(false);
    try {
      const resp = await apiService.get<MediaDetails>(
        `/api/movies/details?id=${id}&media_type=${mediaType}`
      );
      setDetails(resp);
    } catch {
      setDetailsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      router.replace('/login');
      return;
    }
    fetchDetails();

    const checkWatchlist = async () => {
      if (!userId || !id) return;
      try {
        const list = await apiService.get<string[]>(`/users/${userId}/watchlist`);
        const exists = list.some(entry => {
          try {
            return JSON.parse(entry).movieId === id;
          } catch {
            return false;
          }
        });
        setInWatchlist(exists);
      } catch { }
    };

    const fetchUserRating = async () => {
      if (!userId || !id) return;
      try {
        const resp = await apiService.get<UserRatingResponse>(
          `/api/users/${userId}/ratings?movieId=${id}`
        );
        setUserRating(resp.rating);
        if (resp.comment) setCurrentTextComment(resp.comment);
      } catch { }
    };

    const fetchAggregatedUserRating = async () => {
      if (!id) return;
      try {
        const resp = await apiService.get<AggregatedRatingResponse>(
          `/api/movies/${id}/userRatings`
        );
        setAggregatedUserRating(resp.averageRating);
      } catch { }
    };

    const fetchChatRatings = async () => {
      if (!id) return;
      try {
        const resp = await apiService.get<ChatRating[]>(`/api/movies/${id}/ratings`);
        setChatRatings(resp);
      } catch { }
    };

    checkWatchlist();
    fetchUserRating();
    fetchAggregatedUserRating();
    fetchChatRatings();
  }, [id, mediaType, userId, apiService, router]);

  if (!isAuthed) return null;

  const handleAdd = async () => {
    if (!userId || !details) return;
    try {
      await apiService.post(`/users/${userId}/watchlist`, {
        movieId: details.id.toString(),
        title: details.title,
        posterPath: details.poster_path ?? "",
        mediaType
      });
      setInWatchlist(true);
    } catch {
      messageApi.error("Error adding to Watchlist.");
    }
    messageApi.success("Added movie to Watchlist!");
  };

  const handleRemove = async () => {
    if (!userId || !details) return;
    try {
      await apiService.delete(`/users/${userId}/watchlist/${details.id}`);
      setInWatchlist(false);
    } catch {
      messageApi.error("Error removing from Watchlist.");
    }
    messageApi.success("Removed from Watchlist!");
  };

  const handleUserRatingChange = async (value: number) => {
    if (!userId || !id) return;
    const username = await getCurrentUsername();
    if (!username) {
      messageApi.error("Please log in to submit your review.");
      return;
    }
    try {
      setUserRating(value);
      await apiService.post(`/api/users/${userId}/ratings`, {
        movieId: id,
        rating: value,
        username,
      });
      const agg = await apiService.get<AggregatedRatingResponse>(
        `/api/movies/${id}/userRatings`
      );
      setAggregatedUserRating(agg.averageRating);
    } catch {
      messageApi.error("Error updating rating.");
    }
    messageApi.success("Your rating has been updated.");
  };

  const handleSubmitTextRating = async () => {
    if (textRating.length > 200) {
      messageApi.error("Max 200 characters.");
      return;
    }
    if (!userId || !id) return;
    const username = await getCurrentUsername();
    if (!username) {
      messageApi.error("Please log in to submit your review.");
      return;
    }
    try {
      await apiService.post(`/api/users/${userId}/ratings`, {
        movieId: id,
        rating: userRating,
        comment: textRating,
        username,
      });
      setCurrentTextComment(textRating);
      setEditCommentMode(false);
      const updated = await apiService.get<ChatRating[]>(`/api/movies/${id}/ratings`);
      setChatRatings(updated);
    } catch {
      messageApi.error("Error submitting review.");
    }
  };

  const reviewChat = chatRatings.filter(r => r.comment?.trim());

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (detailsError) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "black" }}>
        <p>Error loading details.</p>
        <Button type="primary" onClick={fetchDetails} style={buttonPrimaryStyle}>
          Retry
        </Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "black" }}>
        <p>No details available.</p>
        <Button type="primary" onClick={() => router.back()} style={buttonPrimaryStyle}>
          Back
        </Button>
      </div>
    );
  }

  const ratingOutOfFive = (details.ratings / 2).toFixed(1);

  return (
    <>
      {contextHolder}
      <Card
        title={`Detailed View for "${details.title}"`}
        headStyle={{ color: "black" }}
        extra={
          <Button
            onClick={() => router.back()}
            style={{ backgroundColor: "#1890ff", color: "white" }}
          >
            Back
          </Button>
        }
        style={{
          backgroundColor: "#ddd",
          border: "1px solid #bbb",
          margin: "20px auto",
          marginTop: "200px",
          maxWidth: 800,
        }}
      >
        <div
          style={{
            backgroundColor: "#ccc",
            padding: "20px",
            borderRadius: "4px",
            display: "flex",
            gap: "20px",
            flexDirection: screens.lg ? "row" : "column",
            alignItems: screens.lg ? "flex-start" : "center",
          }}
        >
          {details.poster_path && (
            <div style={{ flex: "0 0 200px" }}>
              <Image
                alt="Poster"
                src={`https://image.tmdb.org/t/p/w200${details.poster_path}`}
                width={200}
                height={300}
                style={{ borderRadius: 4, width: "100%", height: "auto" }}
              />
            </div>
          )}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p>
                <strong>Release Date:</strong> {details.release_date}
              </p>
              <p>
                <strong>Genre:</strong> {details.genre}
              </p>
              <p>
                <strong>Cast:</strong> {details.cast}
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              <p>{details.description}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span>TMDB Rating:</span>
                <Rate disabled allowHalf defaultValue={Number(ratingOutOfFive)} />
                <span>({ratingOutOfFive}/5)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span>Your Rating:</span>
                <Rate allowHalf value={userRating} onChange={handleUserRatingChange} />
                <span>({userRating}/5)</span>
              </div>
              {aggregatedUserRating !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span>Average User Rating:</span>
                  <span>{aggregatedUserRating.toFixed(1)}/5</span>
                </div>
              )}
              <Button
                onClick={inWatchlist ? handleRemove : handleAdd}
                style={{ backgroundColor: inWatchlist ? "#ff4d4f" : "#1890ff", color: "white" }}
              >
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
                <Button
                  style={buttonPrimaryStyle}
                  onClick={() => {
                    setEditCommentMode(true);
                    setTextRating(currentTextComment);
                  }}
                >
                  Edit review
                </Button>
              </div>
            ) : (
              !editCommentMode && (
                <Button style={buttonPrimaryStyle} onClick={() => setEditCommentMode(true)}>
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
                  onChange={e => setTextRating(e.target.value)}
                />
                <div style={{ marginTop: "10px" }}>
                  <Button style={buttonPrimaryStyle} onClick={handleSubmitTextRating}>
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
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong>{item.username}</strong>
                        <Rate disabled allowHalf value={item.rating} />
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
    </>
  );
};

export default DetailsPage;
