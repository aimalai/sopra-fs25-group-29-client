"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Table, message, DatePicker, TimePicker } from "antd";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

interface Watchparty {
  id: number;
  partyName: string;
  description: string;
}

interface Invitation {
  id: number;
  sender: string;
  watchpartyName: string;
}

const WatchpartyPage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const [watchparties, setWatchparties] = useState<Watchparty[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [form] = Form.useForm();

  const onFinish = async (values: {
    title: string;
    date: any;
    time: any;
    contentLink: string;
  }) => {
    try {
      console.log("Creating watchparty with values:", values);
      const newParty: Watchparty = {
        id: Date.now(),
        partyName: values.title,
        description: `Date: ${values.date.format("YYYY-MM-DD")}, Time: ${values.time.format("HH:mm")}, Link: ${values.contentLink}`,
      };
      setWatchparties((prev) => [...prev, newParty]);
      message.success("Watchparty created!");
      form.resetFields();
    } catch (error: any) {
      message.error("Error creating watchparty: " + error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setWatchparties([]);
        setInvitations([]);
      } catch (error: any) {
        message.error("Error fetching data: " + error.message);
      }
    };
    fetchData();
  }, [apiService]);

  const watchpartyColumns = [
    {
      title: "Watchparty Name",
      dataIndex: "partyName",
      key: "partyName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  const invitationColumns = [
    {
      title: "Sender",
      dataIndex: "sender",
      key: "sender",
    },
    {
      title: "Watchparty",
      dataIndex: "watchpartyName",
      key: "watchpartyName",
    },
  ];

  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: "20px" }}>Watchparty Page</h1>
      <div
        style={{
          display: "flex",
          gap: "20px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 300px",
            border: "1px solid #444",
            padding: "20px",
            borderRadius: "8px",
            background: "#2f2f2f",
            color: "#fff",
            minWidth: "280px",
          }}
        >
          <h2>Create Watchparty</h2>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: "Please select a time" }]}
            >
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
            <Form.Item
              name="contentLink"
              label="Content Link"
              rules={[{ required: true, message: "Please enter a content link" }]}
            >
              <Input placeholder="Enter content link (e.g., YouTube URL)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div
          style={{
            flex: "2 1 400px",
            border: "1px solid #444",
            padding: "20px",
            borderRadius: "8px",
            background: "#2f2f2f",
            color: "#fff",
            minWidth: "300px",
          }}
        >
          <h2>Joined Watchparties</h2>
          <Card style={{ background: "#2f2f2f", border: "none" }}>
            <Table
              dataSource={watchparties}
              columns={watchpartyColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </div>
        <div
          style={{
            flex: "1 1 300px",
            border: "1px solid #444",
            padding: "20px",
            borderRadius: "8px",
            background: "#2f2f2f",
            color: "#fff",
            minWidth: "280px",
          }}
        >
          <h2>Invitations</h2>
          <Card style={{ background: "#2f2f2f", border: "none" }}>
            <Table
              dataSource={[]}
              columns={invitationColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </div>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button
          type="primary"
          onClick={() => router.push("/users")}
          style={{ marginRight: "10px" }}
        >
          Home
        </Button>
      </div>
    </div>
  );
};

export default WatchpartyPage;
