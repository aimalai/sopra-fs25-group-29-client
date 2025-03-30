"use client"; // SSR disabled so that browser APIs (localStorage) can be used

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Button, Input, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const loggedInUserId = localStorage.getItem("userId");
  const isOwnProfile = id === loggedInUserId;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isOwnProfile){
      router.replace("/users");
    }
  }, [router, isOwnProfile]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user: User = await apiService.get<User>(`/users/${id}`);
        form.setFieldsValue({
          username: user.username || "",
          birthday: user.birthday || "",
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error("Error Loading User: " + error.message);
        } else {
          console.error("An unknown error occurred while loading the user.");
        }
      }
    };
    fetchUser();
  }, [apiService, id, form]);

  const onFinish = async (values: { username: string; birthday: string }) => {
    try {
      await apiService.put(`/users/${id}`, {
        username: values.username,
        birthday: values.birthday || null,
      });
      message.success("Profile Updated: Your profile has been updated successfully.");
      router.push(`/users/${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        let errorMessage = error.message;
        if (errorMessage.trim() === "400:" || errorMessage.trim() === "400: ") {
          errorMessage = "Invalid birthday format. Please use YYYY-MM-DD.";
        } else if (errorMessage.includes("Username already taken")) {
          errorMessage = "The chosen username is already taken. Please choose another one.";
        }
        message.error("Update Failed: " + errorMessage);
      } else {
        message.error("Update Failed: An unknown error occurred while updating the profile.");
      }
    }
  };

  return (
    <div className="auth-container">
      <Form
        form={form}
        name="edit-user"
        size="large"
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 400 }}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter new username" />
        </Form.Item>
        <Form.Item
          name="birthday"
          label="Birthday (YYYY-MM-DD)"
          rules={[
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.resolve();
                }
                const inputDate = new Date(value);
                const today = new Date();
                today.setHours(1, 0, 0, 0);
                if (inputDate > today) {
                  return Promise.reject(new Error("Birthday cannot be in the future."));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="auth-button">
            Save
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            className="auth-button"
            onClick={() => router.push(`/users/${id}`)}
          >
            Back
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditUser;
