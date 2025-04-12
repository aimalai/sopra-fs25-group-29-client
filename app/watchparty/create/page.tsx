"use client"; // Ensure this component uses React hooks properly

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input } from "antd";
import useWatchPartyLocalStorage from "@/hooks/useWatchPartyLocalStorage"; // ✅ Using modular storage

const WatchPartyCreation: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { value: watchPartyUserId } = useWatchPartyLocalStorage("id", ""); // ✅ Correct reference using modular storage
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCreateWatchParty = async (values: {
    name: string;
    contentLink: string;
  }) => {
    setLoading(true);
    try {
      if (!watchPartyUserId) {
        throw new Error("User ID not found.");
      }

      const payload = {
        name: values.name,
        organizerId: Number(watchPartyUserId), // ✅ Uses modular storage for user ID
        contentLink: values.contentLink,
      };

      await apiService.post("/watchparty/create", payload);
      router.push("/watchparty"); // Redirect to watch party list page
    } catch (error) {
      console.error("Watch Party Creation Error:", error);
      form.setFields([
        { name: "name", errors: ["Failed to create watch party"] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="watch-party-container">
      <h2>Create a Watch Party</h2>
      <Form
        form={form}
        name="watchPartyCreation"
        size="large"
        onFinish={handleCreateWatchParty}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Party Name"
          rules={[{ required: true, message: "Please enter a party name!" }]}
        >
          <Input placeholder="Enter watch party name" />
        </Form.Item>
        <Form.Item
          name="contentLink"
          label="Content Link"
          rules={[
            {
              required: true,
              message: "Please provide a link to the content!",
            },
          ]}
        >
          <Input placeholder="Enter content link" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="create-button"
            loading={loading}
          >
            Create Watch Party
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WatchPartyCreation;
