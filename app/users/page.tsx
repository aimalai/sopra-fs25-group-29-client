"use client";

import React, { useState, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TutorialContent from "@/components/TutorialContent";

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
  width: "100%",
  maxWidth: 1300,
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

  useEffect(() => {
    const key = "dashboard_reloaded";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
    }
  }, []);

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
          style={{ width: "100%", maxWidth: 1100 }}
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

      <div style={{ ...tutorialBoxStyle, marginTop: "40px" }}>
        <br />
        <br />
        <TutorialContent />{" "}
        {/* Rendering the tutorial component inside here as a variable */}
      </div>
    </div>
  );
}
