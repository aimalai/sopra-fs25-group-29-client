"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Drawer, Dropdown, Button, Avatar, message } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import Image from "next/image";
import type { MenuProps } from "antd";
import { avatars } from "@/constants/avatars";

const { Header } = Layout;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const api = useApi();
  const [userId, setUserId] = useSessionStorage<number>("userId", 0);
  const [, setToken] = useSessionStorage<string>("token", "");
  const [username, setUsername] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const id = userId || Number(sessionStorage.getItem("userId") ?? 0);
      if (!id) return;
      try {
        const u = await api.get<{
          username?: string;
          avatarKey?: string;
          profilePictureUrl?: string;
        }>(`/users/${id}`);
        setUsername(u.username ?? "Profile");
        const url =
          avatars.find(a => a.key === u.avatarKey)?.url ||
          u.profilePictureUrl ||
          "/default-avatar.jpg";
        setProfileImage(url);
      } catch {
        setUsername("Profile");
      }
    })();
  }, [userId, api, pathname]);

  const handleLogout = async () => {
    const id = userId || Number(sessionStorage.getItem("userId") ?? 0);
    if (!id) {
      message.error("User ID missing, cannot logout.");
      return;
    }
    try {
      await api.put(`/users/${id}/logout`, {});
      message.success("Logged out successfully.");
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Unknown error.");
    } finally {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      setToken("");

      sessionStorage.removeItem("userId");
      localStorage.removeItem("userId");
      setUserId(0);

      router.push("/login");
    }
  };

  const hidePaths = ["/", "/login", "/register", "/otpVerification"];
  const isLobby = /^\/watchparty\/[^/]+\/lobby$/.test(pathname);
  if (hidePaths.includes(pathname) || isLobby) {
    return null;
  }

  if (["/", "/login", "/register", "/otpVerification"].includes(pathname)) {
    return null;
  }

  const items: MenuProps["items"] = [
    { key: "home", label: "🏠 Home", onClick: () => router.push("/home") },
    { key: "watchparty", label: "🎉 Create Watchparty", onClick: () => router.push("/watchparty") },
    { key: "trending", label: "🔥 Trending Now", onClick: () => router.push("/trending") },
    { key: "watchlist", label: "📺 Your Watchlist", onClick: () => router.push("/watchlist") },
    { key: "search", label: "🔎 Search for Users", onClick: () => router.push("/users") },
  ];

  const userMenuItems: MenuProps["items"] = [
    { key: "profile", label: "👤 Profile", onClick: () => router.push(`/users/${userId}`) },
    { key: "logout", label: "🚪 Logout", danger: true, onClick: handleLogout },
  ];

  const segment = pathname.split("/")[1];
  let activeKey: string;
  if (/^users\/\d+/.test(pathname.slice(1))) {
    activeKey = "profile";
  } else {
    switch (segment) {
      case "":
        activeKey = "home";
        break;
      case "users":
        activeKey = "search";
        break;
      case "watchparty":
        activeKey = "watchparty";
        break;
      case "trending":
        activeKey = "trending";
        break;
      case "watchlist":
        activeKey = "watchlist";
        break;
      case "search-users":
        activeKey = "search";
        break;
      default:
        activeKey = "home";
    }
  }

  return (
    <>
      <Header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: 72,
          background: "#f7f7f7",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{ fontSize: 24, color: "#333", marginRight: 24 }}
        />
        <div
          onClick={() => router.push("/home")}
          style={{
            cursor: "pointer",
            marginRight: 48,
            position: "relative",
            width: 140,
            height: 46,
          }}
        >
          <Image src="/NiroLogo.png" alt="Logo" fill style={{ objectFit: "contain" }} />
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={activeKey === "profile" ? [] : [activeKey]}
          items={items}
          className="custom-navbar-menu"
          style={{ flex: 1, background: "transparent", borderBottom: "none" }}
          overflowedIndicator={<MenuOutlined style={{ color: "#333" }} />}
        />
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <div
            style={{ cursor: "pointer", marginLeft: "auto", display: "inline-block", transition: "transform 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Avatar
              src={profileImage || undefined}
              icon={!profileImage ? <UserOutlined /> : undefined}
              size={40}
            />
          </div>
        </Dropdown>
      </Header>
      <Drawer
        placement="left"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        styles={{
          header: { background: "#f7f7f7", color: "#333", height: 72 },
          body: { padding: 0 },
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={[
            ...items,
            { key: "profile", label: `👤 ${username}`, onClick: () => router.push(`/users/${userId}`) },
            { key: "logout", label: "🚪 Logout", onClick: handleLogout, danger: true },
          ]}
          style={{ height: "100%", borderRight: 0 }}
          onClick={() => setDrawerVisible(false)}
        />
      </Drawer>
      <style jsx global>{`
        .custom-navbar-menu .ant-menu-item {
          transition: background-color 0.3s, color 0.3s;
        }
        .custom-navbar-menu .ant-menu-item:hover {
          background-color: rgba(24,144,255,0.1) !important;
          color: #1890ff !important;
        }
        .custom-navbar-menu .ant-menu-item-selected {
          color: #1890ff !important;
        }
        .custom-navbar-menu .ant-menu-item-selected::after {
          border-bottom: 2px solid #1890ff !important;
        }
        @media (max-width: 950px) {
          .custom-navbar-menu {
            display: none !important;
            flex: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
