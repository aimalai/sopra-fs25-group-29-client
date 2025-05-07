"use client";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input, message } from "antd";
import { CSSProperties } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

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

const OTPVerification: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<number | null>("userId", null);

  const handleVerifyOTP = async (values: { username: string; otp: string }) => {
    try {
      const response = await apiService.post("/users/otp/verify", values);
      console.log("Response from /users/otp/verify:", response);

      if (
        response &&
        typeof response === "object" &&
        "token" in response &&
        "userId" in response
      ) {
        const token = response.token as string; // Extract token
        const userId = response.userId as string; // Extract userId

        // Store both token and userId in localStorage
        setToken(token); // Use useLocalStorage for token
        setUserId(Number(userId)); // Use useLocalStorage for userId

        message.success("OTP Verified Successfully.");
        router.push("/users"); // Navigate to the main user page
      } else {
        throw new Error(
          "Unexpected response format: " + JSON.stringify(response)
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error during OTP Verification:", error); // Debugging
        message.error(
          "OTP Verification Failed: " + (error.message || "An error occurred.")
        );
      } else {
        message.error("OTP Verification Failed: An unknown error occurred.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formBoxStyle}>
        <div style={headingStyle}>Verify OTP</div>
        <Form
          form={form}
          name="verifyOTP"
          size="large"
          onFinish={handleVerifyOTP}
          layout="vertical"
        >
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
            <Button style={buttonStyle} htmlType="submit">
              Verify OTP
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default OTPVerification;
