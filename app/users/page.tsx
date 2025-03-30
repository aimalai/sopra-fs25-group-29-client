"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, message, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";

const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Creation Date",
    dataIndex: "creationDate",
    key: "creationDate",
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
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: userId, clear: clearUserId } = useLocalStorage<number>("userId", 0);

  useEffect(() => {
    const directToken = localStorage.getItem("token");
    if (!directToken) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers: User[] = await apiService.get<User[]>("/users");
        setUsers(fetchedUsers);
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error("Error fetching users: " + error.message);
        } else {
          message.error("Error fetching users: An unknown error occurred.");
        }
      }
    };

    fetchUsers();
  }, [apiService]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await apiService.put(`/users/${userId}/logout`, {});
      message.success("Logout Successful: You have been logged out successfully.");
      clearToken();
      clearUserId();
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error("Logout Failed: " + error.message);
      } else {
        message.error("Logout Failed: An unknown error occurred during logout.");
      }
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ padding: "20px" }}>
      <div style={{ position: "relative" }}>
        <div
          className="search-container"
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px auto",
            marginTop: "40px",
          }}
        >
          <Space>
            <Input
              placeholder="Search for Movies & TV Shows"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ width: "400px" }}
              suffix={
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearchClick}
                  style={{ marginLeft: 10 }}
                />
              }
            />
          </Space>
        </div>
        <Button
          type="default"
          onClick={() => router.push("/profile")}
          style={{ position: "absolute", right: "20px", top: "50px" }}
        >
          Profile
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "60px",
        }}
      >
        <Card
          title="Get all users from secure endpoint:"
          loading={!users}
          className="dashboard-container"
          style={{ width: "350px" }}
        >
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
              <Button onClick={handleLogout} type="primary" style={{ marginTop: "20px" }}>
                Logout
              </Button>
            </>
          )}
        </Card>

        <Card title="Friends Overview" className="dashboard-container" style={{ width: "350px" }}>
          <Table
            dataSource={[]}
            columns={[
              {
                title: "Friend Name",
                dataIndex: "name",
                key: "name",
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
              },
            ]}
            locale={{ emptyText: "No friends to display" }}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
