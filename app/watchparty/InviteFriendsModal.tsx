"use client";

import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Modal, Button, Form, AutoComplete, List } from "antd";
import useWatchPartyLocalStorage from "../hooks/useWatchPartyLocalStorage";

interface InviteFriendsProps {
  watchPartyId: number;
  visible: boolean;
  onClose: () => void;
}

const InviteFriendsModal: React.FC<InviteFriendsProps> = ({
  watchPartyId,
  visible,
  onClose,
}) => {
  const apiService = useApi();
  const { value: watchPartyUserId } = useWatchPartyLocalStorage<string>("id", "");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<string[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        if (!watchPartyUserId) return;
        const friendList = await apiService.get<{ username: string }[]>(
          `/users/${watchPartyUserId}/friends`
        );
        const usernames = friendList.map((u) => u.username);
        setFriends(usernames);
        setFilteredFriends(usernames);
      } catch {
        console.error("Error fetching friends");
      }
    })();
  }, [apiService, watchPartyUserId, visible]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        if (!watchPartyId) return;
        const response = await apiService.get<string[]>(
          `/api/watchparties/${watchPartyId}/invites`
        );
        setInvitedUsers(response);
      } catch {
        console.error("Error fetching invites");
      }
    })();
  }, [apiService, watchPartyId, visible]);

  const handleSearch = (value: string) => {
    const q = value.trim().toLowerCase();
    setFilteredFriends(
      !q ? friends : friends.filter((f) => f.toLowerCase().includes(q))
    );
  };

  const handleInvite = async (values: { username: string }) => {
    setLoading(true);
    setSuccessMessage("");
    try {
      if (!watchPartyUserId) throw new Error("User ID not found");
      const response = await apiService.post<{ message: string }>(
        `/api/watchparties/${watchPartyId}/invites?username=${encodeURIComponent(
          values.username
        )}&inviterId=${watchPartyUserId}`,
        {}
      );
      if (response.message === "Username does not exist") {
        form.setFields([
          {
            name: "username",
            errors: [
              "Username does not exist. Please check DB and enter again.",
            ],
          },
        ]);
      } else {
        setInvitedUsers((prev) => [...prev, values.username]);
        setSuccessMessage(`🎉 Invite sent successfully to ${values.username}!`);
        form.resetFields(["username"]);
      }
    } catch {
      form.setFields([
        {
          name: "username",
          errors: ["An unexpected error occurred. Please try again."],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null}>
      <div
        style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px" }}
      >
        <h3
          style={{ fontSize: "20px", fontWeight: "bold", color: "#333", textAlign: "center" }}
        >
          Invite Friends to Watch Party
        </h3>
      </div>

      <Form
        form={form}
        name="inviteFriends"
        size="large"
        onFinish={handleInvite}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Enter username to invite!" }]}
        >
          <AutoComplete
            options={filteredFriends.map((f) => ({ value: f }))}
            onSearch={handleSearch}
            placeholder="Enter friend's username"
            filterOption={false}
          />
        </Form.Item>

        {successMessage && (
          <Form.Item>
            <p style={{ color: "green", fontWeight: "bold", textAlign: "center" }}>
              {successMessage}
            </p>
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Send Invitation
          </Button>
        </Form.Item>
      </Form>

      <h4>Invited Users:</h4>
      <List dataSource={invitedUsers} renderItem={(user) => <List.Item>{user}</List.Item>} />
    </Modal>
  );
};

export default InviteFriendsModal;
