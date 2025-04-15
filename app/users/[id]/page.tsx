"use client";
import React, { CSSProperties, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Checkbox, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import Image from "next/image";

const pageContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
};

const logoContainerStyle: CSSProperties = {
  marginTop: "16px",
  alignSelf: "flex-start",
  marginLeft: "24px",
  marginBottom: "24px",
};

const logoStyle: CSSProperties = {
  width: "160px",
  height: "auto",
};

const contentStyle: CSSProperties = {
  width: "480px",
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
  position: "relative",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
  flexDirection: "row-reverse",
};

const headingStyle: CSSProperties = {
  fontWeight: "bold",
  fontSize: "1.25rem",
  color: "#000",
};

const labelStyle: CSSProperties = {
  fontWeight: "bold",
  marginBottom: "4px",
  color: "#000",
};

const valueBoxStyle: CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  padding: "8px 12px",
  borderRadius: "4px",
  textAlign: "left",
  color: "#000",
  whiteSpace: "pre-wrap",
};

const fieldContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "12px",
};

const sectionHeadingStyle: CSSProperties = {
  fontWeight: "bold",
  marginTop: "12px",
  marginBottom: "6px",
  fontSize: "1rem",
  color: "#333",
};

const profilePictureStyle: CSSProperties = {
  borderRadius: "50%",
  border: "2px solid #ccc",
  marginTop: "10px",
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%",
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

  return (
    <div style={pageContainerStyle}>
      <div style={logoContainerStyle}>
        <Image
          src="/NiroLogo.png"
          alt="App Logo"
          style={logoStyle}
          width={160}
          height={100}
        />
      </div>
      {user ? (
        <div style={contentStyle}>
          <div style={topRowStyle}>
            <Image
              src={user.profilePictureUrl || "/default-avatar.jpg"}
              alt="Profile Picture"
              width={80}
              height={80}
              style={profilePictureStyle}
            />
            <div style={headingStyle}>
              {isOwnProfile ? "View Your Profile" : `View ${user.username}'s Profile`}
            </div>
          </div>

          <div style={fieldContainer}>
            <div style={labelStyle}>Username:</div>
            <div style={valueBoxStyle}>{user.username || "N/A"}</div>
          </div>

          {isOwnProfile ? (
            <>
              <div style={fieldContainer}>
                <div style={labelStyle}>Email:</div>
                <div style={valueBoxStyle}>{user.email || "N/A"}</div>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Password:</div>
                <div style={valueBoxStyle}>**********</div>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Birthdate:</div>
                <div style={valueBoxStyle}>{user.birthday || "N/A"}</div>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Biography:</div>
                <div style={valueBoxStyle}>{user.biography || "N/A"}</div>
              </div>
              <div style={sectionHeadingStyle}>Privacy Settings</div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Sharable:</div>
                <Checkbox checked={user.sharable} disabled>
                  Enable profile search
                </Checkbox>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Public Ratings:</div>
                <Checkbox checked={user.publicRatings} disabled>
                  Share my ratings
                </Checkbox>
              </div>
            </>
          ) : (
            <>
              <div style={fieldContainer}>
                <div style={labelStyle}>Online Status:</div>
                <div style={valueBoxStyle}>
                  {user.status === "ONLINE" ? "🟢 Online" : "🔴 Offline"}
                </div>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Email:</div>
                <div style={valueBoxStyle}>{user.email || "N/A"}</div>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Birthdate:</div>
                <div style={valueBoxStyle}>{user.birthday || "N/A"}</div>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Joined on:</div>
                <div style={valueBoxStyle}>{user.creationDate || "N/A"}</div>
              </div>
              <div style={fieldContainer}>
                <div style={labelStyle}>Biography:</div>
                <div style={valueBoxStyle}>{user.biography || "N/A"}</div>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
            {isOwnProfile ? (
              <Button
                style={buttonStyle}
                onClick={() => router.push(`/users/${id}/edit`)}
              >
                Edit
              </Button>
            ) : (
              <Button
                style={buttonStyle}
                onClick={async () => {
                  try {
                    const currentUserId = Number(localStorage.getItem("userId"));
                    await apiService.post(`/users/${user.id}/friendrequests`, {
                      fromUserId: currentUserId,
                    });
                    message.success("Friend request sent!");
                  } catch (error) {
                    console.error("Error sending friend request:", error);
                    message.error("Error sending friend request");
                  }
                }}
              >
                Add friend
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