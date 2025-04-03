"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, message, Spin } from "antd";
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
      <div style={{ padding: "20px" }}>
        <p>No details available.</p>
        <Button type="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title={details.title}
        extra={
          <Button type="primary" onClick={() => router.back()}>
            Back to Results
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          {details.poster_path && (
            <img
              alt="Poster"
              src={`https://image.tmdb.org/t/p/w200${details.poster_path}`}
              style={{ width: "200px", height: "auto", borderRadius: "4px" }}
            />
          )}
          <div>
            <p>
              <strong>Release Date:</strong> {details.release_date}
            </p>
            <p>
              <strong>Genre:</strong> {details.genre}
            </p>
            <p>
              <strong>Rating:</strong> {details.ratings.toFixed(1)} / 10
            </p>
            <p>
              <strong>Votes:</strong> {details.vote_count}
            </p>
            <p>
              <strong>Cast:</strong> {details.cast}
            </p>
            <p>
              <strong>Description:</strong>
            </p>
            <p>{details.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DetailsPage;
