"use client"; // Enables React hooks in this component

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Modal, Button, Form, Input, List } from "antd";
import useWatchPartyLocalStorage from "../hooks/useWatchPartyLocalStorage"; // ✅ Using modular storage

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
  const { value: watchPartyUserId } = useWatchPartyLocalStorage("id", ""); // ✅ Correct reference using modular storage
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState(""); // ✅ Success message state

  // ✅ Fetch previously invited users when modal opens
  useEffect(() => {
    // Debugging logs to check local storage
    if (visible) {
      console.log("Local storage content on modal open:", localStorage);
      console.log("Retrieved watchPartyUserId:", localStorage.getItem("id"));
    }

    const fetchInvites = async () => {
      try {
        if (!watchPartyId) return; // ✅ Prevents unnecessary API call

        const response = await apiService.get<string[]>(
          `/api/watchparties/${watchPartyId}/invites` // Updated base path to match backend
        );
        setInvitedUsers(response); // ✅ Populate the invite list
      } catch (error) {
        console.error("Error fetching invites:", error);
      }
    };

    if (visible) {
      fetchInvites(); // ✅ Only fetch invites when modal is open
    }
  }, [watchPartyId, visible]);

  const handleInvite = async (values: { username: string }) => {
    setLoading(true);
    setSuccessMessage(""); // ✅ Clear any previous success message
    try {
      if (!watchPartyUserId) {
        throw new Error("User ID not found.");
      }

      console.log("Sending invite request:", values.username);

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
        setInvitedUsers([...invitedUsers, values.username]);
        setSuccessMessage(`🎉 Invite sent successfully to ${values.username}!`);
        form.resetFields(["username"]); // ✅ Clears only the username field
      }
    } catch (error) {
      console.error("Invitation Error:", error);
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
      {/* 🔥 Improved Title Visibility */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
          }}
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
          <Input placeholder="Enter friend's username" />
        </Form.Item>

        {successMessage && (
          <Form.Item>
            <p
              style={{
                color: "green",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
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
      <List
        dataSource={invitedUsers}
        renderItem={(user) => <List.Item>{user}</List.Item>}
      />
    </Modal>
  );
};

export default InviteFriendsModal;
