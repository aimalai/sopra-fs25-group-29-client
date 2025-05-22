import React, { CSSProperties, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Button, Card, List, Tag, Spin, Typography, message } from "antd";

const { Text } = Typography;

interface PollingProps {
  watchParties: { id: number; title: string }[];
}

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%",
};

const InviteResponsesPolling: React.FC<PollingProps> = ({ watchParties }) => {
  const apiService = useApi();
  const [inviteResponses, setInviteResponses] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const fetchInviteResponses = async (showMessage: boolean) => {
    setLoading(true);
    try {
      const entries = await Promise.all(
        watchParties.map(async (party) => {
          const responses = await apiService.get<string[]>(
            `/api/watchparties/${party.id}/latest-invite-status`
          );
          return [party.title, responses] as [string, string[]];
        })
      );
      setInviteResponses(Object.fromEntries(entries));
      if (showMessage) {
        messageApi.success("Invite statuses reloaded successfully");
      }
    } catch (error) {
      console.error("Error fetching invite responses:", error);
      if (showMessage) {
        messageApi.error("Failed to reload invite statuses");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (watchParties.length > 0) {
      fetchInviteResponses(false);
    }
  }, [watchParties, apiService]);

  return (
    <>
      {contextHolder}
      <Button
        size="small"
        onClick={() => fetchInviteResponses(true)}
        style={{ ...buttonStyle, width: "auto", marginBottom: 8 }}
      >
        Reload Status
      </Button>

      {loading && Object.keys(inviteResponses).length === 0 && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin tip="Load Responses..." />
        </div>
      )}

      {Object.entries(inviteResponses).map(([partyTitle, responses]) => (
        <Card
          key={partyTitle}
          style={{ marginBottom: 24, border: "1px solid #000" }}
          headStyle={{
            backgroundColor: "#d4d4d4",
            borderBottom: "1px solid #e0e0e0",
          }}
          bodyStyle={{ backgroundColor: "#e0e0e0" }}
          title={partyTitle}
        >
          {responses.length === 0 ? (
            <Text type="secondary">No User Invited.</Text>
          ) : (
            <List
              dataSource={responses}
              renderItem={(resp) => {
                let color: "green" | "red" | "gold" = "gold";
                if (resp.toLowerCase().includes("accepted")) color = "green";
                else if (resp.toLowerCase().includes("declined")) color = "red";
                return (
                  <List.Item style={{ padding: "8px 0" }}>
                    <Tag color={color} style={{ fontWeight: 600 }}>
                      {resp}
                    </Tag>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      ))}
    </>
  );
};

export default InviteResponsesPolling;
