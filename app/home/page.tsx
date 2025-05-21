"use client";

import React, { useState, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TutorialContent from "@/components/TutorialContent";
import useAuth from "@/hooks/useAuth";

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "24px",
  paddingTop: "140px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const searchContainerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1000,
  backgroundColor: "#e0e0e0",
  padding: "16px 24px",
  borderRadius: "24px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
};

const inputStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1000,
  borderRadius: "50px",
  padding: "12px 20px",
  backgroundColor: "#f9f9f9",
  border: "none",
};

const searchButtonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  borderColor: "#007BFF",
};

const tutorialBoxStyle: CSSProperties = {
  marginTop: "48px",
  width: "100%",
  maxWidth: 1300,
  minHeight: 400,
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  textAlign: "center",
};

export default function Dashboard() {
  const isAuthed = useAuth();
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

  if (!isAuthed) return null;

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    router.push(`/results?query=${encodeURIComponent(q)}`);
  };

  return (
    <div style={containerStyle}>
      <div style={searchContainerStyle}>
        <Input
          placeholder="Search for Movies & TV Shows"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSearch}
          style={inputStyle}
          suffix={
            <Button
              type="primary"
              shape="circle"
              size="middle"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleSearch}
              style={searchButtonStyle}
            />
          }
        />
      </div>

      <div style={tutorialBoxStyle}>
        <TutorialContent />
      </div>
    </div>
  );
}
