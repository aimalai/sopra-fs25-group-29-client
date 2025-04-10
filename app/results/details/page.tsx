"use client";

import { App as AntdApp } from "antd";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, message, Spin, Rate } from "antd";
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

const DetailsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mediaType = searchParams.get("media_type") || "movie";
  const router = useRouter();
  const apiService = useApi();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        message.error("No ID provided.");
        return;
      }
      setLoading(true);
      try {
        const response = await apiService.get(`/api/movies/details?id=${id}&media_type=${mediaType}`);
        const data = typeof response === "string" ? JSON.parse(response) : response;
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

    fetchDetails();
    checkWatchlist();
  }, [id, mediaType, apiService]);

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

  const handleAdd = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not logged in");
      const body = {
        movieId: details.id.toString(),
        title: details.title,
        posterPath: details.poster_path ?? "",
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
      await apiService.delete(`/users/${userId}/watchlist/${details.id}`);
      message.success("Removed from Watchlist!");
      setInWatchlist(false);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      message.error("Error removing from Watchlist.");
    }
  };

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
                <div style={{ display: "flex", alignItems: "center" }}>
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
                  <div style={{ marginLeft: "20px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Rate disabled allowHalf defaultValue={Number(ratingOutOfFive)} style={{ fontSize: "16px", color: "#faad14" }} />
                    <span>({ratingOutOfFive}/5)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AntdApp>
  );
};

export default DetailsPage;
