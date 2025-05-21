"use client";
import React, { CSSProperties, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";

interface FormFieldProps {
  username: string;
  password: string;
  confirmPassword?: string;
  email: string;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
};

const logoContainerStyle: CSSProperties = {
  marginBottom: "24px",
};

const logoStyle: CSSProperties = {
  width: "200px",
  height: "auto",
};

const formBoxStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const headingStyle: CSSProperties = {
  color: "#000",
  marginBottom: "16px",
  fontWeight: "bold",
  fontSize: "1.25rem",
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%",
};

const inputStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  border: "1px solid #ccc",
  color: "#000",
};

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm<FormFieldProps>();
  const [isLoading, setIsLoading] = useState(false);

  const [, setToken] = useSessionStorage<string>("token", "");
  const [, setUserId] = useSessionStorage<number>("userId", 0);
  const [, setUsername] = useSessionStorage<string>("username", "");

  const handleRegister = async (
    values: Omit<FormFieldProps, "confirmPassword">
  ) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<User>("/users", values);

      if (response.token) setToken(response.token);
      if (response.id) setUserId(Number(response.id));
      if (response.username) {
        setUsername(response.username);
      }

      message.success(
        "Registration Successful: You have been successfully registered and logged in."
      );
      router.push("/home");
    } catch (error) {
      if (error instanceof Error) {
        message.error(
          "Registration Failed: " +
            (error.message || "An error occurred during registration.")
        );
      } else {
        message.error(
          "Registration Failed: An unknown error occurred during registration."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={logoContainerStyle}>
        <Image
          src="/NiroLogo_white.png"
          alt="App Logo"
          style={logoStyle}
          width={200}
          height={200}
        />
      </div>
      <div style={formBoxStyle}>
        <div style={headingStyle}>Register below!</div>
        <Form
          form={form}
          name="register"
          size="large"
          onFinish={(values) => handleRegister(values)}
          layout="vertical"
        >
          <Form.Item
            label={<span style={{ color: "#000" }}>Choose a Username</span>}
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input style={inputStyle} placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#000" }}>Choose a Password</span>}
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              {
                pattern:
                  /^(?=.*[A-Za-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                message:
                  "Password must be at least 8 characters and contain letters and special characters.",
              },
            ]}
            hasFeedback
          >
            <Input.Password style={inputStyle} placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#000" }}>Confirm Password</span>}
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              style={inputStyle}
              placeholder="Re-enter your password"
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#000" }}>Enter Your Email</span>}
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please input a valid email address!",
              },
            ]}
          >
            <Input style={inputStyle} placeholder="Enter email address" />
          </Form.Item>

          <Form.Item>
            <Button style={buttonStyle} htmlType="submit" loading={isLoading}>
              Register
            </Button>
          </Form.Item>

          <Form.Item>
            <Button style={buttonStyle} onClick={() => router.push("/login")}>
              Already have an account? Login
            </Button>
          </Form.Item>

          <Form.Item>
            <Button style={buttonStyle} onClick={() => router.push("/")}>
              Back
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
