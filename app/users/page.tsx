"use client";

import React, { useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const containerStyle: CSSProperties = {
  padding: 24,
  paddingTop: 140,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const searchContainerStyle: CSSProperties = {
  width: 1100,
  display: "flex",
  justifyContent: "center",
};

const tutorialBoxStyle: CSSProperties = {
  marginTop: 24,
  width: 1300,
  minHeight: 400,
  backgroundColor: "#e0e0e0",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  textAlign: "center",
};

export default function Dashboard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    router.push(`/results?query=${encodeURIComponent(q)}`);
  };

  return (
    <div style={containerStyle}>
      <Space style={searchContainerStyle}>
        <Input
          placeholder="Search for Movies & TV Shows"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 350 }}
          suffix={
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleSearch}
            />
          }
        />
      </Space>

      <div style={tutorialBoxStyle}>
        <br />
        <h3>Welcome to Flicks & Friends! 🍿✨</h3>
        <br />
        <br />
        <p>
          Explore movies, create watchlists, and connect with friends. Start by
          searching for your favorite movies and TV shows above. Watch this
          space for more information soon! 🍿✨
        </p>
      </div>
    </div>
  );
}
