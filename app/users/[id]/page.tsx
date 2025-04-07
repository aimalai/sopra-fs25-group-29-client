"use client";
import React, { CSSProperties, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

const pageContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f2f2f2",
  position: "relative"
};

const logoContainerStyle: CSSProperties = {
  marginTop: "16px",
  alignSelf: "flex-start",
  marginLeft: "24px",
  marginBottom: "24px"
};

const logoStyle: CSSProperties = {
  width: "160px",
  height: "auto"
};

const contentStyle: CSSProperties = {
  width: "400px",
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px"
};

const headingStyle: CSSProperties = {
  marginBottom: "16px",
  fontWeight: "bold",
  fontSize: "1.25rem",
  textAlign: "left",
  color: "#000"
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%"
};

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

  const headingTitle = isOwnProfile
    ? "View Your Profile"
    : `View ${user?.username}'s Profile`;

  return (
    <div style={pageContainerStyle}>
      <div style={logoContainerStyle}>
        <img src="/NiroLogo.png" alt="App Logo" style={logoStyle} />
      </div>
      {user ? (
        <div style={contentStyle}>
          <div style={headingStyle}>{headingTitle}</div>
          <Card style={{ backgroundColor: "#e0e0e0", border: "none" }}>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Online Status:</strong>{" "}
              {user.status === "ONLINE" ? "🟢 Online" : "🔴 Offline"}
            </p>
            <p>
              <strong>Creation Date:</strong> {user.creationDate}
            </p>
            <p>
              <strong>Birth Date:</strong> {user.birthday ? user.birthday : "N/A"}
            </p>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isOwnProfile && (
              <Button
                style={buttonStyle}
                onClick={() => router.push(`/users/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            <Button style={buttonStyle} onClick={() => router.push("/users")}>
              Back
            </Button>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default UserProfile;