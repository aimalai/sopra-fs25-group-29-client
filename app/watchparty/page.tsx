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
import InviteFriendsModal from "@/watchparty/InviteFriendsModal"; // Import InviteFriendsModal
import InviteResponsesPolling from "./InviteResponsesPolling";

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

const WatchpartyPage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const [watchparties, setWatchparties] = useState<Watchparty[]>([]);
  const [username] = useSessionStorage<string>("username", "");
  const [userIdStr] = useSessionStorage<string>("userId", "");
  const currentUserId  = Number(userIdStr);
  const [form] = Form.useForm();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedWatchPartyId, setSelectedWatchPartyId] = useState<
    number | null
  >(null);

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

      const organizerIdStr = sessionStorage.getItem("userId") || localStorage.getItem("userId");
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
      const response = await apiService.post<Watchparty>(
        "/api/watchparties",
        payload
      );
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
        const organizerId = Number(userIdStr);
        const invitedUser = username;

        const [own, invited] = await Promise.all([
          apiService.get<Watchparty[]>(`/api/watchparties?organizerId=${organizerId}`),
          apiService.get<Watchparty[]>(`/api/watchparties?username=${encodeURIComponent(invitedUser)}`)
        ]);

        const merged = [...own, ...invited].reduce<Watchparty[]>((acc, wp) => {
          if (!acc.some(x => x.id === wp.id)) acc.push(wp);
          return acc;
        }, []);

        setWatchparties(merged);
      } catch {
        message.error("Error fetching watchparties.");
      }
    };
    fetchData();
  }, [apiService, userIdStr, username]);

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
          <Button
            style={buttonStyle}
            onClick={() => router.push(`/watchparty/${record.id}`)}
          >
            Details
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => handleInviteClick(record.id)}
          >
            Invite Friends
          </Button>
        </div>
      ),
    },
  ];
  /*
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
  */

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        paddingTop: "100px",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: "20px" }}>
        Watchparty Manager
      </h1>
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
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish} 
            style={{ color: 'white' }}
          >
            <Form.Item
              name="title"
              label={<span style={{ color: 'white', fontWeight: 'bold' }}>Title</span>}
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item
              name="date"
              label={<span style={{ color: 'white', fontWeight: 'bold' }}>Date</span>}
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={disabledDate}
              />
            </Form.Item>
            <Form.Item
              name="time"
              label={<span style={{ color: 'white', fontWeight: 'bold' }}>Time</span>}
              rules={[{ required: true, message: "Please select a time" }]}
            >
              <TimePicker
                style={{ width: "100%" }}
                format="HH:mm"
                disabledTime={disabledTime}
              />
            </Form.Item>
            <Form.Item
              name="contentLink"
              label={<span style={{ color: 'white', fontWeight: 'bold' }}>Content Link</span>}
              rules={[
                { required: true, message: "Please enter a content link" },
              ]}
              extra={
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 30}}>
                  <p style={{ color: 'white', fontSize: '12px', marginRight: 10 , marginLeft: 15}}>
                    No link? Try out this sample link:<br />https://www.youtube.com/watch?v=oRDRfikj2z8
                  </p>
                  <Button
                    type="primary"
                    size="small"
                    htmlType="button"
                    style={{...buttonStyle, width: 'auto', padding: '0 12px'}}
                    onClick={() => {
                      navigator.clipboard.writeText("https://www.youtube.com/watch?v=oRDRfikj2z8")
                        .then(() => message.success('Sample link copied!'))
                        .catch(() => message.error('Failed to copy link'));
                    }}
                  >
                    Copy link
                  </Button>
                </div>
              }
            >
              <Input placeholder="Enter content link (e.g., YouTube URL)" />
              
            </Form.Item>
            <Form.Item name="description" label={<span style={{ color: 'white', fontWeight: 'bold'}}>Description (Optional)</span>}>
              <Input.TextArea placeholder="Enter additional details (optional)" />
            </Form.Item>
            <Form.Item>
              <Button style={buttonStyle} htmlType="submit">
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
          <h2>Watchparties</h2>
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
          <h2>Invitations & Responses</h2>
          <Card
            style={{ background: "#2f2f2f", border: "none", padding: "10px" }}
          >
            <InviteResponsesPolling watchParties={watchparties.filter(wp => wp.organizer.id === currentUserId)}/>
          </Card>
        </div>
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}></div>

      {selectedWatchPartyId && (
        <InviteFriendsModal
          watchPartyId={selectedWatchPartyId}
          visible={inviteModalVisible}
          onClose={closeInviteModal}
        />
      )}
    </div>
  );
};

export default WatchpartyPage;
