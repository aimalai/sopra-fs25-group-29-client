"use client";

import { App as AntdApp } from "antd";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, message, Spin, Rate, Input, List } from "antd";
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
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mediaType = searchParams.get("media_type") || "movie";
  const router = useRouter();
  const apiService = useApi();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        message.error("No ID provided.");
        return;
      }
      setLoading(true);
      try {
        const response = await apiService.get(`/api/movies/details?id=${id}&media_type=${mediaType}`);
        const data = typeof response === "string" ? JSON.parse(response) : (response as MediaDetails);
        setDetails(data);
      } catch (error) {
        console.error("Error loading details:", error);
        message.error("Error loading details.");
      } finally {
        setLoading(false);
      }
    };

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
      } catch (error) {
        console.error("Error checking watchlist:", error);
      }
    };

    const fetchUserRating = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId || !id) return;
        const response = await apiService.get(`/api/users/${userId}/ratings?movieId=${id}`) as UserRatingResponse;
        setUserRating(response.rating);
        if (response.comment) {
          setCurrentTextComment(response.comment);
        }
      } catch {
        console.log("User rating not found, initializing with 0");
      }
    };

    const fetchAggregatedUserRating = async () => {
      try {
        const response = await apiService.get(`/api/movies/${id}/userRatings`) as AggregatedRatingResponse;
        setAggregatedUserRating(response.averageRating);
      } catch {
        console.log("Aggregated user rating not available");
      }
    };

    const fetchChatRatings = async () => {
      try {
        const response = await apiService.get(`/api/movies/${id}/ratings`);
        setChatRatings(Array.isArray(response) ? response : []);
      } catch {
        console.error("Error fetching chat ratings");
      }
    };

    fetchDetails();
    checkWatchlist();
    fetchUserRating();
    fetchAggregatedUserRating();
    fetchChatRatings();
  }, [id, mediaType, apiService]);

  const handleAdd = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not logged in");
      const body = {
        movieId: details!.id.toString(),
        title: details!.title,
        posterPath: details!.poster_path ?? "",
      };
      await apiService.post(`/users/${userId}/watchlist`, body);
      message.success("Added movie to Watchlist!");
      setInWatchlist(true);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      message.error("Error adding to Watchlist.");
    }
  };

  const handleRemove = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not logged in");
      await apiService.delete(`/users/${userId}/watchlist/${details!.id}`);
      message.success("Removed from Watchlist!");
      setInWatchlist(false);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      message.error("Error removing from Watchlist.");
    }
  };

  const handleUserRatingChange = async (value: number) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !id) throw new Error("User not logged in or movie ID missing");
      const username = await getCurrentUsername();
      if (!username) {
        message.error("Please log in with a valid username to submit your review.");
        return;
      }
      setUserRating(value);
      await apiService.post(`/api/users/${userId}/ratings`, { movieId: id, rating: value, username });
      message.success("Your rating has been updated.");
      const aggResponse = await apiService.get(`/api/movies/${id}/userRatings`) as AggregatedRatingResponse;
      setAggregatedUserRating(aggResponse.averageRating);
    } catch (error) {
      console.error("Error updating user rating:", error);
      message.error("Error updating your rating.");
    }
  };

  const handleSubmitTextRating = async () => {
    if (textRating.length > 200) {
      message.error("Maximum 200 characters.");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !id) throw new Error("User not logged in or movie ID missing");
      const username = await getCurrentUsername();
      if (!username) {
        message.error("Please log in with a valid username to submit your review.");
        return;
      }
      const payload = {
        movieId: id,
        rating: userRating,
        comment: textRating,
        username: username,
      };
      await apiService.post(`/api/users/${userId}/ratings`, payload);
      message.success("Your rating has been saved!");
      setCurrentTextComment(textRating);
      setEditCommentMode(false);
      const updatedChat = await apiService.get(`/api/movies/${id}/ratings`);
      setChatRatings(Array.isArray(updatedChat) ? updatedChat : []);
    } catch (error) {
      console.error("Error submitting text rating:", error);
      message.error("Error when submitting your review.");
    }
  };

  const reviewChat = chatRatings.filter((rating) => rating.comment && rating.comment.trim() !== "");

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!details) {
    return (
      <div style={{ padding: "20px", color: "black" }}>
        <p>No details available.</p>
        <Button
          type="primary"
          onClick={() => router.back()}
          style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", color: "white" }}
        >
          Back to Results
        </Button>
      </div>
    );
  }

  const ratingOutOfFive = (details.ratings / 2).toFixed(1);

  return (
    <AntdApp>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", color: "black" }}>
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <Image alt="Logo" src="/NiroLogo.png" style={{ width: "120px", height: "auto" }} width={120} height={120} />
        </div>
        <div style={{ marginTop: "60px", width: "80%", maxWidth: "800px" }}>
          <Card
            title={`Detailed View for "${details.title}"`}
            headStyle={{ color: "black" }}
            extra={
              <Button
                type="primary"
                onClick={() => router.back()}
                style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", color: "white" }}
              >
                Back to Results
              </Button>
            }
            style={{ backgroundColor: "#ddd", border: "1px solid #bbb" }}
          >
            <div style={{ backgroundColor: "#ccc", padding: "20px", borderRadius: "4px", color: "black", display: "flex", flexDirection: "row", gap: "20px" }}>
              {details.poster_path && (
                <Image alt="Poster" src={`https://image.tmdb.org/t/p/w200${details.poster_path}`} style={{ borderRadius: "4px" }} width={200} height={300} />
              )}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
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
                    <Rate disabled allowHalf defaultValue={Number(ratingOutOfFive)} style={{ fontSize: "16px", color: "#faad14" }} />
                    <span>({ratingOutOfFive}/5)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>Your Rating:</span>
                    <Rate allowHalf value={userRating} onChange={handleUserRatingChange} style={{ fontSize: "16px", color: "#faad14" }} />
                    <span>({userRating}/5)</span>
                  </div>
                  {aggregatedUserRating !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>Average User Rating:</span>
                      <span>{aggregatedUserRating.toFixed(1)}/5</span>
                    </div>
                  )}
                  <div style={{ marginTop: "10px" }}>
                    <Button
                      type="primary"
                      onClick={inWatchlist ? handleRemove : handleAdd}
                      style={{
                        backgroundColor: inWatchlist ? "#ff4d4f" : "#1890ff",
                        borderColor: inWatchlist ? "#ff4d4f" : "#1890ff",
                        color: "white",
                      }}
                    >
                      {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                    </Button>
                  </div>
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
