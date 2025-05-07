"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Checkbox, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import Image from "next/image";
import ChatBox from "@/components/ChatBox";
import { avatars } from "@/constants/avatars";

const pageContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  paddingTop: "130px",
};

const contentStyle: CSSProperties = {
  width: "450px",
  backgroundColor: "#e0e0e0",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  position: "relative",
  maxHeight: "calc(100vh - 200px)",
  overflowY: "auto",
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

const placeholderStyle: CSSProperties = {
  padding: "24px",
  backgroundColor: "#f9f9f9",
  border: "1px solid #ddd",
  borderRadius: "8px",
  color: "#555",
  textAlign: "center",
};

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const { value: loggedInUserId } = useLocalStorage<number | null>("userId", null);
  const isOwnProfile = Number(id) === loggedInUserId;
  const [isFriend, setIsFriend] = useState(false);
  const [isPending, setIsPending] = useState(false);

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

  useEffect(() => {
    if (!isOwnProfile && user) {
      apiService
        .get<User[]>(`/users/${loggedInUserId}/friends`)
        .then(friends => setIsFriend(friends.some(f => f.id === user.id)))
        .catch(() => setIsFriend(false));

      apiService
        .get<number[]>(`/users/${user.id}/friendrequests`)
        .then(reqs => setIsPending(loggedInUserId !== null && reqs.includes(loggedInUserId)))
        .catch(() => setIsPending(false));
    }
  }, [apiService, loggedInUserId, user, isOwnProfile]);

  if (!user) {
    return <p>Loading user data...</p>;
  }
  return (
    <div style={pageContainerStyle}>
      {isOwnProfile ? (
        <div style={contentStyle}>
          <div style={topRowStyle}>
            <Image
              src={
                avatars.find(a => a.key === user.avatarKey)?.url ||
                user.profilePictureUrl ||
                "/default-avatar.jpg"
              }
              alt="Profile Picture"
              width={80}
              height={80}
              style={profilePictureStyle}
            />
            <div style={headingStyle}>View Your Profile</div>
          </div>
          <div style={fieldContainer}>
            <div style={labelStyle}>Username:</div>
            <div style={valueBoxStyle}>{user.username || "N/A"}</div>
          </div>
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
            <Checkbox checked={user.sharable} disabled>
              Share your Watchlist with Friends
            </Checkbox>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
            <Button style={buttonStyle} onClick={() => router.push(`/users/${id}/edit`)}>
              Edit
            </Button>
            <Button style={buttonStyle} onClick={() => router.push("/users")}>
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", gap: "20px", flexWrap: "wrap" }}>
          <div style={contentStyle}>
            <div style={topRowStyle}>
              <Image
                src={
                  avatars.find(a => a.key === user.avatarKey)?.url ||
                  user.profilePictureUrl ||
                  "/default-avatar.jpg"
                }
                alt="Profile Picture"
                width={80}
                height={80}
                style={profilePictureStyle}
              />
              <div style={headingStyle}>View {user.username}&apos;s Profile</div>
            </div>
            <div style={fieldContainer}>
              <div style={labelStyle}>Username:</div>
              <div style={valueBoxStyle}>{user.username || "N/A"}</div>
            </div>
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
            <div style={{ marginTop: "20px" }}>
              <Button style={buttonStyle} onClick={() => router.push("/users")}>
                Back
              </Button>
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: "480px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {isFriend ? (
              <>
                <Button
                  type="primary"
                  danger
                  block
                  style={{ marginBottom: 16 }}
                  onClick={async () => {
                    try {
                      await apiService.delete(`/users/${loggedInUserId}/friends/${user.id}`);
                      await apiService.delete(`/chat/conversation/${loggedInUserId}/${user.id}`);
                      message.success("User has been unfriended");
                      setIsFriend(false);
                    } catch {
                      message.error("Error unfriending user");
                    }
                  }}
                >
                  Unfriend
                </Button>
                <ChatBox friendId={Number(id)} currentUserId={loggedInUserId!} />
              </>
            ) : (
              <div style={placeholderStyle}>
                <p><strong>Messaging unavailable.</strong></p>
                <p>You can only chat with people on your friends list.</p>
                {isPending ? (
                  <Button
                    type="primary"
                    danger
                    block
                    style={{ marginTop: "16px" }}
                    onClick={async () => {
                      try {
                        await apiService.delete(`/users/${user.id}/friendrequests/${loggedInUserId}`);
                        message.success("Friend request canceled");
                        setIsPending(false);
                      } catch {
                        message.error("Error canceling friend request");
                      }
                    }}
                  >
                    Cancel Friend Request
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    style={{ ...buttonStyle, marginTop: "16px" }}
                    onClick={async () => {
                      try {
                        await apiService.post(`/users/${user.id}/friendrequests`, { fromUserId: loggedInUserId });
                        message.success("Friend request sent!");
                        setIsPending(true);
                      } catch {
                        message.error("Error sending friend request");
                      }
                    }}
                  >
                    Send Friend Request
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
