"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Card, Input, Table, Button, Space, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Image from "next/image";
import { avatars } from "@/constants/avatars";
import type { ColumnsType } from 'antd/es/table';


export default function SearchUsersPage() {
  const router = useRouter();
  const api = useApi();
  const { value: userId } = useLocalStorage<number | null>("userId", null);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);

  const fetchAllUsers = async () => {
    try {
      const all: User[] = await api.get("/users");
      const q = searchTerm.trim().toLowerCase();
      setResults(
        !q
          ? all
          : all.filter(u =>
            (u.username?.toLowerCase().includes(q) ?? false) ||
            (u.email?.toLowerCase().includes(q) ?? false)
          )
      );
    } catch {
      message.error("Failed to search users.");
    }
  };

  const fetchFriends = async () => {
    if (!userId) return;
    try {
      const f: User[] = await api.get(`/users/${userId}/friends`);
      setFriends(f);
    } catch {
      message.error("Failed to load friends list.");
    }
  };

  const fetchRequests = async () => {
    if (!userId) return;
    try {
      const ids: (number | string)[] = await api.get(`/users/${userId}/friendrequests`);
      const reqs = await Promise.all(ids.map(id => api.get<User>(`/users/${id}`)));
      setRequests(reqs);
    } catch {
      message.error("Failed to load friend requests.");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [searchTerm]);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [userId]);

  const commonColumns: ColumnsType<User> = [
    {
      title: "Username",
      key: "username",
      render: (_: unknown, user: User) => (<Space align="center">
        <Image
          src={
            avatars.find(a => a.key === user.avatarKey)?.url ||
            user.profilePictureUrl ||
            "/default-avatar.jpg"
          }
          alt="avatar"
          width={32}
          height={32}
          style={{ borderRadius: "50%" }}
        />
        <a
          onClick={() => router.push(`/users/${user.id}`)}
          style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
        >
          {user.username}
        </a>
      </Space>),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ['sm'],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (status === "ONLINE" ? "🟢 Online" : "🔴 Offline"),
    },
  ];

  return (
    <div style={{ padding: 24, paddingTop: 100, maxWidth: 1200, margin: "0 auto" }}>
      <Card title="Search for Users" style={{ marginBottom: 24 }}>
        <Input
          placeholder="Search for new friends..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          suffix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Table<User>
          dataSource={results}
          rowKey="id"
          columns={[
            ...commonColumns,
            {
              title: "Actions",
              key: "actions",
              render: (_: unknown, user: User) => (
                <Button type="primary" onClick={() => router.push(`/users/${user.id}`)}>
                  Details
                </Button>
              ),
            },
          ]}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title="Friend List" style={{ marginBottom: 24 }}>
        <Table<User>
          dataSource={friends}
          rowKey="id"
          columns={[
            ...commonColumns,
            {
              title: "Actions",
              key: "actions",
              render: (_: unknown, user: User) => (
                <Button type="primary" onClick={() => router.push(`/users/${user.id}`)}>
                  Details
                </Button>
              ),
            },
          ]}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title="Incoming Friend Requests">
        {requests.length === 0 ? (
          <p>No incoming requests</p>
        ) : (
          requests.map(req => (
            <div
              key={req.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Space align="center">
                <Image
                  src={
                    avatars.find(a => a.key === req.avatarKey)?.url ||
                    req.profilePictureUrl ||
                    "/default-avatar.jpg"
                  }
                  alt="avatar"
                  width={32}
                  height={32}
                  style={{ borderRadius: "50%" }}
                />
                <a
                  onClick={() => router.push(`/users/${req.id}`)}
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                >
                  {req.username}
                </a>
              </Space>
              <div>
                <Button
                  type="primary"
                  style={{ marginRight: 8 }}
                  onClick={async () => {
                    await api.put(`/users/${userId}/friendrequests/${req.id}/accept`, {});
                    fetchRequests();
                    fetchFriends();
                  }}
                >
                  Accept
                </Button>
                <Button
                  danger
                  style={{ marginRight: 8 }}
                  onClick={async () => {
                    await api.delete(`/users/${userId}/friendrequests/${req.id}`);
                    fetchRequests();
                  }}
                >
                  Decline
                </Button>
                <Button onClick={() => router.push(`/users/${req.id}`)}>
                  View Profile
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
