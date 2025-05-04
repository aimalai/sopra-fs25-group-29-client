"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

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
    <div style={{ padding: 24, paddingTop: 100 }}>
      <Space style={{ width: "100%", justifyContent: "center" }}>
        <Input
          placeholder="Search for Movies & TV Shows"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 400 }}
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
    </div>
  );
}
