"use client";

import React, { CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";
import { Button, Form, Input, message } from "antd";

interface OTPForm {
  username: string;
  otp: string;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
};

const formBoxStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  width: "320px",
};

const headingStyle: CSSProperties = {
  color: "#000",
  marginBottom: "16px",
  fontWeight: "bold",
  fontSize: "1.25rem",
  textAlign: "center",
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

const otpInstructionStyle: CSSProperties = {
  color: "#000",
  fontSize: "1rem",
  backgroundColor: "#e0e0e0",
  padding: "8px",
  borderRadius: "4px",
  textAlign: "center",
  marginBottom: "16px",
  marginTop: "8px",
};

export default function OTPVerification() {
  const router = useRouter();
  const api = useApi();
  const [form] = Form.useForm<OTPForm>();
  const [loading, setLoading] = useState(false);

  const [, setToken] = useSessionStorage<string>("token", "");
  const [, setUserId] = useSessionStorage<number>("userId", 0);

  const handleVerify = async (values: OTPForm) => {
    setLoading(true);
    try {
      const response = await api.post("/users/otp/verify", values);
      if (
        response &&
        typeof response === "object" &&
        "token" in response &&
        "userId" in response
      ) {
        setToken(response.token as string);
        setUserId(Number(response.userId));
        message.success("OTP Verified Successfully.");
        router.push("/home");
      } else {
        throw new Error("Unexpected response: " + JSON.stringify(response));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred.";
      message.error("OTP Verification Failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formBoxStyle}>
        <div style={headingStyle}>Verify OTP</div>
        <Form
          form={form}
          name="verifyOTP"
          layout="vertical"
          size="large"
          onFinish={handleVerify}
        >
          <p style={otpInstructionStyle}>
            An email with a One-Time Password (OTP) was sent to your registered
            email address. Please check your email and enter the OTP below to
            complete your login!
          </p>
          <Form.Item
            label={<span style={{ color: "#000" }}>Enter your Username</span>}
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input style={inputStyle} placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#000" }}>Enter your OTP</span>}
            name="otp"
            rules={[{ required: true, message: "Please input your OTP!" }]}
          >
            <Input style={inputStyle} placeholder="Enter OTP" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={buttonStyle}
            >
              Verify OTP
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
