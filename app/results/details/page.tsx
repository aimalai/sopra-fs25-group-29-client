"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, message, Spin, Rate } from "antd";
import { useApi } from "@/hooks/useApi";

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

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        message.error("No ID provided.");
        return;
      }
      setLoading(true);
      try {
        const endpoint = mediaType === "tv" ? "/api/movies/tv/details" : "/api/movies/details";
        const response = await apiService.get(`${endpoint}?id=${id}`);
        const data = typeof response === "string" ? JSON.parse(response) : response;
        setDetails(data);
      } catch (error) {
        console.error("Error loading details:", error);
        message.error("Error loading details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
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
      <div style={{ padding: "20px", backgroundColor: "#eee", color: "black" }}>
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
    <div
      style={{
        backgroundColor: "#eee",
        color: "black",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <img alt="Logo" src="/NiroLogo.png" style={{ width: "120px", height: "auto" }} />
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
          <div
            style={{
              backgroundColor: "#ccc",
              padding: "20px",
              borderRadius: "4px",
              color: "black",
              display: "flex",
              flexDirection: "row",
              gap: "20px",
            }}
          >
            {details.poster_path && (
              <img
                alt="Poster"
                src={`https://image.tmdb.org/t/p/w200${details.poster_path}`}
                style={{ width: "200px", height: "auto", borderRadius: "4px" }}
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
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
              <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                  type="primary"
                  onClick={async () => {
                    try {
                      console.log("Add to Watchlist button clicked");
                      const userId = localStorage.getItem("userId");
                      console.log("Retrieved userId:", userId);
                      if (!userId) {
                        console.error("User not logged in");
                        throw new Error("User not logged in");
                      }
                      console.log("Details object:", details);
                      const watchlistItem = {
                        movieId: details.id.toString(),
                        title: details.title,
                        posterPath: details.poster_path,
                      };
                      console.log("Constructed watchlist item:", watchlistItem);

                      const response = await apiService.post(`/users/${userId}/watchlist`, watchlistItem);
                      console.log("Response from add-to-watchlist API:", response);

                      message.success("Film zur Watchlist hinzugefügt!");
                    } catch (error) {
                      console.error("Error adding to watchlist:", error);
                      message.error("Fehler beim Hinzufügen zur Watchlist.");
                    }
                  }}
                >
                  Add to Watchlist
                </Button>
                <div
                  style={{
                    marginLeft: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Rate
                    disabled
                    allowHalf
                    defaultValue={Number(ratingOutOfFive)}
                    style={{ fontSize: "16px", color: "#faad14" }}
                  />
                  <span>({ratingOutOfFive}/5)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DetailsPage;
