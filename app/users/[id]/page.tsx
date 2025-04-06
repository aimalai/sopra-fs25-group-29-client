"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);

  const { value: loggedInUserId } = useLocalStorage<number>("userId", 0);
  const isOwnProfile = Number(id) === loggedInUserId;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser: User = await apiService.get<User>(`/users/${id}`);
        setUser(fetchedUser);
      } catch (err: unknown) {
        if (err instanceof Error) {
          message.error("Error loading user data: " + err.message);
        } else {
          message.error("Error loading user data");
        }
      }
    };

    fetchUser();
  }, [apiService, id]);

  return (
    <div
      className="auth-container"
      style={{ width: "100%", minHeight: "100vh", padding: "20px" }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {user ? (
          <Card
            title={`User Profile: ${user.username}`}
            style={{ marginBottom: "20px" }}
          >
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Online Status:</strong> {user.status === "ONLINE" ? "🟢 Online" : "🔴 Offline"}
            </p>
            <p>
              <strong>Creation Date:</strong> {user.creationDate}
            </p>
            
            <p>
              <strong>Birth Date:</strong> {user.birthday ? user.birthday : "N/A"}
            </p>
          </Card>
        ) : (
          <p>Loading user data...</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isOwnProfile && (
            <Button
              type="primary"
              className="auth-button"
              onClick={() => router.push(`/users/${id}/edit`)}
            >
              Edit
            </Button>
          )}
          <Button
            type="primary"
            className="auth-button"
            onClick={() => router.push("/users")}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
