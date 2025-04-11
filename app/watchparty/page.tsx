"use client";
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Table, message, DatePicker, TimePicker } from "antd";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import type { ColumnsType } from "antd/es/table";

dayjs.extend(utc);
interface Watchparty {
  id: number;
  title: string;
  utcTime: string;
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

  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs().startOf("day"));
  };

  const disabledTime = () => {
    const selectedDate: Dayjs | undefined = form.getFieldValue("date");
    if (selectedDate && selectedDate.isSame(dayjs(), "day")) {
      return {
        disabledHours: (): number[] => {
          const nowHour = dayjs().hour();
          const hours: number[] = [];
          for (let i = 0; i < nowHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour: number): number[] => {
          if (selectedHour === dayjs().hour()) {
            const nowMinute = dayjs().minute();
            const minutes: number[] = [];
            for (let i = 0; i < nowMinute; i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
      };
    }
    return {};
  };

  const onFinish = async (values: {
    title: string;
    date: Dayjs;
    time: Dayjs;
    contentLink: string;
    description?: string;
  }) => {
    try {
      const localDateTime = dayjs(
        `${values.date.format("YYYY-MM-DD")} ${values.time.format("HH:mm")}`,
        "YYYY-MM-DD HH:mm"
      );
      if (!localDateTime.isAfter(dayjs())) {
        message.error("Please select a future time for the watch party.");
        return;
      }
      const utcDateTime = localDateTime.utc();
      const utcTimeString = utcDateTime.format("YYYY-MM-DD[T]HH:mm:ss");

      const organizerIdStr = localStorage.getItem("userId");
      if (!organizerIdStr) {
        message.error("Organizer ID not found. Please log in.");
        return;
      }
      const organizerId = Number(organizerIdStr);
      const payload = {
        organizerId: organizerId,
        title: values.title,
        contentLink: values.contentLink,
        description: values.description || "",
        scheduledTime: utcTimeString,
      };

      console.log("Sending payload to backend:", payload);
      const response = await apiService.post<Watchparty>("/api/watchparties", payload);
      setWatchparties((prev) => [...prev, response]);
      message.success("Watchparty created!");
      form.resetFields();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error("Error creating watchparty: " + error.message);
      } else {
        message.error("Error creating watchparty");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const organizerIdStr = localStorage.getItem("userId");
        if (organizerIdStr) {
          const organizerId = Number(organizerIdStr);
          const data = await apiService.get<Watchparty[]>(`/api/watchparties?organizerId=${organizerId}`);
          setWatchparties(data);
        } else {
          setWatchparties([]);
          setInvitations([]);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error("Error fetching watchparties: " + error.message);
        } else {
          message.error("Error fetching watchparties");
        }
      }
    };
    fetchData();
  }, [apiService]);

  const watchpartyColumns: ColumnsType<Watchparty> = [
    {
      title: "Watchparty Name",
      dataIndex: "title",
      key: "partyName",
    },
    {
      title: "Local Time",
      key: "time",
      render: (_text: unknown, record: Watchparty) =>
        dayjs.utc(record.utcTime).local().format("DD.MM.YYYY, HH:mm"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  const invitationColumns: ColumnsType<Invitation> = [
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
    <div style={{ minHeight: "100vh", padding: "20px", boxSizing: "border-box" }}>
      <h1 style={{ color: "#fff", marginBottom: "20px" }}>Watchparty Page</h1>
      <div style={{ display: "flex", gap: "20px", width: "100%", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", border: "1px solid #444", padding: "20px", borderRadius: "8px", background: "#2f2f2f", color: "#fff", minWidth: "280px" }}>
          <h2>Create Watchparty</h2>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter a title" }]}>
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true, message: "Please select a date" }]}>
              <DatePicker style={{ width: "100%" }} disabledDate={disabledDate} />
            </Form.Item>
            <Form.Item name="time" label="Time" rules={[{ required: true, message: "Please select a time" }]}>
              <TimePicker style={{ width: "100%" }} format="HH:mm" disabledTime={disabledTime} />
            </Form.Item>
            <Form.Item name="contentLink" label="Content Link" rules={[{ required: true, message: "Please enter a content link" }]}>
              <Input placeholder="Enter content link (e.g., YouTube URL)" />
            </Form.Item>
            <Form.Item name="description" label="Description (Optional)">
              <Input.TextArea placeholder="Enter additional details (optional)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div style={{ flex: "2 1 400px", border: "1px solid #444", padding: "20px", borderRadius: "8px", background: "#2f2f2f", color: "#fff", minWidth: "300px" }}>
          <h2>Joined Watchparties</h2>
          <Card style={{ background: "#2f2f2f", border: "none" }}>
            <Table dataSource={watchparties} columns={watchpartyColumns} rowKey="id" pagination={false} />
          </Card>
        </div>
        <div style={{ flex: "1 1 300px", border: "1px solid #444", padding: "20px", borderRadius: "8px", background: "#2f2f2f", color: "#fff", minWidth: "280px" }}>
          <h2>Invitations</h2>
          <Card style={{ background: "#2f2f2f", border: "none" }}>
            <Table dataSource={invitations} columns={invitationColumns} rowKey="id" pagination={false} />
          </Card>
        </div>
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button type="primary" onClick={() => router.push("/users")} style={{ marginRight: "10px" }}>
          Home
        </Button>
      </div>
    </div>
  );
};

export default WatchpartyPage;
