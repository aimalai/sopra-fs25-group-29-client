"use client"; // Ensures the component uses React hooks and browser APIs

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import "../styles/globals.css";

interface LoginFormProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added loading state

  const handleLogin = async (values: LoginFormProps) => {
    setLoading(true); // ✅ Show spinner before login request starts
    try {
      const response: Response = await apiService.post("/users/login", values);
      const responseMessage = await response.text();

      console.log("Login API Response:", responseMessage);

      if (responseMessage.includes("OTP sent")) {
        setUsername(values.username);
        setIsOtpStage(true); // Move to OTP stage
      } else {
        localStorage.setItem("token", responseMessage);
        localStorage.setItem("username", values.username); // ✅ Stores username for Watch Party retrieval
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);
      form.setFields([
        { name: "username", errors: ["Invalid username or password"] },
        { name: "password", errors: ["Invalid username or password"] },
      ]);
    }
    setLoading(false); // ✅ Hide spinner after request completes
  };

  const handleOtpVerification = async (values: { otp: string }) => {
    setLoading(true); // ✅ Show spinner for OTP verification
    try {
      const response: Response = await apiService.post("/users/verify-otp", {
        username,
        otp: values.otp,
      });

      const token = await response.text();
      localStorage.setItem("token", token);
      localStorage.setItem("username", username); // ✅ Ensures username is saved after OTP verification
      router.push("/dashboard");
    } catch (error) {
      console.error("OTP Verification Error:", error);
      otpForm.setFields([{ name: "otp", errors: ["Invalid or expired OTP"] }]);
    }
    setLoading(false); // ✅ Hide spinner
  };

  return (
    <div className="login-container">
      {loading && <div className="spinner"></div>}{" "}
      {/* ✅ Show spinner when loading */}
      {!isOtpStage ? (
        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              disabled={loading} // ✅ Disable button while loading
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          form={otpForm}
          name="otp"
          size="large"
          onFinish={handleOtpVerification}
          layout="vertical"
        >
          <Form.Item
            name="otp"
            label={
              <>
                OTP sent to your Email. <br /> Please enter that OTP below:
              </>
            }
            rules={[
              {
                required: true,
                message: "Please enter the OTP sent to your email!",
              },
            ]}
          >
            <Input placeholder="Enter your OTP" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="otp-button"
              disabled={loading} // ✅ Disable button while loading
            >
              Verify OTP
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Login;
