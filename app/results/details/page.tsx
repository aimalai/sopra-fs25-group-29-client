"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, message, Spin } from "antd";
import { useApi } from "@/hooks/useApi";

interface MovieDetails {
  id: number;
  title: string;
  description: string;
  cast: string;
  ratings: number;
  release_date: string;
  genre: string;
  poster_path: string;
}

const DetailsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("id");
  const router = useRouter();
  const apiService = useApi();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) {
        message.error("No movie ID provided.");
        return;
      }
      setLoading(true);
      try {
        const response = await apiService.get(`/api/movies/details?id=${movieId}`);
        const data = typeof response === "string" ? JSON.parse(response) : response;
        setMovie(data);
      } catch (error) {
        console.error("Error loading movie details:", error);
        message.error("Error loading movie details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId, apiService]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ padding: "20px" }}>
        <p>No movie details available.</p>
        <Button type="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title={movie.title}
        extra={
          <Button type="primary" onClick={() => router.back()}>
            Back to Results
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          {movie.poster_path && (
            <img
              alt="Movie Poster"
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              style={{ width: "200px", height: "auto", borderRadius: "4px" }}
            />
          )}
          <div>
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Genre:</strong> {movie.genre}</p>
            <p><strong>Rating:</strong> {movie.ratings}</p>
            <p><strong>Cast:</strong> {movie.cast}</p>
            <p><strong>Description:</strong></p>
            <p>{movie.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DetailsPage;
