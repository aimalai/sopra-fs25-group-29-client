"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Space } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import Image from "next/image";
import { User } from "@/types/user";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const api = useApi();

  const { value: userId, clear: clearUserId } = useLocalStorage<number>("userId", 0);
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (!userId) return;
      try {
        const user = await api.get<User>(`/users/${userId}`);
        setUsername(user.username || "Profile");
      } catch {
        setUsername("Profile");
      }
    };
    fetchUsername();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await api.put(`/users/${userId}/logout`, {});
    } catch {
      // optional: Fehler ignorieren
    } finally {
      clearToken();
      clearUserId();
      router.push("/login");
    }
  };

  if (["/", "/login", "/register"].includes(pathname)) return null;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e0e0e0",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        position: "fixed",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo links */}
      <div style={{ cursor: "pointer" }} onClick={() => router.push("/users")}>
        <Image
          src="/NiroLogo.png"
          alt="Logo"
          width={150}
          height={60}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Buttons rechtszentriert */}
      <div style={{ marginLeft: "auto" }}>
        <Space size="large">
          <Button type="link" onClick={() => router.push("/users")}>
            Home
          </Button>
          <Button type="link" onClick={() => router.push("/watchparty")}>
            Watchparty
          </Button>
          <Button type="link" onClick={() => router.push(`/users/${userId}`)}>
            {username || "Profile"}
          </Button>
          <Button danger type="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Navbar;
