"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, Form, Input } from "antd";
import type { TableProps } from "antd";

// Existierende Spalten für User-Tabelle
const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [form] = Form.useForm();
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  const handleLogout = (): void => {
    clearToken();
    router.push("/login");
  };

  // Hier fügst du den Search-Handler hinzu, der zur Results-Seite navigiert:
  const handleSearch = (values: { search: string }) => {
    // Navigiere zur "Results"-Page und übergebe den Suchbegriff als Query-Parameter
    router.push(`/results?query=${encodeURIComponent(values.search)}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      }
    };

    fetchUsers();
  }, [apiService]);

  return (
    <div className="card-container">
      <Card title="Dashboard" loading={!users} className="dashboard-container">
        {/* Neue Search Bar oben */}
        <Form layout="inline" form={form} onFinish={handleSearch} style={{ marginBottom: "20px" }}>
          <Form.Item
            name="search"
            rules={[{ required: true, message: "Please enter a search term!" }]}
          >
            <Input placeholder="Search for movies or TV shows" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Form.Item>
        </Form>
        
        {users && (
          <>
            <Table<User>
              columns={columns}
              dataSource={users}
              rowKey="id"
              onRow={(row) => ({
                onClick: () => router.push(`/users/${row.id}`),
                style: { cursor: "pointer" },
              })}
            />
            <Button onClick={handleLogout} type="primary">
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
