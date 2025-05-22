"use client";
import React, { CSSProperties, useEffect, useState } from "react";
import useSessionStorage from "@/hooks/useSessionStorage";
import {
  Form,
  Input,
  Button,
  Card,
  Table,
  message,
  DatePicker,
  TimePicker,
} from "antd";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import type { ColumnsType } from "antd/es/table";
import InviteFriendsModal from "@/watchparty/InviteFriendsModal";
import InviteResponsesPolling from "./InviteResponsesPolling";
import useAuth from "@/hooks/useAuth";

dayjs.extend(utc);

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%",
};

interface Watchparty {
  id: number;
  title: string;
  scheduledTime: string;
  description: string;
  organizer: {
    id: number;
    username: string;
  };
}

export default function WatchpartyPage() {
  const isAuthed = useAuth();
  const router = useRouter();
  const apiService = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  const [watchparties, setWatchparties] = useState<Watchparty[]>([]);
  const [username] = useSessionStorage<string>("username", "");
  const [userIdStr] = useSessionStorage<string>("userId", "");
  const currentUserId = Number(userIdStr);
  const [form] = Form.useForm();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedWatchPartyId, setSelectedWatchPartyId] = useState<number | null>(null);

  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs().startOf("day"));
  };

  const disabledTime = () => {
    const selectedDate = form.getFieldValue("date");
    if (selectedDate?.isSame(dayjs(), "day")) {
      const now = dayjs();
      return {
        disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
        disabledMinutes: (selectedHour: number) =>
          selectedHour === now.hour()
            ? Array.from({ length: now.minute() }, (_, i) => i)
            : [],
      };
    }
    return {};
  };

  const handleCopy = async () => {
    const sample = "https://www.youtube.com/watch?v=oRDRfikj2z8";
    try {
      await navigator.clipboard.writeText(sample);
      messageApi.success("Copied Link!");
    } catch {
      messageApi.error("Failed to copy link");
    }
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
        messageApi.error("Please select a future time for the watch party.");
        return;
      }
      const utcDateTime = localDateTime.utc();
      const utcTimeString = utcDateTime.format("YYYY-MM-DD[T]HH:mm:ss");

      const organizerIdStr = sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (!organizerIdStr) {
        messageApi.error("Organizer ID not found. Please log in.");
        return;
      }
      const organizerId = Number(organizerIdStr);
      const payload = {
        organizerId,
        title: values.title,
        contentLink: values.contentLink,
        description: values.description || "",
        scheduledTime: utcTimeString,
      };

      console.log("Sending payload to backend:", payload);
      const response = await apiService.post<Watchparty>("/api/watchparties", payload);
      setWatchparties((prev) => [...prev, response]);
      messageApi.success("Watchparty created!");
      form.resetFields();
    } catch (error: unknown) {
      if (error instanceof Error) messageApi.error("Error creating watchparty: " + error.message);
      else messageApi.error("Error creating watchparty");
    }
  };

  const fetchData = async (showMessage: boolean = false) => {
    try {
      const organizerId = Number(userIdStr);
      const invitedUser = username;
      const [own, invited] = await Promise.all([
        apiService.get<Watchparty[]>(`/api/watchparties?organizerId=${organizerId}`),
        apiService.get<Watchparty[]>(`/api/watchparties?username=${encodeURIComponent(invitedUser)}`),
      ]);
      const merged = [...own, ...invited].reduce<Watchparty[]>((acc, wp) => {
        if (!acc.some((x) => x.id === wp.id)) acc.push(wp);
        return acc;
      }, []);
      setWatchparties(merged);

      if (showMessage) {
        messageApi.success("Watchparties reloaded successfully");
      }
    } catch {
      messageApi.error("Error fetching watchparties.");
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [apiService, userIdStr, username]);

  if (!isAuthed) return null;

  const handleInviteClick = (watchPartyId: number) => {
    setSelectedWatchPartyId(watchPartyId);
    setInviteModalVisible(true);
  };

  const closeInviteModal = () => {
    setInviteModalVisible(false);
    setSelectedWatchPartyId(null);
  };

  const watchpartyColumns: ColumnsType<Watchparty> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "partyName",
    },
    {
      title: "Scheduled Time",
      key: "time",
      render: (_text: unknown, record: Watchparty) =>
        dayjs.utc(record.scheduledTime).local().format("DD.MM.YYYY, HH:mm"),
    },
    {
      title: "Actions",
      key: "action",
      render: (_text: unknown, record: Watchparty) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button style={buttonStyle} onClick={() => router.push(`/watchparty/${record.id}`)}>
            Details
          </Button>
          {record.organizer.id === currentUserId && (
            <Button style={buttonStyle} onClick={() => handleInviteClick(record.id)}>
              Invite Friends
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div
        style={{
          minHeight: "100vh",
          padding: "20px",
          paddingTop: "100px",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ color: "#fff", marginBottom: "20px" }}>Watchparty Manager</h1>
        <div style={{ display: "flex", gap: "20px", width: "100%", flexWrap: "wrap" }}>
          <Card title="Create Watchparty" style={{ flex: "1 1 300px", marginBottom: 24 }}>
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ color: 'white' }}>
              <Form.Item
                name="title"
                label={<span style={{ color: 'black', fontWeight: 'bold' }}>Title</span>}
                rules={[{ required: true, message: "Please enter a title" }]}
              >
                <Input placeholder="Enter title" />
              </Form.Item>
              <Form.Item
                name="date"
                label={<span style={{ color: 'black', fontWeight: 'bold' }}>Date</span>}
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <DatePicker
                  style={{ width: "100%", border: "1px solid #000", borderRadius: 4 }}
                  disabledDate={disabledDate}
                />
              </Form.Item>
              <Form.Item
                name="time"
                label={<span style={{ color: 'black', fontWeight: 'bold' }}>Time</span>}
                rules={[{ required: true, message: "Please select a time" }]}
              >
                <TimePicker
                  style={{ width: "100%", border: "1px solid #000", borderRadius: 4 }}
                  format="HH:mm"
                  disabledTime={disabledTime}
                />
              </Form.Item>
              <Form.Item
                name="contentLink"
                label={<span style={{ color: 'black', fontWeight: 'bold' }}>Content Link</span>}
                validateFirst
                validateTrigger={['onBlur']}
                rules={[
                  { required: true, message: "Please enter a link.", whitespace: true },
                  {
                    validator: async (_, value) => {
                      let url: URL;
                      try {
                        url = new URL(value);
                      } catch {
                        return Promise.reject(new Error("Please enter a valid URL."));
                      }
                      if (!/^https?:$/.test(url.protocol)) {
                        return Promise.reject(new Error("Link must start with http:// or https://."));
                      }
                      if (value.length > 512) {
                        return Promise.reject(new Error("Link is too long (max 512 characters)."));
                      }
                      const host = url.hostname.replace(/^www\./, "");
                      if (host.includes("youtube.com") || host === "youtu.be") {
                        const id =
                          host === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
                        if (!id || !/^[-_A-Za-z0-9]{11}$/.test(id)) {
                          return Promise.reject(new Error("Invalid YouTube video ID."));
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                extra={
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <p style={{ color: 'black', fontSize: '12px', marginRight: 10, marginLeft: 15 }}>
                      No link? Try this sample link:<br />
                      https://www.youtube.com/watch?v=oRDRfikj2z8
                    </p>
                    <Button
                      type="primary"
                      size="small"
                      htmlType="button"
                      style={{ ...buttonStyle, width: 'auto', padding: '0 12px' }}
                      onClick={handleCopy}
                    >
                      Copy link
                    </Button>
                  </div>
                }
              >
                <Input placeholder="Enter content link (e.g., YouTube URL)" />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span style={{ color: 'black', fontWeight: 'bold' }}>Description (Optional)</span>}
              >
                <Input.TextArea placeholder="Enter additional details" />
              </Form.Item>
              <Form.Item>
                <Button style={buttonStyle} htmlType="submit">
                  Create
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Card
            title="Watchparties"
            extra={
              <Button style={{ ...buttonStyle, width: "auto" }} onClick={() => fetchData(true)}>
                Reload
              </Button>
            }
            style={{ flex: "2 1 400px", marginBottom: 24 }}
          >
            <Table
              dataSource={watchparties}
              columns={watchpartyColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
          <Card title="Invitations & Responses" style={{ flex: "1 1 300px", marginBottom: 24 }}>
            <InviteResponsesPolling
              watchParties={watchparties.filter((wp) => wp.organizer.id === currentUserId)}
            />
          </Card>
        </div>

        {selectedWatchPartyId && (
          <InviteFriendsModal
            watchPartyId={selectedWatchPartyId}
            visible={inviteModalVisible}
            onClose={closeInviteModal}
          />
        )}
      </div>
    </>
  );

}
