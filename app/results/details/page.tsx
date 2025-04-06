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
  ratings: number; // auf einer Skala von 0 bis 10
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

  // Umrechnung des Ratings von 0-10 auf 0-5
  const ratingOutOfFive = (details.ratings / 2).toFixed(1);

  return (
    <div
      style={{
        backgroundColor: "#eee", // Gesamthintergrund in Hellgrau
        color: "black",         // Alle Texte in Schwarz
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Logo oben links */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <img alt="Logo" src="/NiroLogo.png" style={{ width: "120px", height: "auto" }} />
      </div>

      {/* Haupt-Container für die Card, zentriert */}
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
          style={{
            backgroundColor: "#ddd", // Card-Hintergrund in Grauton
            border: "1px solid #bbb",
          }}
        >
          {/* Innere Box (dunkelgrau) als Flex-Container */}
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
            {/* Linke Spalte: Filmplakat */}
            {details.poster_path && (
              <img
                alt="Poster"
                src={`https://image.tmdb.org/t/p/w200${details.poster_path}`}
                style={{ width: "200px", height: "auto", borderRadius: "4px" }}
              />
            )}
            {/* Rechte Spalte: Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
              }}
            >
              {/* Obere Sektion: Textdetails */}
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
              {/* Untere Sektion: Button und Rating, am unteren Rand ausgerichtet */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Button
                  type="primary"
                  onClick={() => message.info("Added to watchlist!")}
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                    color: "white",
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
