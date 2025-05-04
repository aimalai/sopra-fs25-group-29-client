"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Form, Input, Checkbox, Modal, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import Image from "next/image";
import { avatars } from "@/constants/avatars";

type FormValues = {
  username: string;
  birthday?: string | null;
  email?: string | null;
  biography?: string | null;
  sharable: boolean;
  publicRatings: boolean;
  password?: string;
  avatarKey?: string;
};

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
};

const logoContainerStyle: CSSProperties = {
  marginTop: "16px",
  alignSelf: "flex-start",
  marginLeft: "24px",
  marginBottom: "24px",
};

const logoStyle: CSSProperties = {
  width: "160px",
  height: "auto",
};

const contentStyle: CSSProperties = {
  width: "480px",
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
  position: "relative",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
  flexDirection: "row-reverse",
};

const headingStyle: CSSProperties = {
  fontWeight: "bold",
  fontSize: "1.25rem",
  color: "#000",
};

const profilePictureWrapper: CSSProperties = {
  position: "relative",
  width: "80px",
  height: "80px",
  cursor: "pointer",
};

const profilePictureStyle: CSSProperties = {
  borderRadius: "50%",
  border: "2px solid #ccc",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.85rem",
  fontWeight: "bold",
};

const fieldContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "12px",
};

const labelStyle: CSSProperties = {
  fontWeight: "bold",
  marginBottom: "4px",
  color: "#000",
};

const inputBoxStyle: CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "8px 12px",
};

const sectionHeadingStyle: CSSProperties = {
  fontWeight: "bold",
  marginTop: "12px",
  marginBottom: "6px",
  fontSize: "1rem",
  color: "#333",
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%",
};

const avatarGridContainer: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  justifyItems: "center",
};

const avatarItem: CSSProperties = {
  cursor: "pointer",
  padding: "4px",
  border: "2px solid transparent",
  borderRadius: "50%",
};

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm<FormValues>();
  const [user, setUser] = useState<User | null>(null);
  const [hover, setHover] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();

  const loggedInUserId = localStorage.getItem("userId");
  const isOwnProfile = id === loggedInUserId;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isOwnProfile) {
      router.replace("/users");
    }
  }, [router, isOwnProfile]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser: User = await apiService.get<User>(`/users/${id}`);
        setUser(fetchedUser);
        form.setFieldsValue({
          username: fetchedUser.username || "",
          birthday: fetchedUser.birthday || "",
          email: fetchedUser.email || "",
          biography: fetchedUser.biography || "",
          sharable: fetchedUser.sharable || false,
          publicRatings: fetchedUser.publicRatings || false,
          avatarKey: fetchedUser.avatarKey || undefined,
        });
        setSelectedAvatar(fetchedUser.avatarKey || undefined);
      } catch {
        message.error("Error loading user data");
      }
    };
    fetchUser();
  }, [apiService, id, form]);

  const handleAvatarSelect = (key: string) => {
    form.setFieldsValue({ avatarKey: key });
    setSelectedAvatar(key);
    setIsModalVisible(false);
  };

  const onFinish = async (values: FormValues) => {
    try {
      const payload: Partial<FormValues> = {
        username: values.username,
        birthday: values.birthday || null,
        email: values.email || null,
        biography: values.biography || null,
        sharable: values.sharable,
        publicRatings: values.publicRatings,
        avatarKey: values.avatarKey,
      };
      if (values.password && values.password.trim().length > 0) {
        payload.password = values.password;
      }
      await apiService.put(`/users/${id}`, payload);
      message.success("Profile updated successfully.");
      router.push(`/users/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        message.error("Update Failed: " + error.message);
      } else {
        message.error("Update Failed: Unknown error.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={logoContainerStyle}>
        <Image src="/NiroLogo.png" alt="App Logo" style={logoStyle} width={160} height={100} />
      </div>
      {user && (
        <div style={contentStyle}>
          <div style={topRowStyle}>
            <div
              style={profilePictureWrapper}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => setIsModalVisible(true)}
            >
              <Image
                src={
                  avatars.find(a => a.key === selectedAvatar)?.url ||
                  user.profilePictureUrl ||
                  "/default-avatar.jpg"
                }
                alt="Profile Picture"
                width={80}
                height={80}
                style={profilePictureStyle}
              />
              {hover && <div style={overlayStyle}>Edit</div>}
            </div>
            <div style={headingStyle}>Edit Your Profile</div>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="avatarKey" style={{ display: "none" }}>
              <Input />
            </Form.Item>

            <div style={fieldContainer}>
              <Form.Item name="username" label={<span style={labelStyle}>Username:</span>} rules={[{ required: true }]}>
                <Input style={inputBoxStyle} />
              </Form.Item>
            </div>
            <div style={fieldContainer}>
              <Form.Item name="email" label={<span style={labelStyle}>Email:</span>}>
                <Input style={inputBoxStyle} />
              </Form.Item>
            </div>
            <div style={fieldContainer}>
              <Form.Item
                name="birthday"
                label={<span style={labelStyle}>Birthday:</span>}
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const regex = /^\d{4}-\d{2}-\d{2}$/;
                      if (!regex.test(value)) return Promise.reject(new Error("Please use the format YYYY-MM-DD"));
                      const inputDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (inputDate > today) return Promise.reject(new Error("Birthday cannot be in the future."));
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input style={inputBoxStyle} placeholder="YYYY-MM-DD" />
              </Form.Item>
            </div>
            <div style={fieldContainer}>
              <Form.Item label={<span style={labelStyle}>Current Password:</span>}>
                <Input type="password" style={inputBoxStyle} value="**********" readOnly />
              </Form.Item>
            </div>
            <div style={fieldContainer}>
              <Form.Item
                name="password"
                label={<span style={labelStyle}>New Password (optional):</span>}
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || value.trim().length === 0) return Promise.resolve();
                      const valid = value.length >= 8 && /[A-Za-z]/.test(value) && /[^A-Za-z0-9]/.test(value);
                      if (!valid) return Promise.reject(new Error("Password must be at least 8 characters and include letters and special characters."));
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password style={inputBoxStyle} placeholder="Leave empty to keep current" />
              </Form.Item>
            </div>

            <div style={fieldContainer}>
              <Form.Item name="biography" label={<span style={labelStyle}>Biography:</span>}>
                <Input.TextArea
                  showCount
                  maxLength={200}
                  rows={4}
                  style={{
                    ...inputBoxStyle,
                    resize: "none",
                    lineHeight: "1.5",
                    height: "auto",
                    overflow: "hidden",
                    whiteSpace: "pre-wrap",
                  }}
                />
              </Form.Item>
            </div>

            <div style={sectionHeadingStyle}>Privacy Settings</div>
            <div style={fieldContainer}>
              <Form.Item name="sharable" valuePropName="checked">
                <Checkbox>Enable profile search</Checkbox>
              </Form.Item>
            </div>
            <div style={fieldContainer}>
              <Form.Item name="publicRatings" valuePropName="checked">
                <Checkbox>Share my ratings</Checkbox>
              </Form.Item>
            </div>
            <Form.Item>
              <Button style={buttonStyle} htmlType="submit">
                Save
              </Button>
            </Form.Item>
            <Form.Item>
              <Button style={buttonStyle} onClick={() => router.push(`/users/${id}`)}>
                Back
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
      <Modal open={isModalVisible} title="Select a Profile Picture" onCancel={() => setIsModalVisible(false)} footer={null}>
        <div style={avatarGridContainer}>
          {avatars.map(a => (
            <div
              key={a.key}
              style={{ ...avatarItem, borderColor: selectedAvatar === a.key ? "#007BFF" : "transparent" }}
              onClick={() => handleAvatarSelect(a.key)}
            >
              <Image src={a.url} width={80} height={80} style={{ borderRadius: "50%" }} alt={a.key} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default EditUser;
