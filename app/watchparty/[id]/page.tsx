"use client";

import { useParams, useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import { Card, Button, Descriptions } from "antd";
import { useApi } from "@/hooks/useApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import useAuth from "@/hooks/useAuth";

dayjs.extend(utc);

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%",
};

interface Organizer {
  id: number;
  username: string;
}

interface Watchparty {
  id: number;
  organizer: Organizer;
  contentLink: string;
  title: string;
  description: string;
  scheduledTime: string;
}

const WatchpartyDetail: React.FC = () => {
  const isAuthed = useAuth();
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const apiService = useApi();
  const [watchparty, setWatchparty] = useState<Watchparty | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchWatchparty = async () => {
      try {
        const data = await apiService.get<Watchparty[]>(`/api/watchparties`);
        const wp = data.find((w) => w.id.toString() === id);
        if (wp) setWatchparty(wp);
      } catch (error: unknown) {
        console.error("Error fetching watchparty details", error);
      }
    };
    fetchWatchparty();
  }, [id, apiService]);

  if (!isAuthed) return null;
  if (!id) return <div>No ID provided.</div>;
  if (!watchparty) return <div>Loading details...</div>;

  return (
    <div style={{ minHeight: "100vh", padding: "20px", paddingTop: "100px", boxSizing: "border-box" }}>
      <Card
        title={watchparty.title}
        headStyle={{ backgroundColor: "#d9d9d9", color: "#000", fontSize: "18px" }}
        style={{
          margin: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <Descriptions
          bordered
          column={1}
          labelStyle={{ color: "#000", backgroundColor: "#f0f0f0" }}
          contentStyle={{ color: "#000", backgroundColor: "#f0f0f0" }}
        >
          <Descriptions.Item label="Organizer">
            {watchparty.organizer.username}
          </Descriptions.Item>
          <Descriptions.Item label="Scheduled Time">
            {dayjs.utc(watchparty.scheduledTime).local().format("DD.MM.YYYY, HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {watchparty.description}
          </Descriptions.Item>
          <Descriptions.Item label="Content Link">
            <a
              href={watchparty.contentLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1890ff" }}
            >
              {watchparty.contentLink}
            </a>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div style={{ margin: "20px" }}>
        <Button
          style={buttonStyle}
          type="default"
          onClick={() => router.push(`/watchparty/${id}/lobby`)}
        >
          Join Lobby
        </Button>
        <br />
        <br />
        <Button style={buttonStyle} onClick={() => router.push("/watchparty")}>Back</Button>
      </div>
    </div>
  );
};

export default WatchpartyDetail;
